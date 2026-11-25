import { getLeagueId } from "../utils/sleeper-dom";
import { NUMBER_STYLE, setParts } from "../utils/text-styles";

////////////////////////////////////////////////////////////////////////////
// League median box on the Matchup tab, shown right under the
// "Winning/Losing by" box. Works in both the new (/beta) UI and Classic.
//
//   Current League Median:   Sleeper's own "League Median: X" element
//   Projected League Median: median of every team's "proj." total
//
// Where the numbers come from:
//   1. The new UI's League tab (/beta/leagues/{id}/leagues?week=N), fetched
//      in the background: its "League Median" element, and the "proj." value
//      shown for each team in the week's matchups.
//   2. Fallback when that page isn't available (e.g. the account is set to
//      Classic, which redirects /beta pages): compute both from Sleeper's
//      public API. Current = median of actual points (or of projections
//      before kickoff, as Sleeper does); projected = median of each roster's
//      starters' projections scored with the league's scoring_settings.
//      Verified to match the League tab (Wk 11: 103.10 / 122.73,
//      Wk 12: 124.14 / 124.14).
////////////////////////////////////////////////////////////////////////////

const API = 'https://api.sleeper.app';
const CURRENT_WEEK_TTL_MS = 60 * 1000; // refresh the live week once a minute

const cache = new Map();   // `${leagueId}:${week}` -> { at, value, source }
const inFlight = new Map();
let nflStatePromise = null;
const leaguePromises = new Map();
const projectionPromises = new Map(); // `${season}:${week}` -> Promise<Map>

async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
}

function getNflState() {
    if (!nflStatePromise) {
        nflStatePromise = getJson(`${API}/v1/state/nfl`).catch(err => {
            nflStatePromise = null;
            throw err;
        });
    }
    return nflStatePromise;
}

////////////////////////////////////////////////////////////////////////////
// Source 1: Sleeper's own League Median element (new UI League tab)
////////////////////////////////////////////////////////////////////////////
async function fetchLeagueTabMedians(leagueId, week) {
    const res = await fetch(`/beta/leagues/${leagueId}/leagues?week=${week}`, { credentials: 'include' });
    if (!res.ok || res.redirected) return null; // Classic accounts get redirected
    const html = await res.text();

    // Current: server-rendered as "League Median: <!-- -->103.10"
    const m = html.match(/League Median:\s*(?:<!--\s*-->)?\s*(-?[0-9]+(?:\.[0-9]+)?)/);
    if (!m) return null;
    const current = parseFloat(m[1]);

    // Projected: every team's "proj." total in this week's matchups
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const projections = Array.from(doc.querySelectorAll('span'))
        .filter(s => s.textContent.trim() === 'proj.')
        .map(label => [label.nextElementSibling, label.previousElementSibling]
            .find(el => el && /^-?\d+(\.\d+)?$/.test(el.textContent.trim())))
        .filter(Boolean)
        .map(el => parseFloat(el.textContent));

    return { current, projected: median(projections) };
}

////////////////////////////////////////////////////////////////////////////
// Source 2 (fallback): compute from the public API
////////////////////////////////////////////////////////////////////////////
function getLeague(leagueId) {
    if (!leaguePromises.has(leagueId)) {
        leaguePromises.set(leagueId, getJson(`${API}/v1/league/${leagueId}`).catch(err => {
            leaguePromises.delete(leagueId);
            throw err;
        }));
    }
    return leaguePromises.get(leagueId);
}

// player_id -> projected stats for one NFL week
function getProjections(season, week) {
    const key = `${season}:${week}`;
    if (!projectionPromises.has(key)) {
        projectionPromises.set(key,
            getJson(`${API}/projections/nfl/${season}/${week}?season_type=regular`)
                .then(list => {
                    const byPlayer = new Map();
                    list.forEach(p => { if (p && p.player_id) byPlayer.set(String(p.player_id), p.stats || {}); });
                    return byPlayer;
                })
                .catch(err => {
                    projectionPromises.delete(key);
                    throw err;
                }));
    }
    return projectionPromises.get(key);
}

function scoreStats(stats, scoring) {
    if (!stats) return 0;
    let total = 0;
    for (const [stat, value] of Object.entries(stats)) {
        const weight = scoring[stat];
        if (typeof weight === 'number' && typeof value === 'number') total += weight * value;
    }
    return total;
}

function median(values) {
    if (!values.length) return null;
    const v = [...values].sort((a, b) => a - b);
    const n = v.length;
    return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
}

async function computeMedians(leagueId, week) {
    const league = await getLeague(leagueId);
    const [matchups, projections] = await Promise.all([
        getJson(`${API}/v1/league/${leagueId}/matchups/${week}`),
        getProjections(league.season, week)
    ]);
    const scoring = league.scoring_settings || {};

    const projectedTotals = matchups
        .map(m => (m.starters || []).reduce((sum, pid) => sum + scoreStats(projections.get(String(pid)), scoring), 0))
        .filter(p => p > 0);
    const projected = median(projectedTotals);

    // Like Sleeper's element: actual median once games are played,
    // projected median before kickoff
    const actualPoints = matchups.map(m => Number(m.points) || 0);
    const current = actualPoints.some(p => p > 0) ? median(actualPoints) : projected;

    return { current, projected };
}

async function loadMedians(leagueId, week) {
    try {
        const fromLeagueTab = await fetchLeagueTabMedians(leagueId, week);
        if (fromLeagueTab) return { ...fromLeagueTab, source: 'league-tab' };
    } catch (err) {
        console.warn('[Sleeper extension] League tab unavailable, computing medians instead', err);
    }
    return { ...(await computeMedians(leagueId, week)), source: 'computed' };
}

////////////////////////////////////////////////////////////////////////////
// Which week is on screen
////////////////////////////////////////////////////////////////////////////
function weekFromPage() {
    // New UI: ?week=N in the URL
    const fromUrl = parseInt(new URLSearchParams(location.search).get('week'), 10);
    if (Number.isFinite(fromUrl)) return fromUrl;
    // Classic: the selected week reads "Wk. 11". (Don't match "Week N": Classic's
    // hidden dropdown options are "Week 1".."Week 17". The new UI has no ?week=
    // only when showing the current week, which the caller falls back to.)
    const leaf = Array.from(document.querySelectorAll('span, div, p, button'))
        .find(el => el.children.length === 0 && /^Wk\.?\s*\d+$/.test(el.textContent.trim()));
    if (leaf) return parseInt(leaf.textContent.replace(/\D+/g, ''), 10);
    return null;
}

async function getViewedWeek() {
    const state = await getNflState();
    const current = Number(state.display_week || state.week);
    const week = weekFromPage();
    return { week: Number.isFinite(week) ? week : current, current };
}

function requestMedians(leagueId, week, current, onReady) {
    const key = `${leagueId}:${week}`;
    const cached = cache.get(key);
    const ttl = week >= current ? CURRENT_WEEK_TTL_MS : Infinity;
    if (cached && Date.now() - cached.at < ttl) return cached;
    if (!inFlight.has(key)) {
        inFlight.set(key, loadMedians(leagueId, week)
            .then(result => {
                cache.set(key, { at: Date.now(), ...result });
                onReady();
            })
            .catch(err => console.error('[Sleeper extension] league median', err))
            .finally(() => inFlight.delete(key)));
    }
    return cached || null; // show the previous value while refreshing
}

////////////////////////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////////////////////////
const NEUTRAL_BG = 'rgba(64, 64, 64, 0.15)';

// Same look as the "Winning/Losing by" box it sits under (new UI or Classic)
function getOrCreateBox(anchor) {
    let box = document.querySelector('#leagueMedianDisplay');
    if (!box) {
        box = document.createElement('div');
        box.id = 'leagueMedianDisplay';
    }
    box.style.cssText = anchor.style.cssText;
    box.style.backgroundColor = NEUTRAL_BG;
    box.style.backgroundImage = 'none';
    if (anchor.nextElementSibling !== box) {
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    return box;
}

const fmt = v => (v === null || v === undefined || Number.isNaN(v)) ? '…' : v.toFixed(2);

// Two lines in one box: label words + number. The new UI gets the
// label/number font pairing; Classic keeps its plain box styling.
function setLines(box, lines) {
    const numberStyle = document.querySelector('.player-section') ? null : NUMBER_STYLE;
    while (box.children.length > lines.length) box.lastElementChild.remove();
    lines.forEach(([label, value], i) => {
        let line = box.children[i];
        if (!line) {
            line = document.createElement('div');
            box.appendChild(line);
        }
        setParts(line, [{ text: `${label} ` }, { text: value, number: true }], numberStyle);
    });
}

// anchor: the "Winning/Losing by" element (#scoreDifferenceDisplay)
export function displayLeagueMedian(anchor = document.querySelector('#scoreDifferenceDisplay')) {
    const leagueId = getLeagueId();
    if (!anchor || !anchor.parentNode || !leagueId) return null;

    const box = getOrCreateBox(anchor);
    const rerender = () => displayLeagueMedian();

    getViewedWeek().then(({ week, current }) => {
        const result = requestMedians(leagueId, week, current, rerender) || {};
        setLines(box, [
            ['Current League Median:', fmt(result.current)],
            ['Projected League Median:', fmt(result.projected)]
        ]);
        box.dataset.week = String(week);
        if (result.source) box.dataset.source = result.source;
    }).catch(err => console.error('[Sleeper extension] league median', err));

    return box;
}

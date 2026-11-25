// New (/beta) Sleeper UI
import { colorPlayers } from "../utils/add-heat-map";
import { displayScoreDifference } from "../elems/score-difference";
import { displayLeagueMedian } from "../elems/league-median";
import { isMatchupPage, getStarterPairs, getMatchupHeader } from "../utils/sleeper-dom";
// Classic Sleeper UI ("Back to Classic Fantasy") - original code, unchanged
import { colorPlayers as classicColorPlayers } from "../classic/add-heat-map";
import { displayScoreDifference as classicDisplayScoreDifference } from "../classic/score-difference";
import { resizeScoreElement as classicResizeScoreElement } from "../classic/resize-scores";

////////////////////////////////////////////////////////////////////////////
// Mutation Observer:
// Sleeper is a React app that re-renders often (live scores, chat), so
// batch mutations and run main() at most once per animation frame.
////////////////////////////////////////////////////////////////////////////
let scheduled = false;

function scheduleMain() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
        scheduled = false;
        observer.disconnect();
        try {
            main();
        } catch (err) {
            console.error('[Sleeper extension]', err);
        }
        observeDOM();
    });
}

const observer = new MutationObserver(scheduleMain);

function observeDOM() {
    observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
    });
}

if (document.readyState === 'complete') {
    observeDOM();
    scheduleMain();
} else {
    window.addEventListener("load", () => {
        observeDOM();
        scheduleMain();
    });
}

////////////////////////////////////////////////////////////////////////////
// Main functionality:
////////////////////////////////////////////////////////////////////////////
let lastSignature = null;
let oldClassicPlayers = null;

function main() {
    // Sleeper serves either UI depending on the account's choice, so detect it
    const classicPlayers = document.querySelector(".player-section");
    if (classicPlayers) {
        classicMain(classicPlayers);
    } else {
        newUiMain();
    }
}

////////////////////////////////////////////////////////////////////////////
// Classic UI: same behavior as before the redesign
////////////////////////////////////////////////////////////////////////////
function classicMain(allPlayers) {
    if (oldClassicPlayers === allPlayers.innerHTML) {
        ensureLeagueMedian();
        return;
    }
    const users = document.querySelectorAll(".matchup-row .user");
    const scores = document.querySelectorAll(".matchup-row .user .score");

    classicColorPlayers(allPlayers);
    classicDisplayScoreDifference(users, scores);
    classicResizeScoreElement();
    displayLeagueMedian();

    oldClassicPlayers = allPlayers.innerHTML;
}

// Re-attach the median box if the page re-rendered and dropped it
function ensureLeagueMedian() {
    const anchor = document.querySelector('#scoreDifferenceDisplay');
    const box = document.querySelector('#leagueMedianDisplay');
    if (anchor && (!box || anchor.nextElementSibling !== box)) displayLeagueMedian(anchor);
}

////////////////////////////////////////////////////////////////////////////
// New UI
////////////////////////////////////////////////////////////////////////////
function newUiMain() {
    if (!isMatchupPage()) return;

    const header = getMatchupHeader();
    const pairs = getStarterPairs();
    if (!header || pairs.length === 0) return;

    // Only recompute when a score or the lineup actually changed
    const signature = [
        location.pathname + location.search,
        header.myScoreEl.textContent,
        header.oppScoreEl.textContent,
        ...pairs.map(([l, r]) => `${l.scoreEl.textContent}|${r.scoreEl.textContent}`)
    ].join('~');

    const missingElements = !document.querySelector('#scoreDifferenceDisplay') ||
        !document.querySelector('#leagueMedianDisplay') ||
        !document.querySelector('.score-difference-added');

    if (signature === lastSignature && !missingElements) return;
    lastSignature = signature;

    colorPlayers(pairs);
    const differenceElement = displayScoreDifference(header);
    displayLeagueMedian(differenceElement);
}

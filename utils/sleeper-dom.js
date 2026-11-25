////////////////////////////////////////////////////////////////////////////
// DOM lookups for Sleeper's new (/beta) league UI.
//
// The new UI is styled with Tailwind utility classes (e.g. "flex", "min-w-0"),
// so instead of class names we anchor on things that carry meaning:
//   - starter rows contain a position button: aria-label="QB slot", "RB slot", ...
//   - each player's score sits directly above its "proj." label
//   - the matchup score card contains the "Open Sleeperzone" button, with the
//     two team scores on either side of it
////////////////////////////////////////////////////////////////////////////

export function isMatchupPage() {
    return /\/leagues\/\d+\/matchup/.test(location.pathname);
}

export function getLeagueId() {
    const m = location.pathname.match(/\/leagues\/(\d+)/);
    return m ? m[1] : null;
}

// Returns a number, or null for "–" / "—" / "-" / empty (player hasn't played).
export function parseScore(text) {
    if (!text) return null;
    const cleaned = text.replace(/[^0-9.\-]/g, '');
    if (cleaned === '' || cleaned === '-') return null;
    const v = parseFloat(cleaned);
    return Number.isFinite(v) ? v : null;
}

function findProjLabel(container) {
    return Array.from(container.querySelectorAll('span'))
        .find(s => s.textContent.trim() === 'proj.') || null;
}

// One side of a starter row -> { item, scoreEl, scoreColumn }
function readPlayerSide(side) {
    const item = side.firstElementChild;
    const projLabel = findProjLabel(side);
    if (!item || !projLabel) return null;
    const projLine = projLabel.parentElement;          // "proj. 20.23"
    // Big score above it. Skip our own "+/-" element, which the heatmap
    // inserts between the score and the "proj." line.
    let scoreEl = projLine.previousElementSibling;
    while (scoreEl && scoreEl.classList.contains('score-difference-added')) {
        scoreEl = scoreEl.previousElementSibling;
    }
    if (!scoreEl) return null;
    return { item, scoreEl, projLine, scoreColumn: projLine.parentElement };
}

// The <section> whose heading is "Starters" (bench / IR are separate sections)
function getStartersSection() {
    return Array.from(document.querySelectorAll('section'))
        .find(s => Array.from(s.querySelectorAll('h3'))
            .some(h => h.textContent.trim() === 'Starters')) || null;
}

// Starter rows as [[left, right], ...]; bench and IR are excluded.
// Rows are found via each player's "proj." label, which is present both for
// editable weeks (with "QB slot" buttons) and locked/past weeks (without them).
export function getStarterPairs() {
    const section = getStartersSection();
    if (!section) return [];

    const rows = [];
    findAllProjLabels(section).forEach(label => {
        const side = label.closest('.min-w-0.flex-1');
        const row = side && side.parentElement;
        if (row && !rows.includes(row)) rows.push(row);
    });

    const pairs = [];
    rows.forEach(row => {
        const sides = Array.from(row.children).filter(c => c.classList.contains('flex-1'));
        if (sides.length !== 2) return;
        const left = readPlayerSide(sides[0]);
        const right = readPlayerSide(sides[1]);
        if (left && right) pairs.push([left, right]);
    });
    return pairs;
}

function findAllProjLabels(container) {
    return Array.from(container.querySelectorAll('span'))
        .filter(s => s.textContent.trim() === 'proj.');
}

// The matchup score card and the two team score elements inside it.
export function getMatchupHeader() {
    const sleeperzone = document.querySelector('button[aria-label="Open Sleeperzone"]');
    if (!sleeperzone) return null;
    const card = sleeperzone.closest('.rounded-3xl');
    const myScoreEl = sleeperzone.previousElementSibling;
    const oppScoreEl = sleeperzone.nextElementSibling;
    if (!card || !myScoreEl || !oppScoreEl) return null;
    return { card, myScoreEl, oppScoreEl };
}

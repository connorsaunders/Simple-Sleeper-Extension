import { colorPlayers } from "../utils/add-heat-map";
import { displayScoreDifference } from "../elems/score-difference";
import { resizeScoreElement } from "../utils/resize-scores"; 
import { colorStatus } from "../utils/add-playing-redzone";
import { displayProjectedMedian } from "../elems/projected-median";


////////////////////////////////////////////////////////////////////////////
// Mutation Observer:
////////////////////////////////////////////////////////////////////////////
window.addEventListener("load", function () {
    const observer = new MutationObserver(function (mutations) {
        observer.disconnect();

        mutations.forEach(function (mutation) {
            main();
        });
        observeDOM();
    });

    function observeDOM() {
        observer.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }
    observeDOM();
});

////////////////////////////////////////////////////////////////////////////
// Main functionality:
////////////////////////////////////////////////////////////////////////////
let oldPlayers = null; // Store the previous state globally

function main() {
    // Fetch the current players section
    const allPlayers = document.querySelector(".player-section");
    // Ensure that `allPlayers` exists and has changed since the last call 
    if (allPlayers && oldPlayers !== allPlayers.innerHTML) {
        const users = document.querySelectorAll(".matchup-row .user");
        const scores = document.querySelectorAll(".matchup-row .user .score");

        // Apply the custom color formatting and score difference display
        colorStatus(allPlayers);
        colorPlayers(allPlayers);
        displayScoreDifference(users, scores);
        resizeScoreElement(); // Call the imported resize function

        // Update the oldPlayers state to the current one
        oldPlayers = allPlayers.innerHTML;
    }
    const leaguePage = document.querySelector(".league-matchups");
    console.log('leaguePage:', leaguePage);

    if (leaguePage) {
        console.log('On league page now');
        // Collect all team projections (team name + raw + numeric)
        const results = [];
        const matchups = document.querySelectorAll('.matchup-row');
        matchups.forEach(m => {
            const users = m.querySelectorAll('.user');
            users.forEach(user => {
                const teamNameEl = user.querySelector('.team-name');
                const projEl = user.querySelector('.roster-score-and-projection-matchup .projections');
                const raw = projEl ? projEl.textContent.trim() : null;
                const cleaned = raw ? raw.replace(/[^0-9.\-]/g, '') : '';
                const num = (cleaned === '' || cleaned === '-') ? null : parseFloat(cleaned);
                results.push({
                    team: teamNameEl ? teamNameEl.textContent.trim() : null,
                    projectionRaw: raw,
                    projection: num
                });
            });
        });

        console.log('team projections:', results);

        // compute median of numeric projections
        const nums = results.map(r => r.projection).filter(v => v != null);
        nums.sort((a,b) => a-b);
        let median = null;
        if (nums.length) {
            const n = nums.length;
            median = (n % 2) ? nums[(n-1)/2] : (nums[n/2 -1] + nums[n/2]) / 2;
        }
        console.log('computed median:', median);

        // update the UI element (idempotent)
        displayProjectedMedian(document);
    }
}

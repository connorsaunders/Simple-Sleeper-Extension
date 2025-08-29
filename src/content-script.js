import { colorPlayers } from "../utils/add-heat-map";
import { displayScoreDifference } from "../elems/score-difference";
import { resizeScoreElement } from "../utils/resize-scores"; 
import { colorStatus } from "../utils/add-playing-redzone";


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
}

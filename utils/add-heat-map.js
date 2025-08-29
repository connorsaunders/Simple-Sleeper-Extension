////////////////////////////////////////////////////////////////////////////
// Add heatmap to players 
////////////////////////////////////////////////////////////////////////////

export function colorPlayers(allPlayers) {
    ////////////////////////////////////////////////////////////////////////////
    // Reset in-game color scheme and individual player score differences
    ////////////////////////////////////////////////////////////////////////////
    resetInGameItemColors();
    resetScoreDifference();
    
    ////////////////////////////////////////////////////////////////////////////
    // Grab all players scores:
    ////////////////////////////////////////////////////////////////////////////
    const allPlayersScores = allPlayers ? allPlayers.querySelectorAll(".player-scoring .score") : [];
    
    ////////////////////////////////////////////////////////////////////////////
    // Declare max difference for any 2 starters
    ////////////////////////////////////////////////////////////////////////////
    let maxDifference = 0;

    // Calculate the max difference between any 2 players of the same position (for conditional formatting)
    for (let i = 0; i < allPlayersScores.length; i += 2) {
        const score1 = parseFloat(allPlayersScores[i].textContent.trim()) || 0;
        const score2 = parseFloat(allPlayersScores[i + 1].textContent.trim()) || 0;
        maxDifference = Math.max(maxDifference, Math.abs(score1 - score2));
    }

    ////////////////////////////////////////////////////////////////////////////
    // Iterate through players and add conditionally formatted colors + differences
    ////////////////////////////////////////////////////////////////////////////
    for (let i = 0; i < allPlayersScores.length; i += 2) {
        const score1Element = allPlayersScores[i];
        const score2Element = allPlayersScores[i + 1];

        const isScore1Dash = score1Element.textContent.trim() === "-";
        const isScore2Dash = score2Element.textContent.trim() === "-";

        let score1 = isScore1Dash ? 0 : parseFloat(score1Element.textContent);
        let score2 = isScore2Dash ? 0 : parseFloat(score2Element.textContent);

        const playerItem1 = score1Element.closest('.matchup-player-item');
        const playerItem2 = score2Element.closest('.matchup-player-item');

        // Reset colors if both scores are dashes
        if (isScore1Dash && isScore2Dash) {
            const uniqueId1 = `difference-${i}`;
            const uniqueId2 = `difference-${i + 1}`;

            const differenceElement1 = document.querySelector(`#${uniqueId1}`);
            const differenceElement2 = document.querySelector(`#${uniqueId2}`);

            if (differenceElement1) {
                differenceElement1.textContent = "0.00";
                differenceElement1.style.color = 'white';
            }
            if (differenceElement2) {
                differenceElement2.textContent = "0.00";
                differenceElement2.style.color = 'white';
            }
        }

        playerItem1.style.borderRadius = playerItem2.style.borderRadius = '10px';

        // Remove the shadow
        playerItem1.style.boxShadow = '';
        playerItem2.style.boxShadow = '';

        // --- REMOVED: Position-based outline ---
        playerItem1.style.border = '';
        playerItem2.style.border = '';

        const difference = parseFloat((score1 - score2).toFixed(2));
        const intensity = Math.abs(difference) / maxDifference * 0.15 + 0.05;

        if (score1 < score2) {
            if (!isScore1Dash) {
                playerItem1.style.backgroundColor = `rgba(255, 0, 0, ${intensity})`;
            }
            if (!isScore2Dash) {
                playerItem2.style.backgroundColor = `rgba(0, 128, 0, ${intensity})`;
            }
        } else if (score1 > score2) {
            if (!isScore1Dash) {
                playerItem1.style.backgroundColor = `rgba(0, 128, 0, ${intensity})`;
            }
            if (!isScore2Dash) {
                playerItem2.style.backgroundColor = `rgba(255, 0, 0, ${intensity})`;
            }
        } else {
            if (!isScore1Dash) {
                playerItem1.style.backgroundColor = `rgba(255, 255, 0, ${intensity + 0.01})`;
            }
            if (!isScore2Dash) {
                playerItem2.style.backgroundColor = `rgba(255, 255, 0, ${intensity + 0.01})`;
            }
        }

        const uniqueId1 = `difference-${i}`;
        const uniqueId2 = `difference-${i + 1}`;

        let differenceElement1 = document.querySelector(`#${uniqueId1}`);
        if (!differenceElement1) {
            differenceElement1 = document.createElement('div');
            differenceElement1.id = uniqueId1;
            differenceElement1.className = 'score-difference-added';
            differenceElement1.style.fontSize = '9px';
            differenceElement1.style.textAlign = 'center';
            differenceElement1.style.marginTop = '3px';
            score1Element.parentNode.insertBefore(differenceElement1, score1Element.nextSibling);
        }
        differenceElement1.textContent = difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);
        differenceElement1.style.color = difference > 0 ? 'rgb(4,204,188)' : (difference < 0 ? 'rgb(251,44,107)' : 'white');

        let differenceElement2 = document.querySelector(`#${uniqueId2}`);
        if (!differenceElement2) {
            differenceElement2 = document.createElement('div');
            differenceElement2.id = uniqueId2;
            differenceElement2.className = 'score-difference-added';
            differenceElement2.style.fontSize = '9px';
            differenceElement2.style.textAlign = 'center';
            differenceElement2.style.marginTop = '3px';
            score2Element.parentNode.insertBefore(differenceElement2, score2Element.nextSibling);
        }
        let differenceScore2 = parseFloat((score2 - score1).toFixed(2));
        differenceElement2.textContent = differenceScore2 > 0 ? `+${differenceScore2.toFixed(2)}` : differenceScore2.toFixed(2);
        differenceElement2.style.color = differenceScore2 < 0 ? 'rgb(251,44,107)' : (differenceScore2 > 0 ? 'rgb(4,204,188)' : 'white');
    }
}

function resetInGameItemColors() {
    const inGameItems = document.querySelectorAll(".matchup-player-body-item.in-game-flip, .matchup-player-body-item.in-game");
    inGameItems.forEach(item => {
        // Reset styles of the main element
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        item.style.boxShadow = ''; // Reset box-shadow if needed
        item.classList.remove('player-item'); // Remove the class if it's no longer needed
        item.style.border = ''; // Also reset border
    });
}

function resetScoreDifference() {
    // Reset difference elements
    const differenceElements = document.querySelectorAll('.score-difference-added');
    differenceElements.forEach(diffElem => {
        diffElem.textContent = '0.00';
        diffElem.style.color = 'white';
    });
}

export function addHeatmapToggleButton(differenceElement) {
    let heatmapToggle = document.querySelector("#heatmapToggleButton");
    if (!heatmapToggle) {
        heatmapToggle = document.createElement("button");
        heatmapToggle.id = "heatmapToggleButton";
        heatmapToggle.textContent = "Toggle Heatmap";
        // Style: semi-transparent gray, white text, same width, NO border, light shadow
        heatmapToggle.style.display = "block";
        heatmapToggle.style.margin = "10px auto";
        heatmapToggle.style.padding = "10px 20px";
        heatmapToggle.style.borderRadius = "8px";
        heatmapToggle.style.fontSize = "16px";
        heatmapToggle.style.cursor = "pointer";
        heatmapToggle.style.background = "rgba(64, 64, 64, 0.65)";
        heatmapToggle.style.color = "#fff";
        heatmapToggle.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
        heatmapToggle.style.fontWeight = "500";
        heatmapToggle.style.textAlign = "center";
        heatmapToggle.style.transition = "background 0.15s, box-shadow 0.15s";
        heatmapToggle.style.width = differenceElement.offsetWidth
            ? differenceElement.offsetWidth + "px"
            : "220px";
        heatmapToggle.style.border = "none";
        heatmapToggle.style.outline = "none";
        heatmapToggle.style.boxSizing = "border-box";
        heatmapToggle.style.appearance = "none";
        heatmapToggle.style.WebkitAppearance = "none";
        differenceElement.parentNode.insertBefore(heatmapToggle, differenceElement.nextSibling);

        // Keep button width in sync with differenceElement
        new ResizeObserver(() => {
            heatmapToggle.style.width = differenceElement.offsetWidth + "px";
        }).observe(differenceElement);

        // Press effect
        heatmapToggle.addEventListener("mousedown", () => {
            heatmapToggle.style.background = "rgba(64, 64, 64, 0.85)";
            heatmapToggle.style.boxShadow = "0 1px 3px rgba(0,0,0,0.13)";
        });
        heatmapToggle.addEventListener("mouseup", () => {
            heatmapToggle.style.background = "rgba(64, 64, 64, 0.65)";
            heatmapToggle.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
        });
        heatmapToggle.addEventListener("mouseleave", () => {
            heatmapToggle.style.background = "rgba(64, 64, 64, 0.65)";
            heatmapToggle.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
        });

        heatmapToggle.addEventListener("click", function () {
            window.heatmapEnabled = !window.heatmapEnabled;
            if (!window.heatmapEnabled) {
                resetHeatmapColors();
            } else {
                const allPlayers = document.querySelector(".player-section");
                if (allPlayers) colorPlayers(allPlayers);
            }
            heatmapToggle.textContent = window.heatmapEnabled ? "Turn Heatmap Off" : "Turn Heatmap On";
        });
    }
    // Set initial state
    if (typeof window.heatmapEnabled === "undefined") {
        window.heatmapEnabled = true;
        heatmapToggle.textContent = "Turn Heatmap Off";
    }
}

// Helper to reset all player coloring and differences
export function resetHeatmapColors() {
    // Reset all player item backgrounds (removes heatmap)
    document.querySelectorAll('.matchup-player-item').forEach(item => {
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
        item.style.boxShadow = '';
        item.style.border = '';
        item.style.borderRadius = '10px';
    });
    resetScoreDifference();
}

import { getStarterPairs, parseScore } from "./sleeper-dom";

////////////////////////////////////////////////////////////////////////////
// Add heatmap to players
////////////////////////////////////////////////////////////////////////////

const POSITIVE = 'rgb(4,204,188)';
const NEGATIVE = 'rgb(251,44,107)';
const NEUTRAL = 'white';

export function colorPlayers(pairs = getStarterPairs()) {
    if (window.heatmapEnabled === false) return;

    ////////////////////////////////////////////////////////////////////////////
    // Declare max difference for any 2 starters (for conditional formatting)
    ////////////////////////////////////////////////////////////////////////////
    let maxDifference = 0;
    pairs.forEach(([left, right]) => {
        const s1 = parseScore(left.scoreEl.textContent) || 0;
        const s2 = parseScore(right.scoreEl.textContent) || 0;
        maxDifference = Math.max(maxDifference, Math.abs(s1 - s2));
    });

    ////////////////////////////////////////////////////////////////////////////
    // Iterate through players and add conditionally formatted colors + differences
    ////////////////////////////////////////////////////////////////////////////
    pairs.forEach(([left, right], i) => {
        const raw1 = parseScore(left.scoreEl.textContent);
        const raw2 = parseScore(right.scoreEl.textContent);
        const isScore1Dash = raw1 === null;
        const isScore2Dash = raw2 === null;
        const score1 = raw1 || 0;
        const score2 = raw2 || 0;

        const playerItem1 = left.item;
        const playerItem2 = right.item;

        playerItem1.style.borderRadius = playerItem2.style.borderRadius = '10px';
        playerItem1.style.boxShadow = playerItem2.style.boxShadow = '';
        playerItem1.style.border = playerItem2.style.border = '';
        playerItem1.style.backgroundColor = playerItem2.style.backgroundColor = '';

        const difference = parseFloat((score1 - score2).toFixed(2));
        const intensity = maxDifference > 0
            ? Math.abs(difference) / maxDifference * 0.15 + 0.05
            : 0.05;

        if (score1 < score2) {
            if (!isScore1Dash) playerItem1.style.backgroundColor = `rgba(255, 0, 0, ${intensity})`;
            if (!isScore2Dash) playerItem2.style.backgroundColor = `rgba(0, 128, 0, ${intensity})`;
        } else if (score1 > score2) {
            if (!isScore1Dash) playerItem1.style.backgroundColor = `rgba(0, 128, 0, ${intensity})`;
            if (!isScore2Dash) playerItem2.style.backgroundColor = `rgba(255, 0, 0, ${intensity})`;
        } else {
            if (!isScore1Dash) playerItem1.style.backgroundColor = `rgba(255, 255, 0, ${intensity + 0.01})`;
            if (!isScore2Dash) playerItem2.style.backgroundColor = `rgba(255, 255, 0, ${intensity + 0.01})`;
        }

        setDifference(left, `difference-${i * 2}`, difference);
        setDifference(right, `difference-${i * 2 + 1}`, -difference);
    });
}

// Small "+4.20" / "-4.20" directly under a player's score (above "proj."),
// matching where the classic UI showed it.
function setDifference(player, id, diff) {
    let el = document.getElementById(id);
    if (!el || el.nextElementSibling !== player.projLine) {
        if (el) el.remove();
        el = document.createElement('div');
        el.id = id;
        el.className = 'score-difference-added';
        el.style.fontSize = '9px';
        el.style.lineHeight = '11px';
        el.style.marginTop = '1px';
        player.scoreColumn.insertBefore(el, player.projLine);
    }
    const value = parseFloat(diff.toFixed(2));
    const text = value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    if (el.textContent !== text) el.textContent = text;
    el.style.color = value > 0 ? POSITIVE : (value < 0 ? NEGATIVE : NEUTRAL);
}

export function addHeatmapToggleButton(differenceElement) {
    let heatmapToggle = document.querySelector("#heatmapToggleButton");
    if (!heatmapToggle) {
        heatmapToggle = document.createElement("button");
        heatmapToggle.id = "heatmapToggleButton";
        heatmapToggle.textContent = "Toggle Heatmap";
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

        new ResizeObserver(() => {
            heatmapToggle.style.width = differenceElement.offsetWidth + "px";
        }).observe(differenceElement);

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
                colorPlayers();
            }
            heatmapToggle.textContent = window.heatmapEnabled ? "Turn Heatmap Off" : "Turn Heatmap On";
        });
    }
    if (typeof window.heatmapEnabled === "undefined") {
        window.heatmapEnabled = true;
        heatmapToggle.textContent = "Turn Heatmap Off";
    }
}

// Helper to reset all player coloring and differences
export function resetHeatmapColors() {
    getStarterPairs().forEach(pair => pair.forEach(p => {
        p.item.style.backgroundColor = '';
        p.item.style.boxShadow = '';
        p.item.style.border = '';
    }));
    document.querySelectorAll('.score-difference-added').forEach(el => el.remove());
}

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
        heatmapToggle.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"; // light shadow, matches score-difference.js
        heatmapToggle.style.fontWeight = "500";
        heatmapToggle.style.textAlign = "center";
        heatmapToggle.style.transition = "background 0.15s, box-shadow 0.15s";
        heatmapToggle.style.width = differenceElement.offsetWidth
            ? differenceElement.offsetWidth + "px"
            : "220px"; // fallback width if not rendered yet
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

        // Press effect: darken background and reduce shadow on mousedown, revert on mouseup/mouseleave
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
            document.dispatchEvent(new CustomEvent("toggleHeatmap", { detail: { enabled: window.heatmapEnabled } }));
            heatmapToggle.textContent = window.heatmapEnabled ? "Turn Heatmap Off" : "Turn Heatmap On";
        });
    }
    // Set initial state
    if (typeof window.heatmapEnabled === "undefined") {
        window.heatmapEnabled = true;
        heatmapToggle.textContent = "Turn Heatmap Off";
    }
}
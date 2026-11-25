////////////////////////////////////////////////////////////////////////////
// Compute median of projection values on the league matchups page and display
// a small element with the value. Idempotent: updates existing element.
////////////////////////////////////////////////////////////////////////////

function parseNumber(text) {
    if (!text) return null;
    const cleaned = text.replace(/[^0-9.\-]/g, '').trim();
    if (cleaned === '' || cleaned === '-' ) return null;
    const v = parseFloat(cleaned);
    return Number.isFinite(v) ? v : null;
}

export function displayProjectedMedian(root = document) {
    let retryCount = 0;
    const maxRetries = 2;

    function checkAndInsert() {
        try {
            const nodes = Array.from(root.querySelectorAll('.roster-score-and-projection-matchup .projections'));
            const rawTexts = nodes.map(n => n.textContent.trim());
            const parsed = nodes.map(n => parseNumber(n.textContent));
            console.log('projected-median: found projections (raw):', rawTexts);
            console.log('projected-median: parsed values:', parsed);

            const values = parsed.filter(v => v !== null && !Number.isNaN(v));

            // sort ascending
            values.sort((a,b) => a - b);

            const existing = document.querySelector('#projected-median-display');

            if (values.length === 0) {
                if (retryCount >= maxRetries) {
                    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
                    return null;
                }
                retryCount++;
                setTimeout(checkAndInsert, 500);
                return null;
            }

            let median;
            const n = values.length;
            if (n % 2 === 1) median = values[(n - 1) / 2];
            else median = (values[n/2 - 1] + values[n/2]) / 2;

            const text = `Projected League Median: ${median.toFixed(2)}`;

            // Build or reuse the root element for the projected median display.
            let el = existing;
            if (!el) {
                el = document.createElement('div');
                el.id = 'projected-median-display';
            }

            // Ensure the element is keyboard accessible and toggleable.
            // We maintain a header (always visible) and a content area (collapses/expands).
            // Reuse existing subnodes if present to avoid re-attaching listeners multiple times.
            let header = el.querySelector('.pm-header');
            let content = el.querySelector('.pm-content');

            if (!header) {
                header = document.createElement('div');
                header.className = 'pm-header';
                header.textContent = 'Weekly League Stats 🔽';
                header.setAttribute('role', 'button');
            }

            // Style header (apply even if reusing existing header to enforce changes)
            header.style.fontWeight = '600';
            // Slightly bigger than the other 3 lines
            header.style.fontSize = '20px';
            // Underline the header text
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            header.style.paddingBottom = '6px';

            if (!content) {
                content = document.createElement('div');
                content.className = 'pm-content';
            }

            // Clear and populate the content area (this is what shows/hides)
            content.innerHTML = '';

            // Build a small table: Label | Projected | Actual
            // Align actuals to projections by finding the nearest .score for each projection node
            const projectedNodes = nodes; // from earlier
            const projectedValues = values; // already sorted for projected metrics

            // Map each projection node to its nearby score value (actual)
            const actualAligned = projectedNodes.map(n => {
                try {
                    const container = n.closest('.roster-score-and-projection-matchup') || n.parentNode;
                    const scoreEl = container ? container.querySelector('.score') : null;
                    return scoreEl ? parseNumber(scoreEl.textContent) : null;
                } catch (e) {
                    return null;
                }
            }).filter(v => v !== null && !Number.isNaN(v));

            // Fallback: if alignment produced no actuals, try a global query
            let actualValues = actualAligned;
            if (actualValues.length === 0) {
                actualValues = Array.from(root.querySelectorAll('.roster-score-and-projection-matchup .score'))
                    .map(n => parseNumber(n.textContent))
                    .filter(v => v !== null && !Number.isNaN(v));
            }
            actualValues.sort((a,b) => a - b);

            const projectedMedian = projectedValues.length ? (projectedValues.length % 2 === 1 ? projectedValues[(projectedValues.length-1)/2] : (projectedValues[projectedValues.length/2 -1] + projectedValues[projectedValues.length/2]) / 2) : null;
            const projectedAvg = projectedValues.length ? (projectedValues.reduce((s,v)=>s+v,0) / projectedValues.length) : null;
            const projectedLow = projectedValues.length ? projectedValues[0] : null;
            const projectedHigh = projectedValues.length ? projectedValues[projectedValues.length - 1] : null;

            const actualMedian = actualValues.length ? (actualValues.length % 2 === 1 ? actualValues[(actualValues.length-1)/2] : (actualValues[actualValues.length/2 -1] + actualValues[actualValues.length/2]) / 2) : null;
            const actualAvg = actualValues.length ? (actualValues.reduce((s,v)=>s+v,0) / actualValues.length) : null;
            const actualLow = actualValues.length ? actualValues[0] : null;
            const actualHigh = actualValues.length ? actualValues[actualValues.length - 1] : null;

            const table = document.createElement('div');
            table.style.display = 'grid';
            table.style.gridTemplateColumns = '1fr 1fr 1fr';
            // reduce vertical gap to make rows tighter
            table.style.gap = '4px 10px';
            table.style.alignItems = 'center';

            // header
            const headerLabel = document.createElement('div');
            headerLabel.textContent = '';
            headerLabel.style.fontWeight = '600';
            headerLabel.style.fontSize = '15px';

            const headerProj = document.createElement('div');
            headerProj.textContent = 'Projected';
            headerProj.style.fontWeight = '600';
            headerProj.style.textAlign = 'right';
            headerProj.style.fontSize = '15px';

            const headerAct = document.createElement('div');
            headerAct.textContent = 'Actual';
            headerAct.style.fontWeight = '600';
            headerAct.style.textAlign = 'right';
            headerAct.style.fontSize = '15px';

            table.appendChild(headerLabel);
            table.appendChild(headerProj);
            table.appendChild(headerAct);

            const makeRow = (labelText, projValue, actValue, isLast=false) => {
                const lbl = document.createElement('div');
                lbl.textContent = labelText;
                lbl.style.fontWeight = '600';
                lbl.style.fontSize = '16px';
                lbl.style.padding = '4px 0';

                const proj = document.createElement('div');
                proj.textContent = (projValue !== null && projValue !== undefined) ? Number(projValue).toFixed(2) : '-';
                proj.style.fontSize = '16px';
                proj.style.textAlign = 'right';
                proj.style.padding = '4px 0';

                const act = document.createElement('div');
                act.textContent = (actValue !== null && actValue !== undefined) ? Number(actValue).toFixed(2) : '-';
                act.style.fontSize = '16px';
                act.style.textAlign = 'right';
                act.style.padding = '4px 0';

                return {lbl, proj, act};
            };

            const rows = [];
            rows.push(makeRow('Median', projectedMedian, actualMedian));
            rows.push(makeRow('Average', projectedAvg, actualAvg));
            rows.push(makeRow('Low', projectedLow, actualLow));
            rows.push(makeRow('High', projectedHigh, actualHigh, true));

            rows.forEach((r,i) => {
                const isLast = i === rows.length - 1;
                // removed thick white separators as requested

                table.appendChild(r.lbl);
                table.appendChild(r.proj);
                table.appendChild(r.act);
            });

            // Color low/high numeric values
            if (rows[2] && rows[2].proj) rows[2].proj.style.color = 'rgb(247, 92, 141)';
            if (rows[3] && rows[3].proj) rows[3].proj.style.color = 'rgb(69, 230, 167)';
            if (rows[2] && rows[2].act) rows[2].act.style.color = 'rgb(247, 92, 141)';
            if (rows[3] && rows[3].act) rows[3].act.style.color = 'rgb(69, 230, 167)';

            content.appendChild(table);

            // Root element styles (always visible box)
            el.style.padding = '10px';
            el.style.textAlign = 'left';
            el.style.backgroundColor = 'rgba(0,0,0,0.06)';
            el.style.fontSize = '14px';
            el.style.marginTop = '0px';
            el.style.marginBottom = '10px';
            el.style.borderRadius = '8px';
            el.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)';
            el.style.cursor = 'pointer';

            // Content area transition styles
            content.style.overflow = 'hidden';
            content.style.maxHeight = '0px';
            content.style.transition = 'max-height 300ms ease, opacity 250ms ease';
            content.style.opacity = '0';

            // Insert header/content into root (idempotent)
            el.innerHTML = '';
            el.appendChild(header);

            // Build a two-column container inside content: left for existing stats, right for future content
            const columns = document.createElement('div');
            columns.className = 'pm-columns';
            columns.style.display = 'flex';
            columns.style.gap = '12px';
            // border to make it look like a table
            columns.style.border = '1px solid rgba(0,0,0,0.12)';
            columns.style.padding = '8px';
            columns.style.borderRadius = '6px';
            columns.style.backgroundClip = 'padding-box';

            const leftCol = document.createElement('div');
            leftCol.className = 'pm-left';
            leftCol.style.flex = '1 1 60%';
            leftCol.style.minWidth = '0';
            leftCol.style.paddingRight = '10px';

            const rightCol = document.createElement('div');
            rightCol.className = 'pm-right';
            rightCol.style.flex = '0 0 40%';
            rightCol.style.minWidth = '0';
            // subtle divider on the right column
            rightCol.style.borderLeft = '1px solid rgba(0,0,0,0.06)';
            rightCol.style.paddingLeft = '10px';

            // Move existing content children into leftCol
            while (content.firstChild) {
                leftCol.appendChild(content.firstChild);
            }

            // Right column is intentionally left empty for now (future stats/widgets)
            rightCol.innerHTML = '';

            columns.appendChild(leftCol);
            columns.appendChild(rightCol);

            content.appendChild(columns);
            el.appendChild(content);

            // Maintain expanded state across updates if previously expanded
            const wasExpanded = el.getAttribute('data-expanded') === 'true';
            if (wasExpanded) {
                // must allow the browser to measure content height
                requestAnimationFrame(() => {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                });
                header.setAttribute('aria-expanded', 'true');
                el.setAttribute('data-expanded', 'true');
            } else {
                content.style.maxHeight = '0px';
                content.style.opacity = '0';
                header.setAttribute('aria-expanded', 'false');
                el.setAttribute('data-expanded', 'false');
            }

            // Toggle handler: clicking header or the box toggles expansion.
            const toggle = () => {
                const expanded = el.getAttribute('data-expanded') === 'true';
                if (expanded) {
                    // collapse
                    content.style.maxHeight = '0px';
                    content.style.opacity = '0';
                    header.setAttribute('aria-expanded', 'false');
                    el.setAttribute('data-expanded', 'false');
                } else {
                    // expand: set to scrollHeight for smooth animation
                    requestAnimationFrame(() => {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        content.style.opacity = '1';
                    });
                    header.setAttribute('aria-expanded', 'true');
                    el.setAttribute('data-expanded', 'true');
                }
            };

            // Attach event listeners once
            if (!el.__pm_initialized) {
                header.addEventListener('click', toggle);
                el.addEventListener('click', (e) => {
                    // if user clicks the content area, don't re-toggle immediately (let header handle it)
                    // but allow clicking anywhere on the box to toggle; if click target is an interactive element, ignore
                    if (e.target && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')) return;
                    // prevent double-toggle when header click fires
                    if (e.target === header) return;
                    toggle();
                });
                // keyboard accessibility
                header.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        toggle();
                    }
                });
                el.__pm_initialized = true;
            }

            // Prefer inserting directly below the Matchups title header
            const titleEl = document.querySelector('.league-tab-container .row .title');
            if (titleEl && titleEl.parentNode) {
                // place after the title's row
                const row = titleEl.closest('.row');
                if (row && row.parentNode) {
                    row.parentNode.insertBefore(el, row.nextSibling);
                } else if (titleEl.parentNode) {
                    titleEl.parentNode.insertBefore(el, titleEl.nextSibling);
                }
            } else {
                // Insert element next to the .matchup-row like score-difference does
                const matchupHeader = document.querySelector('.matchup-row');
                if (matchupHeader && matchupHeader.parentNode) {
                    matchupHeader.parentNode.insertBefore(el, matchupHeader.nextSibling);
                } else if (!existing) {
                    // fallback to body append if no clear matchup location
                    document.body.appendChild(el);
                }
            }

            return median;
        } catch (err) {
            console.error('displayProjectedMedian error', err);
            return null;
        }
    }

    return checkAndInsert();
}

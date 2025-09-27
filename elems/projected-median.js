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

            let el = existing;
            if (!el) {
                el = document.createElement('div');
                el.id = 'projected-median-display';
            }

            // Keep styling minimal but consistent with score-difference
            // Create separate label and number spans so we can bold the label only
            const label = document.createElement('span');
            label.textContent = 'Weekly Projected League Median: ';
            label.style.fontWeight = '600';

            const number = document.createElement('span');
            number.textContent = median.toFixed(2);

            // Clear existing content and append spans
            el.innerHTML = '';
            el.appendChild(label);
            el.appendChild(number);
            el.style.padding = '10px';
            el.style.textAlign = 'left';
            el.style.backgroundColor = 'rgba(0,0,0,0.06)';
            el.style.fontSize = '14px';
            el.style.marginTop = '0px';
            el.style.marginBottom = '10px';
            el.style.borderRadius = '8px';
            el.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)';

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

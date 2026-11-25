////////////////////////////////////////////////////////////////////////////
// Shared text styles for the boxes the extension adds to the new UI.
// Mirrors Sleeper's own "48% win" pairing: words in Google Sans Flex
// (medium), numbers in the wide, heavy face used for the matchup scores.
////////////////////////////////////////////////////////////////////////////

export const LABEL_STYLE = {
    fontFamily: '"Google Sans Flex", Inter, sans-serif',
    fontWeight: '500',
    fontVariationSettings: 'normal',
    letterSpacing: '-0.25px'
};

export const NUMBER_STYLE = {
    fontFamily: '"Google Sans Flex Wide", "Google Sans Flex", Inter, sans-serif',
    fontWeight: '900',
    fontVariationSettings: '"wdth" 140',
    letterSpacing: '-0.3px'
};

// Render [{ text, number }] as spans inside `el`, only touching the DOM when
// the text changes. numberStyle: style for number parts (null = inherit).
export function setParts(el, parts, numberStyle = NUMBER_STYLE) {
    const key = parts.map(p => `${p.number ? '#' : ''}${p.text}`).join('|');
    if (el.dataset.parts === key) return;
    el.dataset.parts = key;
    el.textContent = '';
    parts.forEach(p => {
        const span = document.createElement('span');
        span.textContent = p.text;
        if (p.number && numberStyle) Object.assign(span.style, numberStyle);
        el.appendChild(span);
    });
}

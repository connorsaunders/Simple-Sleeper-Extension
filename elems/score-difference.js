import { getMatchupHeader, parseScore } from "../utils/sleeper-dom";
import { LABEL_STYLE, setParts } from "../utils/text-styles";

////////////////////////////////////////////////////////////////////////////
// Create score differential element, add conditional colors to team blocks
////////////////////////////////////////////////////////////////////////////

const LOSING_BG = 'rgba(255, 0, 0, 0.15)';
const WINNING_BG = 'rgba(0, 128, 0, 0.15)';
const TIED_BG = 'rgba(64, 64, 64, 0.15)';

export function displayScoreDifference(header = getMatchupHeader()) {
    if (!header) return null;

    ////////////////////////////////////////////////////////////////////////////
    // Capture my score and opponent's ("—" before kickoff counts as 0)
    ////////////////////////////////////////////////////////////////////////////
    const myScore = parseScore(header.myScoreEl.textContent) || 0;
    const opponentScore = parseScore(header.oppScoreEl.textContent) || 0;
    const difference = myScore - opponentScore;

    ////////////////////////////////////////////////////////////////////////////
    // Create element display text
    ////////////////////////////////////////////////////////////////////////////
    // Words in the label font, numbers in the score font
    let parts;
    if (difference < 0) parts = [{ text: 'Losing by ' }, { text: difference.toFixed(2), number: true }];
    else if (difference > 0) parts = [{ text: 'Winning by ' }, { text: difference.toFixed(2), number: true }];
    else parts = [{ text: 'Tied' }];

    const bg = difference < 0 ? LOSING_BG : (difference === 0 ? TIED_BG : WINNING_BG);

    ////////////////////////////////////////////////////////////////////////////
    // Create or update element scoreDifferenceDisplay
    ////////////////////////////////////////////////////////////////////////////
    let differenceElement = document.querySelector("#scoreDifferenceDisplay");
    if (!differenceElement) {
        differenceElement = document.createElement("div");
        differenceElement.id = "scoreDifferenceDisplay";
        differenceElement.style.padding = '10px';
        differenceElement.style.textAlign = 'center';
        Object.assign(differenceElement.style, LABEL_STYLE);
        differenceElement.style.fontSize = '16px';
        differenceElement.style.lineHeight = '22px';
        differenceElement.style.marginTop = '10px';
        differenceElement.style.marginBottom = '0px';
        differenceElement.style.borderRadius = '8px';
        differenceElement.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)';
        differenceElement.style.color = 'var(--color-dls-text, inherit)';
    }
    setParts(differenceElement, parts);
    differenceElement.style.backgroundColor = bg;

    ////////////////////////////////////////////////////////////////////////////
    // Insert element directly under the matchup score card
    ////////////////////////////////////////////////////////////////////////////
    const { card } = header;
    if (card.nextElementSibling !== differenceElement) {
        card.parentNode.insertBefore(differenceElement, card.nextSibling);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Conditional color of each team's half of the score card.
    // (Classic had two separate owner cards; the new UI has one shared card,
    // so tint its left half for my team and its right half for the opponent.)
    // Each half fades in its own color: strongest at the outer edge, easing
    // lighter toward the center line.
    ////////////////////////////////////////////////////////////////////////////
    const RED = '255, 0, 0';
    const GREEN = '0, 128, 0';
    const GRAY = '64, 64, 64';
    let mine = GRAY;
    let theirs = GRAY;
    if (difference < 0) {
        mine = RED;
        theirs = GREEN;
    } else if (difference > 0) {
        mine = GREEN;
        theirs = RED;
    }
    const EDGE = 0.24;   // alpha at the card's outer edges
    const CENTER = 0.08; // alpha where the two halves meet
    card.style.backgroundImage = `linear-gradient(90deg,
        rgba(${mine}, ${EDGE}) 0%, rgba(${mine}, ${CENTER}) 50%,
        rgba(${theirs}, ${CENTER}) 50%, rgba(${theirs}, ${EDGE}) 100%)`;

    // Sleeper decorates the card with two blurred corner glows (aqua left,
    // red right) that wash out the tint toward the edges. Hide them so each
    // half stays in its own color.
    card.querySelectorAll(':scope > span[aria-hidden="true"][class*="blur"]').forEach(glow => {
        if (glow.style.display !== 'none') glow.style.display = 'none';
    });

    return differenceElement;
}

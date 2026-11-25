////////////////////////////////////////////////////////////////////////////
// Resize the scores of both teams 
////////////////////////////////////////////////////////////////////////////

export function resizeScoreElement() {
    // Select all score elements within the class `.roster-score-and-projection-matchup`
    const scoreElements = document.querySelectorAll(".roster-score-and-projection-matchup .score");
    
    // Loop through all the matching elements (2) and apply the styles
    scoreElements.forEach(scoreElement => {
        scoreElement.style.fontSize = "18px";     
        scoreElement.style.fontWeight = "normal";  
    });
}

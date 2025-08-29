////////////////////////////////////////////////////////////////////////////
// Create score differential element, add conditional colors to team scores
////////////////////////////////////////////////////////////////////////////

export function displayScoreDifference(users, scores) {
    console.log('displayScoreDifference function is running');

    let retryCount = 0;
    const maxRetries = 1;

    ////////////////////////////////////////////////////////////////////////////
    // Check scores
    ////////////////////////////////////////////////////////////////////////////
    function checkScores() {
        // Users and scores captured:
        if (users.length === 2 && scores.length === 2) {

            ////////////////////////////////////////////////////////////////////////////
            // Capture my score and opponents
            ////////////////////////////////////////////////////////////////////////////
            // Check if either score contains '-'
            const isScore1Dash = scores[0].textContent.trim() === "-";
            const isScore2Dash = scores[1].textContent.trim() === "-";

            // Declare my score and opponent's score 
            let myScore = isScore1Dash ? 0 : parseFloat(scores[0].textContent);
            let opponentScore = isScore2Dash ? 0 : parseFloat(scores[1].textContent);

            // Difference:
            const difference = myScore - opponentScore;

            ////////////////////////////////////////////////////////////////////////////
            // Create element display text
            ////////////////////////////////////////////////////////////////////////////
            // Add difference element:
            let displayText = "";
            // Losing (negative difference):
            if (difference < 0) {
                displayText = `test Losing by ${difference.toFixed(2)}`;
            // Winning (positive difference):
            } else if (difference > 0) {
                displayText = `test Winning by ${difference.toFixed(2)}`;
            // Tied:
            } else {
                displayText = 'Tied';
            }
            ////////////////////////////////////////////////////////////////////////////
            // Create or update element scoreDifferenceDisplay
            ////////////////////////////////////////////////////////////////////////////
            let differenceElement = document.querySelector("#scoreDifferenceDisplay");

            if (!differenceElement) {
                differenceElement = document.createElement("div");
                differenceElement.id = "scoreDifferenceDisplay";
                document.body.appendChild(differenceElement);
            }
            ////////////////////////////////////////////////////////////////////////////
            // Update display element traits:
            ////////////////////////////////////////////////////////////////////////////
            differenceElement.textContent = displayText;
            differenceElement.style.padding = '10px';
            differenceElement.style.textAlign = 'center';
            differenceElement.style.backgroundColor = difference < 0 ? 'rgba(255, 0, 0, 0.15)' : (difference === 0 ? 'rgba(64, 64, 64, 0.15)' : 'rgba(0, 128, 0, 0.15)');
            differenceElement.style.fontSize = '16px';
            differenceElement.style.marginTop = '0px';
            differenceElement.style.marginBottom = '10px';
            differenceElement.style.borderRadius = '8px';   
            //differenceElement.style.outline = difference < 0 ? '2px solid rgba(0, 0, 0, 0.4)' : (difference === 0 ? '2px solid rgba(0, 0, 0, 0.4)' : '2px solid rgba(0, 0, 0, 0.4)');
            differenceElement.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)'

            ////////////////////////////////////////////////////////////////////////////
            // Insert element:
            ////////////////////////////////////////////////////////////////////////////
            const matchupHeader = document.querySelector('.matchup-row');
            if (matchupHeader && matchupHeader.parentNode) {
                matchupHeader.parentNode.insertBefore(differenceElement, matchupHeader.nextSibling);
            }

            ////////////////////////////////////////////////////////////////////////////
            // Conditional color of score difference element:
            ////////////////////////////////////////////////////////////////////////////
            const ownerItems = document.querySelectorAll('.matchup-owner-item');
            if (ownerItems.length === 2) {
                const ownerItem1 = ownerItems[0];
                const ownerItem2 = ownerItems[1];
                
                ownerItem1.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)'
                ownerItem2.style.boxShadow = '1px 1px 3px rgba(0, 0, 0, 0.3)'


                if (difference < 0) {
                    ownerItem1.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
                    ownerItem2.style.backgroundColor = 'rgba(0, 128, 0, 0.15)';
                    // ownerItem1.style.outline = '3px 3px 5px rgba(0, 0, 0, 0.3)'; 
                    // ownerItem2.style.outline = '3px 3px 5px rgba(0, 0, 0, 0.3)'; 
                } else if (difference > 0) {
                    ownerItem1.style.backgroundColor = 'rgba(0, 128, 0, 0.15)';
                    ownerItem2.style.backgroundColor = 'rgba(255, 0, 0, 0.15)';
                } else {  // tie
                    ownerItem1.style.backgroundColor = 'rgba(64, 64, 64, 0.15)';
                    ownerItem2.style.backgroundColor = 'rgba(64, 64, 64, 0.15)';
                    // ownerItem1.style.outline = '3px 3px 5px rgba(0, 0, 0, 0.3)'; 
                    // ownerItem2.style.outline = '3px 3px 5px rgba(0, 0, 0, 0.3)';                                 
                }
            }
        // Potential refactor/remove:
        } else if (retryCount >= maxRetries) {
            console.log('Max retries reached, giving up...');
        } else {
            console.log('Could not find the scores, retrying...');
            retryCount++;
            setTimeout(checkScores, 1000); // Retry after a short delay
        }
    }

    checkScores();
}

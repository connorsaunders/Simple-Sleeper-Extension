export function colorStatus(allPlayers) {

    const allPlayersScores = allPlayers ? allPlayers.querySelectorAll(".player-scoring .score") : [];


    for (let i = 0; i < allPlayersScores.length; i += 2) {
        const score1Element = allPlayersScores[i];
        const score2Element = allPlayersScores[i + 1];
        // const playerItem1 = score1Element.closest('.matchup-player-item');
        // const playerItem2 = score2Element.closest('.matchup-player-item');

        ////////////////////////////////////////////////////////////////////////////
        // Playing not in redzone:
        ////////////////////////////////////////////////////////////////////////////
        // playerItem1.style.borderRadius = playerItem2.style.borderRadius = '15px';
        // playerItem1.style.outline = playerItem2.style.outline = '3px solid rgba(255, 255, 0, .5)';
        // loadStylesheet('./css/playing.css');
        // playerItem1.classList.add('player-item');
        // playerItem2.classList.add('player-item');

        ////////////////////////////////////////////////////////////////////////////
        // Playing in redzone:
        ////////////////////////////////////////////////////////////////////////////
        // playerItem1.style.borderRadius = playerItem2.style.borderRadius = '15px';
        // playerItem1.style.outline = playerItem2.style.outline = '3px solid rgba(251, 44, 107, 0.5)';
        // loadStylesheet('./css/redzone.css');
        // playerItem1.classList.add('player-item');
        // playerItem2.classList.add('player-item');

        // Has not played yet:
        //playerItem1.style.borderRadius = playerItem2.style.borderRadius = '15px';
        //playerItem1.style.outline = playerItem2.style.outline = '2px solid rgba(200, 200, 200, 1)';
        //playerItem1.style.outline = playerItem2.style.outline = '2px solid rgba(100, 100, 100, 1)';

    }

    // function loadStylesheet(href) {
    //     const link = document.createElement('link');
    //     link.rel = 'stylesheet';
    //     link.type = 'text/css';
    //     link.href = chrome.runtime.getURL(href);
    //     document.head.appendChild(link);
    // }

    
    // Has not played yet:
    // playerItem1.style.borderRadius = playerItem2.style.borderRadius = '15px';
    // playerItem1.style.outline = playerItem2.style.outline = '3px solid rgba(150, 150, 150, 0.75)';

    // Has not played yet:
    // playerItem1.style.borderRadius = playerItem2.style.borderRadius = '15px';
    // playerItem1.style.outline = playerItem2.style.outline = '3px solid rgba(0, 0, 0, .5)';

    // Load the CSS file
    //loadStylesheet('css/redzone.css');


    // Apply the CSS class for animated border and glowing effect

}
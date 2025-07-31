// narratives/hell-opening.js - Hell theme opening narrative configuration

export const hellOpeningNarrative = {
    id: 'hell-opening',
    
    phases: [
        {
            type: 'approach',
            character: 'narrator',
            startScale: 0.03,
            endScale: 1,
            duration: 6000,
            onStart: (game) => {
                // Hide start screen
                game.elements.startScreen.style.display = 'none';
                // Enable fire background with delay
                setTimeout(() => {
                    game.elements.fireCanvas.style.opacity = 0.3;
                }, 2000);
            }
        },
        
        {
            type: 'dialogue',
            duration: 8000,
            lineInterval: 1500,
            lines: [
                "Math. Math never changes.",
                "It has been said that God is a mathematician.", 
                "True, and He noticed your skills!",
                "But you didn't do enough sucking up...",
                "Now you pay!"
            ]
        },
        
        {
            type: 'transformation',
            character: 'narrator',
            duration: 2000,
            shakeDelay: 0,
            shakeRepeats: 3,
            transformDelay: 500,
            transformState: 'angry', // Use theme-defined transformation
            onStart: (game) => {
                // Hide dialogue
                game.elements.voiceoverText.style.opacity = 0;
                // Intensify fire effect
                game.elements.fireCanvas.style.opacity = 1;
            }
        }
    ],

    onComplete: (game) => {
        // Hide all narrative elements
        game.elements.narratorContainer.style.display = 'none';
        game.elements.voiceoverText.style.display = 'none';
        
        // Start the actual game
        game.startGame();
    }
};

// Alternative quick-start narrative for skip option
export const hellQuickStart = {
    id: 'hell-quick-start',
    
    phases: [
        {
            type: 'custom',
            duration: 500,
            updateFunction: (game, elapsed) => {
                // Just show fire effect quickly
                const progress = elapsed / 500;
                game.elements.fireCanvas.style.opacity = progress;
            }
        }
    ],

    onComplete: (game) => {
        game.startGame();
    }
};

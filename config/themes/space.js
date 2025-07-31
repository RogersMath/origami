// config/themes/space.js - Example Space theme to demonstrate easy reskinning

export const spaceTheme = {
    meta: {
        id: 'space',
        title: 'Math Among The Stars',
        description: 'A cosmic mathematical adventure'
    },

    colors: {
        primary: '#00BFFF',           // Deep sky blue
        secondary: '#1E90FF',         // Dodger blue  
        accent: '#FF69B4',            // Hot pink
        background: '#000814',        // Very dark blue
        surface: '#001D3D',           // Dark blue
        text: '#E0E1DD',              // Light gray
        textEmphasis: '#FFD60A',      // Gold
        success: '#00FF7F',           // Spring green
        error: '#FF6B6B',             // Light red
        warning: '#FFA500'            // Orange
    },

    fonts: {
        primary: '"Courier New", monospace',
        secondary: '"Courier New", monospace',
        display: '"Orbitron", "Courier New", monospace'
    },

    spacing: {
        xs: '4px',
        sm: '8px', 
        md: '12px',
        lg: '16px',
        xl: '24px'
    },

    effects: {
        backgroundShader: 'stars',
        shadowColor: '#00BFFF',
        shadowBlur: '20px',
        glowColor: '#00BFFF',
        textShadow: '0 0 10px #00BFFF',
        borderRadius: '4px',
        transitionDuration: '0.3s'
    },

    audio: {
        backgroundMusic: 'space-music.json',
        soundEffects: {
            correct: { freq: 880, duration: 0.15, type: 'sine' },
            incorrect: { freq: 165, duration: 0.3, type: 'square' },
            enemyHit: { freq: 1000, duration: 0.1, type: 'triangle' },
            levelUp: { freq: 659, duration: 0.7, type: 'sine' },
            bossSpawn: { freq: 82, duration: 2, type: 'sawtooth' },
            gameOver: { freq: 110, duration: 3, type: 'triangle' },
            victory: { freq: 1320, duration: 2.5, type: 'sine' }
        }
    },

    entities: {
        enemy: [
            {
                if: { isTough: true },
                emoji: '👽',
                style: {
                    color: '#FF69B4',
                    filter: 'drop-shadow(0 0 15px #FF69B4)',
                    animation: 'pulse 0.8s infinite alternate'
                }
            },
            {
                emoji: '🛸',
                style: {
                    color: '#00BFFF'
                }
            }
        ],

        boss: {
            emoji: '🚀',
            container: 'boss-container',
            style: {
                filter: 'drop-shadow(0 0 25px rgba(0, 191, 255, 0.8))'
            },
            parts: {
                face: '🤖',
                body: '🚀', 
                accessory: '⚡'
            }
        },

        projectile: {
            style: {
                gradient: {
                    inner: '#FFD60A',
                    middle: '#00BFFF', 
                    outer: 'rgba(0,191,255,0)'
                }
            }
        }
    },

    ui: {
        gameTitle: 'Math Among The Stars',
        gameOverTitle: 'Mission Failed',
        winTitle: 'UNIVERSE SAVED!',
        
        buttons: {
            start: 'LAUNCH MISSION',
            skip: 'SKIP BRIEFING',
            reset: 'RETRY MISSION'
        },

        modal: {
            background: 'rgba(0,8,20,0.95)',
            titleSize: 'clamp(2.2rem, 9vw, 3.5rem)'
        },
        
        keypad: {
            buttonGradient: {
                normal: 'linear-gradient(145deg, #001D3D, #000814)',
                active: 'linear-gradient(145deg, #00BFFF, #1E90FF)',
                correct: 'linear-gradient(145deg, #00FF7F, #32CD32)',
                incorrect: 'linear-gradient(145deg, #FF6B6B, #FF4444)'
            }
        },

        hud: {
            background: 'rgba(0,29,61,0.8)',
            border: '1px solid var(--theme-primary)'
        }
    },

    assets: {
        audio: {
            basePath: 'themes/space/audio/',
            extension: ''
        },
        shaders: {
            basePath: 'themes/space/shaders/',
            extension: '.glsl'
        }
    },

    gameplay: {
        // Space theme could have different gameplay tweaks
        visualEffects: {
            screenShake: { enabled: false }, // More subtle in space
            particleTrails: { enabled: true },
            backgroundPulse: { enabled: true }
        },
        
        // Could modify game parameters for theme
        PROJECTILE_SPEED: 0.06, // Faster lasers in space
        ENEMY_BASE_SPEED: 0.00004 // Slightly slower aliens
    },

    // Quick start version (no lengthy narrative)
    quickStart: {
        id: 'space-quick-start',
        phases: [
            {
                type: 'custom',
                duration: 800,
                updateFunction: (game, elapsed) => {
                    // Quick starfield effect
                    const progress = elapsed / 800;
                    game.elements.fireCanvas.style.opacity = progress * 0.7;
                }
            }
        ],
        onComplete: (game) => {
            game.startGame();
        }
    }
};

// Example of how themes could have completely different narratives
export const spaceBriefingNarrative = {
    id: 'space-briefing',
    
    phases: [
        {
            type: 'approach',
            character: 'narrator',
            startScale: 0.05,
            endScale: 1.2,
            duration: 4000,
            onStart: (game) => {
                game.elements.startScreen.style.display = 'none';
                // Different background transition for space
                setTimeout(() => {
                    game.elements.fireCanvas.style.opacity = 0.6;
                }, 1000);
            }
        },
        
        {
            type: 'dialogue',
            duration: 6000,
            lineInterval: 1200,
            lines: [
                "Commander, we have a situation.",
                "Hostile alien ships are approaching Earth.",
                "Our defense systems are down.",
                "Only precise mathematical calculations can save us.",
                "Good luck, Commander."
            ]
        },
        
        {
            type: 'transformation',
            character: 'narrator',
            duration: 1500,
            shakeDelay: 0,
            shakeRepeats: 2,
            transformDelay: 300,
            transformations: {
                'narratorFace': '🤖',
                'narratorThumbs': '⚡'
            },
            onStart: (game) => {
                game.elements.voiceoverText.style.opacity = 0;
                game.elements.fireCanvas.style.opacity = 0.8;
            }
        }
    ],

    onComplete: (game) => {
        game.elements.narratorContainer.style.display = 'none';
        game.elements.voiceoverText.style.display = 'none';
        game.startGame();
    }
};

// config/themes/hell.js - Hell theme configuration

export const hellTheme = {
    meta: {
        id: 'hell',
        title: 'Math Is Hell',
        description: 'A fiery mathematical adventure'
    },

    colors: {
        primary: '#ff4500',           // Orange red
        secondary: '#ff8c00',         // Dark orange  
        accent: '#ff0000',            // Pure red
        background: '#000000',        // Black
        surface: '#111111',           // Dark gray
        text: '#cccccc',              // Light gray
        textEmphasis: '#ff8c00',      // Orange for emphasis
        success: '#00ff00',           // Green
        error: '#ff6666',             // Light red
        warning: '#ffff00'            // Yellow
    },

    fonts: {
        primary: '"Times New Roman", serif',
        secondary: 'monospace',
        display: '"Times New Roman", serif'
    },

    spacing: {
        xs: '5px',
        sm: '10px', 
        md: '15px',
        lg: '20px',
        xl: '30px'
    },

    effects: {
        backgroundShader: 'fire',
        shadowColor: '#ff0000',
        shadowBlur: '15px',
        glowColor: '#ff4500',
        textShadow: '2px 2px 8px #ff0000',
        borderRadius: '10px',
        transitionDuration: '0.2s'
    },

    audio: {
        backgroundMusic: 'music.json',
        soundEffects: {
            correct: { freq: 660, duration: 0.1, type: 'square' },
            incorrect: { freq: 220, duration: 0.2, type: 'sawtooth' },
            enemyHit: { freq: 800, duration: 0.1, type: 'square' },
            levelUp: { freq: 440, duration: 0.5, type: 'triangle' },
            bossSpawn: { freq: 100, duration: 1.5, type: 'sawtooth' },
            gameOver: { freq: 150, duration: 2, type: 'sawtooth' },
            victory: { freq: 880, duration: 2, type: 'sine' }
        }
    },

    entities: {
        enemy: [
            {
                if: { isTough: true },
                emoji: '💀',
                style: {
                    color: '#ff0000',
                    filter: 'drop-shadow(0 0 15px yellow)',
                    animation: 'pulse 0.5s infinite alternate'
                }
            },
            {
                emoji: '💀',
                style: {
                    color: '#ffffff'
                }
            }
        ],

        boss: {
            emoji: '👿',
            container: 'boss-container',
            style: {
                filter: 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.7))'
            },
            parts: {
                face: '👿',
                body: '👔', 
                accessory: '☕️'
            }
        },

        projectile: {
            style: {
                gradient: {
                    inner: 'white',
                    middle: 'yellow', 
                    outer: 'rgba(255,69,0,0)'
                }
            }
        }
    },

    ui: {
        modal: {
            background: 'rgba(0,0,0,0.9)',
            titleSize: 'clamp(2.5rem, 10vw, 4rem)'
        },
        
        keypad: {
            buttonGradient: {
                normal: 'linear-gradient(145deg, #333, #111)',
                active: 'linear-gradient(145deg, #ff4500, #ff8c00)',
                correct: 'linear-gradient(145deg, #00ff00, #90EE90)',
                incorrect: 'linear-gradient(145deg, #ff0000, #ff6666)'
            }
        },

        hud: {
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--theme-primary)'
        }
    },

    assets: {
        audio: {
            basePath: '',
            extension: ''
        },
        shaders: {
            basePath: 'shaders/',
            extension: '.glsl'
        }
    },

    gameplay: {
        // Theme can also influence gameplay parameters
        visualEffects: {
            screenShake: { enabled: true, intensity: 5 },
            particleTrails: { enabled: true },
            backgroundPulse: { enabled: true }
        }
    }
};

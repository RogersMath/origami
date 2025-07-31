// input.js - Theme-aware input handling system for Origami Engine

import { fireProjectile } from './enemies.js';

let lastAnswerTime = 0;

/**
 * Initialize input handling for the game
 * @param {GameEngine} game - Game engine instance
 */
export function initInput(game) {
    setupModalHandlers(game);
    setupKeypadHandlers(game);
    setupKeyboardHandlers(game);
    setupSettingsHandlers(game);
}

/**
 * Set up modal screen event handlers
 * @param {GameEngine} game - Game engine instance
 */
function setupModalHandlers(game) {
    // Start button - begins opening narrative or quick start
    game.elements.startBtn.addEventListener('click', () => {
        const narrative = game.narrativeManager ? 
            game.currentTheme?.narratives?.opening : null;
        
        if (narrative) {
            game.startOpening(narrative);
        } else {
            game.startGame();
        }
    });
    
    // Skip button - skip to game or use quick narrative
    game.elements.skipBtn.addEventListener('click', () => {
        const quickStart = game.currentTheme?.quickStart;
        
        if (quickStart) {
            game.startOpening(quickStart);
        } else {
            game.startGame();
        }
    });
    
    // Reset button - restart the game
    game.elements.resetBtn.addEventListener('click', () => {
        game.startGame();
    });
    
    // Resume button - resume from pause
    game.elements.resumeBtn.addEventListener('click', () => {
        game.togglePause();
    });
}

/**
 * Set up keypad button handlers
 * @param {GameEngine} game - Game engine instance
 */
function setupKeypadHandlers(game) {
    game.elements.keypadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const value = parseInt(btn.dataset.value);
            handleAnswer(game, value, btn);
        });
        
        // Add visual feedback for button presses
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'translateY(2px) scale(0.98)';
        });
        
        btn.addEventListener('mouseup', () => {
            btn.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

/**
 * Set up keyboard input handlers
 * @param {GameEngine} game - Game engine instance
 */
function setupKeyboardHandlers(game) {
    document.addEventListener('keydown', e => { 
        // Don't interfere with form inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
        
        // Handle number keys 1-9
        if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const value = parseInt(e.key);
            const button = findKeypadButton(game, value);
            handleAnswer(game, value, button);
        }
        
        // Handle numpad keys
        const numpadMap = {
            'Numpad7': 7, 'Numpad8': 8, 'Numpad9': 9, 
            'Numpad4': 4, 'Numpad5': 5, 'Numpad6': 6, 
            'Numpad1': 1, 'Numpad2': 2, 'Numpad3': 3
        };
        
        if (numpadMap[e.code]) {
            e.preventDefault();
            const value = numpadMap[e.code];
            const button = findKeypadButton(game, value);
            handleAnswer(game, value, button);
        }
        
        // Handle special keys
        switch (e.key) {
            case 'Escape':
                if (game.state.phase === 'playing') {
                    game.togglePause();
                } else if (game.narrativeManager?.isActive()) {
                    game.skipNarrative();
                }
                break;
                
            case ' ': // Spacebar
            case 'Enter':
                if (game.state.phase === 'menu') {
                    e.preventDefault();
                    game.elements.startBtn.click();
                } else if (game.state.phase === 'gameOver') {
                    e.preventDefault();
                    game.elements.resetBtn.click();
                }
                break;
        }
    });
    
    // Handle key release for visual feedback
    document.addEventListener('keyup', e => {
        if (e.key >= '1' && e.key <= '9') {
            const button = findKeypadButton(game, parseInt(e.key));
            if (button) {
                button.style.transform = '';
            }
        }
    });
}

/**
 * Set up settings and UI handlers
 * @param {GameEngine} game - Game engine instance
 */
function setupSettingsHandlers(game) {
    // Settings button - toggle pause menu
    game.elements.settingsBtn.addEventListener('click', () => {
        game.togglePause();
    });
    
    // Volume slider - handled in audio.js initialization
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', e => {
            // Volume control is handled in audio.js
            const event = new CustomEvent('volumeChange', { 
                detail: { volume: e.target.value / 100 } 
            });
            document.dispatchEvent(event);
        });
    }
    
    // Add keyboard navigation hints
    addKeyboardHints();
}

/**
 * Handle answer input from keypad or keyboard
 * @param {GameEngine} game - Game engine instance
 * @param {number} answer - The answer value
 * @param {HTMLElement} button - The button element (if clicked)
 */
function handleAnswer(game, answer, button = null) {
    // Check if game is in correct state
    if (game.state.phase !== 'playing' || 
        game.state.paused || 
        !game.state.currentAnswer) return; 
    
    // Debounce rapid input
    const now = performance.now();
    if (now - lastAnswerTime < 200) return;
    lastAnswerTime = now;
    
    // Visual feedback for keyboard input
    if (button) {
        button.style.transform = 'translateY(2px) scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    // Check if answer is correct
    if (answer === game.state.currentAnswer) { 
        handleCorrectAnswer(game, button);
    } else { 
        handleIncorrectAnswer(game, button);
    } 
}

/**
 * Handle correct answer
 * @param {GameEngine} game - Game engine instance
 * @param {HTMLElement} button - The button element
 */
function handleCorrectAnswer(game, button) {
    // Update score and fire projectile
    game.handleCorrectAnswer();
    
    // Visual feedback
    if (button) {
        button.classList.add('correct'); 
        setTimeout(() => button.classList.remove('correct'), 300); 
    }
    
    // Add screen flash effect for correct answers
    addScreenFlash('correct');
}

/**
 * Handle incorrect answer
 * @param {GameEngine} game - Game engine instance
 * @param {HTMLElement} button - The button element
 */
function handleIncorrectAnswer(game, button) {
    // Handle incorrect answer
    game.handleIncorrectAnswer();
    
    // Visual feedback
    if (button) {
        button.classList.add('incorrect'); 
        setTimeout(() => button.classList.remove('incorrect'), 400); 
    }
    
    // Add screen flash effect for incorrect answers
    addScreenFlash('incorrect');
}

/**
 * Find keypad button by value
 * @param {GameEngine} game - Game engine instance
 * @param {number} value - Button value to find
 * @returns {HTMLElement|null} Button element or null
 */
function findKeypadButton(game, value) {
    return Array.from(game.elements.keypadButtons)
        .find(b => parseInt(b.dataset.value) === value);
}

/**
 * Add screen flash effect for feedback
 * @param {string} type - Type of flash ('correct' or 'incorrect')
 */
function addScreenFlash(type) {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0.3;
        background: ${type === 'correct' ? 'var(--theme-success)' : 'var(--theme-error)'};
        animation: flash 0.2s ease-out;
    `;
    
    // Add flash keyframe if not exists
    if (!document.getElementById('flash-style')) {
        const style = document.createElement('style');
        style.id = 'flash-style';
        style.textContent = `
            @keyframes flash {
                0% { opacity: 0.3; }
                50% { opacity: 0.1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);
}

/**
 * Add keyboard navigation hints to the UI
 */
function addKeyboardHints() {
    // Add subtle keyboard hints if not on mobile
    if (!('ontouchstart' in window)) {
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.7);
            color: var(--theme-text);
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            z-index: 1000;
            opacity: 0.6;
            pointer-events: none;
            font-family: var(--theme-font-secondary);
        `;
        hint.textContent = 'Use keyboard 1-9 • ESC: pause • SPACE: start';
        
        document.body.appendChild(hint);
        
        // Auto-hide after a delay
        setTimeout(() => {
            hint.style.transition = 'opacity 2s';
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 2000);
        }, 5000);
    }
}

/**
 * Enable/disable input handling
 * @param {boolean} enabled - Whether input should be enabled
 */
export function setInputEnabled(enabled) {
    const keypadButtons = document.querySelectorAll('.keypad-btn');
    keypadButtons.forEach(btn => {
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? '1' : '0.5';
    });
}

/**
 * Add haptic feedback for mobile devices
 * @param {string} type - Type of haptic feedback
 */
function addHapticFeedback(type) {
    if ('vibrate' in navigator) {
        switch (type) {
            case 'correct':
                navigator.vibrate(50); // Short pulse
                break;
            case 'incorrect':
                navigator.vibrate([100, 50, 100]); // Error pattern
                break;
            case 'button':
                navigator.vibrate(20); // Light tap
                break;
        }
    }
}

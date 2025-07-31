// utils.js - Shared constants and helper functions for Origami Engine

// --- DOM Element Cache ---
export const DOM_ELEMENTS = {
    // Canvas elements
    fireCanvas: document.getElementById('fireCanvas'), 
    gameCanvas: document.getElementById('gameCanvas'),
    
    // UI containers
    uiOverlay: document.getElementById('ui-overlay'), 
    bottomUi: document.getElementById('bottom-ui'),
    
    // Game UI elements
    problemDisplay: document.getElementById('problem-display'), 
    keypadButtons: document.querySelectorAll('.keypad-btn'),
    scoreDisplay: document.getElementById('score-display'), 
    levelDisplay: document.getElementById('level-display'),
    settingsBtn: document.getElementById('settings-btn'),
    
    // Modal screens
    startScreen: document.getElementById('startScreen'), 
    pauseScreen: document.getElementById('pauseScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'), 
    finalScore: document.getElementById('finalScore'),
    
    // Modal buttons
    startBtn: document.getElementById('start-btn'), 
    skipBtn: document.getElementById('skip-btn'),
    resetBtn: document.getElementById('reset-btn'), 
    resumeBtn: document.getElementById('resume-btn'),
    
    // Character containers
    narratorContainer: document.getElementById('narrator-container'), 
    bossContainer: document.getElementById('boss-container'),
    voiceoverText: document.getElementById('voiceover-text'),
    
    // Character parts (populated by themes)
    narratorFace: document.getElementById('narrator-face'),
    narratorBody: document.getElementById('narrator-body'), 
    narratorAccessory: document.getElementById('narrator-accessory'),
    bossFace: document.getElementById('boss-face'),
    bossBody: document.getElementById('boss-body'),
    bossMug: document.getElementById('boss-accessory'), // Keep backward compatibility
    bossAccessory: document.getElementById('boss-accessory')
};

// --- Helper Functions ---

/**
 * Resize all canvas elements to match their display size with device pixel ratio
 */
export function resizeAll() { 
    const dpr = window.devicePixelRatio || 1; 
    const rect = DOM_ELEMENTS.gameCanvas.getBoundingClientRect(); 
    
    [DOM_ELEMENTS.gameCanvas, DOM_ELEMENTS.fireCanvas].forEach(canvas => { 
        if (canvas) {
            canvas.width = rect.width * dpr; 
            canvas.height = rect.height * dpr; 
        }
    }); 
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value  
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random value
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum integer
 * @param {number} max - Maximum integer
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if a point is inside a rectangle
 * @param {number} x - Point x coordinate
 * @param {number} y - Point y coordinate
 * @param {number} rectX - Rectangle x coordinate
 * @param {number} rectY - Rectangle y coordinate
 * @param {number} rectW - Rectangle width
 * @param {number} rectH - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function pointInRect(x, y, rectX, rectY, rectW, rectH) {
    return x >= rectX && x <= rectX + rectW && y >= rectY && y <= rectY + rectH;
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance between points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize an angle to 0-2π range
 * @param {number} angle - Angle in radians
 * @returns {number} Normalized angle
 */
export function normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Deep merge two objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    
    return result;
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format a number with commas for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Load an image and return a promise
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Promise that resolves with loaded image
 */
export function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the specified time
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// theme-switcher-demo.js - Demonstrates easy theme switching

import { gameManager } from './main.js';
import { hellTheme } from './config/themes/hell.js';
import { spaceTheme, spaceBriefingNarrative } from './config/themes/space.js';
import { hellOpeningNarrative, hellQuickStart } from './narratives/hell-opening.js';

// Available themes registry
const availableThemes = {
    hell: {
        theme: hellTheme,
        narrative: hellOpeningNarrative,
        quickStart: hellQuickStart
    },
    space: {
        theme: spaceTheme,
        narrative: spaceBriefingNarrative,
        quickStart: spaceTheme.quickStart
    }
};

/**
 * Switch to a different theme
 * @param {string} themeId - ID of the theme to switch to
 * @param {boolean} useQuickStart - Whether to use quick start narrative
 */
export function switchToTheme(themeId, useQuickStart = false) {
    const themeConfig = availableThemes[themeId];
    
    if (!themeConfig) {
        console.error(`Theme '${themeId}' not found`);
        return;
    }
    
    const narrative = useQuickStart ? themeConfig.quickStart : themeConfig.narrative;
    
    console.log(`Switching to ${themeId} theme${useQuickStart ? ' (quick start)' : ''}`);
    
    // Switch the theme
    gameManager.switchTheme(themeConfig.theme, narrative);
    
    // If game is running, restart with new theme
    const engine = gameManager.getEngine();
    if (engine.state.phase === 'playing') {
        engine.startGame(); // Restart with new theme
    }
}

/**
 * Get list of available themes
 * @returns {Array} Array of theme IDs
 */
export function getAvailableThemes() {
    return Object.keys(availableThemes);
}

/**
 * Create theme selector UI (for development/demo purposes)
 */
export function createThemeSelectorUI() {
    const selector = document.createElement('div');
    selector.id = 'theme-selector';
    selector.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background: rgba(0,0,0,0.8);
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-family: monospace;
        color: white;
    `;
    
    const label = document.createElement('div');
    label.textContent = 'Theme:';
    label.style.marginBottom = '5px';
    selector.appendChild(label);
    
    const themeSelect = document.createElement('select');
    themeSelect.style.cssText = `
        width: 100%;
        margin-bottom: 5px;
        padding: 2px;
    `;
    
    // Add theme options
    Object.keys(availableThemes).forEach(themeId => {
        const option = document.createElement('option');
        option.value = themeId;
        option.textContent = availableThemes[themeId].theme.meta.title;
        if (themeId === 'hell') option.selected = true; // Default selection
        themeSelect.appendChild(option);
    });
    
    const quickStartCheckbox = document.createElement('input');
    quickStartCheckbox.type = 'checkbox';
    quickStartCheckbox.id = 'quick-start-checkbox';
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = 'quick-start-checkbox';
    checkboxLabel.textContent = ' Quick Start';
    checkboxLabel.style.fontSize = '12px';
    
    const switchButton = document.createElement('button');
    switchButton.textContent = 'Switch Theme';
    switchButton.style.cssText = `
        width: 100%;
        padding: 5px;
        margin-top: 5px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    `;
    
    // Event handlers
    switchButton.addEventListener('click', () => {
        const selectedTheme = themeSelect.value;
        const useQuickStart = quickStartCheckbox.checked;
        switchToTheme(selectedTheme, useQuickStart);
    });
    
    // Quick switch on dropdown change
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        const useQuickStart = quickStartCheckbox.checked;
        switchToTheme(selectedTheme, useQuickStart);
    });
    
    selector.appendChild(themeSelect);
    selector.appendChild(quickStartCheckbox);
    selector.appendChild(checkboxLabel);
    selector.appendChild(switchButton);
    
    document.body.appendChild(selector);
    
    return selector;
}

// Auto-create theme selector in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            createThemeSelectorUI();
            console.log('Theme selector created. Available themes:', getAvailableThemes());
        }, 1000);
    });
}

// Expose functions globally for console access
window.switchToTheme = switchToTheme;
window.getAvailableThemes = getAvailableThemes;

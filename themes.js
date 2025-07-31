// themes.js - Theme management and CSS variable injection system

export class ThemeManager {
    constructor() {
        this.currentTheme = null;
    }

    /**
     * Load and apply a theme configuration
     * @param {Object} themeConfig - Theme configuration object
     */
    applyTheme(themeConfig) {
        this.currentTheme = themeConfig;
        this.injectCSSVariables(themeConfig);
        this.updateDOMElements(themeConfig);
    }

    /**
     * Inject theme variables into CSS custom properties
     * @param {Object} theme - Theme configuration
     */
    injectCSSVariables(theme) {
        const root = document.documentElement;
        
        // Colors
        if (theme.colors) {
            Object.entries(theme.colors).forEach(([key, value]) => {
                root.style.setProperty(`--theme-${key}`, value);
            });
        }

        // Fonts
        if (theme.fonts) {
            Object.entries(theme.fonts).forEach(([key, value]) => {
                root.style.setProperty(`--theme-font-${key}`, value);
            });
        }

        // Effects and animations
        if (theme.effects) {
            Object.entries(theme.effects).forEach(([key, value]) => {
                root.style.setProperty(`--theme-${key}`, value);
            });
        }

        // Spacing and sizing
        if (theme.spacing) {
            Object.entries(theme.spacing).forEach(([key, value]) => {
                root.style.setProperty(`--theme-spacing-${key}`, value);
            });
        }
    }

    /**
     * Update DOM elements with theme-specific content
     * @param {Object} theme - Theme configuration
     */
    updateDOMElements(theme) {
        // Set document title
        if (theme.meta?.title) {
            document.title = theme.meta.title;
        }

        // Update entity representations
        if (theme.entities) {
            this.cacheEntityConfig = theme.entities;
        }

        // Apply theme-specific CSS classes
        document.body.className = `theme-${theme.meta?.id || 'default'}`;
    }

    /**
     * Get entity configuration for rendering
     * @param {string} entityType - Type of entity (enemy, boss, etc.)
     * @param {Object} entityData - Entity data object
     * @returns {Object} Rendering configuration
     */
    getEntityConfig(entityType, entityData = {}) {
        if (!this.cacheEntityConfig || !this.cacheEntityConfig[entityType]) {
            return { emoji: '?', style: {} };
        }

        const config = this.cacheEntityConfig[entityType];
        
        // Handle dynamic configurations based on entity properties
        if (typeof config === 'function') {
            return config(entityData);
        }

        // Handle conditional configurations
        if (Array.isArray(config)) {
            for (const condition of config) {
                if (this.evaluateCondition(condition.if, entityData)) {
                    return condition;
                }
            }
            return config[config.length - 1]; // fallback to last
        }

        return config;
    }

    /**
     * Evaluate a condition for conditional entity configurations
     * @param {Object} condition - Condition object
     * @param {Object} data - Entity data to test against
     * @returns {boolean} Whether condition is met
     */
    evaluateCondition(condition, data) {
        for (const [key, value] of Object.entries(condition)) {
            if (data[key] !== value) return false;
        }
        return true;
    }

    /**
     * Get current theme configuration
     * @returns {Object} Current theme config
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Get theme-specific asset path
     * @param {string} assetType - Type of asset (audio, shader, etc.)
     * @param {string} assetName - Name of the asset
     * @returns {string} Full asset path
     */
    getAssetPath(assetType, assetName) {
        const theme = this.currentTheme;
        if (!theme.assets || !theme.assets[assetType]) {
            return assetName; // fallback to direct name
        }

        const basePath = theme.assets[assetType].basePath || '';
        const extension = theme.assets[assetType].extension || '';
        
        return `${basePath}${assetName}${extension}`;
    }
}

// Global theme manager instance
export const themeManager = new ThemeManager();

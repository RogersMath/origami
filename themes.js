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

        // Initialize character entities
        this.initializeCharacters(theme);

        // Update entity representations
        if (theme.entities) {
            this.cacheEntityConfig = theme.entities;
        }

        // Apply theme-specific CSS classes
        document.body.className = `theme-${theme.meta?.id || 'default'}`;
    }

    /**
     * Initialize character entities (narrator, boss) from theme config
     * @param {Object} theme - Theme configuration
     */
    initializeCharacters(theme) {
        if (!theme.entities) return;

        // Initialize narrator
        if (theme.entities.narrator) {
            this.initializeCharacter('narrator', theme.entities.narrator);
        }

        // Initialize boss
        if (theme.entities.boss) {
            this.initializeCharacter('boss', theme.entities.boss);
        }
    }

    /**
     * Initialize a character with theme-specific parts
     * @param {string} characterType - 'narrator' or 'boss'
     * @param {Object} config - Character configuration
     */
    initializeCharacter(characterType, config) {
        if (!config.parts) return;

        const faceElement = document.getElementById(`${characterType}-face`);
        const bodyElement = document.getElementById(`${characterType}-body`);
        const accessoryElement = document.getElementById(`${characterType}-accessory`);

        if (faceElement && config.parts.face) {
            faceElement.textContent = config.parts.face;
        }
        if (bodyElement && config.parts.body) {
            bodyElement.textContent = config.parts.body;
        }
        if (accessoryElement && config.parts.accessory) {
            accessoryElement.textContent = config.parts.accessory;
        }

        // Apply container styling
        if (config.container && config.style) {
            const container = document.getElementById(config.container);
            if (container && config.style.filter) {
                container.style.filter = config.style.filter;
            }
        }
    }

    /**
     * Transform a character to a different state (for narratives)
     * @param {string} characterType - 'narrator' or 'boss'
     * @param {string} transformState - State to transform to
     */
    transformCharacter(characterType, transformState) {
        const entityConfig = this.cacheEntityConfig?.[characterType];
        if (!entityConfig?.transformations?.[transformState]) return;

        const transformation = entityConfig.transformations[transformState];
        const faceElement = document.getElementById(`${characterType}-face`);
        const bodyElement = document.getElementById(`${characterType}-body`);
        const accessoryElement = document.getElementById(`${characterType}-accessory`);

        if (faceElement && transformation.face) {
            faceElement.style.transition = 'none';
            faceElement.textContent = transformation.face;
            void faceElement.offsetWidth; // Force reflow
        }
        if (bodyElement && transformation.body) {
            bodyElement.style.transition = 'none';
            bodyElement.textContent = transformation.body;
            void bodyElement.offsetWidth;
        }
        if (accessoryElement && transformation.accessory) {
            accessoryElement.style.transition = 'none';
            accessoryElement.textContent = transformation.accessory;
            void accessoryElement.offsetWidth;
        }
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

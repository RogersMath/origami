// engine.js - Core game engine, theme-agnostic

import { themeManager } from './themes.js';
import { createNarrativeManager } from './narrative.js';
import { DOM_ELEMENTS, resizeAll } from './utils.js';
import { initInput } from './input.js';
import { initWebGL, renderWebGL } from './effects.js';
import { initAudio, playBackgroundMusic, playTone } from './audio.js';
import { updateEnemies, spawnBoss, updateBoss, drawEnemies, fireProjectile, updateProjectiles, drawProjectiles } from './enemies.js';

export class GameEngine {
    constructor(config = {}) {
        // Default configuration - can be overridden by themes
        this.config = {
            MAX_ENEMIES: 3,
            BOSS_TRIGGER_SCORE: 1500,
            BOSS_HP: 6,
            BOSS_APPROACH_DURATION: 15000,
            ENEMY_SPAWN_INTERVAL_BASE: 1000,
            ENEMY_SPAWN_LEVEL_SCALAR: 0.95,
            ENEMY_BASE_SPEED: 0.00005,
            ENEMY_TOUGH_SPEED_MODIFIER: 0.6,
            ENEMY_LEVEL_SPEED_SCALAR: 1.08,
            ENEMY_BASE_HP: 1,
            ENEMY_TOUGH_HP_BONUS: 3,
            ENEMY_LEVEL_HP_SCALAR: 0.5,
            TOUGH_ENEMY_CHANCE_BASE: 0.1,
            TOUGH_ENEMY_CHANCE_LEVEL_SCALAR: 0.02,
            PROJECTILE_SPEED: 0.04,
            SCORE_PER_CORRECT_ANSWER: 10,
            SCORE_PER_KILL: 50,
            SCORE_PER_TOUGH_KILL: 250,
            SCORE_TO_LEVEL_UP: 500,
            ...config
        };

        this.elements = DOM_ELEMENTS;
        this.ctx = this.elements.gameCanvas.getContext('2d');
        this.gameLoop = this.gameLoop.bind(this);
        this.audioInitialized = false;
        this.narrativeManager = createNarrativeManager(this);
        
        // Current theme reference
        this.currentTheme = null;
    }

    /**
     * Initialize the game engine with a theme
     * @param {Object} theme - Theme configuration object
     */
    init(theme) {
        // Apply theme
        this.applyTheme(theme);
        
        // Initialize base state
        this.state = { 
            phase: 'menu', 
            animationFrameId: null 
        };
        
        // Initialize subsystems
        initWebGL(this.elements.fireCanvas);
        resizeAll();
        window.addEventListener('resize', resizeAll);
        initInput(this);
        
        // Start main game loop
        this.state.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    /**
     * Apply a theme to the game
     * @param {Object} theme - Theme configuration
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        themeManager.applyTheme(theme);
        
        // Override config with theme-specific gameplay settings
        if (theme.gameplay) {
            Object.assign(this.config, theme.gameplay);
        }
    }

    /**
     * Initialize audio system
     */
    initializeAudio() {
        if (this.audioInitialized) return;
        
        initAudio();
        
        // Use theme-specific background music
        const musicPath = themeManager.getAssetPath('audio', this.currentTheme.audio.backgroundMusic);
        playBackgroundMusic(musicPath);
        
        this.audioInitialized = true;
    }

    /**
     * Start opening narrative sequence
     * @param {Object} narrativeConfig - Narrative configuration
     */
    startOpening(narrativeConfig) {
        this.initializeAudio();
        this.state.phase = 'opening';
        this.narrativeManager.startNarrative(narrativeConfig);
    }

    /**
     * Start the main game
     */
    startGame() {
        this.initializeAudio();
        
        // Hide all screens
        this.elements.startScreen.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.elements.narratorContainer.style.display = 'none';
        this.elements.voiceoverText.style.display = 'none';
        this.elements.bossContainer.style.display = 'none';
        this.elements.bossContainer.style.animation = '';
        
        // Reset game over screen title (theme might customize this)
        this.elements.gameOverScreen.querySelector('.modal-title').textContent = 
            this.currentTheme.ui?.gameOverTitle || "Game Over";
        
        // Show game elements
        this.elements.fireCanvas.style.opacity = 1;
        this.elements.uiOverlay.style.visibility = 'visible';
        this.elements.bottomUi.style.visibility = 'visible';
        
        // Initialize game state
        this.state = {
            ...this.state,
            phase: 'playing',
            paused: false,
            gameOver: false,
            score: 0,
            level: 1,
            currentAnswer: null,
            enemies: [],
            projectiles: [],
            lastSpawnTime: performance.now(),
            lastTime: performance.now(),
            bossActive: false,
            bossObject: null
        };
        
        this.updateUI();
        fireProjectile(this, true); // Generate the first problem
    }

    /**
     * Main game loop
     * @param {number} time - Current timestamp
     */
    gameLoop(time) {
        // Always render the background effect
        renderWebGL(time);
        
        // Handle different game phases
        switch (this.state.phase) {
            case 'opening':
                this.narrativeManager.update(time);
                break;
                
            case 'playing':
                if (!this.state.paused) {
                    const deltaTime = time - (this.state.lastTime || time);
                    this.updatePlaying(time, deltaTime);
                    this.draw();
                }
                break;
                
            case 'gameOver':
            case 'menu':
                // Just render background
                break;
        }
        
        this.state.lastTime = time;
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game logic during playing phase
     * @param {number} time - Current timestamp
     * @param {number} deltaTime - Time since last frame
     */
    updatePlaying(time, deltaTime) {
        // Check for boss spawn
        if (!this.state.bossActive && this.state.score >= this.config.BOSS_TRIGGER_SCORE) {
            spawnBoss(this);
            this.playThemeSound('bossSpawn');
        }

        // Update game objects
        if (this.state.bossActive) {
            updateBoss(this, time);
        } else {
            updateEnemies(this, deltaTime);
        }
        
        updateProjectiles(this);
        this.updateUI();
    }

    /**
     * Render game objects
     */
    draw() {
        this.ctx.clearRect(0, 0, this.elements.gameCanvas.width, this.elements.gameCanvas.height);
        drawEnemies(this);
        drawProjectiles(this);
    }

    /**
     * Trigger game over state
     */
    triggerGameOver() {
        if (this.state.gameOver) return;
        
        this.state.phase = 'gameOver';
        this.state.gameOver = true;
        this.elements.finalScore.textContent = this.state.score;
        this.elements.gameOverScreen.style.display = 'flex';
        
        this.playThemeSound('gameOver');
    }

    /**
     * Trigger game win state
     */
    triggerGameWin() {
        if (this.state.gameOver) return;
        
        this.state.phase = 'gameOver';
        this.state.gameOver = true;
        this.elements.finalScore.textContent = this.state.score;
        
        // Use theme-specific win message
        const winTitle = this.currentTheme.ui?.winTitle || "Victory!";
        this.elements.gameOverScreen.querySelector('.modal-title').textContent = winTitle;
        this.elements.gameOverScreen.style.display = 'flex';
        
        // Animate boss defeat
        this.elements.bossContainer.style.transition = 'opacity .5s, transform .5s';
        this.elements.bossContainer.style.opacity = 0;
        this.elements.bossContainer.style.transform = 'translate(-50%,-50%) scale(0)';
        
        this.playThemeSound('victory');
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.elements.scoreDisplay.textContent = `Score: ${this.state.score}`;
        
        const newLevel = Math.floor(this.state.score / this.config.SCORE_TO_LEVEL_UP) + 1;
        if (newLevel > this.state.level) {
            this.state.level = newLevel;
            this.elements.levelDisplay.textContent = `Level: ${this.state.level}`;
            this.playThemeSound('levelUp');
        }
    }

    /**
     * Play a theme-specific sound effect
     * @param {string} soundName - Name of the sound effect
     */
    playThemeSound(soundName) {
        const soundConfig = this.currentTheme.audio?.soundEffects?.[soundName];
        if (soundConfig) {
            playTone(soundConfig.freq, soundConfig.duration, soundConfig.type);
        }
    }

    /**
     * Handle correct answer input
     */
    handleCorrectAnswer() {
        this.state.score += this.config.SCORE_PER_CORRECT_ANSWER;
        fireProjectile(this, false);
        this.playThemeSound('correct');
    }

    /**
     * Handle incorrect answer input
     */
    handleIncorrectAnswer() {
        // Apply theme-specific screen shake if enabled
        const shakeConfig = this.currentTheme.gameplay?.visualEffects?.screenShake;
        if (shakeConfig?.enabled) {
            document.body.style.animation = `shake 0.3s ease-in-out`;
            setTimeout(() => document.body.style.animation = "", 300);
        }
        
        this.playThemeSound('incorrect');
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        if (this.state.phase !== 'playing' || this.state.gameOver) return;
        
        this.initializeAudio(); // Ensure audio context is active
        this.state.paused = !this.state.paused;
        this.elements.pauseScreen.style.display = this.state.paused ? 'flex' : 'none';
        
        if (!this.state.paused) {
            this.state.lastTime = performance.now();
        }
    }

    /**
     * Get current theme configuration
     * @returns {Object} Current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Skip current narrative if active
     */
    skipNarrative() {
        if (this.narrativeManager.isActive()) {
            this.narrativeManager.skip();
        }
    }
}

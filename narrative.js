// narrative.js - Separate narrative system for opening cinematics and story elements

import { themeManager } from './themes.js';

export class NarrativeManager {
    constructor(game) {
        this.game = game;
        this.currentNarrative = null;
    }

    /**
     * Load and start a narrative sequence
     * @param {Object} narrativeConfig - Narrative configuration
     */
    startNarrative(narrativeConfig) {
        this.currentNarrative = {
            ...narrativeConfig,
            startTime: performance.now(),
            currentPhase: 0,
            phaseStartTime: performance.now(),
            currentLineIndex: 0
        };

        // Initialize narrative elements in DOM
        this.initializeNarrativeElements();
    }

    /**
     * Update the current narrative sequence
     * @param {number} currentTime - Current timestamp
     */
    update(currentTime) {
        if (!this.currentNarrative) return;

        const narrative = this.currentNarrative;
        const currentPhase = narrative.phases[narrative.currentPhase];
        
        if (!currentPhase) {
            this.completeNarrative();
            return;
        }

        const phaseElapsed = currentTime - narrative.phaseStartTime;
        
        // Execute phase-specific logic
        switch (currentPhase.type) {
            case 'approach':
                this.updateApproachPhase(currentPhase, phaseElapsed);
                break;
            case 'dialogue':
                this.updateDialoguePhase(currentPhase, phaseElapsed);
                break;
            case 'transformation':
                this.updateTransformationPhase(currentPhase, phaseElapsed);
                break;
            case 'custom':
                if (currentPhase.updateFunction) {
                    currentPhase.updateFunction(this.game, phaseElapsed);
                }
                break;
        }

        // Check if phase is complete
        if (phaseElapsed >= currentPhase.duration) {
            this.nextPhase(currentTime);
        }
    }

    /**
     * Handle approach animation phase
     * @param {Object} phase - Phase configuration
     * @param {number} elapsed - Elapsed time in phase
     */
    updateApproachPhase(phase, elapsed) {
        const progress = Math.min(elapsed / phase.duration, 1);
        const character = this.game.elements[phase.character + 'Container'];
        
        if (character) {
            const startScale = phase.startScale || 0.03;
            const endScale = phase.endScale || 1;
            const scale = startScale + (endScale - startScale) * progress;
            
            character.style.transform = `translate(-50%, -50%) scale(${scale})`;
            character.style.opacity = Math.min(progress * 2, 1);
            character.style.display = 'block';
        }
    }

    /**
     * Handle dialogue display phase
     * @param {Object} phase - Phase configuration
     * @param {number} elapsed - Elapsed time in phase
     */
    updateDialoguePhase(phase, elapsed) {
        const lineInterval = phase.lineInterval || 1500;
        const expectedLineIndex = Math.floor(elapsed / lineInterval);
        
        if (expectedLineIndex > this.currentNarrative.currentLineIndex && 
            expectedLineIndex < phase.lines.length) {
            
            this.showDialogueLine(phase.lines[expectedLineIndex]);
            this.currentNarrative.currentLineIndex = expectedLineIndex;
        }
    }

    /**
     * Handle transformation phase
     * @param {Object} phase - Phase configuration
     * @param {number} elapsed - Elapsed time in phase
     */
    updateTransformationPhase(phase, elapsed) {
        if (elapsed < phase.shakeDelay) return;
        
        const character = this.game.elements[phase.character + 'Container'];
        if (character && !character.classList.contains('transforming')) {
            character.classList.add('transforming');
            character.style.animation = `shake 0.5s ease-in-out ${phase.shakeRepeats || 3}`;
            
            // Apply theme-based transformations
            setTimeout(() => {
                if (phase.transformState) {
                    // Use theme system for transformation
                    themeManager.transformCharacter(phase.character, phase.transformState);
                } else if (phase.transformations) {
                    // Legacy direct transformations (fallback)
                    Object.entries(phase.transformations).forEach(([elementId, newContent]) => {
                        const element = this.game.elements[elementId];
                        if (element) {
                            element.style.transition = 'none';
                            element.textContent = newContent;
                            void element.offsetWidth;
                        }
                    });
                }
            }, phase.transformDelay || 500);
        }
    }

    /**
     * Display a dialogue line
     * @param {string} line - Line of dialogue to display
     */
    showDialogueLine(line) {
        const voiceoverElement = this.game.elements.voiceoverText;
        if (voiceoverElement) {
            voiceoverElement.textContent = line;
            voiceoverElement.style.opacity = 1;
            voiceoverElement.style.display = 'block';
        }
    }

    /**
     * Move to the next phase of the narrative
     * @param {number} currentTime - Current timestamp
     */
    nextPhase(currentTime) {
        this.currentNarrative.currentPhase++;
        this.currentNarrative.phaseStartTime = currentTime;
        this.currentNarrative.currentLineIndex = 0;
    }

    /**
     * Complete the narrative sequence
     */
    completeNarrative() {
        if (this.currentNarrative && this.currentNarrative.onComplete) {
            this.currentNarrative.onComplete(this.game);
        }
        this.currentNarrative = null;
    }

    /**
     * Initialize DOM elements for narrative display
     */
    initializeNarrativeElements() {
        // Ensure narrative container is visible
        const containers = ['narratorContainer', 'voiceoverText'];
        containers.forEach(containerId => {
            const element = this.game.elements[containerId];
            if (element) {
                element.style.display = 'block';
            }
        });
    }

    /**
     * Skip the current narrative
     */
    skip() {
        if (this.currentNarrative && this.currentNarrative.onComplete) {
            this.currentNarrative.onComplete(this.game);
        }
        this.currentNarrative = null;
    }

    /**
     * Check if a narrative is currently active
     * @returns {boolean} Whether narrative is active
     */
    isActive() {
        return this.currentNarrative !== null;
    }
}

// Create narrative manager instance  
export function createNarrativeManager(game) {
    return new NarrativeManager(game);
}

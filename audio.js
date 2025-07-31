// audio.js - Theme-aware audio system with SonantX integration

import { generateSong } from './sonantx.js';
import { themeManager } from './themes.js';

let audioContext;
let masterGain;
let musicBufferSource = null;
let currentMusicConfig = null;

/**
 * Initialize Web Audio API
 */
export function initAudio() {
    if (audioContext) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        return;
    } 
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.3; // Default volume
        masterGain.connect(audioContext.destination);
        
        // Set up volume control if element exists
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', e => {
                if (masterGain) {
                    masterGain.gain.value = e.target.value / 100;
                }
            });
        }
        
        console.log("Audio Context Initialized.");
    } catch (e) {
        console.error('Web Audio API initialization failed:', e);
    }
}

/**
 * Play background music based on current theme
 * @param {Object} musicConfig - Music configuration from theme (optional override)
 */
export async function playBackgroundMusic(musicConfig = null) {
    if (!audioContext) {
        console.warn('Audio context not initialized');
        return;
    }

    // Stop current music if playing
    if (musicBufferSource) {
        musicBufferSource.stop();
        musicBufferSource = null;
    }
    
    // Get music config from theme or parameter
    const config = musicConfig || themeManager.getCurrentTheme()?.audio?.backgroundMusic;
    
    if (!config) {
        console.warn('No background music configuration found in theme');
        return;
    }

    currentMusicConfig = config;
    
    try {
        let buffer;
        
        if (config.type === 'sonantx') {
            // Generate music using SonantX
            buffer = await generateMusicFromTheme(config);
        } else if (config.type === 'file') {
            // Load audio file
            buffer = await loadAudioFile(config.data);
        } else {
            console.warn('Unknown music type:', config.type);
            return;
        }
        
        if (buffer) {
            playAudioBuffer(buffer, config);
        }
        
    } catch (e) {
        console.error('Background music failed to load:', e);
    }
}

/**
 * Generate music using SonantX from theme data
 * @param {Object} config - Music configuration
 * @returns {AudioBuffer} Generated audio buffer
 */
async function generateMusicFromTheme(config) {
    const response = await fetch(config.data);
    if (!response.ok) {
        throw new Error(`Failed to fetch music data: ${response.statusText}`);
    }
    
    const songData = await response.json();
    return await generateSong(songData, audioContext.sampleRate);
}

/**
 * Load audio file
 * @param {string} filePath - Path to audio file
 * @returns {AudioBuffer} Loaded audio buffer
 */
async function loadAudioFile(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Play an audio buffer with configuration
 * @param {AudioBuffer} buffer - Audio buffer to play
 * @param {Object} config - Playback configuration
 */
function playAudioBuffer(buffer, config) {
    musicBufferSource = audioContext.createBufferSource();
    musicBufferSource.buffer = buffer;
    musicBufferSource.loop = config.loop !== false; // Default to true
    
    // Create gain node for music-specific volume
    const musicGain = audioContext.createGain();
    musicGain.gain.value = config.volume || 0.3;
    
    musicBufferSource.connect(musicGain);
    musicGain.connect(masterGain);
    musicBufferSource.start();
    
    console.log(`Background music started: ${config.data}`);
}

/**
 * Play a theme-specific sound effect
 * @param {string} soundName - Name of sound effect from theme
 * @param {Object} overrides - Optional parameter overrides
 */
export function playThemeSound(soundName, overrides = {}) {
    const theme = themeManager.getCurrentTheme();
    const soundConfig = theme?.audio?.soundEffects?.[soundName];
    
    if (!soundConfig) {
        console.warn(`Sound effect '${soundName}' not found in current theme`);
        return;
    }
    
    const config = { ...soundConfig, ...overrides };
    playTone(config.freq, config.duration, config.type, config.volume);
}

/**
 * Play a procedural tone
 * @param {number} freq - Frequency in Hz
 * @param {number} dur - Duration in seconds
 * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} volume - Volume (0-1)
 */
export function playTone(freq, dur, type = 'sine', volume = 0.2) {
    if (!audioContext || !masterGain) return;
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + dur);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + dur + 0.1);
}

/**
 * Switch to different background music (for theme switching)
 * @param {Object} newMusicConfig - New music configuration
 */
export function switchBackgroundMusic(newMusicConfig) {
    if (currentMusicConfig?.data === newMusicConfig?.data) {
        return; // Same music, no need to switch
    }
    
    playBackgroundMusic(newMusicConfig);
}

/**
 * Stop all audio
 */
export function stopAllAudio() {
    if (musicBufferSource) {
        musicBufferSource.stop();
        musicBufferSource = null;
    }
}

/**
 * Set master volume
 * @param {number} volume - Volume level (0-1)
 */
export function setMasterVolume(volume) {
    if (masterGain) {
        masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
}

/**
 * Get audio context for advanced audio operations
 * @returns {AudioContext} Current audio context
 */
export function getAudioContext() {
    return audioContext;
}

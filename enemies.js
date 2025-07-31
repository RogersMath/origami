// enemies.js - Theme-aware enemy and game object management
import { lerp } from './utils.js';
import { themeManager } from './themes.js';

// --- ENEMY LOGIC ---
export function spawnEnemy(game) { 
    if (game.state.enemies.length >= game.config.MAX_ENEMIES) return; 
    
    const isTough = Math.random() < game.config.TOUGH_ENEMY_CHANCE_BASE + game.state.level * game.config.TOUGH_ENEMY_CHANCE_LEVEL_SCALAR; 
    const speedMod = 1 + (game.state.level - 1) * (game.config.ENEMY_LEVEL_SPEED_SCALAR - 1); 
    const speed = (isTough ? game.config.ENEMY_BASE_SPEED * game.config.ENEMY_TOUGH_SPEED_MODIFIER : game.config.ENEMY_BASE_SPEED) * speedMod; 
    
    game.state.enemies.push({ 
        x: game.elements.gameCanvas.width * (.2 + Math.random() * .6), 
        y: game.elements.gameCanvas.height * (.2 + Math.random() * .5), 
        z: 1, 
        baseSize: isTough ? 100 : 70, 
        speed, 
        hp: game.config.ENEMY_BASE_HP + (isTough ? game.config.ENEMY_TOUGH_HP_BONUS : 0) + Math.floor((game.state.level - 1) * game.config.ENEMY_LEVEL_HP_SCALAR), 
        isTough, 
        angle: 0, 
        velocity: 0, 
        spring: .03, 
        damp: .92 
    }); 
    
    game.state.lastSpawnTime = performance.now(); 
}

export function updateEnemies(game, deltaTime) {
    const spawnInterval = game.config.ENEMY_SPAWN_INTERVAL_BASE * Math.pow(game.config.ENEMY_SPAWN_LEVEL_SCALAR, game.state.level - 1);
    
    if (performance.now() - game.state.lastSpawnTime > spawnInterval) {
        spawnEnemy(game);
    }
    
    for (let i = game.state.enemies.length - 1; i >= 0; i--) {
        const e = game.state.enemies[i]; 
        e.z -= e.speed * deltaTime;
        e.velocity -= e.angle * e.spring; 
        e.velocity *= e.damp; 
        e.angle += e.velocity;
        
        if (e.z <= 0) { 
            game.triggerGameOver(); 
            return; 
        }
    }
}

export function drawEnemies(game) {
    game.state.enemies.sort((a, b) => b.z - a.z);
    
    game.state.enemies.forEach(e => {
        const scale = 1 - e.z;
        const size = e.baseSize * scale;
        const alpha = 0.5 + scale * 0.5;
        
        // Get theme-specific enemy configuration
        const enemyConfig = themeManager.getEntityConfig('enemy', e);
        
        game.ctx.save(); 
        game.ctx.translate(e.x, e.y); 
        game.ctx.rotate(e.angle);
        game.ctx.font = `${size}px sans-serif`; 
        game.ctx.textAlign = "center"; 
        game.ctx.textBaseline = "middle";
        
        // Apply theme-specific styling
        if (enemyConfig.style) {
            if (enemyConfig.style.color) {
                game.ctx.fillStyle = `${enemyConfig.style.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba')}`;
            } else {
                game.ctx.fillStyle = e.isTough ? `rgba(255,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
            }
            
            if (enemyConfig.style.filter && enemyConfig.style.filter.includes('drop-shadow')) {
                const shadowMatch = enemyConfig.style.filter.match(/drop-shadow\(([^)]+)\)/);
                if (shadowMatch) {
                    game.ctx.shadowColor = "yellow"; 
                    game.ctx.shadowBlur = 15; 
                }
            }
        } else {
            // Fallback styling
            if (e.isTough) { 
                game.ctx.fillStyle = `rgba(255,0,0,${alpha})`; 
                game.ctx.shadowColor = "yellow"; 
                game.ctx.shadowBlur = 15; 
            } else { 
                game.ctx.fillStyle = `rgba(255,255,255,${alpha})`; 
            }
        }
        
        game.ctx.fillText(enemyConfig.emoji || '💀', 0, 0); 
        game.ctx.shadowBlur = 0; 
        game.ctx.restore();
    });
}

// --- BOSS LOGIC ---
export function spawnBoss(game) {
    game.state.bossActive = true; 
    game.state.enemies = []; 
    game.state.projectiles = [];
    
    const bossConfig = themeManager.getEntityConfig('boss');
    const bossContainer = game.elements.bossContainer;
    
    bossContainer.style.display = 'block';
    
    // Apply theme-specific boss styling
    if (bossConfig.style?.filter) {
        bossContainer.style.filter = bossConfig.style.filter;
    }
    
    // Update boss parts if theme specifies them
    if (bossConfig.parts) {
        const faceElement = game.elements.bossFace || document.getElementById('boss-face');
        const bodyElement = game.elements.bossBody || document.getElementById('boss-body');
        const accessoryElement = game.elements.bossMug || document.getElementById('boss-mug');
        
        if (faceElement && bossConfig.parts.face) faceElement.textContent = bossConfig.parts.face;
        if (bodyElement && bossConfig.parts.body) bodyElement.textContent = bossConfig.parts.body;
        if (accessoryElement && bossConfig.parts.accessory) accessoryElement.textContent = bossConfig.parts.accessory;
    }
    
    game.state.bossObject = { 
        hp: game.config.BOSS_HP, 
        startTime: performance.now(), 
        duration: game.config.BOSS_APPROACH_DURATION, 
        startScale: 0.05, 
        endScale: 1, 
        element: bossContainer 
    };
    
    bossContainer.style.transform = `translate(-50%,-50%) scale(${game.state.bossObject.startScale})`;
    bossContainer.style.opacity = 0;
}

export function updateBoss(game, currentTime) {
    const boss = game.state.bossObject; 
    if (!boss) return;
    
    const progress = Math.min((currentTime - boss.startTime) / boss.duration, 1);
    const scale = boss.startScale + (boss.endScale - boss.startScale) * progress;
    
    boss.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    boss.element.style.opacity = progress;
    
    if (progress >= 1) {
        game.triggerGameOver();
    }
}

// --- PROJECTILE LOGIC ---
export function fireProjectile(game, isInitialCall = false) {
    if (game.state.bossActive) {
        game.state.projectiles.push({ 
            startX: game.elements.gameCanvas.width / 2, 
            startY: game.elements.gameCanvas.height, 
            target: { x: game.elements.gameCanvas.width / 2, y: game.elements.gameCanvas.height / 2 }, 
            progress: 0, 
            speed: game.config.PROJECTILE_SPEED, 
            isBossShot: true 
        });
    } else {
        if (game.state.enemies.length === 0 && !isInitialCall) return;
        
        const nearest = game.state.enemies.length > 0 ? 
            game.state.enemies.reduce((a, b) => a.z < b.z ? a : b) : null;
            
        if(nearest) {
            game.state.projectiles.push({ 
                startX: game.elements.gameCanvas.width / 2, 
                startY: game.elements.gameCanvas.height, 
                target: nearest, 
                progress: 0, 
                speed: game.config.PROJECTILE_SPEED, 
                isBossShot: false 
            });
        }
    }
    
    generateProblem(game);
}

export function updateProjectiles(game) {
    for (let i = game.state.projectiles.length - 1; i >= 0; i--) {
        const p = game.state.projectiles[i]; 
        p.progress += p.speed;
        
        if (p.progress >= 1) {
            if (p.isBossShot) {
                const boss = game.state.bossObject;
                if (boss) {
                    boss.hp--;
                    boss.element.style.animation = 'shake 0.2s';
                    setTimeout(() => boss.element.style.animation = '', 200);
                    
                    if (boss.hp <= 0) {
                        game.triggerGameWin();
                    }
                }
            } else {
                const target = p.target;
                if (target && game.state.enemies.includes(target)) {
                    target.hp--; 
                    target.velocity += (Math.random() - 0.5) * 0.3;
                    game.playThemeSound('enemyHit');
                    
                    if (target.hp <= 0) {
                        const enemyIndex = game.state.enemies.indexOf(target);
                        if (enemyIndex > -1) game.state.enemies.splice(enemyIndex, 1);
                        game.state.score += target.isTough ? game.config.SCORE_PER_TOUGH_KILL : game.config.SCORE_PER_KILL;
                    }
                }
            }
            game.state.projectiles.splice(i, 1);
        }
    }
}

export function drawProjectiles(game) {
    const projectileConfig = themeManager.getEntityConfig('projectile');
    
    game.state.projectiles.forEach(p => {
        const x = lerp(p.startX, p.target.x, p.progress);
        const y = lerp(p.startY, p.target.y, p.progress);
        const radius = lerp(30, 5, p.progress);
        
        game.ctx.beginPath();
        const grad = game.ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        // Use theme-specific gradient colors if available
        if (projectileConfig.style?.gradient) {
            const gradient = projectileConfig.style.gradient;
            grad.addColorStop(0, gradient.inner || "white");
            grad.addColorStop(.4, gradient.middle || "yellow");
            grad.addColorStop(1, gradient.outer || "rgba(255,69,0,0)");
        } else {
            // Default gradient
            grad.addColorStop(0, "white");
            grad.addColorStop(.4, "yellow");
            grad.addColorStop(1, "rgba(255,69,0,0)");
        }
        
        game.ctx.fillStyle = grad;
        game.ctx.arc(x, y, radius, 0, Math.PI * 2);
        game.ctx.fill();
    });
}

// --- PROBLEM GENERATION ---
function generateProblem(game) { 
    const level = game.state.level; 
    let p; 
    
    if (level < 3) { 
        const r = Math.floor(Math.random() * 5) + 2; 
        const a = Math.floor(Math.random() * (r - 1)) + 1; 
        p = { t: `${a} + ${r - a}`, a: r }; 
    } else if (level < 6) { 
        const r = Math.floor(Math.random() * 9) + 1; 
        const a = r + Math.floor(Math.random() * (9 - r)) + 1; 
        p = { t: `${a} - ${a - r}`, a: r }; 
    } else { 
        const a = Math.floor(Math.random() * 4) + 2;
        const b = Math.floor(Math.random() * 4) + 1;
        const c = Math.floor(Math.random() * 5) + 1; 
        const r = a * b - c; 
        
        if (r > 0 && r < 10) {
            p = { t: `${a}×${b} - ${c}`, a: r };
        } else {
            generateProblem(game); // Recursive call with implicit base case
            return;
        }
    } 
    
    if (!p || !p.t) { 
        generateProblem(game); 
        return; 
    } 
    
    game.elements.problemDisplay.textContent = p.t + " = ?"; 
    game.state.currentAnswer = p.a; 
}

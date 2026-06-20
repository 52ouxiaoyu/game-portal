const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let CANVAS_W = window.innerWidth;
let CANVAS_H = window.innerHeight;
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

window.addEventListener('resize', () => {
    CANVAS_W = window.innerWidth;
    CANVAS_H = window.innerHeight;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    bgCanvas.width = CANVAS_W;
    bgCanvas.height = CANVAS_H;
});

// --- AUDIO SYSTEM (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audio = {
    playTone: (freq, type, duration, vol=0.1) => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq*0.5, audioCtx.currentTime + duration);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },
    shootPistol: () => audio.playTone(400, 'square', 0.1, 0.05),
    shootShotgun: () => audio.playTone(200, 'sawtooth', 0.2, 0.1),
    shootMachine: () => audio.playTone(500, 'square', 0.05, 0.03),
    shootLaser: () => audio.playTone(800, 'sine', 0.3, 0.05),
    zombieHit: () => audio.playTone(150, 'triangle', 0.1, 0.05),
    zombieDie: () => audio.playTone(100, 'sawtooth', 0.2, 0.1),
    levelUp: () => {
        audio.playTone(400, 'square', 0.1, 0.1);
        setTimeout(() => audio.playTone(600, 'square', 0.2, 0.1), 100);
        setTimeout(() => audio.playTone(800, 'square', 0.4, 0.1), 200);
    },
    playerHit: () => audio.playTone(150, 'sawtooth', 0.5, 0.2)
};

// --- GAME STATE ---
let gameState = 'START'; // START, PLAYING, GAME_OVER, PAUSED
let score = 0;
let highScore = parseInt(localStorage.getItem('zs_highscore') || '0');
let survivalTime = 0;
let killCount = 0;
let startTime = 0;
let lastTime = 0;

let players = [];
let zombies = [];
let bullets = [];
let particles = [];
let floatingTexts = [];
let lootBoxes = [];
let boars = [];
let lootTimer = 0;

let spawnTimer = 0;
let spawnRate = 60;
let frameCount = 0;
let screenShake = 0;
let comboCount = 0;
let comboTimer = 0;
let bgCanvas = document.createElement('canvas');
bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;
let bgCtx = bgCanvas.getContext('2d');
let hitStopFrames = 0;
let flashFrames = 0;
let currentWave = 1;
let waveTimer = 0;
let barrels = [];

let camera = {x: 0, y: 0};
let buildings = [];
let bloodStains = [];
let generatedChunks = new Set();
const CHUNK_SIZE = 800;

class Building {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
    }
    draw(ctx) {
        // Draw 3D-ish roof effect
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x + 10, this.y + 10, this.w - 20, this.h - 20);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

class Blood {
    constructor(x, y, w, h, color) {
        this.x = x; this.y = y; this.w = w; this.h = h; this.color = color;
        this.life = 1.0;
    }
    draw(ctx) {
        if(this.life <= 0) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.globalAlpha = 1.0;
    }
}


class Barrel {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = 20;
        this.hp = 50;
        this.active = true;
    }
    draw(ctx) {
        if(!this.active) return;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 15, this.y - 20, 30, 40);
        ctx.fillStyle = '#111';
        ctx.fillRect(this.x - 15, this.y - 10, 30, 5);
        ctx.fillRect(this.x - 15, this.y + 5, 30, 5);
        ctx.fillStyle = '#ffaa00';
        ctx.font = '16px Arial';
        ctx.fillText('☢️', this.x, this.y+5);
    }
}

let activeEvent = null;
let eventTimer = 0;

// Inputs
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyS: false, KeyA: false, KeyD: false,
    Space: false, Enter: false, NumpadEnter: false, KeyQ: false, ShiftRight: false, Slash: false
};

window.addEventListener('keydown', e => {
    if(keys.hasOwnProperty(e.code)) keys[e.code] = true;
    
    // Reset AI timer on any key press
    if(gameState === 'PLAYING') {
        players.forEach(p => {
            if(p.id === 1 && (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' || e.code === 'Space')) {
                p.lastInputTime = Date.now();
                p.isAI = false;
            }
            if(p.id === 2 && (e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'Enter' || e.code === 'NumpadEnter')) {
                p.lastInputTime = Date.now();
                p.isAI = false;
            }
        });
    }
    if((e.code === 'KeyQ' || e.code === 'ShiftRight' || e.code === 'Slash') && gameState === 'PLAYING') {
        players.forEach(p => { 
            if(((e.code==='KeyQ'&&p.id===1) || ((e.code==='ShiftRight'||e.code==='Slash')&&p.id===2)) && p.hasUlt) {
                p.hasUlt = false;
                // Fire Ultimate: 360 degree lasers
                audio.levelUp();
                screenShake = 30;
                addFloatingText(p.x, p.y - 50, "⚡ 万剑归宗 ⚡", "#00ffff");
                for(let angle=0; angle<Math.PI*2; angle+=Math.PI/16) {
                    let b = new Bullet(p.x, p.y, Math.cos(angle), Math.sin(angle), 20, 150, '#00ffff', true, p.id);
                    b.size = 10;
                    bullets.push(b);
                }
            }
        });
    }
    if((e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') && gameState === 'PLAYING') {
        players.forEach(p => { if((e.code==='Space'&&p.id===1) || ((e.code==='Enter'||e.code==='NumpadEnter')&&p.id===2)) p.shoot(); });
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => {
    if(keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// UI Elements
document.getElementById('high-score').textContent = highScore;
document.getElementById('start-btn').onclick = startGame;
document.getElementById('restart-btn').onclick = startGame;
document.getElementById('pause-btn').onclick = togglePause;
document.getElementById('resume-btn').onclick = togglePause;

// --- CLASSES ---

class Player {
    constructor(id) {
        this.id = id;
        this.x = CANVAS_W / 2 + (id === 1 ? -50 : 50);
        this.y = CANVAS_H / 2;
        this.size = 20;
        this.speed = 5;
        this.color = id === 1 ? '#00bfff' : '#ff9900';
        this.facing = {x: 1, y: 0}; // default facing right
        this.hp = 3;
        this.score = 0;
        this.maxHp = 10;
        this.weaponLevel = 0;
        this.cooldown = 0;
        this.buffTime = 0;
        this.shieldTime = 0;
        this.mechTime = 0;
        this.mechType = 0;
        this.mechHp = 0;
        this.vehicleTime = 0;
                this.reviveProgress = 0; // 0 to 180 (3 seconds at 60fps)
        this.isDowned = false;
        this.lastInputTime = Date.now();
        this.isAI = false;
        
this.weapons = [];
        for(let i=1; i<=30; i++) {
            let w = {name: `Lv.${i} 暴雨`, cd: 15, damage: 20, speed: 10, count: 1, spread: 0, pierce: false};
            
            w.damage = 15 + Math.floor(i / 2) * 5;
            w.speed = 10 + i * 0.3;
            
            if(i <= 5) {
                w.count = 1;
                w.cd = 16 - i * 2;
            } else if (i <= 10) {
                w.count = 2;
                w.spread = 0.2;
                w.cd = 14 - (i - 5) * 1.5;
            } else if (i <= 15) {
                w.count = 3;
                w.spread = 0.4;
                w.cd = 10 - (i - 10) * 1;
            } else if (i <= 20) {
                w.count = 4;
                w.spread = 0.6;
                w.cd = 8 - (i - 15) * 0.5;
                w.pierce = true;
            } else if (i <= 25) {
                w.count = 5;
                w.spread = 1.0;
                w.cd = 6 - (i - 20) * 0.4;
                w.pierce = true;
            } else if (i < 30) {
                w.count = 6 + (i - 26)*2;
                w.spread = Math.PI; 
                w.cd = 5;
                w.pierce = true;
            } else { 
                w.name = "🔥 毁灭者光轮 🔥";
                w.count = 16;
                w.spread = Math.PI * 2;
                w.cd = 3;
                w.pierce = true;
                w.damage = 150;
            }
            this.weapons.push(w);
        }
        this.weapon = this.weapons[this.weaponLevel];
    }

    update() {
        if(this.cooldown > 0 && this.buffTime <= 0) this.cooldown--;
        if(this.buffTime > 0) this.buffTime--;
        if(this.shieldTime > 0) this.shieldTime--;

        
        if(this.mechTime > 0) this.mechTime--;
        if(this.vehicleTime > 0) {
            this.vehicleTime--;
            // Vehicle ramming
            zombies.forEach(z => {
                if(!z.active) return;
                let d = Math.hypot(z.x - this.x, z.y - this.y);
                if(d < this.size + z.size + 10) {
                    z.active = false;
                    score += z.scoreVal;
                    killCount++;
                    createParticles(z.x, z.y, '#ff0000', 15);
                    screenShake = Math.max(screenShake, 5);
                    for(let b=0; b<5; b++) bloodStains.push(new Blood(z.x + (Math.random()-0.5)*40, z.y + (Math.random()-0.5)*40, Math.random()*8+4, Math.random()*8+4, '#800000'));
                    comboCount++; comboTimer = 180;
                    if(comboCount % 10 === 0) { screenShake = 10; addFloatingText(CANVAS_W/2, 100, `${comboCount} COMBO!`, '#ffaa00'); audio.levelUp(); }
                    audio.zombieDie();
                    addFloatingText(z.x, z.y, "🏍️ 碾压!", "#ffcc00");
                }
            });
        }
        let dx = 0; let dy = 0;
        let currentSpeed = this.speed;
        if(this.buffTime > 0) currentSpeed *= 1.5;
        if(this.mechTime > 0) {
            if(this.mechType === 1) currentSpeed *= 0.4;
            else if(this.mechType === 2) currentSpeed *= 0.6;
            else if(this.mechType === 3) currentSpeed *= 1.3;
        }
        if(this.vehicleTime > 0) currentSpeed *= 3.0; // Vehicle is fast

        
        if(Date.now() - this.lastInputTime > 5000) {
            this.isAI = true;
        }

        if(this.hp <= 0) {
            if(!this.isDowned && this.lives > 0) {
                this.isDowned = true;
                this.lives--;
                this.reviveProgress = 0;
            }
            if(this.isDowned) {
                // Check if other alive player is near
                let beingRevived = false;
                players.forEach(p => {
                    if(p !== this && p.hp > 0 && !p.isDowned) {
                        if(Math.hypot(p.x - this.x, p.y - this.y) < 60) {
                            beingRevived = true;
                            this.reviveProgress++;
                            if(this.reviveProgress >= 120) { // 2 seconds to revive
                                this.isDowned = false;
                                this.hp = this.maxHp / 2;
                                this.reviveProgress = 0;
                                addFloatingText(this.x, this.y - 40, "💉 重新加入战斗!", "#00ff00");
                                audio.levelUp();
                            }
                        }
                    }
                });
                if(!beingRevived) this.reviveProgress = Math.max(0, this.reviveProgress - 2);
            }
            return; // Downed/dead player cannot move or shoot
        }

        if(this.isAI) {
            let closestZDist = Infinity;
            let targetZ = null;
            zombies.forEach(z => {
                if(!z.active) return;
                let d = Math.hypot(z.x - this.x, z.y - this.y);
                if(d < closestZDist) { closestZDist = d; targetZ = z; }
            });

            let closestLootDist = Infinity;
            let targetLoot = null;
            lootBoxes.forEach(lb => {
                let d = Math.hypot(lb.x - this.x, lb.y - this.y);
                if(d < closestLootDist) { closestLootDist = d; targetLoot = lb; }
            });
            
            let closestBarrelDist = Infinity;
            let targetBarrel = null;
            barrels.forEach(b => {
                if(!b.active) return;
                let d = Math.hypot(b.x - this.x, b.y - this.y);
                if(d < closestBarrelDist) { closestBarrelDist = d; targetBarrel = b; }
            });

            let downedTeammate = null;
            players.forEach(p => {
                if(p !== this && p.isDowned) downedTeammate = p;
            });

            if(targetZ) {
                let tdx = targetZ.x - this.x;
                let tdy = targetZ.y - this.y;
                let tLen = Math.hypot(tdx, tdy);
                if(tLen > 0) this.facing = {x: tdx/tLen, y: tdy/tLen};
                // Don't shoot if a barrel is right in front of us
                let safeToShoot = true;
                if(targetBarrel && closestBarrelDist < 200) {
                    // Check if barrel is roughly in the direction we are facing
                    let bdx = (targetBarrel.x - this.x) / closestBarrelDist;
                    let bdy = (targetBarrel.y - this.y) / closestBarrelDist;
                    let dotProd = (bdx * this.facing.x) + (bdy * this.facing.y);
                    if(dotProd > 0.8) safeToShoot = false; // Barrel is in line of fire!
                }
                if(safeToShoot) this.shoot();
            }
            
            // Priority 1: Dodge Barrels (Extremely dangerous)
            if(closestBarrelDist < 160 && targetBarrel) {
                dx = -(targetBarrel.x - this.x) / closestBarrelDist;
                dy = -(targetBarrel.y - this.y) / closestBarrelDist;
            }
            // Priority 2: Dodge Zombies
            else if(closestZDist < 120 && targetZ) {
                dx = -(targetZ.x - this.x) / closestZDist;
                dy = -(targetZ.y - this.y) / closestZDist;
            } 
            // Priority 3: Revive
            else if(downedTeammate) {
                let dist = Math.hypot(downedTeammate.x - this.x, downedTeammate.y - this.y);
                if(dist > 10) {
                    dx = (downedTeammate.x - this.x) / dist;
                    dy = (downedTeammate.y - this.y) / dist;
                }
            } 
            // Priority 4: Loot
            else if(targetLoot) {
                dx = (targetLoot.x - this.x) / closestLootDist;
                dy = (targetLoot.y - this.y) / closestLootDist;
            } 
            // Priority 5: Kite Zombies
            else if(targetZ) {
                if(closestZDist > 250) {
                    dx = (targetZ.x - this.x) / closestZDist;
                    dy = (targetZ.y - this.y) / closestZDist;
                } else {
                    dx = -this.facing.y;
                    dy = this.facing.x;
                }
            }

            
        } else {
            // Player Logic
            if(this.id === 1) {
                if(keys.KeyW) dy -= 1;
                if(keys.KeyS) dy += 1;
                if(keys.KeyA) dx -= 1;
                if(keys.KeyD) dx += 1;
                if(keys.Space) this.shoot();
            } else {
                if(keys.ArrowUp) dy -= 1;
                if(keys.ArrowDown) dy += 1;
                if(keys.ArrowLeft) dx -= 1;
                if(keys.ArrowRight) dx += 1;
                if(keys.Enter || keys.NumpadEnter) this.shoot();
            }

            if(dx !== 0 || dy !== 0) {
                const len = Math.hypot(dx, dy);
                dx /= len; dy /= len;
                this.facing = {x: dx, y: dy};
            }
        }

        this.x += dx * currentSpeed;
        this.y += dy * currentSpeed;

        resolveBuildingCollision(this);

        // Keep players within the current camera view (Co-op screen binding)
        const margin = 50;
        if(this.x < camera.x - CANVAS_W/2 + margin) this.x = camera.x - CANVAS_W/2 + margin;
        if(this.x > camera.x + CANVAS_W/2 - margin) this.x = camera.x + CANVAS_W/2 - margin;
        if(this.y < camera.y - CANVAS_H/2 + margin) this.y = camera.y - CANVAS_H/2 + margin;
        if(this.y > camera.y + CANVAS_H/2 - margin) this.y = camera.y + CANVAS_H/2 - margin;

        // Check weapon level up
        for(let i = this.weapons.length - 1; i >= 0; i--) {
            if(killCount >= this.weapons[i].req) {
                if(this.weaponLevel !== i) {
                    this.weaponLevel = i;
                    audio.levelUp();
                    addFloatingText(this.x, this.y - 30, "🔫 火力升级!", "#ffff00");
                    if(this.id === 1) document.getElementById('p1-weapon').textContent = this.weapons[i].name;
                }
                break;
            }
        }
    }

    shoot() {
        if(this.hp <= 0 || this.isDowned || this.cooldown > 0 || this.vehicleTime > 0) return;
        const w = this.weapons[this.weaponLevel];
        this.cooldown = w.cd;
        
        if(this.mechTime > 0) {
            if(this.mechType === 1) { 
                if(frameCount % 20 === 0) {
                    audio.shootLaser();
                    let b = new Bullet(this.x, this.y, this.facing.x, this.facing.y, 10, 300, '#ff5500', true, this.id);
                    b.size = 15;
                    bullets.push(b);
                }
            } else if(this.mechType === 2) { 
                audio.shootLaser();
                for(let i=0; i<8; i++) {
                    let angle = Math.PI/4 * i + (frameCount*0.1);
                    bullets.push(new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), 15, 50, '#ff0000', true, this.id));
                }
            } else if(this.mechType === 3) { 
                audio.shootMachine();
                let angle = Math.atan2(this.facing.y, this.facing.x) + (Math.random()-0.5)*0.15;
                bullets.push(new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), 25, 30, '#00ffff', true, this.id));
            }
            return;
        }

        let baseAngle = Math.atan2(this.facing.y, this.facing.x);
        let count = w.count;
        let spread = w.spread;
        
        let startAngle = count === 1 ? baseAngle : baseAngle - spread/2;
        let angleStep = count === 1 ? 0 : spread / (count - 1);
        
        for(let i = 0; i < count; i++) {
            let angle = startAngle + i * angleStep;
            let b = new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), w.speed, w.damage, '#fff', w.pierce, this.id);
            
            if(this.weaponLevel >= 29) b.color = '#ff00ff';
            else if(count >= 5) b.color = '#ffaa00';
            else if(w.pierce) b.color = '#00ffff';
            
            b.size = w.pierce ? 5 : 4;
            bullets.push(b);
        }
        audio.shootPistol();
    }

    draw(ctx) {
        if(this.hp <= 0 && !this.isDowned) return;

        if(this.isDowned) {
            // Draw Tombstone
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x - 15, this.y - 15, 30, 35);
            ctx.beginPath(); ctx.arc(this.x, this.y - 15, 15, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#000'; ctx.font = '20px Arial'; ctx.fillText('RIP', this.x, this.y + 5);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Share Tech Mono", monospace';
            ctx.fillText('P' + this.id + ' 等待救援...', this.x, this.y - 35);
            
            // Draw Revive Progress Bar
            if(this.reviveProgress > 0) {
                ctx.fillStyle = '#222'; ctx.fillRect(this.x - 20, this.y + 25, 40, 6);
                ctx.fillStyle = '#0f0'; ctx.fillRect(this.x - 20, this.y + 25, 40 * (this.reviveProgress/120), 6);
            }
            return;
        }

        if(this.mechTime > 0) {
            // Draw Mech
            ctx.fillStyle = '#444';
            ctx.fillRect(this.x - 30, this.y - 30, 60, 60);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x + this.facing.x*20 - 5, this.y + this.facing.y*20 - 5, 10, 10);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.facing.x*40, this.y + this.facing.y*40); ctx.stroke();
        } else if(this.vehicleTime > 0) {
            // Draw Motorcycle
            ctx.fillStyle = '#ff3300';
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.facing.y, this.facing.x));
            ctx.fillRect(-20, -10, 40, 20);
            ctx.fillStyle = '#222'; // wheels
            ctx.fillRect(-15, -15, 10, 5); ctx.fillRect(-15, 10, 10, 5);
            ctx.fillRect(15, -15, 10, 5); ctx.fillRect(15, 10, 10, 5);
            ctx.restore();
        } else {
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.atan2(this.facing.y, this.facing.x));
            
            // Shoulders/Torso
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size - 2, this.size, 0, 0, Math.PI*2);
            ctx.fill();

            // Backpack
            ctx.fillStyle = '#333';
            ctx.fillRect(-this.size-2, -8, 8, 16);

            // Left arm & Hand
            ctx.fillStyle = this.color;
            ctx.fillRect(0, -this.size+2, 18, 6);
            ctx.fillStyle = '#ffccaa'; // skin
            ctx.beginPath(); ctx.arc(18, -this.size+5, 4, 0, Math.PI*2); ctx.fill();

            // Right arm & Hand
            ctx.fillStyle = this.color;
            ctx.fillRect(0, this.size-8, 18, 6);
            ctx.fillStyle = '#ffccaa'; // skin
            ctx.beginPath(); ctx.arc(18, this.size-5, 4, 0, Math.PI*2); ctx.fill();

            // Gun
            ctx.fillStyle = '#222';
            ctx.fillRect(10, -3, 25, 6); // barrel
            
            // Helmet
            ctx.fillStyle = '#1a3300';
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2); ctx.fill();
            // Visor (Goggles)
            ctx.fillStyle = '#0ff';
            ctx.beginPath(); ctx.arc(2, 0, 8, -Math.PI/3, Math.PI/3); ctx.fill();

            ctx.restore();

        }


        // Player ID and Lives
        ctx.fillStyle = '#fff';
        ctx.font = '12px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        let idText = this.isAI ? 'P' + this.id + ' (AI托管)' : 'P' + this.id;
        ctx.fillText(idText, this.x, this.y - 35);
        
        
        // Draw Shield
        if(this.shieldTime > 0) {
            ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(frameCount * 0.2)*0.3})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Draw Buff aura
        if(this.buffTime > 0) {
            ctx.strokeStyle = `rgba(0, 255, 255, 0.8)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Ultimate Indicator
        if(this.hasUlt) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 40 + Math.sin(frameCount*0.2)*5, 0, Math.PI*2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Stars
        if(this.hp > 0 && !this.isDowned) {
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            let stars = '❤️'.repeat(this.hp);
            ctx.fillText(stars, this.x, this.y - 25);
        }
    }
}


function resolveBuildingCollision(obj) {
    buildings.forEach(b => {
        let testX = obj.x;
        let testY = obj.y;
        if (obj.x < b.x) testX = b.x; else if (obj.x > b.x + b.w) testX = b.x + b.w;
        if (obj.y < b.y) testY = b.y; else if (obj.y > b.y + b.h) testY = b.y + b.h;
        let distX = obj.x - testX;
        let distY = obj.y - testY;
        let distance = Math.hypot(distX, distY);
        let s = obj.size || 15;
        if (distance < s) {
            let overlap = s - distance;
            if(distance === 0) { distX = 1; distY = 0; distance = 1; }
            obj.x += (distX / distance) * overlap;
            obj.y += (distY / distance) * overlap;
        }
    });
}

class Bullet {
    constructor(x, y, dx, dy, speed, damage, color, pierce=false, ownerId=0) {
        this.ownerId = ownerId;
        this.x = x; this.y = y;
        this.dx = dx; this.dy = dy;
        this.speed = speed;
        this.damage = damage;
        this.color = color;
        this.pierce = pierce;
        this.size = pierce ? 4 : 3;
        this.active = true;
    }
    update() {
        let closestDist = 200;
        let target = null;
        zombies.forEach(z => {
            if (!z.active) return;
            let d = Math.hypot(z.x - this.x, z.y - this.y);
            if(d < closestDist) { closestDist = d; target = z; }
        });
        if(target) {
            const idealDx = (target.x - this.x) / closestDist;
            const idealDy = (target.y - this.y) / closestDist;
            this.dx = this.dx * 0.9 + idealDx * 0.1;
            this.dy = this.dy * 0.9 + idealDy * 0.1;
            const len = Math.hypot(this.dx, this.dy);
            this.dx /= len; this.dy /= len;
        }
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;
        resolveBuildingCollision(this);

        // Keep players within the current camera view (Co-op screen binding)
        const margin = 50;
        if(this.x < camera.x - CANVAS_W/2 + margin) this.x = camera.x - CANVAS_W/2 + margin;
        if(this.x > camera.x + CANVAS_W/2 - margin) this.x = camera.x + CANVAS_W/2 - margin;
        if(this.y < camera.y - CANVAS_H/2 + margin) this.y = camera.y - CANVAS_H/2 + margin;
        if(this.y > camera.y + CANVAS_H/2 - margin) this.y = camera.y + CANVAS_H/2 - margin;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if(this.pierce) {
            ctx.arc(this.x, this.y, this.size+2, 0, Math.PI*2);
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        }
        ctx.fill();
    }
}

class Zombie {
    constructor(isBoss = false) {
        this.isBoss = isBoss;
        
        // Types
        if(isBoss) {
            this.type = 'boss';
        } else {
            const rand = Math.random();
            if(rand < 0.5) this.type = 'normal';
            else if(rand < 0.75) this.type = 'fast';
            else if(rand < 0.9) this.type = 'tank';
            else this.type = 'exploder';
        }

        // Spawn at edges
        const edge = Math.floor(Math.random() * 4);
        if(edge === 0) { this.x = Math.random() * CANVAS_W; this.y = -30; }
        else if(edge === 1) { this.x = CANVAS_W + 30; this.y = Math.random() * CANVAS_H; }
        else if(edge === 2) { this.x = Math.random() * CANVAS_W; this.y = CANVAS_H + 30; }
        else { this.x = -30; this.y = Math.random() * CANVAS_H; }

        if(this.type === 'boss') {
            this.size = 35; this.speed = 0.8; this.hp = 1000 + survivalTime*10; this.color = '#ff00ff'; this.damage = 2; this.scoreVal = 500;
        } else if(this.type === 'fast') {
            this.size = 12 + Math.random()*3; this.speed = 1.5 + Math.random()*0.5 + (survivalTime/180); this.hp = 10 + survivalTime/2; this.color = '#ffff00'; this.damage = 1; this.scoreVal = 15;
        } else if(this.type === 'tank') {
            this.size = 25 + Math.random()*5; this.speed = 0.3 + Math.random()*0.3 + (survivalTime/300); this.hp = 100 + survivalTime*3; this.color = '#4444ff'; this.damage = 2; this.scoreVal = 30;
        } else if(this.type === 'exploder') {
            this.size = 18 + Math.random()*4; this.speed = 0.8 + Math.random()*0.5 + (survivalTime/180); this.hp = 15 + survivalTime; this.color = '#ff5500'; this.damage = 1; this.scoreVal = 20;
        } else { // normal
            this.size = 15 + Math.random()*5; this.speed = 0.6 + Math.random()*0.6 + (survivalTime/180); this.hp = 20 + survivalTime; this.color = '#00ff00'; this.damage = 1; this.scoreVal = 10;
        }
        
        if(activeEvent === 'bloodmoon') this.speed *= 2;
        this.maxHp = this.hp;
        this.active = true;
        this.facing = {x: 1, y: 0};
    }
    
    update() {
        let target = null;
        let minDist = Infinity;
        players.forEach(p => {
            if(p.hp > 0) {
                let d = Math.hypot(p.x - this.x, p.y - this.y);
                if(d < minDist) { minDist = d; target = p; }
            }
        });
        if(target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            if(minDist > 0) {
                this.x += (dx / minDist) * this.speed;
                this.y += (dy / minDist) * this.speed;
                this.facing = {x: dx/minDist, y: dy/minDist};
            }
            if(minDist < this.size + target.size) {
                if(target.shieldTime <= 0) {
                    if(target.mechTime > 0) {
                        target.mechHp -= this.damage * 20;
                        if(target.mechHp <= 0) target.mechTime = 0; // mech destroyed
                        audio.playerHit();
                    } else if(target.vehicleTime <= 0) {
                        target.hp -= this.damage;
                        screenShake = 15;
                        audio.playerHit();
                    }
                }
                this.active = false;
                createParticles(this.x, this.y, '#ff0000', 10);

            }
        }
    }

    draw(ctx) {
        if(!this.active) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.facing.y, this.facing.x));
        
        let s = this.size;
        let armSway = Math.sin(frameCount * 0.1) * 5;

        // Zombie Body (Pixel style)
        ctx.fillStyle = this.color; // Dark Green
        ctx.fillRect(-s+4, -s+4, s*2-8, s*2-8);
        
        // Shoulders
        ctx.fillStyle = '#1A3300'; // Darker green clothing
        ctx.fillRect(-s, -s, 10, s*2);

        // Arms (Reaching forward)
        ctx.fillStyle = '#2d5700'; // Arm skin
        ctx.fillRect(0, -s-2, s + 10 + armSway, 6); // Left Arm
        ctx.fillRect(0, s-4, s + 10 - armSway, 6); // Right Arm
        
        // Bloody Hands
        ctx.fillStyle = '#800000'; // Blood red
        ctx.fillRect(s + 10 + armSway, -s-2, 4, 6);
        ctx.fillRect(s + 10 - armSway, s-4, 4, 6);

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, s*0.6, 0, Math.PI*2);
        ctx.fill();

        // Eyes (Red glowing pixels)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(s*0.2, -s*0.3, 4, 4);
        ctx.fillRect(s*0.2, s*0.3-4, 4, 4);

        if(this.isBoss) {
            // Boss Spikes
            ctx.fillStyle = '#555';
            ctx.beginPath(); ctx.moveTo(-s, -s); ctx.lineTo(-s-10, -s-10); ctx.lineTo(-s+5, -s); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-s, s); ctx.lineTo(-s-10, s+10); ctx.lineTo(-s+5, s); ctx.fill();
            ctx.beginPath(); ctx.moveTo(-s-5, 0); ctx.lineTo(-s-20, 0); ctx.lineTo(-s-5, 5); ctx.fill();
        }

        ctx.restore();
        
        // Boss HP Bar
        if(this.isBoss && this.hp < this.maxHp) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x - 30, this.y + this.size + 10, 60, 6);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x - 30, this.y + this.size + 10, 60 * (this.hp/this.maxHp), 6);
        }
    }
}

class LootBox {
    constructor(x, y) {
        this.x = x || Math.random() * (CANVAS_W - 100) + 50;
        this.y = y || Math.random() * (CANVAS_H - 100) + 50;
        this.size = 20;
        
        const rand = Math.random();
        if(rand < 0.25) this.type = 'nuke'; 
        else if(rand < 0.50) this.type = 'ult'; 
        else if(rand < 0.60) this.type = 'mech';
        else if(rand < 0.70) this.type = 'vehicle';
        else {
            const types = ['heal', 'shield', 'buff', 'weapon_box', 'trap', 'revive'];
            this.type = types[Math.floor(Math.random() * types.length)];
        }

        this.color = '#fff';
        if(this.type === 'heal') this.color = '#0f0';
        else if(this.type === 'shield') this.color = '#00f';
        else if(this.type === 'buff') this.color = '#0ff';
        else if(this.type === 'weapon_box') this.color = '#aa00ff';
        else if(this.type === 'mech') this.color = '#555';
        else if(this.type === 'vehicle') this.color = '#ffaa00';
        else if(this.type === 'nuke') this.color = '#ff0000';
        else if(this.type === 'trap') this.color = '#880000';
        else if(this.type === 'revive') this.color = '#ffffff';
        else if(this.type === 'ult') this.color = '#00ffff';
        
        this.active = true;
        this.life = 600;
    }
    
    update() {
        if(!this.active) return;
        this.life--;
        if(this.life <= 0) this.active = false;
        
        players.forEach(p => {
            if(p.hp > 0 && Math.hypot(p.x - this.x, p.y - this.y) < p.size + this.size) {
                this.active = false;
                if(this.type === 'heal') {
                    p.hp = Math.min(p.maxHp, p.hp + 1);
                    addFloatingText(p.x, p.y - 30, "❤️ 护甲修复!", "#00ff00");
                    audio.levelUp();
                } else if(this.type === 'shield') {
                    p.shieldTime = 300;
                    addFloatingText(p.x, p.y - 30, "🛡️ 能量偏导盾!", "#0000ff");
                    audio.levelUp();
                } else if(this.type === 'buff') {
                    p.buffTime = 300;
                    addFloatingText(p.x, p.y - 30, "🌀 射速超频!", "#00ffff");
                    audio.levelUp();
                } else if(this.type === 'weapon_box') {
                    if(p.weaponLevel < 29) p.weaponLevel++;
                    p.weapon = p.weapons[p.weaponLevel];
                    
                    addFloatingText(p.x, p.y - 30, `🔫 火力升级! ${p.weapon.name}`, "#aa00ff");
                    audio.levelUp();
                } else if(this.type === 'mech') {
                    p.mechTime = 600;
                    p.mechHp = 500;
                    addFloatingText(p.x, p.y - 30, "🤖 战术机甲部署!", "#555555");
                    audio.levelUp();
                } else if(this.type === 'vehicle') {
                    p.vehicleTime = 600;
                    addFloatingText(p.x, p.y - 30, "🏍️ 机动载具就绪!", "#ffaa00");
                    audio.levelUp();
                } else if(this.type === 'nuke') {
                    zombies.forEach(z => { z.active = false; score += z.scoreVal; createParticles(z.x, z.y, z.color, 15); });
                    screenShake = 30;
                    audio.shootShotgun();
                    addFloatingText(CANVAS_W/2, CANVAS_H/2, "☢️ 战术核打击!", "#ff0000");
                } else if(this.type === 'trap') {
                    p.hp -= 1;
                    addFloatingText(p.x, p.y - 30, "⚠️ 踩中地雷!", "#ff0000");
                    audio.playerHit();
                } else if(this.type === 'revive') {
                    let deadPlayer = players.find(pl => pl.hp <= 0);
                    if(deadPlayer) {
                        deadPlayer.hp = 3;
                        deadPlayer.isDowned = false;
                        deadPlayer.x = p.x; deadPlayer.y = p.y;
                        addFloatingText(p.x, p.y - 30, "👼 战地救援!", "#ffffff");
                        audio.levelUp();
                    } else {
                        p.hp = Math.min(p.maxHp, p.hp + 1);
                        addFloatingText(p.x, p.y - 30, "❤️ 护甲+1", "#ff3333");
                        audio.levelUp();
                    }
                } else if(this.type === 'ult') {
                    p.hasUlt = true;
                    addFloatingText(p.x, p.y - 30, "⚡ 战术充能完毕 (按Q/Shift释放)", "#00ffff");
                    audio.levelUp();
                }
            }
        });
    }
    
    draw(ctx) {
        if(!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        let text = '?';
        if(this.type === 'heal') text = '💖';
        else if(this.type === 'shield') text = '🛡️';
        else if(this.type === 'buff') text = '🌀';
        else if(this.type === 'weapon_box') text = '🔫';
        else if(this.type === 'mech') text = '🤖';
        else if(this.type === 'vehicle') text = '🏍️';
        else if(this.type === 'nuke') text = '☢️';
        else if(this.type === 'trap') text = '⚠️';
        else if(this.type === 'revive') text = '👼';
        else if(this.type === 'ult') text = '⚡';
        ctx.fillText(text, this.x, this.y + 4);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.size = Math.random() * 3 + 1;
        this.life = 1.0;
        this.color = color;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life -= 0.05;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

function createParticles(x, y, color, count) {
    for(let i=0; i<count; i++) particles.push(new Particle(x, y, color));
}

function addFloatingText(x, y, text, color) {
    floatingTexts.push({x, y, text, color, life: 1.0});
}

// --- GAME LOOP ---

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    killCount = 0;
    survivalTime = 0;
    startTime = Date.now();
    players = [new Player(1), new Player(2)];
    players[0].x = CANVAS_W/2 - 20;
    players[1].x = CANVAS_W/2 + 20;
    players[0].y = CANVAS_H/2;
    players[1].y = CANVAS_H/2;
    zombies = [];
    bullets = [];
    particles = [];
    floatingTexts = [];
    lootBoxes = [];
    barrels = [];
    buildings = [];
    bloodStains = [];
    generatedChunks.clear();
    camera = {x: CANVAS_W/2, y: CANVAS_H/2};
    for(let i=0; i<5; i++) barrels.push(new Barrel(Math.random()*(CANVAS_W-200)+100, Math.random()*(CANVAS_H-200)+100));
    currentWave = 1;
    waveTimer = 0;
    hitStopFrames = 0;
    flashFrames = 0;
    lootTimer = 0;
    spawnRate = 100;
    frameCount = 0;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('score').textContent = '0';
    document.getElementById('p1-weapon').textContent = players[0].weapons[0].name;
    document.getElementById('p2-weapon').textContent = players[1].weapons[0].name;
    document.getElementById('new-high').classList.add('hidden');

    requestAnimationFrame(gameLoop);
}

function togglePause() {
    if(gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('pause-screen').classList.remove('hidden');
    } else if(gameState === 'PAUSED') {
        gameState = 'PLAYING';
        document.getElementById('pause-screen').classList.add('hidden');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    gameState = 'GAME_OVER';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
    document.getElementById('survival-time').textContent = survivalTime;
    document.getElementById('kill-count').textContent = killCount;
    
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('zs_highscore', highScore);
        document.getElementById('high-score').textContent = highScore;
        document.getElementById('new-high').classList.remove('hidden');
    }
}

function update() {
    if(gameState !== 'PLAYING') return;
    frameCount++;
    

    // Camera Update
    let cx = 0, cy = 0, count = 0;
    players.forEach(p => { if(p.hp > 0) { cx += p.x; cy += p.y; count++; }});
    if(count > 0) {
        camera.x += (cx/count - camera.x) * 0.1;
        camera.y += (cy/count - camera.y) * 0.1;
    }
    
    // World Generation
    let cX = Math.floor(camera.x / CHUNK_SIZE);
    let cY = Math.floor(camera.y / CHUNK_SIZE);
    for(let i = cX - 1; i <= cX + 1; i++) {
        for(let j = cY - 1; j <= cY + 1; j++) {
            let key = `${i},${j}`;
            if(!generatedChunks.has(key)) {
                generatedChunks.add(key);
                // Create 1-3 buildings per chunk
                let numB = Math.floor(Math.random()*3) + 1;
                for(let k=0; k<numB; k++) {
                    let w = 150 + Math.random() * 300;
                    let h = 150 + Math.random() * 300;
                    let bx = i * CHUNK_SIZE + Math.random() * (CHUNK_SIZE - w);
                    let by = j * CHUNK_SIZE + Math.random() * (CHUNK_SIZE - h);
                    buildings.push(new Building(bx, by, w, h));
                }
            }
        }
    }

    // Wave System
    waveTimer++;
    if(waveTimer > 3600) { // 60 seconds per wave
        currentWave++;
        waveTimer = 0;
        addFloatingText(camera.x, camera.y, `🚨 第 ${currentWave} 波 尸潮来袭! 🚨`, "#ff0000");
        screenShake = 20;
        audio.levelUp();
        // Spawn Wave Boss
        for(let i=0; i<Math.floor(currentWave/2)+1; i++) {
            let z = new Zombie(true);
            z.x = camera.x + (Math.random()-0.5)*CANVAS_W;
            z.y = camera.y + (Math.random()-0.5)*CANVAS_H;
            zombies.push(z);
        }
        for(let i=0; i<3; i++) barrels.push(new Barrel(camera.x + (Math.random()-0.5)*CANVAS_W, camera.y + (Math.random()-0.5)*CANVAS_H));
    }

    
    // Update blood stains
    bloodStains.forEach(b => b.life -= 0.005);
    bloodStains = bloodStains.filter(b => b.life > 0);

    // Random Events every 40 seconds
    if(frameCount > 0 && frameCount % 2400 === 0) {
        const events = ['swarm', 'bloodmoon', 'orbital'];
        activeEvent = events[Math.floor(Math.random() * events.length)];
        eventTimer = 600; // 10 seconds duration
        
        if(activeEvent === 'swarm') {
            addFloatingText(camera.x, camera.y, "⚠️ 警告：侦测到大规模感染者群！ ⚠️", "#ff0000");
            audio.levelUp();
            screenShake = 30;
            for(let i=0; i<30; i++) {
                let z = new Zombie();
                z.x = camera.x + (Math.random()-0.5)*CANVAS_W*1.5;
                z.y = camera.y + (Math.random()-0.5)*CANVAS_H*1.5;
                zombies.push(z);
            }
        } else if(activeEvent === 'bloodmoon') {
            addFloatingText(camera.x, camera.y, "🌙 战地预警：目标进入狂暴状态！ 🌙", "#ff0000");
            audio.levelUp();
            screenShake = 20;
        } else if(activeEvent === 'orbital') {
            addFloatingText(camera.x, camera.y, "🚀 轨道打击火力覆盖中！ 🚀", "#00ffff");
            audio.levelUp();
            screenShake = 20;
        }
    }
    
    // Process active event
    if(eventTimer > 0) {
        eventTimer--;
        if(activeEvent === 'orbital' && eventTimer % 10 === 0) {
            // Drop bombs randomly
            let bx = camera.x + (Math.random()-0.5)*CANVAS_W*1.5;
            let by = camera.y + (Math.random()-0.5)*CANVAS_H*1.5;
            createParticles(bx, by, '#ffaa00', 30);
            screenShake = 5;
            audio.shootShotgun();
            zombies.forEach(z => {
                if(Math.hypot(z.x - bx, z.y - by) < 150) {
                    z.hp -= 200;
                    if(z.hp <= 0 && z.active) {
                        z.active = false;
                        score += z.scoreVal;
                        createParticles(z.x, z.y, z.color, 15);
                    if(z.type === 'exploder') {
                        createParticles(z.x, z.y, '#ffaa00', 30);
                        audio.shootShotgun();
                        screenShake = Math.max(screenShake, 10);
                        addFloatingText(z.x, z.y, "💥 异种自爆!", "#ff5500");
                        players.forEach(p => {
                            if(p.hp > 0 && Math.hypot(p.x - z.x, p.y - z.y) < 80) {
                                p.hp -= 2;
                                audio.playerHit();
                            }
                        });
                        zombies.forEach(oz => {
                            if(oz.active && oz !== z && Math.hypot(oz.x - z.x, oz.y - z.y) < 80) {
                                oz.hp -= 50;
                            }
                        });
                    }
                    }
                }
            });
        }
        if(eventTimer <= 0) {
            activeEvent = null;
        }
    }

    if(screenShake > 0) screenShake--;
    if(comboTimer > 0) {
        comboTimer--;

    // Garbage collection to prevent memory leaks in infinite world
    zombies = zombies.filter(z => z.active && Math.hypot(z.x - camera.x, z.y - camera.y) < CANVAS_W * 2);
    bullets = bullets.filter(b => b.active);
    particles = particles.filter(p => p.life > 0);
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    lootBoxes = lootBoxes.filter(lb => lb.active && Math.hypot(lb.x - camera.x, lb.y - camera.y) < CANVAS_W * 3);
    barrels = barrels.filter(b => b.active && Math.hypot(b.x - camera.x, b.y - camera.y) < CANVAS_W * 3);

    // Check Game Over condition safely
    if(players.every(p => (p.hp <= 0))) {
        gameOver();
    }

    

        if(comboTimer <= 0) {
            if(comboCount >= 10) addFloatingText(CANVAS_W/2, 150, `🔥 ${comboCount} 连杀终结!`, '#ffaa00');
            comboCount = 0;
        }
    }

    // Time
    survivalTime = Math.floor((Date.now() - startTime) / 1000);

    players.forEach(p => p.update());

    // Resolve Player-Player collision
    if(players.length === 2 && players[0].hp > 0 && players[1].hp > 0) {
        let p1 = players[0];
        let p2 = players[1];
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        let dist = Math.hypot(dx, dy);
        let minDist = p1.size + p2.size;
        
        if(dist < minDist && dist > 0) {
            let overlap = minDist - dist;
            let nx = dx / dist;
            let ny = dy / dist;
            
            p1.x -= nx * (overlap / 2);
            p1.y -= ny * (overlap / 2);
            p2.x += nx * (overlap / 2);
            p2.y += ny * (overlap / 2);
            
            // Keep inside bounds
            p1.x = Math.max(p1.size, Math.min(CANVAS_W - p1.size, p1.x));
            p1.y = Math.max(p1.size, Math.min(CANVAS_H - p1.size, p1.y));
            p2.x = Math.max(p2.size, Math.min(CANVAS_W - p2.size, p2.x));
            p2.y = Math.max(p2.size, Math.min(CANVAS_H - p2.size, p2.y));
        }
    }

    // Spawning
    if(frameCount % Math.max(5, spawnRate) === 0) {
        let count = Math.floor(survivalTime / 15) + 1;
        if (count > 10) count = 10;
        for(let i=0; i<count; i++) zombies.push(new Zombie());
    }
    // Boss spawn every 30 seconds
    if(frameCount % 1800 === 0) {
        zombies.push(new Zombie(true));
        addFloatingText(CANVAS_W/2, CANVAS_H/2, "⚠️ 极度危险：首领级变异体出现！ ⚠️", "#ff00ff");
        screenShake = 20;
    }

    // Difficulty increase
    if(frameCount % 300 === 0) {
        spawnRate = Math.max(5, spawnRate - 5);
    }

    bullets.forEach(b => b.update());
    zombies.forEach(z => z.update());
    particles.forEach(p => p.update());
    lootBoxes.forEach(lb => lb.update());
    lootTimer++;
    if(lootTimer > 600) {
        lootTimer = 0;
        if(Math.random() < 0.5) lootBoxes.push(new LootBox());
    }
    floatingTexts.forEach(ft => { ft.y -= 1; ft.life -= 0.02; });
    if(typeof boars !== 'undefined') boars.forEach(b => b.update());

    // Collisions
    for(let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if(!b.active) continue;
        
        // Check Barrels
        barrels.forEach(barrel => {
            if(barrel.active && Math.hypot(b.x - barrel.x, b.y - barrel.y) < barrel.size + b.size) {
                barrel.hp -= b.damage;
                if(!b.pierce) b.active = false;
                if(barrel.hp <= 0) {
                    barrel.active = false;
                    createParticles(barrel.x, barrel.y, '#ffaa00', 50);
                    audio.shootShotgun();
                    screenShake = 20;
                    // Explosion damage
                    zombies.forEach(z => {
                        if(z.active && Math.hypot(z.x - barrel.x, z.y - barrel.y) < 150) {
                            z.hp -= 500;
                        }
                    });
                    players.forEach(p => {
                        if(p.hp > 0 && Math.hypot(p.x - barrel.x, p.y - barrel.y) < 100) {
                            p.hp -= 5;
                            audio.playerHit();
                        }
                    });
                    addFloatingText(barrel.x, barrel.y, "💥 轰隆!", "#ff5500");
                }
            }
        });

        for(let j = zombies.length - 1; j >= 0; j--) {
            const z = zombies[j];
            if(!z.active) continue;
            
            const dist = Math.hypot(b.x - z.x, b.y - z.y);
            if(dist < z.size + b.size) {
                z.hp -= b.damage;
                if(!b.pierce) b.active = false;
                createParticles(b.x, b.y, '#fff', 3);
                
                if(z.hp <= 0) {
                    z.active = false;
                    score += z.scoreVal;
                    let owner = players.find(pl => pl.id === b.ownerId);
                    if(owner) owner.score += z.scoreVal;
                    killCount++;
                    
                    // 怪物死亡掉落道具
                    if(z.isBoss) {
                        lootBoxes.push(new LootBox(z.x, z.y));
                        lootBoxes.push(new LootBox(z.x+30, z.y+30));
                        lootBoxes.push(new LootBox(z.x-30, z.y-30));
                        hitStopFrames = 12; // 0.2s freeze
                        flashFrames = 15;
                        screenShake = 30;
                        addFloatingText(camera.x, camera.y, "🌟 斩杀目标! 🌟", "#ffff00");
                    } else if(Math.random() < 0.15) {
                        lootBoxes.push(new LootBox(z.x, z.y));
                    }
                    
                    document.getElementById('score').textContent = score;
                    createParticles(z.x, z.y, z.color, 15);
                    if(z.type === 'exploder') {
                        createParticles(z.x, z.y, '#ffaa00', 30);
                        audio.shootShotgun();
                        screenShake = Math.max(screenShake, 10);
                        addFloatingText(z.x, z.y, "💥 异种自爆!", "#ff5500");
                        players.forEach(p => {
                            if(p.hp > 0 && Math.hypot(p.x - z.x, p.y - z.y) < 80) {
                                p.hp -= 2;
                                audio.playerHit();
                            }
                        });
                        zombies.forEach(oz => {
                            if(oz.active && oz !== z && Math.hypot(oz.x - z.x, oz.y - z.y) < 80) {
                                oz.hp -= 50;
                            }
                        });
                    }
                    for(let b=0; b<5; b++) bloodStains.push(new Blood(z.x + (Math.random()-0.5)*40, z.y + (Math.random()-0.5)*40, Math.random()*8+4, Math.random()*8+4, '#800000'));
                    comboCount++; comboTimer = 180;
                    if(comboCount % 10 === 0) { screenShake = 10; addFloatingText(CANVAS_W/2, 100, `🔥 ${comboCount} COMBO!`, '#ffaa00'); audio.levelUp(); }
                    audio.zombieDie();
                    if(z.isBoss) {
                        addFloatingText(z.x, z.y, `+${z.scoreVal} BOSS击杀!`, '#ff00ff');
                    } else if(Math.random() < 0.1) {
                        addFloatingText(z.x, z.y, `+${z.scoreVal}`, '#0f0');
                    }
                } else {
                    audio.zombieHit();
                }
                if(!b.pierce) break;
            }
        }
    }

    // Cleanup
    bullets = bullets.filter(b => b.active);
    zombies = zombies.filter(z => z.active);
    particles = particles.filter(p => p.life > 0);
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    lootBoxes = lootBoxes.filter(lb => lb.active);
    if(typeof boars !== 'undefined') boars = boars.filter(b => b.active);

    // Update Player HUD
    if(players.length >= 2) {
        let p1 = players[0];
        document.getElementById('p1-score').textContent = p1.score;
        document.getElementById('p1-weapon').textContent = p1.weapon.name;
        let p1b = [];
        if(p1.shieldTime > 0) p1b.push('🛡️');
        if(p1.buffTime > 0) p1b.push('🌀');
        if(p1.mechTime > 0) p1b.push('🤖');
        if(p1.vehicleTime > 0) p1b.push('🏍️');
        if(p1.hasUlt) p1b.push('⚡');
        document.getElementById('p1-buffs').textContent = p1b.length > 0 ? p1b.join(' ') : '无';

        let p2 = players[1];
        document.getElementById('p2-score').textContent = p2.score;
        document.getElementById('p2-weapon').textContent = p2.weapon.name;
        let p2b = [];
        if(p2.shieldTime > 0) p2b.push('🛡️');
        if(p2.buffTime > 0) p2b.push('🌀');
        if(p2.mechTime > 0) p2b.push('🤖');
        if(p2.vehicleTime > 0) p2b.push('🏍️');
        if(p2.hasUlt) p2b.push('⚡');
        document.getElementById('p2-buffs').textContent = p2b.length > 0 ? p2b.join(' ') : '无';
    }
}

function draw() {
    ctx.save();
    if(screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
    }

    // Clear background
    if(activeEvent === 'bloodmoon') {
        ctx.fillStyle = '#300';
    } else {
        ctx.fillStyle = '#111';
    }
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for(let i=0; i<CANVAS_W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_H); ctx.stroke(); }
    for(let i=0; i<CANVAS_H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_W,i); ctx.stroke(); }
    
    // Draw Blood Stains
    ctx.drawImage(bgCanvas, 0, 0);

    particles.forEach(p => p.draw(ctx));
    bullets.forEach(b => b.draw(ctx));
    zombies.forEach(z => z.draw(ctx));
    if(players) players.forEach(p => p.draw(ctx));

    barrels.forEach(b => b.draw(ctx));
    lootBoxes.forEach(lb => lb.draw(ctx));
    if(typeof boars !== 'undefined') boars.forEach(b => b.draw(ctx));
    floatingTexts.forEach(ft => {
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 20px "ZCOOL KuaiLe"';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1.0;
    });
    
    // Draw Combo HUD
    if(comboCount > 1) {
        ctx.fillStyle = `rgba(255, 170, 0, ${comboTimer/180})`;
        ctx.font = 'bold 30px "ZCOOL KuaiLe"';
        ctx.textAlign = 'right';
        ctx.fillText(`${comboCount} 连杀!`, CANVAS_W - 20, 40);
        ctx.fillStyle = '#555';
        ctx.fillRect(CANVAS_W - 120, 50, 100, 5);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(CANVAS_W - 120, 50, 100 * (comboTimer/180), 5);
    }
    
    ctx.restore();
}

function gameLoop(timestamp) {
    if(gameState !== 'PLAYING') return;
    
    try {
        if(hitStopFrames > 0) {
            hitStopFrames--;
        } else {
            update();
        }
        draw();
        if(flashFrames > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${flashFrames / 15})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            flashFrames--;
        }
    } catch(e) {
        console.error("Game Loop Error:", e);
        // Ensure game doesn't pause silently
        if(frameCount % 60 === 0) { // Notify only once a second
             addFloatingText(camera.x, camera.y - CANVAS_H/2 + 50, "⚠️ 战术头盔系统已自动重启", "#ff0000");
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Initial draw
if(activeEvent === 'bloodmoon') {
        ctx.fillStyle = '#300';
    } else {
        ctx.fillStyle = '#111';
    }
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

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
let spawnRate = 100; // frames
let frameCount = 0;

// Inputs
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyS: false, KeyA: false, KeyD: false,
    Space: false, Enter: false, NumpadEnter: false
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
        this.hp = 100;
        this.maxHp = 100;
        this.weaponLevel = 0;
        this.cooldown = 0;
        this.buffTime = 0;
        this.shieldTime = 0;
        this.mechTime = 0;
        this.mechHp = 0;
        this.vehicleTime = 0;
        this.lastInputTime = Date.now();
        this.isAI = false;
        
        this.weapons = [
            { name: "双持手枪 Pistols", cd: 20, type: "pistol", req: 0 },
            { name: "重型霰弹枪 Shotgun", cd: 35, type: "shotgun", req: 20 },
            { name: "突击步枪 Rifle", cd: 8, type: "machinegun", req: 60 },
            { name: "等离子激光 Laser", cd: 2, type: "laser", req: 150 }
        ];
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
                    audio.zombieDie();
                    addFloatingText(z.x, z.y, "车祸现场!", "#ffcc00");
                }
            });
        }
        let dx = 0; let dy = 0;
        let currentSpeed = this.speed;
        if(this.buffTime > 0) currentSpeed *= 1.5;
        if(this.mechTime > 0) currentSpeed *= 0.6; // Mech is slow
        if(this.vehicleTime > 0) currentSpeed *= 3.0; // Vehicle is fast

        
        if(Date.now() - this.lastInputTime > 5000) {
            this.isAI = true;
        }

        if(this.isAI) {
            // AI Logic
            let closestDist = Infinity;
            let target = null;
            zombies.forEach(z => {
                if(!z.active) return;
                let d = Math.hypot(z.x - this.x, z.y - this.y);
                if(d < closestDist) { closestDist = d; target = z; }
            });
            
            if(target) {
                // Aim at target
                let tdx = target.x - this.x;
                let tdy = target.y - this.y;
                let tLen = Math.hypot(tdx, tdy);
                if(tLen > 0) {
                    this.facing = {x: tdx/tLen, y: tdy/tLen};
                }
                
                // Movement: Dodge if too close, approach if far
                if(closestDist < 150) {
                    // Flee
                    dx = -this.facing.x;
                    dy = -this.facing.y;
                } else if(closestDist > 250) {
                    // Approach
                    dx = this.facing.x;
                    dy = this.facing.y;
                } else {
                    // Circle around
                    dx = -this.facing.y;
                    dy = this.facing.x;
                }
                
                // Also dodge borders
                if(this.x < 100) dx = 1;
                if(this.x > CANVAS_W - 100) dx = -1;
                if(this.y < 100) dy = 1;
                if(this.y > CANVAS_H - 100) dy = -1;
                
                // Auto shoot
                this.shoot();
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

        this.x = Math.max(this.size, Math.min(CANVAS_W - this.size, this.x));
        this.y = Math.max(this.size, Math.min(CANVAS_H - this.size, this.y));

        // Check weapon level up
        for(let i = this.weapons.length - 1; i >= 0; i--) {
            if(killCount >= this.weapons[i].req) {
                if(this.weaponLevel !== i) {
                    this.weaponLevel = i;
                    audio.levelUp();
                    addFloatingText(this.x, this.y - 30, "WEAPON UPGRADE!", "#ffff00");
                    if(this.id === 1) document.getElementById('current-weapon').textContent = this.weapons[i].name;
                }
                break;
            }
        }
    }

    shoot() {
        if(this.hp <= 0 || this.cooldown > 0) return;
        const w = this.weapons[this.weaponLevel];
        this.cooldown = w.cd;
        
        let fx = this.facing.x;
        let fy = this.facing.y;
        
        
        if(this.vehicleTime > 0) return; // Cannot shoot while driving
        
        if(this.mechTime > 0) {
            audio.shootLaser();
            // Mech shoots 360 degree lasers and huge missiles
            for(let i=0; i<8; i++) {
                let angle = Math.PI/4 * i + (frameCount*0.1);
                bullets.push(new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), 15, 50, '#ff0000', true));
            }
            return;
        }

        if(w.type === "pistol") {
            audio.shootPistol();
            bullets.push(new Bullet(this.x, this.y, fx, fy, 10, 20, '#fff'));
            bullets.push(new Bullet(this.x, this.y, -fx, -fy, 10, 20, '#fff'));
        } else if(w.type === "shotgun") {
            audio.shootShotgun();
            for(let i = -2; i <= 2; i++) {
                let angle = Math.atan2(fy, fx) + i * 0.2;
                bullets.push(new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), 12, 15, '#ffaa00'));
            }
        } else if(w.type === "machinegun") {
            audio.shootMachine();
            let angle = Math.atan2(fy, fx) + (Math.random() - 0.5) * 0.2;
            bullets.push(new Bullet(this.x, this.y, Math.cos(angle), Math.sin(angle), 15, 18, '#00ffff'));
        } else if(w.type === "laser") {
            audio.shootLaser();
            bullets.push(new Bullet(this.x, this.y, fx, fy, 25, 30, '#ff00ff', true));
        }
    }

    draw(ctx) {
        if(this.hp <= 0) return;
        
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


        // Player ID
        ctx.fillStyle = '#fff';
        ctx.font = '12px ZCOOL KuaiLe';
        ctx.textAlign = 'center';
        ctx.fillText(this.isAI ? 'P' + this.id + ' (AI托管)' : 'P' + this.id, this.x, this.y - 25);
        
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

        // HP Bar
        if(this.hp < this.maxHp) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x - 15, this.y + 25, 30, 4);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x - 15, this.y + 25, 30 * (this.hp/this.maxHp), 4);
        }
    }
}

class Bullet {
    constructor(x, y, dx, dy, speed, damage, color, pierce=false) {
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
        if(this.x < 0 || this.x > CANVAS_W || this.y < 0 || this.y > CANVAS_H) this.active = false;
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
        
        // Spawn at edges
        const edge = Math.floor(Math.random() * 4);
        if(edge === 0) { this.x = Math.random() * CANVAS_W; this.y = -30; }
        else if(edge === 1) { this.x = CANVAS_W + 30; this.y = Math.random() * CANVAS_H; }
        else if(edge === 2) { this.x = Math.random() * CANVAS_W; this.y = CANVAS_H + 30; }
        else { this.x = -30; this.y = Math.random() * CANVAS_H; }

        this.size = isBoss ? 35 : 15 + Math.random() * 5;
        this.speed = isBoss ? 1.5 : 1 + Math.random() * 2 + (survivalTime / 60);
        this.hp = isBoss ? 1000 + survivalTime*10 : 20 + survivalTime;
        this.maxHp = this.hp;
        this.color = isBoss ? '#ff00ff' : '#00ff00';
        this.active = true;
        this.damage = isBoss ? 30 : 10;
        this.scoreVal = isBoss ? 500 : 10;
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
                        target.mechHp -= this.damage;
                        if(target.mechHp <= 0) target.mechTime = 0; // mech destroyed
                        audio.playerHit();
                    } else if(target.vehicleTime <= 0) {
                        target.hp -= this.damage;
                        audio.playerHit();
                    }
                }
                this.active = false;
                createParticles(this.x, this.y, '#ff0000', 10);
                if(players.every(p => p.hp <= 0)) {
                    gameOver();
                }
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
    zombies = [];
    bullets = [];
    particles = [];
    floatingTexts = [];
    lootBoxes = [];
    lootTimer = 0;
    spawnRate = 100;
    frameCount = 0;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('score').textContent = '0';
    document.getElementById('current-weapon').textContent = players[0].weapons[0].name;
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

    // Time
    survivalTime = Math.floor((Date.now() - startTime) / 1000);

    players.forEach(p => p.update());

    // Spawning
    if(frameCount % Math.max(20, spawnRate) === 0) {
        zombies.push(new Zombie());
    }
    // Boss spawn every 30 seconds
    if(frameCount % 1800 === 0) {
        zombies.push(new Zombie(true));
        addFloatingText(CANVAS_W/2, CANVAS_H/2, "⚠️ BOSS 出现 ⚠️", "#ff00ff");
    }

    // Difficulty increase
    if(frameCount % 600 === 0) {
        spawnRate = Math.max(15, spawnRate - 5);
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
                    killCount++;
                    document.getElementById('score').textContent = score;
                    createParticles(z.x, z.y, z.color, 15);
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
}

function draw() {
    // Clear background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for(let i=0; i<CANVAS_W; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,CANVAS_H); ctx.stroke(); }
    for(let i=0; i<CANVAS_H; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(CANVAS_W,i); ctx.stroke(); }

    particles.forEach(p => p.draw(ctx));
    bullets.forEach(b => b.draw(ctx));
    zombies.forEach(z => z.draw(ctx));
    if(players) players.forEach(p => p.draw(ctx));

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
}

function gameLoop(timestamp) {
    if(gameState !== 'PLAYING') return;
    
    // Fixed time step for logic if needed, but simple update works for standard 60fps
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Initial draw
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

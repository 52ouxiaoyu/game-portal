const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_W = 1000;
const CANVAS_H = 800;
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

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
    lootBoxes = [];
    lootTimer = 0;
let lootBoxes = [];
let lootTimer = 0;

let spawnTimer = 0;
let spawnRate = 100; // frames
let frameCount = 0;

// Inputs
const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    KeyW: false, KeyS: false, KeyA: false, KeyD: false,
    Space: false, Enter: false
};

window.addEventListener('keydown', e => {
    if(keys.hasOwnProperty(e.code)) keys[e.code] = true;
    if((e.code === 'Space' || e.code === 'Enter') && gameState === 'PLAYING') {
        players.forEach(p => { if((e.code==='Space'&&p.id===1) || (e.code==='Enter'&&p.id===2)) p.shoot(); });
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
        
        this.weapons = [
            { name: "双持手枪 Pistols", cd: 20, type: "pistol", req: 0 },
            { name: "重型霰弹枪 Shotgun", cd: 35, type: "shotgun", req: 20 },
            { name: "突击步枪 Rifle", cd: 8, type: "machinegun", req: 60 },
            { name: "等离子激光 Laser", cd: 2, type: "laser", req: 150 }
        ];
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
            }
            if(minDist < this.size + target.size) {
                if(target.shieldTime <= 0) {
                    target.hp -= this.damage;
                    audio.playerHit();
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
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // pixel style zombie
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size*2, this.size*2);
        ctx.fillStyle = '#ff0000'; // red eyes
        ctx.fillRect(this.x - this.size + 4, this.y - this.size + 4, 4, 4);
        ctx.fillRect(this.x + this.size - 8, this.y - this.size + 4, 4, 4);
        ctx.fillStyle = '#336600'; // dark green arms
        ctx.fillRect(this.x - this.size - 4, this.y, 4, 10);
        ctx.fillRect(this.x + this.size, this.y, 4, 10);
        
        if(this.hp < this.maxHp) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(this.x - this.size, this.y - this.size - 8, this.size*2, 4);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x - this.size, this.y - this.size - 8, this.size*2 * (this.hp/this.maxHp), 4);
        }
    }
}


class LootBox {
    constructor() {
        this.x = 50 + Math.random() * (CANVAS_W - 100);
        this.y = 50 + Math.random() * (CANVAS_H - 100);
        this.size = 15;
        this.active = true;
        this.color = '#ffd700'; // gold
        // Determine type
        const r = Math.random();
        if(r < 0.3) this.type = 'medkit';      // 30% HP
        else if(r < 0.5) this.type = 'potion'; // 20% Max HP
        else if(r < 0.65) this.type = 'nuke';  // 15% Screen clear
        else if(r < 0.8) this.type = 'stim';   // 15% Speed/Rapid fire
        else if(r < 0.95) this.type = 'shield';// 15% Invincible
        else this.type = 'trap';               // 5% Fake/Trap
    }
    update() {
        // Check collision with players
        players.forEach(p => {
            if(!this.active || p.hp <= 0) return;
            const dist = Math.hypot(p.x - this.x, p.y - this.y);
            if(dist < this.size + p.size) {
                this.collect(p);
            }
        });
    }
    collect(p) {
        this.active = false;
        audio.levelUp(); // use level up sound
        createParticles(this.x, this.y, this.color, 20);
        
        switch(this.type) {
            case 'medkit':
                p.hp = Math.min(p.maxHp, p.hp + 50);
                addFloatingText(this.x, this.y, "急救包! HP +50", "#00ff00");
                break;
            case 'potion':
                p.maxHp += 20;
                p.hp = p.maxHp;
                addFloatingText(this.x, this.y, "神秘药剂! MAX HP 上升", "#ff00ff");
                break;
            case 'nuke':
                zombies.forEach(z => { z.active = false; createParticles(z.x, z.y, '#ffaa00', 10); score += z.scoreVal; killCount++; });
                addFloatingText(this.x, this.y, "核弹轰炸! 全屏秒杀", "#ffaa00");
                break;
            case 'stim':
                p.buffTime = 300; // 5 seconds
                addFloatingText(this.x, this.y, "兴奋剂! 极速射击", "#00ffff");
                break;
            case 'shield':
                p.shieldTime = 600; // 10 seconds
                addFloatingText(this.x, this.y, "无敌护盾!", "#ffff00");
                break;
            case 'trap':
                p.hp -= 30;
                audio.playerHit();
                addFloatingText(this.x, this.y, "陷阱箱! -30 HP", "#ff0000");
                if(p.hp <= 0 && players.every(pl => pl.hp <= 0)) gameOver();
                break;
        }
    }
    draw(ctx) {
        if(!this.active) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size, this.y - this.size, this.size*2, this.size*2);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(this.x - this.size, this.y - this.size, this.size*2, this.size*2);
        // lock icon
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 3, this.y - 2, 6, 6);
        
        // bounce animation
        const offset = Math.sin(frameCount * 0.1) * 3;
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px Arial';
        ctx.fillText('?', this.x - 5, this.y - 15 + offset);
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
    lootBoxes.forEach(lb => lb.draw(ctx));
    floatingTexts.forEach(ft => { ft.y -= 1; ft.life -= 0.02; });

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

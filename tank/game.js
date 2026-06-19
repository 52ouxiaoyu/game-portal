// Game Constants - Final Full-Screen Scaled Version
const TILE_SIZE = 32; 
const GRID_SIZE = 26;
const CANVAS_SIZE = TILE_SIZE * GRID_SIZE; // 832px

const TILE_TYPES = { EMPTY: 0, BRICK: 1, STEEL: 2, WATER: 3, FOREST: 4, ICE: 5, BASE: 9, BASE_DESTROYED: 10 };
const COLORS = { BRICK: '#B53120', BRICK_LIGHT: '#DC5341', STEEL: '#AAAAAA', STEEL_LIGHT: '#EEEEEE', WATER: '#2131E7', FOREST: '#21B521', PLAYER1: '#E7E721', PLAYER2: '#63C6FF', ENEMY: '#E7E7E7', BASE: '#E79C21' };
const POWERUP_TYPES = { SHIELD: '🛡️', BOMB: '💣', STAR: '⭐', SHOVEL: '🏗️', LIFE: '❤️' };

function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function generateLevel(index) {
    const rng = seededRandom(index * 7919 + 12345);
    const level = { bricks: [], steels: [], waters: [], forests: [], ices: [], totalEnemies: 0 };
    const difficulty = Math.min(index / 100, 1);
    level.totalEnemies = Math.floor(8 + index * 0.25 + difficulty * 8);
    const patterns = ['grid', 'cross', 'maze', 'circle', 'diamond', 'spiral', 'fortress', 'arena', 'corridor', 'scattered'];
    const pattern = patterns[index % patterns.length];
    const brickDensity = 0.15 + difficulty * 0.2;
    const steelDensity = 0.02 + difficulty * 0.08;
    const forestDensity = (index % 5 === 0) ? 0.3 : 0;
    const iceDensity = (index % 7 === 0) ? 0.15 : 0;
    const isProtected = (x, y) => (x >= 7 && x <= 17 && y >= 21) || (x >= 11 && x <= 14 && y >= 23);
    const isSpawn = (x, y) => (x >= 0 && x <= 3 && y >= 0 && y <= 3) || (x >= 11 && x <= 14 && y >= 0 && y <= 3) || (x >= 22 && x <= 25 && y >= 0 && y <= 3);
    if (pattern === 'grid') {
        for (let y = 2; y < 22; y += 4) for (let x = 2; x < 24; x += 4) {
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            if (rng() < brickDensity) { const w = 2 + Math.floor(rng() * 2); const h = 2 + Math.floor(rng() * 2); level.bricks.push([y, x, h, w]); }
            if (rng() < steelDensity) level.steels.push([y, x, 2, 2]);
        }
    } else if (pattern === 'cross') {
        for (let i = 2; i < 24; i++) {
            if (isProtected(i, 12) || isSpawn(i, 12)) continue;
            if (rng() < brickDensity) level.bricks.push([12, i, 2, 2]);
            if (rng() < brickDensity) level.bricks.push([i, 12, 2, 2]);
            if (rng() < steelDensity) level.steels.push([i, i, 2, 2]);
        }
    } else if (pattern === 'maze') {
        for (let y = 2; y < 22; y += 3) for (let x = 2; x < 24; x += 3) {
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            if (rng() < brickDensity * 1.5) level.bricks.push([y, x, 3, 1]);
            if (rng() < brickDensity * 1.5) level.bricks.push([y, x, 1, 3]);
            if (rng() < steelDensity) level.steels.push([y, x, 2, 2]);
        }
    } else if (pattern === 'circle') {
        const cx = 13, cy = 13;
        for (let y = 2; y < 24; y++) for (let x = 2; x < 24; x++) {
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            const dist = Math.hypot(x - cx, y - cy);
            if (dist > 4 && dist < 10 && rng() < brickDensity) level.bricks.push([y, x, 1, 1]);
            if (dist > 3 && dist < 4 && rng() < steelDensity * 2) level.steels.push([y, x, 1, 1]);
        }
    } else if (pattern === 'diamond') {
        for (let y = 2; y < 24; y++) for (let x = 2; x < 24; x++) {
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            const dist = Math.abs(x - 13) + Math.abs(y - 13);
            if (dist > 5 && dist < 12 && rng() < brickDensity) level.bricks.push([y, x, 1, 1]);
            if (dist === 5 && rng() < steelDensity * 3) level.steels.push([y, x, 1, 1]);
        }
    } else if (pattern === 'spiral') {
        for (let i = 0; i < 30; i++) {
            const angle = i * 0.5;
            const r = 2 + i * 0.4;
            const x = Math.floor(13 + Math.cos(angle) * r);
            const y = Math.floor(13 + Math.sin(angle) * r);
            if (x >= 2 && x < 24 && y >= 2 && y < 22) {
                if (isProtected(x, y) || isSpawn(x, y)) continue;
                if (rng() < brickDensity * 2) level.bricks.push([y, x, 2, 2]);
                if (rng() < steelDensity) level.steels.push([y, x, 2, 2]);
            }
        }
    } else if (pattern === 'fortress') {
        for (let x = 4; x < 22; x += 2) {
            if (!isProtected(x, 4) && !isSpawn(x, 4)) level.bricks.push([4, x, 2, 1]);
            if (!isProtected(x, 20) && !isSpawn(x, 20)) level.bricks.push([20, x, 2, 1]);
        }
        for (let y = 4; y < 20; y += 2) {
            if (!isProtected(4, y) && !isSpawn(4, y)) level.bricks.push([y, 4, 1, 2]);
            if (!isProtected(20, y) && !isSpawn(20, y)) level.bricks.push([y, 20, 1, 2]);
        }
        level.steels.push([6, 6, 2, 2]); level.steels.push([6, 18, 2, 2]); level.steels.push([16, 6, 2, 2]); level.steels.push([16, 18, 2, 2]);
        if (difficulty > 0.3) level.steels.push([10, 10, 4, 4]);
    } else if (pattern === 'arena') {
        for (let x = 6; x < 20; x += 2) {
            if (!isProtected(x, 6) && !isSpawn(x, 6)) level.bricks.push([6, x, 2, 1]);
            if (!isProtected(x, 18) && !isSpawn(x, 18)) level.bricks.push([18, x, 2, 1]);
        }
        for (let y = 6; y < 18; y += 2) {
            if (!isProtected(6, y) && !isSpawn(6, y)) level.bricks.push([y, 6, 1, 2]);
            if (!isProtected(18, y) && !isSpawn(18, y)) level.bricks.push([y, 18, 1, 2]);
        }
        level.steels.push([12, 12, 2, 2]);
        if (difficulty > 0.5) { level.steels.push([8, 8, 2, 2]); level.steels.push([16, 16, 2, 2]); }
    } else if (pattern === 'corridor') {
        for (let y = 4; y < 20; y += 4) for (let x = 2; x < 24; x++) {
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            if (rng() < brickDensity) level.bricks.push([y, x, 1, 1]);
            if (x === 12 && rng() < steelDensity * 3) level.steels.push([y, x, 1, 1]);
        }
    } else {
        const count = Math.floor(20 + difficulty * 30);
        for (let i = 0; i < count; i++) {
            const x = 2 + Math.floor(rng() * 22);
            const y = 2 + Math.floor(rng() * 18);
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            const w = 1 + Math.floor(rng() * 3);
            const h = 1 + Math.floor(rng() * 3);
            if (rng() < steelDensity * 3) level.steels.push([y, x, h, w]);
            else level.bricks.push([y, x, h, w]);
        }
    }
    if (difficulty > 0.2) {
        const waterCount = Math.floor(difficulty * 6);
        for (let i = 0; i < waterCount; i++) {
            const x = 3 + Math.floor(rng() * 20);
            const y = 3 + Math.floor(rng() * 16);
            const w = 1 + Math.floor(rng() * 3);
            const h = 1 + Math.floor(rng() * 3);
            level.waters.push([y, x, h, w]);
        }
    }
    if (forestDensity > 0) level.forests.push([1, 1, 24, 24]);
    if (iceDensity > 0) {
        const iceCount = Math.floor(iceDensity * 20);
        for (let i = 0; i < iceCount; i++) {
            const x = 3 + Math.floor(rng() * 20);
            const y = 3 + Math.floor(rng() * 16);
            level.ices.push([y, x, 2, 2]);
        }
    }
    if (index < 10) {
        level.totalEnemies = Math.floor(6 + index * 0.8);
        level.bricks = [];
        level.steels = [];
        const baseCount = 15 + Math.floor(rng() * 10);
        for (let i = 0; i < baseCount; i++) {
            const x = 2 + Math.floor(rng() * 22);
            const y = 2 + Math.floor(rng() * 18);
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            const w = 1 + Math.floor(rng() * 2);
            const h = 1 + Math.floor(rng() * 2);
            level.bricks.push([y, x, h, w]);
        }
        if (index > 3) {
            const steelCount = 1 + Math.floor(rng() * 2);
            for (let i = 0; i < steelCount; i++) {
                const x = 4 + Math.floor(rng() * 18);
                const y = 4 + Math.floor(rng() * 14);
                if (isProtected(x, y) || isSpawn(x, y)) continue;
                level.steels.push([y, x, 2, 2]);
            }
        }
    }
    return level;
}

class Effect {
    constructor(x, y, type, sizeScale = 1) { this.x = x; this.y = y; this.type = type; this.timer = type === 'SPAWN' ? 60 : 20; this.active = true; this.sizeScale = sizeScale; }
    update() { this.timer--; if (this.timer <= 0) this.active = false; }
    draw(ctx) {
        if (this.type === 'EXPLOSION') {
            const progress = (20 - this.timer) / 20;
            const size = (TILE_SIZE * this.sizeScale) * progress;
            ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = progress < 0.5 ? '#fff' : (progress < 0.8 ? '#ff0' : '#f00');
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        } else if (this.type === 'SPAWN') {
            if (Math.floor(this.timer / 4) % 2 === 0) {
                ctx.fillStyle = '#fff'; ctx.beginPath(); const s = 20 * this.sizeScale;
                ctx.moveTo(this.x, this.y - s); ctx.lineTo(this.x + s/3, this.y - s/3); ctx.lineTo(this.x + s, this.y); ctx.lineTo(this.x + s/3, this.y + s/3); ctx.lineTo(this.x, this.y + s); ctx.lineTo(this.x - s/3, this.y + s/3); ctx.lineTo(this.x - s, this.y); ctx.lineTo(this.x - s/3, this.y - s/3); ctx.closePath(); ctx.fill();
            }
        }
    }
}

class PowerUp {
    constructor(game, x, y, type) { this.game = game; this.x = x; this.y = y; this.type = type; this.width = 64; this.height = 64; this.timer = 900; this.active = true; }
    update() {
        this.timer--; if (this.timer <= 0) this.active = false;
        this.game.players.forEach(p => { if (p.alive && this.x < p.x + p.width && this.x + this.width > p.x && this.y < p.y + p.height && this.y + this.height > p.y) { this.applyEffect(p); this.active = false; } });
    }
    applyEffect(player) {
        this.game.effects.push(new Effect(this.x + 32, this.y + 32, 'EXPLOSION'));
        if (this.type === POWERUP_TYPES.BOMB) this.game.enemies.forEach(e => e.destroy());
        else if (this.type === POWERUP_TYPES.SHIELD) player.setShield(360);
        else if (this.type === POWERUP_TYPES.STAR) player.upgrade();
        else if (this.type === POWERUP_TYPES.SHOVEL) this.game.fortifyBase();
        else if (this.type === POWERUP_TYPES.LIFE) this.game.lives++;
        this.game.updateHUD();
    }
    draw(ctx) { if (Math.floor(this.timer / 10) % 2 === 0) { ctx.font = '48px Arial'; ctx.fillText(this.type, this.x, this.y + 48); } }
}

class GameMap {
    constructor(game) { this.game = game; this.grid = []; }
    reset(levelIndex) {
        const level = generateLevel(levelIndex);
        this.currentLevel = level;
        this.grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        for (let i = 0; i < GRID_SIZE; i++) this.grid[0][i] = this.grid[GRID_SIZE - 1][i] = this.grid[i][0] = this.grid[i][GRID_SIZE - 1] = TILE_TYPES.STEEL;
        level.bricks.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.BRICK; });
        level.steels.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.STEEL; });
        if (level.waters) level.waters.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.WATER; });
        if (level.forests) level.forests.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.FOREST; });
        if (level.ices) level.ices.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.ICE; });
        this.clearArea(8, 22, 2, 2); this.clearArea(16, 22, 2, 2); this.clearArea(1, 1, 3, 3); this.clearArea(11, 1, 3, 3); this.clearArea(21, 1, 3, 3);
        this.grid[24][12] = this.grid[24][13] = this.grid[25][12] = this.grid[25][13] = TILE_TYPES.BASE;
        this.setBaseWalls(TILE_TYPES.BRICK);
    }
    setBaseWalls(type) {
        const walls = [
            [23,11],[23,12],[23,13],[23,14],
            [24,11],[25,11],[24,14],[25,14],
            [22,10],[22,11],[22,14],[22,15],
            [23,10],[24,10],[25,10],
            [23,15],[24,15],[25,15],
            [21,11],[21,12],[21,13],[21,14],
            [22,12],[22,13]
        ];
        walls.forEach(([y,x]) => { if (y >= 0 && y < GRID_SIZE && x >= 0 && x < GRID_SIZE) this.grid[y][x] = type; });
    }
    clearArea(tx, ty, tw, th) { for (let y = ty; y < ty + th; y++) for (let x = tx; x < tx + tw; x++) if (y < GRID_SIZE && x < GRID_SIZE) this.grid[y][x] = TILE_TYPES.EMPTY; }
    draw(ctx) {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const tile = this.grid[y][x]; if (tile === TILE_TYPES.EMPTY || tile === TILE_TYPES.FOREST) continue;
                const px = x * TILE_SIZE; const py = y * TILE_SIZE;
                if (tile === TILE_TYPES.BRICK) {
                    ctx.fillStyle = COLORS.BRICK; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS.BRICK_LIGHT; ctx.fillRect(px, py, TILE_SIZE, 4); ctx.fillRect(px, py, 4, TILE_SIZE);
                    ctx.fillStyle = '#000'; ctx.fillRect(px + TILE_SIZE/2, py, 2, TILE_SIZE); ctx.fillRect(px, py + TILE_SIZE/2, TILE_SIZE, 2);
                } else if (tile === TILE_TYPES.STEEL) {
                    ctx.fillStyle = COLORS.STEEL; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS.STEEL_LIGHT; ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    ctx.fillStyle = COLORS.STEEL; ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                } else if (tile === TILE_TYPES.WATER) {
                    ctx.fillStyle = COLORS.WATER; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#fff'; ctx.fillRect(px + 8, py + 8, 4, 4);
                } else if (tile === TILE_TYPES.ICE) {
                    ctx.fillStyle = '#a8d8ea'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#d4f1f9'; ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, 4);
                    ctx.fillStyle = '#b8e6f0'; ctx.fillRect(px + 4, py + 12, 8, 8);
                } else if (tile === TILE_TYPES.BASE) this.drawEagle(ctx, px, py);
                else if (tile === TILE_TYPES.BASE_DESTROYED) { ctx.fillStyle = '#555'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#000'; ctx.font = '24px Arial'; ctx.fillText('X', px + 8, py + 24); }
            }
        }
    }
    drawEagle(ctx, px, py) {
        const tx = Math.floor(px / TILE_SIZE); const ty = Math.floor(py / TILE_SIZE);
        if (this.grid[ty][tx-1] === TILE_TYPES.BASE || (this.grid[ty-1] && this.grid[ty-1][tx] === TILE_TYPES.BASE)) return;
        const hpRatio = this.game.baseHealth / this.game.maxBaseHealth;
        const baseColor = hpRatio > 0.6 ? COLORS.BASE : (hpRatio > 0.3 ? '#fa0' : '#f00');
        ctx.fillStyle = baseColor; ctx.fillRect(px + 8, py + 8, 48, 48); ctx.fillStyle = '#000';
        ctx.fillRect(px+8, py+8, 8, 8); ctx.fillRect(px+48, py+8, 8, 8); ctx.fillRect(px+24, py+16, 16, 8);
        ctx.fillStyle = '#333'; ctx.fillRect(px + 8, py - 8, 48, 5);
        ctx.fillStyle = baseColor; ctx.fillRect(px + 8, py - 8, 48 * hpRatio, 5);
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.strokeRect(px + 8, py - 8, 48, 5);
    }
    isBlocked(x, y, width, height, isBullet = false) {
        const left = Math.floor(x / TILE_SIZE); const right = Math.floor((x + width - 0.1) / TILE_SIZE);
        const top = Math.floor(y / TILE_SIZE); const bottom = Math.floor((y + height - 0.1) / TILE_SIZE);
        for (let i = top; i <= bottom; i++) {
            for (let j = left; j <= right; j++) {
                if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE) return true;
                const tile = this.grid[i][j];
                if (isBullet) { if (tile === TILE_TYPES.BRICK || tile === TILE_TYPES.STEEL || tile === TILE_TYPES.BASE) return true; }
                else { if (tile !== TILE_TYPES.EMPTY && tile !== TILE_TYPES.FOREST && tile !== TILE_TYPES.ICE && tile !== TILE_TYPES.WATER) return true; }
            }
        }
        return false;
    }
    isOnWater(x, y, width, height) {
        const cx = Math.floor((x + width/2) / TILE_SIZE);
        const cy = Math.floor((y + height/2) / TILE_SIZE);
        if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) return false;
        return this.grid[cy][cx] === TILE_TYPES.WATER;
    }
}

class InputHandler {
    constructor() {
        this.keys = {};
        this.gameKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'NumpadEnter', 'KeyP'];
        this.touchState = { up: false, down: false, left: false, right: false, shoot: false };
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        window.addEventListener('keydown', (e) => { this.keys[e.code] = true; if (this.gameKeys.includes(e.code)) e.preventDefault(); });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        if (this.isMobile) this.initTouchControls();
    }
    initTouchControls() {
        const dpadBtns = document.querySelectorAll('.dpad-btn');
        const shootBtn = document.getElementById('touch-shoot');
        dpadBtns.forEach(btn => {
            const dir = btn.dataset.dir;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchState[dir] = true; });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); this.touchState[dir] = false; });
        });
        if (shootBtn) {
            shootBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.touchState.shoot = true; });
            shootBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.touchState.shoot = false; });
        }
    }
    isDown(code) {
        if (this.keys[code]) return true;
        if (!this.isMobile) return false;
        if (code === 'KeyW' || code === 'ArrowUp') return this.touchState.up;
        if (code === 'KeyS' || code === 'ArrowDown') return this.touchState.down;
        if (code === 'KeyA' || code === 'ArrowLeft') return this.touchState.left;
        if (code === 'KeyD' || code === 'ArrowRight') return this.touchState.right;
        if (code === 'Space' || code === 'NumpadEnter') return this.touchState.shoot;
        return false;
    }
}

class Bullet {
    constructor(game, owner, x, y, dir, level = 0) { 
        this.game = game; this.owner = owner; this.x = x; this.y = y; this.dir = dir; 
        this.level = level; this.speed = 12 + (level * 2); this.size = 8 + (level * 2); this.active = true; 
    }
    update() {
        if (this.dir === 'UP') this.y -= this.speed; else if (this.dir === 'DOWN') this.y += this.speed; else if (this.dir === 'LEFT') this.x -= this.speed; else if (this.dir === 'RIGHT') this.x += this.speed;
        for (let other of this.game.bullets) {
            if (other === this || !other.active) continue;
            if (this.x < other.x + other.size && this.x + this.size > other.x && this.y < other.y + other.size && this.y + this.size > other.y) { this.active = false; other.active = false; this.triggerExplosion(this.x, this.y, true); return; }
        }
        const tx = Math.floor((this.x + this.size/2) / TILE_SIZE); const ty = Math.floor((this.y + this.size/2) / TILE_SIZE);
        if (tx < 0 || tx >= GRID_SIZE || ty < 0 || ty >= GRID_SIZE) { this.active = false; return; }
        const tile = this.game.map.grid[ty][tx];
        if (tile !== TILE_TYPES.EMPTY && tile !== TILE_TYPES.FOREST) { this.triggerExplosion(this.x + this.size/2, this.y + this.size/2); this.active = false; return; }
        const isEnemyBullet = this.owner instanceof Enemy;
        const tanks = isEnemyBullet ? this.game.players : this.game.enemies;
        for (const tank of tanks) {
            if (!tank.alive) continue;
            if (this.x < tank.x + tank.width && this.x + this.size > tank.x && this.y < tank.y + tank.height && this.y + this.size > tank.y) { this.triggerExplosion(this.x + this.size/2, this.y + this.size/2); tank.destroy(this.owner); this.active = false; break; }
        }
    }
    triggerExplosion(ex, ey, small = false) {
        const radius = small ? 0.5 : (1 + this.level * 0.5);
        this.game.effects.push(new Effect(ex, ey, 'EXPLOSION', radius));
        if (small) return;
        const gridX = Math.floor(ex / TILE_SIZE); const gridY = Math.floor(ey / TILE_SIZE); const range = Math.ceil(radius);
        const isPlayerBullet = this.owner instanceof Player;
        for (let iy = gridY - range; iy <= gridY + range; iy++) {
            for (let ix = gridX - range; ix <= gridX + range; ix++) {
                if (iy < 0 || iy >= GRID_SIZE || ix < 0 || ix >= GRID_SIZE) continue;
                const tile = this.game.map.grid[iy][ix];
                if (tile === TILE_TYPES.BRICK) this.game.map.grid[iy][ix] = TILE_TYPES.EMPTY;
                else if (tile === TILE_TYPES.STEEL && this.level >= 3) this.game.map.grid[iy][ix] = TILE_TYPES.EMPTY;
                else if (tile === TILE_TYPES.BASE && isPlayerBullet) {
                    this.game.baseHealth--;
                    if (this.game.baseHealth <= 0) { this.game.map.grid[iy][ix] = TILE_TYPES.BASE_DESTROYED; this.game.gameOver(); }
                    this.game.shakeScreen(8);
                }
            }
        }
    }
    draw(ctx) { ctx.save(); ctx.fillStyle = this.level >= 3 ? '#ff0' : '#fff'; ctx.beginPath(); ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2); ctx.fill(); if (this.level >= 1) { ctx.shadowBlur = 15; ctx.shadowColor = this.level >= 3 ? '#ff0' : '#fff'; } ctx.restore(); }
}

class Tank {
    constructor(game, x, y, color) { this.game = game; this.x = x; this.y = y; this.width = 60; this.height = 60; this.color = color; this.direction = 'UP'; this.speed = 4; this.cooldown = 0; this.alive = true; this.shieldTimer = 0; this.level = 0; this.score = 0; }
    setShield(d) { this.shieldTimer = d; }
    upgrade() { this.level = Math.min(this.level + 1, 3); this.speed = 4 + this.level; }
    update() { if (this.cooldown > 0) this.cooldown--; if (this.shieldTimer > 0) this.shieldTimer--; }
    move(dir) {
        this.direction = dir; let nx = this.x; let ny = this.y;
        const onWater = this.game.map.isOnWater(this.x, this.y, this.width, this.height);
        const moveSpeed = onWater ? this.speed * 0.5 : this.speed;
        if (dir === 'UP') ny -= moveSpeed; else if (dir === 'DOWN') ny += moveSpeed; else if (dir === 'LEFT') nx -= moveSpeed; else if (dir === 'RIGHT') nx += moveSpeed;
        if (!this.game.map.isBlocked(nx, ny, this.width, this.height)) { this.x = nx; this.y = ny; this.onIce = false; }
        else {
            if (dir === 'UP' || dir === 'DOWN') { const cx = this.x + this.width / 2; const gx = Math.floor(cx / TILE_SIZE) * TILE_SIZE + 4; if (Math.abs(this.x - gx) < 16) this.x += (gx - this.x) * 0.2; }
            else { const cy = this.y + this.height / 2; const gy = Math.floor(cy / TILE_SIZE) * TILE_SIZE + 4; if (Math.abs(this.y - gy) < 16) this.y += (gy - this.y) * 0.2; }
        }
        const gx = Math.floor((this.x + this.width/2) / TILE_SIZE);
        const gy = Math.floor((this.y + this.height/2) / TILE_SIZE);
        if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE && this.game.map.grid[gy][gx] === TILE_TYPES.ICE) {
            if (!this.onIce) { this.onIce = true; this.iceSlideDir = dir; this.iceSlideTimer = 10; }
        } else { this.onIce = false; }
        if (this.onIce && this.iceSlideTimer > 0) {
            this.iceSlideTimer--;
            let sx = this.x, sy = this.y;
            if (this.iceSlideDir === 'UP') sy -= this.speed * 0.5; else if (this.iceSlideDir === 'DOWN') sy += this.speed * 0.5;
            else if (this.iceSlideDir === 'LEFT') sx -= this.speed * 0.5; else if (this.iceSlideDir === 'RIGHT') sx += this.speed * 0.5;
            if (!this.game.map.isBlocked(sx, sy, this.width, this.height)) { this.x = sx; this.y = sy; }
        }
    }
    shoot() {
        if (this.cooldown > 0) return;
        let bulletCount = 0;
        for (const b of this.game.bullets) { if (b.owner === this && b.active) bulletCount++; }
        const maxBullets = this instanceof Player ? 3 : 2;
        if (bulletCount >= maxBullets) return;
        if (this.game.bullets.length >= 50) return;
        this.cooldown = Math.max(5, 20 - this.level * 5);
        let bx = this.x + 26; let by = this.y + 26;
        if (this.direction === 'UP') by = this.y - 10; else if (this.direction === 'DOWN') by = this.y + 60; else if (this.direction === 'LEFT') bx = this.x - 10; else if (this.direction === 'RIGHT') bx = this.x + 60;
        this.game.bullets.push(new Bullet(this.game, this, bx, by, this.direction, this.level));
    }
    destroy(killer) {
        if (this.shieldTimer > 0) return; this.alive = false; this.game.effects.push(new Effect(this.x + 30, this.y + 30, 'EXPLOSION', this.isBoss ? 3 : 1));
        this.game.shakeScreen(this.isBoss ? 15 : 5);
        if (killer instanceof Player) {
            const points = this.isBoss ? 500 : 100;
            killer.score += points;
            this.game.showFloatingText(`+${points}`, this.x + this.width/2, this.y - 10, '#fff');
            const now = Date.now();
            if (now - killer.lastKillTime < 5000) {
                killer.killStreak++;
            } else {
                killer.killStreak = 1;
            }
            killer.lastKillTime = now;
            if (killer.killStreak === 3 && killer.level < 1) {
                killer.upgrade();
                this.game.showAnnouncement('LEVEL UP!', '#0f0');
            } else if (killer.killStreak === 6 && killer.level < 2) {
                killer.upgrade();
                this.game.showAnnouncement('POWER UP!', '#0ff');
            } else if (killer.killStreak === 10 && killer.level < 3) {
                killer.upgrade();
                this.game.showAnnouncement('MAX POWER!', '#ff0');
            }
            this.game.updateHUD();
        }
        if (this instanceof Player) this.game.handlePlayerDeath(this);
        if (this instanceof Enemy && Math.random() < 0.3) {
            const types = Object.values(POWERUP_TYPES); const type = types[Math.floor(Math.random() * types.length)];
            this.game.powerUps.push(new PowerUp(this.game, this.x, this.y, type));
        }
    }
    draw(ctx) {
        const px = this.x; const py = this.y; const w = this.width; const h = this.height; ctx.save();
        if (this.level >= 1) {
            ctx.shadowBlur = 8 + this.level * 4;
            ctx.shadowColor = this.level >= 3 ? '#ff0' : (this.level === 2 ? '#0ff' : '#0f0');
        }
        ctx.fillStyle = this.color;
        if (this.direction === 'UP' || this.direction === 'DOWN') {
            ctx.fillRect(px + 8, py + 8, w - 16, h - 16); ctx.fillStyle = '#000'; ctx.fillRect(px, py, 8, h); ctx.fillRect(px + w - 8, py, 8, h);
            ctx.fillStyle = this.color; for (let i = 0; i < h; i += 8) { ctx.fillRect(px, py + i, 8, 4); ctx.fillRect(px + w - 8, py + i, 8, 4); }
            ctx.fillRect(px + w/2 - 8, py + h/2 - 8, 16, 16); ctx.strokeStyle = '#000'; ctx.strokeRect(px + w/2 - 8, py + h/2 - 8, 16, 16);
            ctx.fillStyle = this.level >= 3 ? '#ff0' : this.color;
            const barrelW = 6 + this.level * 2;
            if (this.direction === 'UP') ctx.fillRect(px + w/2 - barrelW/2, py - 8, barrelW, 24 + this.level * 4);
            else ctx.fillRect(px + w/2 - barrelW/2, py + h - 16 - this.level * 4, barrelW, 24 + this.level * 4);
        } else {
            ctx.fillRect(px + 8, py + 8, w - 16, h - 16); ctx.fillStyle = '#000'; ctx.fillRect(px, py, w, 8); ctx.fillRect(px, py + h - 8, w, 8);
            ctx.fillStyle = this.color; for (let i = 0; i < w; i += 8) { ctx.fillRect(px + i, py, 4, 8); ctx.fillRect(px + i, py + h - 8, 4, 8); }
            ctx.fillRect(px + w/2 - 8, py + h/2 - 8, 16, 16); ctx.strokeStyle = '#000'; ctx.strokeRect(px + w/2 - 8, py + h/2 - 8, 16, 16);
            ctx.fillStyle = this.level >= 3 ? '#ff0' : this.color;
            const barrelW = 6 + this.level * 2;
            if (this.direction === 'LEFT') ctx.fillRect(px - 8 - this.level * 4, py + h/2 - barrelW/2, 24 + this.level * 4, barrelW);
            else ctx.fillRect(px + w - 16 - this.level * 4, py + h/2 - barrelW/2, 24 + this.level * 4, barrelW);
        }
        if (this.level >= 2) {
            ctx.fillStyle = this.level >= 3 ? '#fa0' : '#0ff';
            ctx.fillRect(px + 2, py + 2, 6, 6);
            ctx.fillRect(px + w - 8, py + 2, 6, 6);
            ctx.fillRect(px + 2, py + h - 8, 6, 6);
            ctx.fillRect(px + w - 8, py + h - 8, 6, 6);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(px + 12, py + 12, 4, 4); ctx.restore();
        if (this.shieldTimer > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px + 30, py + 30, 38, 0, Math.PI * 2); ctx.stroke(); }
    }
}

class Player extends Tank {
    constructor(game, x, y, color, controls, id) {
        super(game, x, y, color);
        this.controls = controls;
        this.id = id;
        this.aiActive = false;
        this.lastInputTime = Date.now();
        this.aiDodgeDir = null;
        this.aiDodgeTimer = 0;
        this.aiMoveDir = null;
        this.aiMoveTimer = 0;
        this.killStreak = 0;
        this.lastKillTime = 0;
    }
    update() {
        if (!this.alive) return;
        super.update();
        if (this.killStreak > 0 && Date.now() - this.lastKillTime > 5000) this.killStreak = 0;
        this.checkIdle();
        if (this.aiActive) this.runAI();
        else {
            if (this.game.input.isDown(this.controls.up)) this.move('UP');
            else if (this.game.input.isDown(this.controls.down)) this.move('DOWN');
            else if (this.game.input.isDown(this.controls.left)) this.move('LEFT');
            else if (this.game.input.isDown(this.controls.right)) this.move('RIGHT');
            if (this.game.input.isDown(this.controls.shoot)) this.shoot();
        }
    }
    checkIdle() {
        if (!this.alive || this.game.gameState !== 'PLAYING') return;
        const keys = [this.controls.up, this.controls.down, this.controls.left, this.controls.right, this.controls.shoot];
        const anyPressed = keys.some(k => this.game.input.isDown(k));
        if (anyPressed) {
            this.aiActive = false;
            this.lastInputTime = Date.now();
        } else if (!this.aiActive && Date.now() - this.lastInputTime > 5000) {
            this.aiActive = true;
        }
    }
    runAI() {
        const myX = this.x + this.width / 2;
        const myY = this.y + this.height / 2;
        const baseX = 13 * TILE_SIZE;
        const baseY = 24 * TILE_SIZE;

        let threat = this.findIncomingBullet(myX, myY);
        if (threat) {
            if (this.aiDodgeTimer <= 0) {
                this.aiDodgeDir = this.getSmartDodgeDir(threat, myX, myY);
                this.aiDodgeTimer = 15 + Math.floor(Math.random() * 10);
            }
            if (this.aiDodgeTimer > 0) {
                this.aiDodgeTimer--;
                this.move(this.aiDodgeDir);
                this.shoot();
                return;
            }
        }
        this.aiDodgeTimer = 0;

        let nearestEnemy = null;
        let nearestDist = Infinity;
        let baseThreat = null;
        let baseThreatDist = Infinity;
        for (const e of this.game.enemies) {
            if (!e.alive) continue;
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < nearestDist) { nearestDist = d; nearestEnemy = e; }
            const dBase = Math.hypot(e.x - baseX, e.y - baseY);
            if (dBase < baseThreatDist) { baseThreatDist = dBase; baseThreat = e; }
        }

        let powerUp = null;
        let powerUpDist = Infinity;
        for (const p of this.game.powerUps) {
            if (!p.active) continue;
            const d = Math.hypot(p.x - this.x, p.y - this.y);
            if (d < powerUpDist && d < TILE_SIZE * 10) { powerUpDist = d; powerUp = p; }
        }

        let targetX, targetY;
        if (powerUp && powerUpDist < TILE_SIZE * 8) {
            targetX = powerUp.x + powerUp.width / 2;
            targetY = powerUp.y + powerUp.height / 2;
        } else if (baseThreat && baseThreatDist < TILE_SIZE * 12) {
            targetX = baseThreat.x + baseThreat.width / 2;
            targetY = baseThreat.y + baseThreat.height / 2;
        } else if (nearestEnemy && nearestDist < TILE_SIZE * 15) {
            targetX = nearestEnemy.x + nearestEnemy.width / 2;
            targetY = nearestEnemy.y + nearestEnemy.height / 2;
        } else {
            targetX = baseX;
            targetY = baseY - TILE_SIZE * 3;
        }

        const dx = targetX - myX;
        const dy = targetY - myY;
        let moveDir;
        if (Math.abs(dx) > Math.abs(dy)) moveDir = dx > 0 ? 'RIGHT' : 'LEFT';
        else moveDir = dy > 0 ? 'DOWN' : 'UP';

        if (!this.aiMoveDir) {
            this.aiMoveDir = moveDir;
            this.aiMoveTimer = 30 + Math.floor(Math.random() * 20);
        }
        if (this.aiMoveTimer > 0) {
            this.aiMoveTimer--;
        } else {
            if (moveDir !== this.aiMoveDir) {
                this.aiMoveDir = moveDir;
                this.aiMoveTimer = 30 + Math.floor(Math.random() * 20);
            }
        }

        if (this.isTileBlocked(myX, myY, this.aiMoveDir)) {
            this.aiMoveDir = this.getAlternateDir(this.aiMoveDir, dx, dy);
            this.aiMoveTimer = 20;
        }

        this.move(this.aiMoveDir);

        if (!this.isFacingBase()) {
            let shot = false;
            for (const e of this.game.enemies) {
                if (!e.alive) continue;
                if (this.canShootTarget(e)) { this.shoot(); shot = true; break; }
            }
            if (!shot && Math.random() < 0.03) this.shoot();
        }
    }
    isFacingBase() {
        const baseX = 13 * TILE_SIZE;
        const baseY = 24 * TILE_SIZE;
        const myX = this.x + this.width / 2;
        const myY = this.y + this.height / 2;
        const dx = baseX - myX;
        const dy = baseY - myY;
        const angle = Math.atan2(dy, dx);
        const myAngle = this.direction === 'RIGHT' ? 0 : this.direction === 'DOWN' ? Math.PI/2 : this.direction === 'LEFT' ? Math.PI : -Math.PI/2;
        let diff = Math.abs(angle - myAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        return diff < Math.PI / 3;
    }
    isTileBlocked(x, y, dir) {
        const checkDist = TILE_SIZE * 1.5;
        let tx = x, ty = y;
        if (dir === 'UP') ty -= checkDist; else if (dir === 'DOWN') ty += checkDist;
        else if (dir === 'LEFT') tx -= checkDist; else if (dir === 'RIGHT') tx += checkDist;
        return this.game.map.isBlocked(tx - this.width/2, ty - this.height/2, this.width, this.height);
    }
    getAlternateDir(blockedDir, dx, dy) {
        const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => d !== blockedDir);
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? (dirs.includes('RIGHT') ? 'RIGHT' : 'LEFT') : (dirs.includes('LEFT') ? 'LEFT' : 'RIGHT');
        } else {
            return dy > 0 ? (dirs.includes('DOWN') ? 'DOWN' : 'UP') : (dirs.includes('UP') ? 'UP' : 'DOWN');
        }
    }
    canShootTarget(target) {
        const myX = this.x + this.width / 2;
        const myY = this.y + this.height / 2;
        const tx = target.x + target.width / 2;
        const ty = target.y + target.height / 2;
        const angle = Math.atan2(ty - myY, tx - myX);
        const myAngle = this.direction === 'RIGHT' ? 0 : this.direction === 'DOWN' ? Math.PI/2 : this.direction === 'LEFT' ? Math.PI : -Math.PI/2;
        let diff = Math.abs(angle - myAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff > Math.PI / 4) return false;
        const dist = Math.hypot(tx - myX, ty - myY);
        if (dist > TILE_SIZE * 12) return false;
        const steps = Math.ceil(dist / TILE_SIZE);
        for (let i = 1; i < steps; i++) {
            const px = myX + Math.cos(angle) * i * TILE_SIZE;
            const py = myY + Math.sin(angle) * i * TILE_SIZE;
            const gx = Math.floor(px / TILE_SIZE);
            const gy = Math.floor(py / TILE_SIZE);
            if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return false;
            const tile = this.game.map.grid[gy][gx];
            if (tile === TILE_TYPES.BRICK || tile === TILE_TYPES.STEEL) return false;
        }
        return true;
    }
    findIncomingBullet(x, y) {
        const range = TILE_SIZE * 5;
        for (const b of this.game.bullets) {
            if (!b.active || b.owner instanceof Player) continue;
            let incoming = false;
            if (b.dir === 'DOWN' && Math.abs(b.x + b.size/2 - x) < 20 && b.y > y && b.y - y < range) incoming = true;
            if (b.dir === 'UP' && Math.abs(b.x + b.size/2 - x) < 20 && b.y < y && y - b.y < range) incoming = true;
            if (b.dir === 'RIGHT' && Math.abs(b.y + b.size/2 - y) < 20 && b.x > x && b.x - x < range) incoming = true;
            if (b.dir === 'LEFT' && Math.abs(b.y + b.size/2 - y) < 20 && b.x < x && x - b.x < range) incoming = true;
            if (incoming) return b;
        }
        return null;
    }
    getPerpendicularDir(dir) {
        if (dir === 'UP' || dir === 'DOWN') return Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
        return Math.random() < 0.5 ? 'UP' : 'DOWN';
    }
    getSmartDodgeDir(bullet, myX, myY) {
        const baseX = 13 * TILE_SIZE;
        const baseY = 24 * TILE_SIZE;
        let bestDir = this.getPerpendicularDir(bullet.dir);
        let bestScore = -Infinity;
        for (const dir of ['UP', 'DOWN', 'LEFT', 'RIGHT']) {
            if (dir === bullet.dir || dir === this.getPerpendicularDir(bullet.dir)) continue;
            const nx = myX + (dir === 'RIGHT' ? TILE_SIZE : dir === 'LEFT' ? -TILE_SIZE : 0);
            const ny = myY + (dir === 'DOWN' ? TILE_SIZE : dir === 'UP' ? -TILE_SIZE : 0);
            if (this.game.map.isBlocked(nx - this.width/2, ny - this.height/2, this.width, this.height)) continue;
            const distToBase = Math.hypot(nx - baseX, ny - baseY);
            let score = -distToBase;
            if (!this.isTileBlocked(myX, myY, dir)) score += 100;
            if (score > bestScore) { bestScore = score; bestDir = dir; }
        }
        return bestDir;
    }
}
class Enemy extends Tank { constructor(game, x, y, stage = 0) { super(game, x, y, COLORS.ENEMY); const diffMult = game.difficulty === 'easy' ? 0.8 : (game.difficulty === 'hard' ? 1.2 : 1); this.speed = (2 + Math.min(stage * 0.1, 2)) * diffMult; this.dirTimer = 0; } update() { super.update(); if (this.dirTimer <= 0) { this.direction = ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)]; this.dirTimer = 30 + Math.random() * 60; } else this.dirTimer--; const ox = this.x; const oy = this.y; this.move(this.direction); if (this.x === ox && this.y === oy) this.dirTimer = 0; if (Math.random() * 100 < 5) this.shoot(); } }

class Boss extends Enemy {
    constructor(game, x, y, stage = 0) {
        super(game, x, y);
        const difficulty = Math.min(stage / 50, 1);
        const scale = 1.8 + Math.random() * 1.2 + difficulty * 0.5;
        this.width = TILE_SIZE * scale; this.height = TILE_SIZE * scale;
        this.health = Math.floor((4 + stage * 0.5) * scale); this.maxHealth = this.health;
        this.speed = 0.8 + difficulty * 0.5; this.isBoss = true;
        this.turretAngle = 0; this.turretTargetAngle = 0;
        this.barrelLength = this.width * 0.7;
        this.armorLevel = Math.floor(Math.random() * (1 + difficulty * 2));
        const titles = ['IRON TITAN', 'WAR MACHINE', 'STEEL FURY', 'DEATH DEALER', 'MECH OVERLORD'];
        this.title = titles[Math.floor(Math.random() * titles.length)];
        this.color = `hsl(${200 + Math.random() * 40}, 60%, 35%)`;
        this.metalColor = `hsl(${200 + Math.random() * 40}, 50%, 50%)`;
        const weathers = ['RAIN', 'SNOW', 'WIND', 'LIGHTNING'];
        this.game.weather = weathers[Math.floor(Math.random() * weathers.length)];
    }
    shoot() {
        if (this.cooldown > 0) return; this.cooldown = Math.max(3, 15 - this.level * 3);
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const angle = this.turretAngle;
        const bx = cx + Math.cos(angle) * (this.barrelLength + 10);
        const by = cy + Math.sin(angle) * (this.barrelLength + 10);
        let dir = this.direction;
        if (angle > -Math.PI/4 && angle <= Math.PI/4) dir = 'RIGHT';
        else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) dir = 'DOWN';
        else if (angle > -3*Math.PI/4 && angle <= -Math.PI/4) dir = 'UP';
        else dir = 'LEFT';
        const gx = Math.floor(bx / TILE_SIZE);
        const gy = Math.floor(by / TILE_SIZE);
        if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) return;
        const tile = this.game.map.grid[gy][gx];
        if (tile === TILE_TYPES.BRICK || tile === TILE_TYPES.STEEL) return;
        this.game.bullets.push(new Bullet(this.game, this, bx - 8, by - 8, dir, this.level));
    }
    update() {
        super.update();
        let nearestEnemy = null;
        let nearestDist = Infinity;
        for (const p of this.game.players) {
            if (!p.alive) continue;
            const d = Math.hypot(p.x - this.x, p.y - this.y);
            if (d < nearestDist) { nearestDist = d; nearestEnemy = p; }
        }
        if (nearestEnemy) {
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            this.turretTargetAngle = Math.atan2(nearestEnemy.y + nearestEnemy.height/2 - cy, nearestEnemy.x + nearestEnemy.width/2 - cx);
        }
        let diff = this.turretTargetAngle - this.turretAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.turretAngle += diff * 0.08;
    }
    destroy(killer) {
        this.health--; this.game.effects.push(new Effect(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 'EXPLOSION', 2.5));
        if (this.health <= 0) {
            this.alive = false; this.game.weather = 'NONE';
            for (let i = 0; i < 6; i++) {
                const types = Object.values(POWERUP_TYPES);
                this.game.powerUps.push(new PowerUp(this.game, this.x + Math.random()*this.width, this.y + Math.random()*this.height, types[Math.floor(Math.random()*types.length)]));
            }
            if (killer instanceof Player) { killer.score += 1500; this.game.updateHUD(); }
        }
    }
    draw(ctx) {
        const px = this.x; const py = this.y; const w = this.width; const h = this.height;
        const cx = px + w / 2; const cy = py + h / 2;
        ctx.save();
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(px, py, w, h);
        ctx.fillStyle = '#2d2d44'; ctx.fillRect(px + 4, py + 4, w - 8, h - 8);
        ctx.strokeStyle = '#4a4a6a'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const offset = 8 + i * 6;
            ctx.strokeRect(px + offset, py + offset, w - offset * 2, h - offset * 2);
        }
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(px - 6, py + 4, 8, h - 8);
        ctx.fillRect(px + w - 2, py + 4, 8, h - 8);
        ctx.fillStyle = '#2a2a3a';
        for (let i = 0; i < h; i += 10) {
            ctx.fillRect(px - 6, py + i, 8, 5);
            ctx.fillRect(px + w - 2, py + i, 8, 5);
        }
        ctx.fillStyle = '#555';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath(); ctx.arc(px + 15, py + 15 + i * (h - 30) / 5, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + w - 15, py + 15 + i * (h - 30) / 5, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#3a3a4a'; ctx.fillRect(px + 8, py + 8, w - 16, 12);
        ctx.fillStyle = '#2a2a3a';
        for (let i = 0; i < 4; i++) ctx.fillRect(px + 12 + i * (w - 24) / 3, py + 10, (w - 36) / 6, 8);
        ctx.fillStyle = '#444'; ctx.fillRect(px + w/2 - 20, py + h/2 - 20, 40, 40);
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(this.turretAngle);
        ctx.fillStyle = '#4a4a5a'; ctx.fillRect(0, -5, this.barrelLength, 10);
        ctx.fillStyle = '#5a5a6a'; ctx.fillRect(this.barrelLength - 15, -7, 15, 14);
        ctx.fillStyle = '#6a6a7a'; ctx.fillRect(this.barrelLength - 8, -4, 8, 8);
        ctx.fillStyle = '#7a7a8a'; ctx.fillRect(this.barrelLength - 3, -2, 6, 4);
        ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeStyle = '#5a5a6a'; ctx.lineWidth = 1; ctx.strokeRect(-8, -8, 16, 16);
        ctx.restore();
        if (this.armorLevel >= 1) {
            ctx.fillStyle = '#3a3a5a';
            ctx.fillRect(px + 5, py + h - 20, 25, 15);
            ctx.fillRect(px + w - 30, py + h - 20, 25, 15);
            ctx.fillStyle = '#4a4a6a';
            ctx.beginPath(); ctx.arc(px + 17, py + h - 12, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(px + w - 17, py + h - 12, 5, 0, Math.PI * 2); ctx.fill();
        }
        if (this.armorLevel >= 2) {
            ctx.fillStyle = '#4a4a6a';
            ctx.fillRect(px + 10, py + 5, 20, 8);
            ctx.fillRect(px + w - 30, py + 5, 20, 8);
        }
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText(this.title, cx, py - 25);
        const barW = w * 0.8; const barH = 8;
        const barX = cx - barW / 2; const barY = py - 18;
        ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barW, barH);
        const hpRatio = this.health / this.maxHealth;
        ctx.fillStyle = hpRatio > 0.5 ? '#0a0' : (hpRatio > 0.25 ? '#fa0' : '#f00');
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, barH);
        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas'); this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_SIZE; this.canvas.height = CANVAS_SIZE; this.input = new InputHandler(); this.map = new GameMap(this);
        this.players = []; this.enemies = []; this.bullets = []; this.effects = []; this.powerUps = []; this.fortifyTimer = 0; this.spawnTimer = 0;
        this.currentStage = 0; this.gameState = 'START'; this.lives = 3; this.paused = false;
        this.highScore = parseInt(localStorage.getItem('tankBattleHighScore') || '0');
        this.baseHealth = 5; this.maxBaseHealth = 5;
        this.weather = 'NONE'; this.weatherParticles = [];
        this.shakeX = 0; this.shakeY = 0; this.shakeTimer = 0;
        this.announcements = [];
        this.floatingTexts = [];
        this.pausePressed = false;
        this.bossWarning = 0;
        for(let i=0; i<100; i++) this.weatherParticles.push({x: Math.random()*CANVAS_SIZE, y: Math.random()*CANVAS_SIZE, s: 2 + Math.random()*5});
        document.getElementById('start-btn').onclick = () => this.startGame();
        document.getElementById('restart-btn').onclick = () => this.startGame();
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
        this.difficulty = 'normal';
        this.loop();
    }
    shakeScreen(intensity) { this.shakeTimer = intensity; this.shakeIntensity = intensity; }
    showAnnouncement(text, color = '#fff') { this.announcements.push({ text, color, timer: 120, y: CANVAS_SIZE / 2 }); }
    showFloatingText(text, x, y, color = '#fff') { this.floatingTexts.push({ text, x, y, color, timer: 60, vy: -2 }); }
    startGame() {
        const levelInput = document.getElementById('start-level');
        const startLevel = Math.max(1, Math.min(1000, parseInt(levelInput.value) || 1)) - 1;
        this.currentStage = startLevel;
        this.lives = 3;
        this.players = [];
        this.difficulty = document.querySelector('.diff-btn.active')?.dataset.diff || 'normal';
        this.startLevel();
        document.getElementById('hud').classList.remove('hidden');
        if (this.input.isMobile) document.getElementById('touch-controls').classList.remove('hidden');
    }
    startLevel() {
        this.gameState = 'STAGE_START'; this.stageStartTimer = 120;
        document.getElementById('start-screen').classList.add('hidden'); document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('stage-info').innerText = `STAGE ${this.currentStage + 1}`;
        this.map.reset(this.currentStage); this.bullets = []; this.enemies = []; this.effects = []; this.powerUps = []; this.fortifyTimer = 0;
        this.currentLevel = this.map.currentLevel;
        const diffMult = this.difficulty === 'easy' ? 0.7 : (this.difficulty === 'hard' ? 1.3 : 1);
        this.enemiesRemaining = Math.floor(this.currentLevel.totalEnemies * diffMult);
        if (this.currentStage === 0) { this.baseHealth = 5; this.maxBaseHealth = 5; }
        if (this.players.length === 0) {
            this.players = [
                new Player(this, TILE_SIZE * 8, TILE_SIZE * 22, COLORS.PLAYER1, { up:'KeyW', down:'KeyS', left:'KeyA', right:'KeyD', shoot:'Space' }, 1),
                new Player(this, TILE_SIZE * 16, TILE_SIZE * 22, COLORS.PLAYER2, { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', shoot:'NumpadEnter' }, 2)
            ];
        } else {
            this.players.forEach(p => { p.alive = true; });
            this.players[0].x = TILE_SIZE * 8; this.players[0].y = TILE_SIZE * 22;
            this.players[1].x = TILE_SIZE * 16; this.players[1].y = TILE_SIZE * 22;
        }
        this.players.forEach(p => p.setShield(180)); this.updateHUD();
    }
    updateHUD() {
        document.getElementById('p1-score').innerText = String(this.players[0].score).padStart(5, '0');
        document.getElementById('p2-score').innerText = String(this.players[1].score).padStart(5, '0');
        document.getElementById('lives-info').innerText = `LIVES: ❤️x${this.lives}`;
    }
    handlePlayerDeath(player) {
        if (this.lives > 0) {
            this.lives--; this.updateHUD();
            setTimeout(() => {
                player.alive = true;
                player.x = (player.id === 1) ? TILE_SIZE * 8 : TILE_SIZE * 16;
                player.y = TILE_SIZE * 22;
                player.setShield(180);
            }, 2000);
        }
    }
    nextLevel() { this.currentStage++; this.startLevel(); }
    fortifyBase() { this.fortifyTimer = 600; this.map.setBaseWalls(TILE_TYPES.STEEL); }
    unfortifyBase() { this.map.setBaseWalls(TILE_TYPES.BRICK); }
    gameOver() {
        this.gameState = 'GAME_OVER';
        const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);
        if (totalScore > this.highScore) {
            this.highScore = totalScore;
            localStorage.setItem('tankBattleHighScore', String(totalScore));
        }
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    update() {
        if (this.gameState === 'STAGE_START') { this.stageStartTimer--; if (this.stageStartTimer <= 0) this.gameState = 'PLAYING'; return; }
        if (this.gameState !== 'PLAYING') return;

        if (this.game.input.isDown('KeyP') && !this.pausePressed) { this.paused = !this.paused; this.pausePressed = true; }
        if (!this.game.input.isDown('KeyP')) this.pausePressed = false;
        if (this.paused) return;

        if (this.weather !== 'NONE') {
            this.weatherParticles.forEach(p => {
                if (this.weather === 'RAIN') { p.y += p.s * 2; p.x += 1; }
                else if (this.weather === 'SNOW') { p.y += p.s * 0.5; p.x += Math.sin(p.y/20); }
                else if (this.weather === 'WIND') { p.x += p.s * 3; }
                if (p.y > CANVAS_SIZE) p.y = 0; if (p.x > CANVAS_SIZE) p.x = 0; if (p.x < 0) p.x = CANVAS_SIZE;
            });
        }
        if (this.weather === 'LIGHTNING' && Math.random() < 0.02) this.lightningFlash = 5;
        if (this.lightningFlash > 0) this.lightningFlash--;

        if (this.shakeTimer > 0) {
            this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeTimer--;
        } else {
            this.shakeX = 0; this.shakeY = 0;
        }

        this.announcements = this.announcements.filter(a => { a.timer--; a.y -= 0.5; return a.timer > 0; });
        this.floatingTexts = this.floatingTexts.filter(t => { t.timer--; t.y += t.vy; return t.timer > 0; });

        const bossChance = this.currentStage < 5 ? 0 : (this.currentStage < 20 ? 0.0002 : 0.0005);
        if (Math.random() < bossChance && !this.enemies.some(e => e.isBoss) && !this.bossWarning) {
            this.bossWarning = 180;
            this.showAnnouncement('WARNING! BOSS INCOMING!', '#f00');
        }
        if (this.bossWarning > 0) {
            this.bossWarning--;
            if (this.bossWarning === 0) {
                const bossSize = TILE_SIZE * 3;
                const spawnPositions = [
                    { x: CANVAS_SIZE/2 - bossSize/2, y: CANVAS_SIZE/2 - bossSize/2 },
                    { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
                    { x: TILE_SIZE * 20, y: TILE_SIZE * 2 }
                ];
                let spawnPos = spawnPositions[Math.floor(Math.random() * spawnPositions.length)];
                const isPlayerNear = this.players.some(p => p.alive && Math.hypot(p.x - spawnPos.x, p.y - spawnPos.y) < TILE_SIZE * 5);
                if (this.map.isBlocked(spawnPos.x, spawnPos.y, bossSize, bossSize) || isPlayerNear) {
                    spawnPos = spawnPositions.find(p => !this.map.isBlocked(p.x, p.y, bossSize, bossSize) && !this.players.some(pl => pl.alive && Math.hypot(pl.x - p.x, pl.y - p.y) < TILE_SIZE * 5)) || spawnPositions[0];
                }
                this.effects.push(new Effect(spawnPos.x + bossSize/2, spawnPos.y + bossSize/2, 'SPAWN', 5));
                setTimeout(() => { if (this.gameState === 'PLAYING') this.enemies.push(new Boss(this, spawnPos.x, spawnPos.y, this.currentStage)); }, 1000);
            }
        }

        if (this.fortifyTimer > 0) { this.fortifyTimer--; if (this.fortifyTimer === 0) this.unfortifyBase(); }
        if (this.enemiesRemaining > 0 && this.enemies.length < Math.min(4 + Math.floor(this.currentStage / 10), 8)) {
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                const sx = [TILE_SIZE * 2, TILE_SIZE * 12, TILE_SIZE * 22][Math.floor(Math.random() * 3)]; const sy = TILE_SIZE * 2; this.effects.push(new Effect(sx + TILE_SIZE, sy + TILE_SIZE, 'SPAWN'));
                setTimeout(() => { if (this.gameState === 'PLAYING') { this.enemies.push(new Enemy(this, sx, sy, this.currentStage)); this.enemiesRemaining--; } }, 1000); this.spawnTimer = 180;
            }
        } else if (this.enemiesRemaining === 0 && this.enemies.length === 0) { this.gameState = 'STAGE_CLEAR'; setTimeout(() => this.nextLevel(), 2000); }
        
        this.players.forEach(p => p.update()); this.enemies.forEach(e => e.update());
        this.bullets.forEach(b => b.update());
        this.effects.forEach(e => e.update());
        this.powerUps.forEach(p => p.update());
        this.bullets = this.bullets.filter(b => b.active);
        this.effects = this.effects.filter(e => e.active);
        this.powerUps = this.powerUps.filter(p => p.active);
        this.enemies = this.enemies.filter(e => e.alive);
        if (this.players.every(p => !p.alive) && this.lives === 0) this.gameOver();
    }
    draw() {
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.gameState === 'STAGE_START') {
            const progress = 1 - this.stageStartTimer / 120;
            this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            this.ctx.fillStyle = '#aaa'; this.ctx.font = '60px "Courier New"'; this.ctx.textAlign = 'center';
            this.ctx.globalAlpha = progress < 0.1 ? progress * 10 : (progress > 0.8 ? (1 - progress) * 5 : 1);
            this.ctx.fillText(`STAGE ${this.currentStage + 1}`, CANVAS_SIZE/2, CANVAS_SIZE/2 - 20);
            this.ctx.font = '24px "Courier New"';
            this.ctx.fillText(`Enemies: ${this.enemiesRemaining}`, CANVAS_SIZE/2, CANVAS_SIZE/2 + 30);
            this.ctx.globalAlpha = 1;
            return;
        }
        if (this.gameState === 'PLAYING' || this.gameState === 'STAGE_CLEAR') {
            this.ctx.save();
            this.ctx.translate(this.shakeX, this.shakeY);
            this.map.draw(this.ctx); 
            if (this.weather !== 'NONE') {
                this.ctx.save();
                if (this.weather === 'RAIN') { this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)'; this.ctx.lineWidth = 2; this.weatherParticles.forEach(p => { this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(p.x+1, p.y+15); this.ctx.stroke(); }); }
                else if (this.weather === 'SNOW') { this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; this.weatherParticles.forEach(p => { this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 3, 0, Math.PI*2); this.ctx.fill(); }); }
                else if (this.weather === 'WIND') { this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; this.ctx.lineWidth = 1; this.weatherParticles.forEach(p => { this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(p.x+30, p.y); this.ctx.stroke(); }); }
                else if (this.weather === 'LIGHTNING') { if (this.lightningFlash > 0) { this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash/10})`; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); } }
                this.ctx.restore();
            }
            this.players.forEach(p => { if(p.alive) { p.draw(this.ctx); if (p.aiActive) { this.ctx.save(); this.ctx.fillStyle = 'rgba(0,0,0,0.7)'; this.ctx.beginPath(); this.ctx.arc(p.x + 30, p.y - 12, 14, 0, Math.PI * 2); this.ctx.fill(); this.ctx.fillStyle = '#0f0'; this.ctx.font = 'bold 12px Arial'; this.ctx.textAlign = 'center'; this.ctx.fillText('AI', p.x + 30, p.y - 8); this.ctx.restore(); } } }); this.enemies.forEach(e => e.draw(this.ctx)); this.bullets.forEach(b => b.draw(this.ctx)); this.effects.forEach(e => e.draw(this.ctx)); this.powerUps.forEach(p => p.draw(this.ctx));
            this.drawForest();
            this.ctx.restore();
            this.floatingTexts.forEach(t => { this.ctx.save(); this.ctx.fillStyle = t.color; this.ctx.font = 'bold 16px Arial'; this.ctx.textAlign = 'center'; this.ctx.globalAlpha = t.timer / 60; this.ctx.fillText(t.text, t.x, t.y); this.ctx.restore(); });
            this.announcements.forEach(a => { this.ctx.save(); const scale = 1 + Math.sin(a.timer / 10) * 0.1; this.ctx.translate(CANVAS_SIZE / 2, a.y); this.ctx.scale(scale, scale); this.ctx.fillStyle = '#000'; this.ctx.font = 'bold 48px Arial'; this.ctx.textAlign = 'center'; this.ctx.fillText(a.text, 2, 2); this.ctx.fillStyle = a.color; this.ctx.fillText(a.text, 0, 0); this.ctx.restore(); });
            if (this.gameState === 'STAGE_CLEAR') { this.ctx.fillStyle = 'rgba(0,0,0,0.5)'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); this.ctx.fillStyle = '#fff'; this.ctx.font = '80px "Courier New"'; this.ctx.textAlign = 'center'; this.ctx.fillText("STAGE CLEAR!", CANVAS_SIZE/2, CANVAS_SIZE/2); }
            if (this.paused) { this.ctx.fillStyle = 'rgba(0,0,0,0.7)'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); this.ctx.fillStyle = '#fff'; this.ctx.font = '60px "Courier New"'; this.ctx.textAlign = 'center'; this.ctx.fillText("PAUSED", CANVAS_SIZE/2, CANVAS_SIZE/2 - 20); this.ctx.font = '24px "Courier New"'; this.ctx.fillText("Press P to resume", CANVAS_SIZE/2, CANVAS_SIZE/2 + 30); }
        }
        if (this.highScore > 0) { this.ctx.fillStyle = '#ff0'; this.ctx.font = '16px Arial'; this.ctx.textAlign = 'right'; this.ctx.fillText(`HIGH SCORE: ${this.highScore}`, CANVAS_SIZE - 10, CANVAS_SIZE - 10); }
    }
    drawForest() { for (let y = 0; y < GRID_SIZE; y++) for (let x = 0; x < GRID_SIZE; x++) if (this.map.grid[y][x] === TILE_TYPES.FOREST) { this.ctx.fillStyle = 'rgba(33, 181, 33, 0.7)'; this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); } }
    loop() { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); }
}
window.onload = () => new Game();

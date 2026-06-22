// Game Constants - Final Full-Screen Scaled Version
const TILE_SIZE = 32; 
const GRID_SIZE = 26;
const CANVAS_SIZE = TILE_SIZE * GRID_SIZE; // 832px

const TILE_TYPES = { EMPTY: 0, BRICK: 1, STEEL: 2, WATER: 3, FOREST: 4, ICE: 5, HARD_BRICK: 6, UNBREAKABLE: 7, BASE: 9, BASE_DESTROYED: 10 };
const COLORS = { BRICK: '#B53120', BRICK_LIGHT: '#DC5341', STEEL: '#AAAAAA', STEEL_LIGHT: '#EEEEEE', WATER: '#2131E7', FOREST: '#21B521', PLAYER1: '#E7E721', PLAYER2: '#63C6FF', ENEMY: '#E7E7E7', BASE: '#E79C21' };
const POWERUP_TYPES = { SHIELD: '🛡️', BOMB: '💣', STAR: '⭐', SHOVEL: '🏗️', LIFE: '❤️', TIME: '⏳', MAX_WEAPON: '🚀', BOAT: '🚤', FLY: '🚁' };

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
    if (index === 0) {
        level.totalEnemies = 10;
        for (let x of [2, 6, 10, 14, 18, 22]) {
            for (let y = 2; y < 10; y += 2) level.bricks.push([y, x, 2, 2]);
            for (let y = 14; y < 20; y += 2) level.bricks.push([y, x, 2, 2]);
        }
        level.steels.push([12, 12, 2, 2]);
        return level;
    }
    if (index === 1) {
        level.totalEnemies = 12;
        for (let x of [4, 8, 12, 16, 20]) {
            for (let y = 4; y < 18; y += 2) if (y !== 10) level.bricks.push([y, x, 2, 2]);
        }
        level.steels.push([10, 4, 2, 2]); level.steels.push([10, 20, 2, 2]);
        for (let x = 6; x <= 18; x += 4) level.forests.push([20, x, 2, 4]);
        return level;
    }
    const difficulty = Math.min(index / 100, 1);
    level.totalEnemies = Math.floor(8 + index * 0.25 + difficulty * 8);
    const patterns = ['grid', 'cross', 'maze', 'circle', 'diamond', 'spiral', 'fortress', 'arena', 'corridor', 'scattered'];
    const pattern = patterns[index % patterns.length];
    const brickDensity = 0.15 + difficulty * 0.2;
    const steelDensity = 0.02 + difficulty * 0.08;
    const forestDensity = 0.05 + difficulty * 0.15;
    const iceDensity = 0.02 + difficulty * 0.1;
    const waterDensity = 0.03 + difficulty * 0.1;
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
        const count = Math.floor(15 + difficulty * 15);
        for (let i = 0; i < count; i++) {
            const x = 2 + Math.floor(rng() * 22);
            const y = 2 + Math.floor(rng() * 18);
            if (isProtected(x, y) || isSpawn(x, y)) continue;
            const w = 1 + Math.floor(rng() * 3);
            const h = 1 + Math.floor(rng() * 3);
            if (rng() < steelDensity) level.steels.push([y, x, h, w]);
            else { level.bricks.push([y, x, h, w]); }
        }
    }
    if (waterDensity > 0) {
        const waterCount = Math.floor(3 + waterDensity * 20);
        for (let i = 0; i < waterCount; i++) {
            const x = 3 + Math.floor(rng() * 20);
            const y = 3 + Math.floor(rng() * 16);
            const w = 1 + Math.floor(rng() * 3);
            const h = 1 + Math.floor(rng() * 3);
            if (!isProtected(x, y) && !isSpawn(x, y)) level.waters.push([y, x, h, w]);
        }
    }
    if (forestDensity > 0) {
        const forestCount = Math.floor(2 + forestDensity * 20);
        for (let i = 0; i < forestCount; i++) {
            const x = 3 + Math.floor(rng() * 20);
            const y = 3 + Math.floor(rng() * 16);
            const w = 2 + Math.floor(rng() * 2);
            const h = 2 + Math.floor(rng() * 2);
            level.forests.push([y, x, h, w]);
        }
    }
    if (iceDensity > 0) {
        const iceCount = Math.floor(1 + iceDensity * 20);
        for (let i = 0; i < iceCount; i++) {
            const x = 3 + Math.floor(rng() * 20);
            const y = 3 + Math.floor(rng() * 16);
            if (!isProtected(x, y) && !isSpawn(x, y)) level.ices.push([y, x, 2, 2]);
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

class AudioManager {
    constructor() { this.ctx = null; this.enabled = false; }
    init() {
        if (!this.ctx) { const AudioContext = window.AudioContext || window.webkitAudioContext; if (AudioContext) { this.ctx = new AudioContext(); this.enabled = true; } }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
    play(type) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;
        if (type === 'shoot') {
            osc.type = 'square'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'powerup') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.setValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'start') {
            osc.type = 'square'; osc.frequency.setValueAtTime(300, now); osc.frequency.setValueAtTime(400, now + 0.1); osc.frequency.setValueAtTime(500, now + 0.2);
            gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now); osc.stop(now + 0.5);
        } else if (type === 'hit') {
            osc.type = 'square'; osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        }
    }
}
const audio = new AudioManager();

class Effect {
    constructor(x, y, type, data = 1) { this.x = x; this.y = y; this.type = type; this.timer = type === 'SPAWN' ? 60 : (type === 'TRACK' ? 30 : 20); this.active = true; this.data = data; }
    update() { this.timer--; if (this.timer <= 0) this.active = false; }
    draw(ctx) {
        if (this.type === 'EXPLOSION') {
            const progress = (20 - this.timer) / 20;
            const size = (TILE_SIZE * this.data) * progress;
            ctx.beginPath(); ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = progress < 0.5 ? '#fff' : (progress < 0.8 ? '#ff0' : '#f00');
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        } else if (this.type === 'SPAWN') {
            if (Math.floor(this.timer / 4) % 2 === 0) {
                ctx.fillStyle = '#fff'; ctx.beginPath(); const s = 20 * this.data;
                ctx.moveTo(this.x, this.y - s); ctx.lineTo(this.x + s/3, this.y - s/3); ctx.lineTo(this.x + s, this.y); ctx.lineTo(this.x + s/3, this.y + s/3); ctx.lineTo(this.x, this.y + s); ctx.lineTo(this.x - s/3, this.y + s/3); ctx.lineTo(this.x - s, this.y); ctx.lineTo(this.x - s/3, this.y - s/3); ctx.closePath(); ctx.fill();
            }
        } else if (this.type === 'TRACK') {
            const { dir, w, h } = this.data;
            ctx.fillStyle = `rgba(0, 0, 0, ${this.timer / 150})`;
            if (dir === 'UP' || dir === 'DOWN') {
                ctx.fillRect(this.x - w/2 + 6, this.y - 4, 6, 8);
                ctx.fillRect(this.x + w/2 - 12, this.y - 4, 6, 8);
            } else {
                ctx.fillRect(this.x - 4, this.y - h/2 + 6, 8, 6);
                ctx.fillRect(this.x - 4, this.y + h/2 - 12, 8, 6);
            }
        }
    }
}

class PowerUp {
    constructor(game, x, y, type) { 
        this.game = game; this.x = x; this.y = y; this.type = type; this.width = 64; this.height = 64; this.timer = 900; this.active = true;
        if (type === POWERUP_TYPES.FLY) this.game.showTip("💡 TIP: 吃到直升机🚁可获得飞行能力，无视地形与子弹，按开火键轰炸！", 600);
        else if (type === POWERUP_TYPES.BOAT) this.game.showTip("💡 TIP: 吃到小艇🚤可在水面上自由移动，利用湖泊躲避不会游泳的敌人！", 600);
        else if (type === POWERUP_TYPES.MAX_WEAPON) this.game.showTip("💡 TIP: 终极神药来了！吃到🚀直接升至满级4级（紫色追踪），火力全开！", 600);
        else if (type === POWERUP_TYPES.BOMB) this.game.showTip("💡 TIP: 吃到炸弹💣可以瞬间消灭屏幕上的所有敌人！", 400);
        else if (type === POWERUP_TYPES.SHOVEL) this.game.showTip("💡 TIP: 吃到铁锹🏗️可以把基地周围的砖块升级为坚不可摧的钢板！", 400);
        else if (type === POWERUP_TYPES.TIME) this.game.showTip("💡 TIP: 吃到时钟⏳可以冻结所有敌人一段时间！", 400);
        else if (type === POWERUP_TYPES.STAR) this.game.showTip("💡 TIP: 吃到星星⭐可以直接升一级，火力提升！", 400);
    }
    update() {
        this.timer--; if (this.timer <= 0) this.active = false;
        if (!this.active) return;
        this.game.players.forEach(p => { 
            const margin = 20;
            if (this.active && p.alive && this.x - margin < p.x + p.width && this.x + this.width + margin > p.x && this.y - margin < p.y + p.height && this.y + this.height + margin > p.y) { 
                this.applyEffect(p); this.active = false; 
            } 
        });
    }
    applyEffect(player) {
        audio.play('powerup');
        this.game.effects.push(new Effect(this.x + 32, this.y + 32, 'EXPLOSION'));
        if (this.type === POWERUP_TYPES.BOMB) this.game.enemies.forEach(e => { if (e.isBoss) e.destroy(player, 10); else e.destroy(player, 100); });
        else if (this.type === POWERUP_TYPES.SHIELD) player.setShield(360);
        else if (this.type === POWERUP_TYPES.STAR) player.upgrade();
        else if (this.type === POWERUP_TYPES.SHOVEL) this.game.fortifyBase();
        else if (this.type === POWERUP_TYPES.LIFE) this.game.lives++;
        else if (this.type === POWERUP_TYPES.TIME) this.game.enemyFrozenTimer = 300;
        else if (this.type === POWERUP_TYPES.MAX_WEAPON) {
            player.level = 4;
            player.speed = Math.min(8, 4 + 4 * 0.15);
            player.maxHealth = 1 + 4 * 2;
            player.health = player.maxHealth;
            this.game.showAnnouncement('终极武器 MAX WEAPON!', '#f0f');
            this.game.updateHUD();
        }
        else if (this.type === POWERUP_TYPES.BOAT) {
            player.canBoat = true;
            this.game.showAnnouncement('获得渡河能力 CAN BOAT!', '#0cf');
        }
        else if (this.type === POWERUP_TYPES.FLY) {
            player.canFly = true;
            player.flyTimer = 1800;
            this.game.showAnnouncement('获得飞行能力 CAN FLY!', '#ccc');
        }
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
        for (let i = 0; i < GRID_SIZE; i++) this.grid[0][i] = this.grid[GRID_SIZE - 1][i] = this.grid[i][0] = this.grid[i][GRID_SIZE - 1] = TILE_TYPES.UNBREAKABLE;
        const hardBrickChance = Math.min(0.05 + levelIndex * 0.01, 0.4);
        const unbreakableChance = Math.min(0.02 + levelIndex * 0.005, 0.2);
        level.bricks.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = Math.random() < hardBrickChance ? TILE_TYPES.HARD_BRICK : TILE_TYPES.BRICK; });
        level.steels.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = Math.random() < unbreakableChance ? TILE_TYPES.UNBREAKABLE : TILE_TYPES.STEEL; });
        if (level.waters) level.waters.forEach(([y,x,h,w]) => { for(let i=0; i<h; i++) for(let j=0; j<w; j++) if (y+i < GRID_SIZE && x+j < GRID_SIZE) this.grid[y+i][x+j] = TILE_TYPES.WATER; });
        if (!level.waters || level.waters.length === 0) {
            if (Math.random() < 0.4) {
                const lx = 4 + Math.floor(Math.random() * 12);
                const ly = 8 + Math.floor(Math.random() * 8);
                const lw = 4 + Math.floor(Math.random() * 4);
                const lh = 2 + Math.floor(Math.random() * 4);
                for(let i=0; i<lh; i++) for(let j=0; j<lw; j++) if (ly+i < GRID_SIZE && lx+j < GRID_SIZE) this.grid[ly+i][lx+j] = TILE_TYPES.WATER;
            }
        }
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
                } else if (tile === TILE_TYPES.HARD_BRICK) {
                    ctx.fillStyle = '#8B4513'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#A0522D'; ctx.fillRect(px, py, TILE_SIZE, 4); ctx.fillRect(px, py, 4, TILE_SIZE);
                    ctx.fillStyle = '#000'; ctx.fillRect(px + TILE_SIZE/2, py, 2, TILE_SIZE); ctx.fillRect(px, py + TILE_SIZE/2, TILE_SIZE, 2);
                } else if (tile === TILE_TYPES.UNBREAKABLE) {
                    ctx.fillStyle = '#222'; ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = '#444'; ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                    ctx.fillStyle = '#111'; ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
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
    isBlocked(x, y, width, height, isBullet = false, canBoat = false, canFly = false) {
        const left = Math.floor(x / TILE_SIZE); const right = Math.floor((x + width - 0.1) / TILE_SIZE);
        const top = Math.floor(y / TILE_SIZE); const bottom = Math.floor((y + height - 0.1) / TILE_SIZE);
        for (let i = top; i <= bottom; i++) {
            for (let j = left; j <= right; j++) {
                if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE) return true;
                const tile = this.grid[i][j];
                if (isBullet) { if (tile === TILE_TYPES.BRICK || tile === TILE_TYPES.HARD_BRICK || tile === TILE_TYPES.STEEL || tile === TILE_TYPES.UNBREAKABLE || tile === TILE_TYPES.BASE) return true; }
                else { 
                    if (tile === TILE_TYPES.EMPTY || tile === TILE_TYPES.FOREST || tile === TILE_TYPES.ICE) continue;
                    if (tile === TILE_TYPES.WATER && (canBoat || canFly)) continue;
                    if (tile !== TILE_TYPES.UNBREAKABLE && canFly) continue;
                    return true;
                }
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
    constructor(game, owner, x, y, dir, level = 0, type = 'NORMAL') { 
        this.game = game; this.owner = owner; this.x = x; this.y = y; this.dir = dir; 
        this.level = level; this.type = type;
        this.speed = 8 + (level * 0.2); 
        this.size = 8 + Math.min(level, 5); 
        this.active = true; 
        this.damage = (this.owner instanceof Player) ? 5 + level * 3 : 1;
        if (this.type === 'LASER' || this.type === 'LASER_MISSILE') { this.speed *= 2; this.damage *= 1.5; }
        if (this.type === 'MISSILE') { this.speed *= 0.8; }
        this.vx = undefined; this.vy = undefined;
    }
    update() {
        if (this.type === 'MISSILE' || this.type === 'LASER_MISSILE') {
            let target = null;
            let minDist = Infinity;
            let targets = this.owner instanceof Player ? this.game.enemies : this.game.players;
            for (let t of targets) {
                if (!t.alive) continue;
                let d = Math.hypot(t.x + t.width/2 - this.x, t.y + t.height/2 - this.y);
                if (d < minDist && d < TILE_SIZE * 8) { minDist = d; target = t; }
            }
            if (target) {
                let dx = target.x + target.width/2 - this.x;
                let dy = target.y + target.height/2 - this.y;
                let angle = Math.atan2(dy, dx);
                let currentAngle = this.vx !== undefined ? Math.atan2(this.vy, this.vx) : 
                                   (this.dir === 'UP' ? -Math.PI/2 : this.dir === 'DOWN' ? Math.PI/2 : this.dir === 'LEFT' ? Math.PI : 0);
                let diff = angle - currentAngle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                let turnSpeed = 0.04;
                let newAngle = currentAngle + Math.max(-turnSpeed, Math.min(turnSpeed, diff));
                this.vx = Math.cos(newAngle) * this.speed;
                this.vy = Math.sin(newAngle) * this.speed;
                if (Math.abs(this.vx) > Math.abs(this.vy)) this.dir = this.vx > 0 ? 'RIGHT' : 'LEFT';
                else this.dir = this.vy > 0 ? 'DOWN' : 'UP';
            } else if (this.vx === undefined) {
                this.vx = (this.dir === 'LEFT' ? -this.speed : this.dir === 'RIGHT' ? this.speed : 0);
                this.vy = (this.dir === 'UP' ? -this.speed : this.dir === 'DOWN' ? this.speed : 0);
            }
        }
        
        if (this.vx !== undefined && this.vy !== undefined) {
            this.x += this.vx; this.y += this.vy;
        } else {
            if (this.dir === 'UP') this.y -= this.speed; else if (this.dir === 'DOWN') this.y += this.speed; else if (this.dir === 'LEFT') this.x -= this.speed; else if (this.dir === 'RIGHT') this.x += this.speed;
        }
        for (let other of this.game.bullets) {
            if (other === this || !other.active) continue;
            if (this.x < other.x + other.size && this.x + this.size > other.x && this.y < other.y + other.size && this.y + this.size > other.y) { this.active = false; other.active = false; this.triggerExplosion(this.x, this.y, true); return; }
        }
        const tx = Math.floor((this.x + this.size/2) / TILE_SIZE); const ty = Math.floor((this.y + this.size/2) / TILE_SIZE);
        if (tx < 0 || tx >= GRID_SIZE || ty < 0 || ty >= GRID_SIZE) { 
            if (this.bounces > 0) { 
                this.bounces--; 
                if (this.vx !== undefined && this.vy !== undefined) { this.vx = -this.vx; this.vy = -this.vy; }
                else { this.dir = this.dir === 'UP' ? 'DOWN' : (this.dir === 'DOWN' ? 'UP' : (this.dir === 'LEFT' ? 'RIGHT' : 'LEFT')); }
                this.active = true; 
            } else { this.active = false; }
            return; 
        }
        const tile = this.game.map.grid[ty][tx];
        if (tile === TILE_TYPES.BRICK || tile === TILE_TYPES.HARD_BRICK || tile === TILE_TYPES.STEEL || tile === TILE_TYPES.UNBREAKABLE || tile === TILE_TYPES.BASE) {
            if (tile === TILE_TYPES.BASE) {
                if (!(this.owner instanceof Player && this.owner.aiActive)) {
                    this.game.baseHealth--;
                    if (this.game.baseHealth === 2 || this.game.baseHealth === 1) {
                        this.game.showAnnouncement('⚠️ 警告！大本营血量告急！ ⚠️', '#f00');
                        audio.play('explosion');
                    }
                    if (this.game.baseHealth <= 0) {
                        this.game.map.grid[24][12] = TILE_TYPES.BASE_DESTROYED;
                        this.game.map.grid[24][13] = TILE_TYPES.BASE_DESTROYED;
                        this.game.map.grid[25][12] = TILE_TYPES.BASE_DESTROYED;
                        this.game.map.grid[25][13] = TILE_TYPES.BASE_DESTROYED;
                        this.game.gameOver();
                    }
                    this.game.shakeScreen(8);
                }
            } else {
                this.triggerExplosion(this.x + this.size/2, this.y + this.size/2);
            }
            if (this.bounces > 0 && tile !== TILE_TYPES.BASE) {
                this.bounces--;
                if (this.vx !== undefined && this.vy !== undefined) {
                    if (Math.abs(this.vx) > Math.abs(this.vy)) this.vx = -this.vx; else this.vy = -this.vy;
                } else {
                    this.dir = this.dir === 'UP' ? 'DOWN' : (this.dir === 'DOWN' ? 'UP' : (this.dir === 'LEFT' ? 'RIGHT' : 'LEFT'));
                }
                this.active = true;
            } else {
                this.active = false;
            }
            return;
        }
        const isEnemyBullet = this.owner instanceof Enemy;
        const tanks = isEnemyBullet ? this.game.players : this.game.enemies;
        for (const tank of tanks) {
            if (!tank.alive) continue;
            if (tank.canFly && this.owner instanceof Enemy) continue;
            if (this.x < tank.x + tank.width && this.x + this.size > tank.x && this.y < tank.y + tank.height && this.y + this.size > tank.y) { 
                this.triggerExplosion(this.x + this.size/2, this.y + this.size/2); 
                tank.destroy(this.owner, this.damage); 
                if (!this.piercing) { this.active = false; break; }
            }
        }
    }
    triggerExplosion(ex, ey, small = false) {
        let radius = small ? 0.5 : (1 + Math.min(this.level, 10) * 0.2);
        if (this.owner instanceof Player && !small) radius += 1.5;
        audio.play('explosion');
        this.game.effects.push(new Effect(ex, ey, 'EXPLOSION', radius));
        if (small) return;
        const gridX = Math.floor(ex / TILE_SIZE); const gridY = Math.floor(ey / TILE_SIZE); const range = Math.ceil(radius);
        for (let iy = gridY - range; iy <= gridY + range; iy++) {
            for (let ix = gridX - range; ix <= gridX + range; ix++) {
                if (iy < 0 || iy >= GRID_SIZE || ix < 0 || ix >= GRID_SIZE) continue;
                const tile = this.game.map.grid[iy][ix];
                if (iy === 0 || iy === GRID_SIZE - 1 || ix === 0 || ix === GRID_SIZE - 1) continue;
                if (tile === TILE_TYPES.BRICK) this.game.map.grid[iy][ix] = TILE_TYPES.EMPTY;
                else if (tile === TILE_TYPES.HARD_BRICK) this.game.map.grid[iy][ix] = TILE_TYPES.BRICK;
                else if (tile === TILE_TYPES.STEEL && this.level >= 2) this.game.map.grid[iy][ix] = TILE_TYPES.HARD_BRICK;
            }
        }
    }
    draw(ctx) { 
        ctx.save(); 
        if (this.type === 'LASER' || this.type === 'LASER_MISSILE') {
            ctx.fillStyle = '#0ff';
            ctx.shadowBlur = 10; ctx.shadowColor = '#0ff';
            ctx.fillRect(this.x, this.y, this.dir === 'UP' || this.dir === 'DOWN' ? this.size/2 : this.size*2, this.dir === 'UP' || this.dir === 'DOWN' ? this.size*2 : this.size/2);
        } else if (this.type === 'MISSILE') {
            ctx.fillStyle = '#f55';
            ctx.shadowBlur = 10; ctx.shadowColor = '#f00';
            ctx.beginPath(); ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2); ctx.fill();
            if (Math.random() < 0.5) this.game.effects.push(new Effect(this.x + this.size/2, this.y + this.size/2, 'EXPLOSION', 0.2));
        } else {
            ctx.fillStyle = this.level >= 1 ? '#ff0' : '#fff'; 
            ctx.beginPath(); ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2); ctx.fill(); 
            if (this.level >= 1) { ctx.shadowBlur = 15; ctx.shadowColor = this.level >= 1 ? '#ff0' : '#fff'; } 
        }
        ctx.restore(); 
    }
}

class Tank {
    constructor(game, x, y, color) { this.game = game; this.x = x; this.y = y; this.width = 60; this.height = 60; this.color = color; this.direction = 'UP'; this.speed = 4; this.cooldown = 0; this.alive = true; this.shieldTimer = 0; this.level = 0; this.score = 0; }
    setShield(d) { this.shieldTimer = d; }
    upgrade() { 
        if (this.level >= 4) return;
        this.level++;
        this.speed = Math.min(8, 4 + this.level * 0.15); 
        if (this instanceof Player) {
            this.maxHealth = 1 + this.level * 2;
            this.health = this.maxHealth;
            this.game.showFloatingText(`LEVEL ${this.level}!`, this.x, this.y, '#0f0');
            
            if (!this.perks) this.perks = [];
            const availablePerks = ['SPREAD', 'VAMPIRIC', 'PIERCING', 'RAPID'].filter(p => !this.perks.includes(p) || p === 'RAPID');
            if (availablePerks.length > 0) {
                const perk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
                this.perks.push(perk);
                this.game.showFloatingText(`获得天赋: ${perk}!`, this.x, this.y - 20, '#0ff');
                this.game.showTip(`💡 TIP: 你获得了新天赋 [${perk}]！善用散弹、穿甲、吸血、连发等能力！`, 400);
            }
            this.game.updateHUD();
        }
    }
    update() { if (this.cooldown > 0) this.cooldown--; if (this.canBoat) { ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 6; ctx.setLineDash([10, 5]); ctx.strokeRect(px - 6, py - 6, w + 12, h + 12); ctx.setLineDash([]); }
        if (this.canFly) { ctx.strokeStyle = '#ffaa00'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px + 30, py + 30, 45, 0, Math.PI * 2); ctx.stroke(); }
        if (this.shieldTimer > 0) this.shieldTimer--; if (this.flyBombCooldown > 0) this.flyBombCooldown--; }
    move(dir) {
        this.direction = dir; let nx = this.x; let ny = this.y;
        const onWater = this.game.map.isOnWater(this.x, this.y, this.width, this.height);
        const moveSpeed = onWater ? this.speed * 0.5 : this.speed;
        if (dir === 'UP') ny -= moveSpeed; else if (dir === 'DOWN') ny += moveSpeed; else if (dir === 'LEFT') nx -= moveSpeed; else if (dir === 'RIGHT') nx += moveSpeed;
        if (!this.game.map.isBlocked(nx, ny, this.width, this.height, false, this.canBoat, this.canFly)) { 
            this.x = nx; this.y = ny; this.onIce = false; 
            this.moveCounter = (this.moveCounter || 0) + 1;
            if (this.moveCounter % 5 === 0) this.game.effects.push(new Effect(this.x + this.width/2, this.y + this.height/2, 'TRACK', { dir: this.direction, w: this.width, h: this.height }));
        }
        else {
            if (dir === 'UP' || dir === 'DOWN') { 
                const gx = Math.round(this.x / TILE_SIZE) * TILE_SIZE + 2; 
                if (Math.abs(this.x - gx) < 24) {
                    if (this.x < gx) this.x = Math.min(gx, this.x + moveSpeed);
                    else if (this.x > gx) this.x = Math.max(gx, this.x - moveSpeed);
                }
            } else { 
                const cy = this.y + this.height / 2; 
                const gy = Math.round(this.y / TILE_SIZE) * TILE_SIZE + 2; 
                if (Math.abs(this.y - gy) < 24) {
                    if (this.y < gy) this.y = Math.min(gy, this.y + moveSpeed);
                    else if (this.y > gy) this.y = Math.max(gy, this.y - moveSpeed);
                }
            }
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
            if (!this.game.map.isBlocked(sx, sy, this.width, this.height, false, this.canBoat, this.canFly)) { this.x = sx; this.y = sy; }
        }
    }
    shoot() {
        if (this.canFly) {
            if (this.flyBombCooldown === undefined || this.flyBombCooldown <= 0) {
                this.flyBombCooldown = 45;
                this.game.effects.push(new Effect(this.x + 30, this.y + 30, 'EXPLOSION', 1.5));
                audio.play('explosion');
                this.game.enemies.forEach(e => {
                    if (e.alive && Math.hypot(e.x + e.width/2 - (this.x + 30), e.y + e.height/2 - (this.y + 30)) < TILE_SIZE * 3) e.destroy(this, 100);
                });
            }
            if (this.level < 2) return;
        }
        if (this.cooldown > 0) {
            if (this.perks && this.perks.includes('RAPID') && this.cooldown > 5) this.cooldown -= 1; // Faster cooldown
            return;
        }
        let bulletCount = 0;
        for (const b of this.game.bullets) { if (b.owner === this && b.active) bulletCount++; }
        const maxBullets = this.isBoss ? 2 : (this instanceof Player ? 1 + Math.floor(this.level / 3) : 1);
        if (bulletCount >= maxBullets) return;
        if (this.game.bullets.length >= 80) return; 
        this.cooldown = this instanceof Player ? Math.max(5, 35 - this.level * 1.5) : Math.max(30, 60 - this.level * 10);
        if (this.perks && this.perks.includes('RAPID')) this.cooldown = Math.max(2, this.cooldown / 2);
        
        let bx = this.x + 26; let by = this.y + 26;
        if (this.direction === 'UP') by = this.y - 10; else if (this.direction === 'DOWN') by = this.y + 60; else if (this.direction === 'LEFT') bx = this.x - 10; else if (this.direction === 'RIGHT') bx = this.x + 60;
        if (this instanceof Player) audio.play('shoot');
        
        let bType = 'NORMAL';
        if (this instanceof Player) {
            if (this.level >= 4) bType = 'LASER_MISSILE';
            else if (this.level >= 3) bType = 'LASER';
            else if (this.level >= 1) bType = 'MISSILE';
        }
        
        let b = new Bullet(this.game, this, bx, by, this.direction, this.level, bType);
        
        if (this.perks && this.perks.includes('PIERCING')) b.piercing = true;
        this.game.bullets.push(b);
        
        if (this instanceof Player && (this.level >= 3 || (this.perks && this.perks.includes('SPREAD')))) {
             let bx2 = bx, by2 = by, bx3 = bx, by3 = by;
             if (this.direction === 'UP' || this.direction === 'DOWN') { bx2 -= 15; bx3 += 15; }
             else { by2 -= 15; by3 += 15; }
             let b2 = new Bullet(this.game, this, bx2, by2, this.direction, this.level, bType);
             let b3 = new Bullet(this.game, this, bx3, by3, this.direction, this.level, bType);
             
             if (this.perks && this.perks.includes('PIERCING')) { b2.piercing = true; b3.piercing = true; }
             this.game.bullets.push(b2, b3);
        }
    }
    destroy(killer, damage = 1) {
        if (this.shieldTimer > 0) return; 
        this.health = (this.health || 1) - damage;
        if (this.health > 0) {
            audio.play('hit');
            this.game.effects.push(new Effect(this.x + 30, this.y + 30, 'EXPLOSION', 1));
            if (this instanceof Player) {
                this.game.shakeScreen(4);
                this.level = Math.max(0, Math.floor((this.health - 1) / 2));
                this.speed = Math.min(8, 4 + this.level * 0.15);
                this.shieldTimer = 30;
                this.game.updateHUD();
            } else if (this.variant === 'HEAVY') {
                this.color = this.health === 2 ? '#B56B20' : '#B53120';
            }
            return;
        }
        
        

        this.alive = false; this.game.effects.push(new Effect(this.x + 30, this.y + 30, 'EXPLOSION', this.isBoss ? 3 : 1));
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
            
            if (killer.killStreak > 2) {
                this.game.showFloatingText(`${killer.killStreak} COMBO!`, this.x + this.width/2, this.y - 30, '#ff0');
                if (killer.killStreak === 5) this.game.showTip('💡 TIP: 连续击杀不仅能获得分数，连击10次还可以直升1级并获得天赋！', 400);
                this.game.shakeScreen(Math.min(killer.killStreak * 2, 12));
                if (killer.killStreak % 10 === 0) {
                    killer.upgrade();
                }
            }
            // Vampiric Perk hook
            if (killer.perks && killer.perks.includes('VAMPIRIC') && Math.random() < 0.5) {
                killer.health = Math.min(killer.health + 1, killer.maxHealth);
                this.game.showFloatingText('+1 HP', killer.x, killer.y, '#0f0');
            }
        }
        if (this instanceof Player) this.game.handlePlayerDeath(this);
        if (this instanceof Enemy && Math.random() < 0.15) {
            const standardTypes = [
                POWERUP_TYPES.SHIELD, POWERUP_TYPES.SHIELD,
                POWERUP_TYPES.BOMB, POWERUP_TYPES.BOMB,
                POWERUP_TYPES.SHOVEL, POWERUP_TYPES.SHOVEL,
                POWERUP_TYPES.TIME, POWERUP_TYPES.TIME,
                POWERUP_TYPES.LIFE,
                POWERUP_TYPES.STAR
            ];
            const type = standardTypes[Math.floor(Math.random() * standardTypes.length)];
            this.game.powerUps.push(new PowerUp(this.game, this.x, this.y, type));
        }
    }
    draw(ctx) {
        const px = this.x; const py = this.y; const w = this.width; const h = this.height; ctx.save();
        if (this.level >= 1) {
            ctx.shadowBlur = 8 + Math.min(this.level, 5) * 4;
            ctx.shadowColor = this.level >= 4 ? '#f0f' : (this.level >= 3 ? '#0ff' : (this.level >= 2 ? '#f00' : (this.level >= 1 ? '#ff0' : '#fff')));
        }
        ctx.fillStyle = this.color;
        if (this.direction === 'UP' || this.direction === 'DOWN') {
            ctx.fillRect(px + 8, py + 8, w - 16, h - 16); ctx.fillStyle = '#000'; ctx.fillRect(px, py, 8, h); ctx.fillRect(px + w - 8, py, 8, h);
            ctx.fillStyle = this.color; for (let i = 0; i < h; i += 8) { ctx.fillRect(px, py + i, 8, 4); ctx.fillRect(px + w - 8, py + i, 8, 4); }
            ctx.fillRect(px + w/2 - 8, py + h/2 - 8, 16, 16); ctx.strokeStyle = '#000'; ctx.strokeRect(px + w/2 - 8, py + h/2 - 8, 16, 16);
            ctx.fillStyle = this.level >= 4 ? '#f0f' : (this.level >= 3 ? '#0ff' : (this.level >= 2 ? '#f00' : (this.level >= 1 ? '#ff0' : this.color)));
            const barrelW = 6 + Math.min(this.level, 10) * 2;
            const ext = Math.min(this.level, 4) * 2;
            if (this.direction === 'UP') ctx.fillRect(px + w/2 - barrelW/2, py - 8 - ext, barrelW, 24 + ext);
            else ctx.fillRect(px + w/2 - barrelW/2, py + h - 16, barrelW, 24 + ext);
        } else {
            ctx.fillRect(px + 8, py + 8, w - 16, h - 16); ctx.fillStyle = '#000'; ctx.fillRect(px, py, w, 8); ctx.fillRect(px, py + h - 8, w, 8);
            ctx.fillStyle = this.color; for (let i = 0; i < w; i += 8) { ctx.fillRect(px + i, py, 4, 8); ctx.fillRect(px + i, py + h - 8, 4, 8); }
            ctx.fillRect(px + w/2 - 8, py + h/2 - 8, 16, 16); ctx.strokeStyle = '#000'; ctx.strokeRect(px + w/2 - 8, py + h/2 - 8, 16, 16);
            ctx.fillStyle = this.level >= 4 ? '#f0f' : (this.level >= 3 ? '#0ff' : (this.level >= 2 ? '#f00' : (this.level >= 1 ? '#ff0' : this.color)));
            const barrelW = 6 + Math.min(this.level, 10) * 2;
            const ext = Math.min(this.level, 4) * 2;
            if (this.direction === 'LEFT') ctx.fillRect(px - 8 - ext, py + h/2 - barrelW/2, 24 + ext, barrelW);
            else ctx.fillRect(px + w - 16, py + h/2 - barrelW/2, 24 + ext, barrelW);
        }
        if (this.level >= 1) {
            ctx.fillStyle = this.level >= 1 ? '#fa0' : '#0ff';
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
        this.health = 1;
        this.maxHealth = 1;
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
        
        if (this.comboTimer > 0) this.comboTimer--; else this.combo = 0;
        
        

        super.update();
        if (this.canFly && this.flyTimer > 0) {
            this.flyTimer--;
            if (this.flyTimer <= 0) {
                if (!this.game.map.isBlocked(this.x, this.y, this.width, this.height, false, this.canBoat, false)) {
                    this.canFly = false;
                    this.game.showFloatingText('降落！', this.x, this.y, '#ccc');
                } else {
                    this.flyTimer = 1;
                }
            }
        }
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
        } else if (nearestEnemy) {
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
            this.aiMoveDir = this.getAlternateDir(this.aiMoveDir, dx, dy, myX, myY);
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
        if (this.direction === 'UP' && myY > baseY && Math.abs(myX - baseX) < TILE_SIZE * 3) return true;
        if (this.direction === 'DOWN' && myY < baseY && Math.abs(myX - baseX) < TILE_SIZE * 3) return true;
        if (this.direction === 'LEFT' && myX > baseX && Math.abs(myY - baseY) < TILE_SIZE * 3) return true;
        if (this.direction === 'RIGHT' && myX < baseX && Math.abs(myY - baseY) < TILE_SIZE * 3) return true;
        return false;
    }
    isTileBlocked(x, y, dir) {
        const checkDist = TILE_SIZE * 1.5;
        let tx = x, ty = y;
        if (dir === 'UP') ty -= checkDist; else if (dir === 'DOWN') ty += checkDist;
        else if (dir === 'LEFT') tx -= checkDist; else if (dir === 'RIGHT') tx += checkDist;
        return this.game.map.isBlocked(tx - this.width/2, ty - this.height/2, this.width, this.height, false, this.canBoat, this.canFly);
    }
    getAlternateDir(blockedDir, dx, dy, myX, myY) {
        let dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => d !== blockedDir);
        if (myX !== undefined && myY !== undefined) {
            dirs = dirs.filter(d => !this.isTileBlocked(myX, myY, d));
        }
        if (dirs.length === 0) {
            const rev = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
            return rev[blockedDir] || 'UP';
        }
        dirs.sort((a, b) => {
            const costA = (a === 'UP' && dy < 0) || (a === 'DOWN' && dy > 0) || (a === 'LEFT' && dx < 0) || (a === 'RIGHT' && dx > 0) ? 0 : 1;
            const costB = (b === 'UP' && dy < 0) || (b === 'DOWN' && dy > 0) || (b === 'LEFT' && dx < 0) || (b === 'RIGHT' && dx > 0) ? 0 : 1;
            return costA - costB;
        });
        return dirs[0];
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
        const range = TILE_SIZE * 6;
        for (const b of this.game.bullets) {
            if (!b.active || b.owner instanceof Player) continue;
            let incoming = false;
            if (b.dir === 'DOWN' && Math.abs(b.x + b.size/2 - x) < 24 && b.y < y && y - b.y < range) incoming = true;
            if (b.dir === 'UP' && Math.abs(b.x + b.size/2 - x) < 24 && b.y > y && b.y - y < range) incoming = true;
            if (b.dir === 'RIGHT' && Math.abs(b.y + b.size/2 - y) < 24 && b.x < x && x - b.x < range) incoming = true;
            if (b.dir === 'LEFT' && Math.abs(b.y + b.size/2 - y) < 24 && b.x > x && b.x - x < range) incoming = true;
            if (incoming) return b;
        }
        return null;
    }
    getPerpendicularDir(dir) {
        if (dir === 'UP' || dir === 'DOWN') return Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
        return Math.random() < 0.5 ? 'UP' : 'DOWN';
    }
    getSmartDodgeDir(bullet, myX, myY) {
        const perpDirs = (bullet.dir === 'UP' || bullet.dir === 'DOWN') ? ['LEFT', 'RIGHT'] : ['UP', 'DOWN'];
        const validDirs = perpDirs.filter(d => !this.isTileBlocked(myX, myY, d));
        if (validDirs.length > 0) return validDirs[Math.floor(Math.random() * validDirs.length)];
        return perpDirs[0];
    }
}
class Enemy extends Tank { 
    constructor(game, x, y, stage = 0) { 
        super(game, x, y, COLORS.ENEMY); 
        const diffMult = game.difficulty === 'easy' ? 0.8 : (game.difficulty === 'hard' ? 1.2 : 1); 
        const r = Math.random();
        if (stage > 5 && r < 0.15) this.variant = 'ELITE';
        else if (stage > 2 && r < 0.4) this.variant = 'HEAVY';
        else if (r < 0.6) this.variant = 'FAST';
        else this.variant = 'BASIC';

        if (this.variant === 'FAST') { this.speed = (2.5 + Math.min(stage * 0.05, 0.8)) * diffMult; this.health = 1; this.color = '#FF9999'; }
        else if (this.variant === 'HEAVY') { this.speed = (1.0 + Math.min(stage * 0.02, 0.5)) * diffMult; this.health = 3; this.color = '#777777'; }
        else if (this.variant === 'ELITE') { this.speed = (1.8 + Math.min(stage * 0.05, 0.8)) * diffMult; this.health = 1; this.level = Math.min(3, 1 + Math.floor(stage / 10)); this.color = '#FF55FF'; }
        else { this.speed = (1.5 + Math.min(stage * 0.05, 0.8)) * diffMult; this.health = 1; this.level = Math.min(3, Math.floor(stage / 15)); }
        
        this.dirTimer = 0; 
    } 
    update() { 
        super.update();
        if (this.canFly && this.flyTimer > 0) {
            this.flyTimer--;
            if (this.flyTimer <= 0) {
                if (!this.game.map.isBlocked(this.x, this.y, this.width, this.height, false, this.canBoat, false)) {
                    this.canFly = false;
                    this.game.showFloatingText('降落！', this.x, this.y, '#ccc');
                } else {
                    this.flyTimer = 1;
                }
            }
        } 
        if (this.game.enemyFrozenTimer > 0) return;
        if (this.dirTimer <= 0) { this.direction = ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)]; this.dirTimer = 30 + Math.random() * 60; } else this.dirTimer--; const ox = this.x; const oy = this.y; this.move(this.direction); if (this.x === ox && this.y === oy) this.dirTimer = 0; if (Math.random() * 100 < (this.variant==='ELITE'? 4 : 2)) this.shoot(); 
    } 
}

class Boss extends Enemy {
    constructor(game, x, y, stage = 0) {
        super(game, x, y, stage);
        const difficulty = Math.min(stage / 50, 1);
        
        const variants = ['SPREAD', 'HEAVY', 'FAST'];
        this.bossVariant = variants[Math.floor(Math.random() * variants.length)];
        
        let scaleMult = 1;
        let hpMult = 1;
        let speedMult = 1;
        
        if (this.bossVariant === 'HEAVY') {
            scaleMult = 1.3; hpMult = 1.8; speedMult = 0.5;
            this.title = ['JUGGERNAUT', 'DOOMSDAY', 'RED FURY'][Math.floor(Math.random()*3)];
            this.color = `hsl(${0 + Math.random() * 20}, 70%, 40%)`;
        } else if (this.bossVariant === 'FAST') {
            scaleMult = 0.8; hpMult = 0.6; speedMult = 1.6;
            this.title = ['VIPER', 'PHANTOM', 'GHOST'][Math.floor(Math.random()*3)];
            this.color = `hsl(${100 + Math.random() * 40}, 80%, 40%)`;
        } else {
            this.title = ['IRON TITAN', 'WAR MACHINE', 'MECH OVERLORD'][Math.floor(Math.random()*3)];
            this.color = `hsl(${200 + Math.random() * 40}, 60%, 35%)`;
        }
        
        const scale = (1.5 + Math.random() * 0.5 + difficulty * 0.5) * scaleMult;
        this.width = TILE_SIZE * scale; this.height = TILE_SIZE * scale;
        this.health = Math.floor((50 + stage * 8) * scale * hpMult); 
        this.maxHealth = this.health;
        this.speed = (1.0 + difficulty * 0.8) * speedMult; 
        this.isBoss = true;
        this.turretAngle = 0; this.turretTargetAngle = 0;
        this.barrelLength = this.width * 0.6;
        this.level = 2 + Math.floor(difficulty * 2);
        this.metalColor = `hsl(0, 0%, ${40 + Math.random() * 20}%)`;
        
        const weathers = ['RAIN', 'SNOW', 'WIND', 'LIGHTNING'];
        this.game.weather = weathers[Math.floor(Math.random() * weathers.length)];
    }
    shoot() {
        if (this.cooldown > 0) return; 
        
        let cdBase = 25;
        let offsets = [-0.25, 0, 0.25];
        
        if (this.bossVariant === 'HEAVY') {
            cdBase = 45;
            offsets = [0];
        } else if (this.bossVariant === 'FAST') {
            cdBase = 15;
            offsets = [-0.15, 0.15];
        } else {
            cdBase = 25;
            offsets = [-0.25, 0, 0.25];
        }
        
        this.cooldown = Math.max(cdBase, cdBase + 20 - this.level * 4);
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        
        for (let offset of offsets) {
            const angle = this.turretAngle + offset;
            const bx = cx + Math.cos(angle) * (this.barrelLength + 10);
            const by = cy + Math.sin(angle) * (this.barrelLength + 10);
            
            let normAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
            let dir = 'DOWN';
            if (normAngle > -Math.PI/4 && normAngle <= Math.PI/4) dir = 'RIGHT';
            else if (normAngle > Math.PI/4 && normAngle <= 3*Math.PI/4) dir = 'DOWN';
            else if (normAngle > -3*Math.PI/4 && normAngle <= -Math.PI/4) dir = 'UP';
            else dir = 'LEFT';
            
            const gx = Math.floor(bx / TILE_SIZE);
            const gy = Math.floor(by / TILE_SIZE);
            if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
                const tile = this.game.map.grid[gy][gx];
                if (tile !== TILE_TYPES.BRICK && tile !== TILE_TYPES.STEEL) {
                    let blvl = this.level;
                    if (this.bossVariant === 'HEAVY') blvl += 2; // Heavy bullets explode larger
                    this.game.bullets.push(new Bullet(this.game, this, bx - 8, by - 8, dir, blvl));
                }
            }
        }
        audio.play('shoot');
    }
    update() {
        super.update();
        if (this.canFly && this.flyTimer > 0) {
            this.flyTimer--;
            if (this.flyTimer <= 0) {
                if (!this.game.map.isBlocked(this.x, this.y, this.width, this.height, false, this.canBoat, false)) {
                    this.canFly = false;
                    this.game.showFloatingText('降落！', this.x, this.y, '#ccc');
                } else {
                    this.flyTimer = 1;
                }
            }
        }
        if (this.game.enemyFrozenTimer > 0) return;
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
            if (nearestDist < TILE_SIZE * 15 && Math.random() < 0.05) this.shoot();
        }
        let diff = this.turretTargetAngle - this.turretAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.turretAngle += diff * 0.1;
        
        for (const p of this.game.players) {
            if (!p.alive) continue;
            if (this.x < p.x + p.width && this.x + this.width > p.x && this.y < p.y + p.height && this.y + this.height > p.y) {
                p.destroy(this, 999);
            }
        }
    }
    destroy(killer, damage = 1) {
        this.health -= damage; 
        this.game.effects.push(new Effect(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 'EXPLOSION', 2.5));
        audio.play('hit');
        const oldColor = this.color;
        this.color = '#ffffff';
        setTimeout(() => { if (this.alive) this.color = oldColor; }, 100);

        if (this.health <= 0) {
            this.alive = false; this.game.weather = 'NONE';
            for (let i = 0; i < 12; i++) {
                const standardTypes = [POWERUP_TYPES.SHIELD, POWERUP_TYPES.BOMB, POWERUP_TYPES.SHOVEL, POWERUP_TYPES.TIME, POWERUP_TYPES.LIFE, POWERUP_TYPES.STAR];
                const angle = (i / 12) * Math.PI * 2;
                const dist = TILE_SIZE * 3;
                let px = this.x + this.width/2 + Math.cos(angle) * dist - 32;
                let py = this.y + this.height/2 + Math.sin(angle) * dist - 32;
                px = Math.max(0, Math.min(CANVAS_SIZE - 64, px));
                py = Math.max(0, Math.min(CANVAS_SIZE - 64, py));
                this.game.powerUps.push(new PowerUp(this.game, px, py, standardTypes[Math.floor(Math.random()*standardTypes.length)]));
            }
            
            for(let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.game.effects.push(new Effect(this.x + Math.random()*this.width, this.y + Math.random()*this.height, 'EXPLOSION', 3));
                    audio.play('explosion');
                }, i * 200);
            }
            this.game.effects.push(new Effect(this.x + this.width/2, this.y + this.height/2, 'EXPLOSION', 8));
            this.game.shakeScreen(40);
            
            this.game.baseHealth = this.game.maxBaseHealth;
            this.game.fortifyBase();
            this.game.enemies.forEach(e => { if (e !== this && e.alive) e.destroy(killer, 999); });
            
            if (killer instanceof Player) { 
                killer.score += 20000; 
                killer.level = Math.max(killer.level, 2); 
                killer.speed = Math.min(8, 4 + killer.level * 0.15);
                killer.setShield(600);
                this.game.showFloatingText('+20000', this.x + this.width/2, this.y - 20, '#ff0');
                this.game.showAnnouncement('BOSS 陨落! BOSS DESTROYED!', '#ff0');
                this.game.showAnnouncement('基地防御加强! BASE FORTIFIED!', '#0f0');
                this.game.updateHUD(); 
            }
        }
    }
    draw(ctx) {
        const px = this.x; const py = this.y; const w = this.width; const h = this.height;
        const cx = px + w / 2; const cy = py + h / 2;
        ctx.save();
        
        const cBase = this.color;
        const cHighlight = this.metalColor;
        
        ctx.fillStyle = cBase; ctx.fillRect(px, py, w, h);
        ctx.fillStyle = cHighlight; ctx.fillRect(px + 4, py + 4, w - 8, h - 8);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const offset = 8 + i * 6;
            ctx.strokeRect(px + offset, py + offset, w - offset * 2, h - offset * 2);
        }
        
        ctx.fillStyle = '#222';
        ctx.fillRect(px - 6, py + 4, 8, h - 8);
        ctx.fillRect(px + w - 2, py + 4, 8, h - 8);
        ctx.fillStyle = '#111';
        for (let i = 0; i < h; i += 10) {
            ctx.fillRect(px - 6, py + i, 8, 5);
            ctx.fillRect(px + w - 2, py + i, 8, 5);
        }
        
        ctx.fillStyle = '#444'; ctx.fillRect(px + w/2 - 20, py + h/2 - 20, 40, 40);
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
        
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(this.turretAngle);
        ctx.fillStyle = this.bossVariant === 'HEAVY' ? '#a44' : (this.bossVariant === 'FAST' ? '#4a4' : '#44a'); 
        ctx.fillRect(0, -5, this.barrelLength, 10);
        
        if (this.bossVariant === 'SPREAD') {
            ctx.fillStyle = '#4a4a5a'; 
            ctx.rotate(-0.25); ctx.fillRect(0, -3, this.barrelLength - 10, 6); ctx.rotate(0.5);
            ctx.fillRect(0, -3, this.barrelLength - 10, 6); ctx.rotate(-0.25);
        } else if (this.bossVariant === 'FAST') {
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(0, -12, this.barrelLength, 6);
            ctx.fillRect(0, 6, this.barrelLength, 6);
        }
        
        ctx.fillStyle = '#5a5a6a'; ctx.fillRect(this.barrelLength - 15, -7, 15, 14);
        ctx.fillStyle = '#6a6a7a'; ctx.fillRect(this.barrelLength - 8, -4, 8, 8);
        ctx.fillStyle = '#7a7a8a'; ctx.fillRect(this.barrelLength - 3, -2, 6, 4);
        
        ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeStyle = '#5a5a6a'; ctx.lineWidth = 1; ctx.strokeRect(-8, -8, 16, 16);
        ctx.restore();
        
        ctx.fillStyle = this.color === '#ffffff' ? '#ffffff' : (this.bossVariant === 'HEAVY' ? '#ff4444' : (this.bossVariant === 'FAST' ? '#44ff44' : '#44aaff')); 
        ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
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
        this.players = []; this.enemies = []; this.bullets = []; this.effects = []; this.powerUps = []; this.fortifyTimer = 0; this.spawnTimer = 0; this.enemyFrozenTimer = 0;
        this.currentStage = 0; this.gameState = 'START'; this.lives = 3; this.paused = false;
        this.highScore = parseInt(localStorage.getItem('tankBattleHighScore') || '0');
        this.baseHealth = 5; this.maxBaseHealth = 5;
        this.weather = 'NONE'; this.weatherParticles = [];
        this.shakeX = 0; this.shakeY = 0; this.shakeTimer = 0;
        this.announcements = [];
        this.floatingTexts = [];
        this.pausePressed = false;
        this.bossWarning = 0;
        this.lastEnemyCount = 0;
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
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.focus();
        this.canvas.addEventListener('click', () => this.canvas.focus());
        this.loop();
    }
    shakeScreen(intensity) { this.shakeTimer = intensity; this.shakeIntensity = intensity; }
    showAnnouncement(text, color = '#fff') { this.announcements.push({ text, color, timer: 120, y: CANVAS_SIZE / 2 }); }
    showFloatingText(text, x, y, color = '#fff') { this.floatingTexts.push({ text, x, y, color, timer: 60, vy: -2 }); }
    showTip(text, duration = 300) {
        const banner = document.getElementById('tips-banner');
        if (banner) {
            banner.innerText = text;
            banner.classList.remove('hidden');
            this.tipTimer = duration;
        }
    }
    startGame() {
        audio.init();
        audio.play('start');
        const levelInput = document.getElementById('start-level');
        const startLevel = Math.max(1, Math.min(1000, parseInt(levelInput.value) || 1)) - 1;
        this.currentStage = startLevel;
        this.lives = 3;
        this.players = [];
        this.difficulty = document.querySelector('.diff-btn.active')?.dataset.diff || 'normal';
        this.startLevel();
        document.getElementById('hud').classList.remove('hidden');
        if (this.input.isMobile) document.getElementById('touch-controls').classList.remove('hidden');
        this.canvas.focus();
    }
    startLevel() {
        this.gameState = 'STAGE_START'; this.stageStartTimer = 120;
        document.getElementById('start-screen').classList.add('hidden'); document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('stage-info').innerText = `关卡 Stage ${this.currentStage + 1}`;

        this.map.reset(this.currentStage); this.bullets = []; this.enemies = []; this.effects = []; this.powerUps = []; this.fortifyTimer = 0; this.enemyFrozenTimer = 0;
        this.stageClearTimer = 0;
        this.currentLevel = this.map.currentLevel;
        const diffMult = this.difficulty === 'easy' ? 0.7 : (this.difficulty === 'hard' ? 1.3 : 1);
        this.enemiesRemaining = Math.floor(this.currentLevel.totalEnemies * diffMult);
        if (this.currentStage === 0) { this.baseHealth = 5; this.maxBaseHealth = 5; }
        else { this.baseHealth = this.maxBaseHealth; }
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
        
        const p1LvlEl = document.getElementById('p1-level');
        const p2LvlEl = document.getElementById('p2-level');
        const getWeaponHTML = (level) => {
            if (level >= 4) return "<span style='color:#f0f;'>追踪激光(紫)</span>";
            if (level >= 3) return "<span style='color:#0ff;'>穿透激光(青)</span>";
            if (level >= 2) return "<span style='color:#f00;'>跟踪导弹(红)</span>";
            if (level >= 1) return "<span style='color:#ff0;'>强化高爆(黄)</span>";
            return "<span style='color:#fff;'>普通炮弹(白)</span>";
        };
        if(p1LvlEl) p1LvlEl.innerHTML = this.players[0].alive ? `火力: Lv.${this.players[0].level} [${getWeaponHTML(this.players[0].level)}]` : `DEAD`;
        if(p2LvlEl) p2LvlEl.innerHTML = this.players[1].alive ? `火力: Lv.${this.players[1].level} [${getWeaponHTML(this.players[1].level)}]` : `DEAD`;

        document.getElementById('lives-info').innerText = `生命 Lives: ❤️x${this.lives}`;
        document.getElementById('enemies-info').innerText = `敌人 Enemies: ${this.enemiesRemaining + this.enemies.length}`;
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

        if (this.input.isDown('KeyP') && !this.pausePressed) { this.paused = !this.paused; this.pausePressed = true; }
        if (!this.input.isDown('KeyP')) this.pausePressed = false;
        if (this.paused) return;

        if (this.tipTimer > 0) {
            this.tipTimer--;
            if (this.tipTimer <= 0) {
                const banner = document.getElementById('tips-banner');
                if (banner) banner.classList.add('hidden');
            }
        }

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
        if (this.enemyFrozenTimer > 0) this.enemyFrozenTimer--;

        const bossChance = this.currentStage < 5 ? 0 : (this.currentStage < 20 ? 0.0002 : 0.0005);
        if (Math.random() < bossChance && !this.enemies.some(e => e.isBoss) && !this.bossWarning) {
            this.bossWarning = 180;
            this.showAnnouncement('警告! BOSS降临! BOSS INCOMING!', '#f00');
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
                setTimeout(() => { if (this.gameState === 'PLAYING') { this.enemies.push(new Boss(this, spawnPos.x, spawnPos.y, this.currentStage)); this.updateHUD(); } }, 1000);
            }
        }

        if (this.fortifyTimer > 0) { this.fortifyTimer--; if (this.fortifyTimer === 0) this.unfortifyBase(); }
        
        // Random Airdrop for Rare Items
        if (Math.random() < 0.0001) {
            const px = TILE_SIZE * 2 + Math.random() * (CANVAS_SIZE - TILE_SIZE * 4);
            const py = TILE_SIZE * 2 + Math.random() * (CANVAS_SIZE - TILE_SIZE * 4);
            const rareTypes = [POWERUP_TYPES.MAX_WEAPON, POWERUP_TYPES.BOAT, POWERUP_TYPES.FLY];
            const type = rareTypes[Math.floor(Math.random() * rareTypes.length)];
            this.powerUps.push(new PowerUp(this, px, py, type));
            this.effects.push(new Effect(px + 32, py + 32, 'SPAWN', 5));
            this.showAnnouncement('天降奇遇 AIRDROP!', '#0ff');
        }

        if (this.enemiesRemaining > 0 && this.enemies.length < Math.min(4 + Math.floor(this.currentStage / 10), 8)) {
            this.spawnTimer--;
            if (this.spawnTimer <= 0) {
                const sx = [TILE_SIZE * 2, TILE_SIZE * 12, TILE_SIZE * 22][Math.floor(Math.random() * 3)]; const sy = TILE_SIZE * 2; this.effects.push(new Effect(sx + TILE_SIZE, sy + TILE_SIZE, 'SPAWN'));
                setTimeout(() => { if (this.gameState === 'PLAYING') { this.enemies.push(new Enemy(this, sx, sy, this.currentStage)); this.enemiesRemaining--; this.updateHUD(); } }, 1000); this.spawnTimer = 180;
            }
        } else if (this.enemiesRemaining === 0 && this.enemies.length === 0) {
            if (this.stageClearTimer === 0) {
                this.stageClearTimer = 300;
                this.showAnnouncement('奖励时间 BONUS TIME: 5s!', '#0f0');
            } else {
                this.stageClearTimer--;
                if (this.stageClearTimer <= 0) {
                    this.gameState = 'STAGE_CLEAR';
                    setTimeout(() => this.nextLevel(), 2000);
                }
            }
        }
        
        this.players.forEach(p => p.update()); this.enemies.forEach(e => e.update());
        this.bullets.forEach(b => b.update());
        this.effects.forEach(e => e.update());
        this.powerUps.forEach(p => p.update());
        this.bullets = this.bullets.filter(b => b.active);
        this.effects = this.effects.filter(e => e.active);
        this.powerUps = this.powerUps.filter(p => p.active);
        this.enemies = this.enemies.filter(e => e.alive);
        if (this.enemies.length !== this.lastEnemyCount) { this.updateHUD(); this.lastEnemyCount = this.enemies.length; }
        if (this.players.every(p => !p.alive) && this.lives === 0) this.gameOver();
    }
    draw() {
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.gameState === 'STAGE_START') {
            const progress = 1 - this.stageStartTimer / 120;
            this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            this.ctx.fillStyle = '#aaa'; this.ctx.font = '60px "Courier New"'; this.ctx.textAlign = 'center';
            this.ctx.globalAlpha = progress < 0.1 ? progress * 10 : (progress > 0.8 ? (1 - progress) * 5 : 1);
            this.ctx.fillText(`关卡 Stage ${this.currentStage + 1}`, CANVAS_SIZE/2, CANVAS_SIZE/2 - 20);
            this.ctx.font = '30px "Courier New"';
            this.ctx.fillText(`敌人 Enemies: ${this.enemiesRemaining}`, CANVAS_SIZE/2, CANVAS_SIZE/2 + 30);
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
            if (this.baseHealth > 0 && this.baseHealth <= 2) {
                this.ctx.save();
                this.ctx.fillStyle = `rgba(255, 0, 0, ${Math.abs(Math.sin(Date.now() / 200)) * 0.3})`;
                this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                this.ctx.fillStyle = '#f00';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                if (Math.floor(Date.now() / 500) % 2 === 0) {
                    this.ctx.fillText("🚨 大本营血量告急！速回防！ 🚨", CANVAS_SIZE/2, 100);
                }
                this.ctx.restore();
            }
            this.floatingTexts.forEach(t => { this.ctx.save(); this.ctx.fillStyle = t.color; this.ctx.font = 'bold 16px Arial'; this.ctx.textAlign = 'center'; this.ctx.globalAlpha = t.timer / 60; this.ctx.fillText(t.text, t.x, t.y); this.ctx.restore(); });
            this.announcements.forEach(a => { this.ctx.save(); const scale = 1 + Math.sin(a.timer / 10) * 0.1; this.ctx.translate(CANVAS_SIZE / 2, a.y); this.ctx.scale(scale, scale); this.ctx.fillStyle = '#000'; this.ctx.font = 'bold 48px Arial'; this.ctx.textAlign = 'center'; this.ctx.fillText(a.text, 2, 2); this.ctx.fillStyle = a.color; this.ctx.fillText(a.text, 0, 0); this.ctx.restore(); });
            if (this.gameState === 'STAGE_CLEAR') { this.ctx.fillStyle = 'rgba(0,0,0,0.5)'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); this.ctx.fillStyle = '#fff'; this.ctx.font = '60px "Courier New"'; this.ctx.textAlign = 'center'; this.ctx.fillText("过关 STAGE CLEAR!", CANVAS_SIZE/2, CANVAS_SIZE/2); }
            if (this.paused) { this.ctx.fillStyle = 'rgba(0,0,0,0.7)'; this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); this.ctx.fillStyle = '#fff'; this.ctx.font = '60px "Courier New"'; this.ctx.textAlign = 'center'; this.ctx.fillText("暂停 PAUSED", CANVAS_SIZE/2, CANVAS_SIZE/2 - 20); this.ctx.font = '24px "Courier New"'; this.ctx.fillText("按P键继续 Press P to resume", CANVAS_SIZE/2, CANVAS_SIZE/2 + 30); }
        }
        if (this.highScore > 0) { this.ctx.fillStyle = '#ff0'; this.ctx.font = '16px Arial'; this.ctx.textAlign = 'right'; this.ctx.fillText(`HIGH SCORE: ${this.highScore}`, CANVAS_SIZE - 10, CANVAS_SIZE - 10); }
    }
    drawForest() {
        this.ctx.save();
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (this.map.grid[y][x] === TILE_TYPES.FOREST) {
                    const px = x * TILE_SIZE; const py = y * TILE_SIZE;
                    const ts = TILE_SIZE;
                    this.ctx.fillStyle = 'rgba(20, 80, 20, 0.9)';
                    this.ctx.beginPath();
                    this.ctx.arc(px + ts*0.25, py + ts*0.25, ts*0.3, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.75, py + ts*0.25, ts*0.3, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.25, py + ts*0.75, ts*0.3, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.75, py + ts*0.75, ts*0.3, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.5, py + ts*0.5, ts*0.4, 0, Math.PI*2);
                    this.ctx.fill();
                    
                    this.ctx.fillStyle = 'rgba(40, 120, 40, 0.9)';
                    this.ctx.beginPath();
                    this.ctx.arc(px + ts*0.3, py + ts*0.3, ts*0.15, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.7, py + ts*0.7, ts*0.15, 0, Math.PI*2);
                    this.ctx.arc(px + ts*0.5, py + ts*0.3, ts*0.2, 0, Math.PI*2);
                    this.ctx.fill();
                }
            }
        }
        this.ctx.restore();
    }
    loop() { this.update(); this.draw(); requestAnimationFrame(() => this.loop()); }
}
window.onload = () => new Game();

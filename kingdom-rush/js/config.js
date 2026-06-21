
const CONFIG = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    FPS: 60,
    
    STARTING_GOLD: 0,
    
    HERO: {
        baseDamage: 20,
        fireRate: 500, // ms
        projectileSpeed: 10,
        size: 20
    },

    UPGRADES: [
        { name: '攻击+', cost: 50, damageInc: 10, costMult: 1.5, type: 'damage' },
        { name: '射速+', cost: 100, fireRateMult: 0.85, costMult: 1.6, type: 'speed' },
        { name: '连弩', cost: 300, arrows: 1, costMult: 2.0, type: 'arrows' }
    ],
    
    ENEMY_TYPES: {
        INFANTRY: { id: 'infantry', name: '黄巾军', hp: 30, speed: 1.5, reward: 5, color: '#FFD700', size: 15 },
        CAVALRY: { id: 'cavalry', name: '西凉铁骑', hp: 80, speed: 2.2, reward: 15, color: '#8B4513', size: 20 },
        HEAVY: { id: 'heavy', name: '铁浮屠', hp: 250, speed: 0.6, reward: 30, color: '#808080', size: 25 }
    },

    ITEMS: {
        BOMB: { id: 'bomb', color: '#FF4500', size: 15, text: '🧨' },
        FREEZE: { id: 'freeze', color: '#00FFFF', size: 15, text: '📜' },
        HEAL: { id: 'heal', color: '#FFD700', size: 15, text: '🥟' }
    }
};

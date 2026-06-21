
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
        { name: '多重箭', cost: 300, arrows: 1, costMult: 2.0, type: 'arrows' }
    ],
    
    ENEMY_TYPES: {
        GOBLIN: { id: 'goblin', name: '哥布林', hp: 30, speed: 1.5, reward: 5, color: '#228B22', size: 15 },
        ORC: { id: 'orc', name: '兽人', hp: 80, speed: 1.0, reward: 15, color: '#556B2F', size: 20 },
        TROLL: { id: 'troll', name: '巨魔', hp: 200, speed: 0.6, reward: 30, color: '#8B0000', size: 25 }
    },

    ITEMS: {
        BOMB: { id: 'bomb', color: '#000000', size: 15, text: '💣' },
        FREEZE: { id: 'freeze', color: '#00FFFF', size: 15, text: '❄️' },
        HEAL: { id: 'heal', color: '#00FF00', size: 15, text: '💰' } // Changed to gold bag
    }
};

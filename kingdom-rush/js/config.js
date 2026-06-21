
const CONFIG = {
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 1000,
    FPS: 60,
    
    STARTING_GOLD: 0,
    
    HERO: {
        y: 850,
        baseDamage: 20,
        fireRate: 500, // ms
        projectileSpeed: 10,
        size: 20
    },

    UPGRADES: [
        { name: '全军攻击力提升', cost: 50, damageInc: 10, costMult: 1.5 },
        { name: '全军射速提升', cost: 100, fireRateMult: 0.9, costMult: 1.6 },
        { name: '全军多重箭', cost: 300, arrows: 1, costMult: 2.0 }
    ],
    
    ENEMY_TYPES: {
        GOBLIN: { id: 'goblin', name: '哥布林', hp: 30, speed: 1.5, reward: 5, color: '#228B22', size: 15 },
        ORC: { id: 'orc', name: '兽人', hp: 80, speed: 1.0, reward: 15, color: '#556B2F', size: 20 },
        TROLL: { id: 'troll', name: '巨魔', hp: 200, speed: 0.6, reward: 30, color: '#8B0000', size: 25 }
    },

    CASTLE_Y: 900,

    ITEMS: {
        BOMB: { id: 'bomb', color: '#000000', size: 15, text: '💣' },
        FREEZE: { id: 'freeze', color: '#00FFFF', size: 15, text: '❄️' },
        HEAL: { id: 'heal', color: '#00FF00', size: 15, text: '❤️' }
    }
};


const CONFIG = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    FPS: 60,
    
    STARTING_GOLD: 0,
    
    WEAPON_TIERS: [
        { id: 'bow', name: '木弓', damage: 20, speed: 10, fireRate: 500, sprite: 'ARROW', color: '#FFFFFF' },
        { id: 'gun', name: '火铳', damage: 45, speed: 15, fireRate: 350, sprite: 'BULLET', color: '#FFD700' },
        { id: 'cannon', name: '红衣大炮', damage: 120, speed: 8, fireRate: 800, sprite: 'CANNONBALL', color: '#A9A9A9', splash: 80 },
        { id: 'laser', name: '天基激光', damage: 60, speed: 30, fireRate: 150, sprite: 'LASER', color: '#00FFFF', pierce: true },
        { id: 'missile', name: '东风导弹', damage: 400, speed: 12, fireRate: 1000, sprite: 'MISSILE', color: '#FF4500', homing: true, splash: 150 },
        { id: 'nuke', name: '核爆(终极)', damage: 3000, speed: 5, fireRate: 2500, sprite: 'NUKE', color: '#32CD32', splash: 600 }
    ],

    UPGRADES: [
        { name: '武器进化', cost: 150, costMult: 2.5, type: 'weapon' },
        { name: '射速强化', cost: 100, fireRateMult: 0.85, costMult: 1.5, type: 'speed' },
        { name: '多重散射', cost: 300, arrows: 1, costMult: 2.0, type: 'arrows' }
    ],
    
    ENEMY_TYPES: {
        INFANTRY: { id: 'infantry', name: '黄巾军', hp: 30, speed: 1.5, reward: 5, color: '#FFD700', size: 15 },
        CAVALRY: { id: 'cavalry', name: '西凉铁骑', hp: 80, speed: 2.2, reward: 15, color: '#8B4513', size: 20 },
        HEAVY: { id: 'heavy', name: '铁浮屠', hp: 250, speed: 0.6, reward: 30, color: '#808080', size: 25 },
        BOSS_DOGE: { id: 'boss_doge', name: '精神小伙(狗头)', hp: 1500, speed: 0.4, reward: 500, color: '#FFD700', size: 40, jumpInterval: 1500, jumpRange: 2 },
        BOSS_CXK: { id: 'boss_cxk', name: '中分战神(唱跳)', hp: 2000, speed: 0.3, reward: 800, color: '#808080', size: 45, jumpInterval: 800, jumpRange: 1 },
        BOSS_BAOAN: { id: 'boss_baoan', name: '摸鱼保安(划水)', hp: 3000, speed: 0.2, reward: 1000, color: '#00BFFF', size: 50, jumpInterval: 3000, jumpRange: 3 }
    },

    ITEMS: {
        BOMB: { id: 'bomb', color: '#FF4500', size: 15, text: '🧨', name: '窜天猴(全屏轰炸)' },
        FREEZE: { id: 'freeze', color: '#00FFFF', size: 15, text: '📜', name: '定身符箓(全员罚站)' },
        HEAL: { id: 'heal', color: '#32CD32', size: 15, text: '🥟', name: '百年肉包(回血+钱)' },
        RAPID: { id: 'rapid', color: '#FF00FF', size: 15, text: '🐔', name: '尖叫鸡(攻速拉满)' },
        KNOCKBACK: { id: 'knockback', color: '#FFFFFF', size: 15, text: '🦁', name: '狮吼功(全员击退)' },
        RICH: { id: 'rich', color: '#FFD700', size: 15, text: '💸', name: '天降横财(+500G)' },
        MULTISHOT: { id: 'multishot', color: '#00FF00', size: 15, text: '🤖', name: '墨家机关(万箭齐发)' },
        POISON: { id: 'poison', color: '#8B0000', size: 15, text: '💩', name: '发霉窝窝头(扣除200G)' },
        SLOW: { id: 'slow', color: '#808080', size: 15, text: '🐢', name: '王八附体(攻速骤降)' },
        DISARM: { id: 'disarm', color: '#000000', size: 15, text: '🍌', name: '踩到香蕉皮(缴械三秒)' }
    }
};

const CONFIG = {
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 768,
    TILE_SIZE: 32,
    GRID_COLS: 32,
    GRID_ROWS: 24,
    FPS: 60,
    
    STARTING_GOLD: 200,
    STARTING_LIVES: 20,
    GOLD_PER_WAVE: 50,
    
    TOWER_TYPES: {
        ARCHER: {
            id: 'archer',
            name: '弓箭塔',
            cost: 80,
            range: 120,
            damage: 15,
            fireRate: 1000,
            color: '#8B4513',
            projectileSpeed: 8,
            projectileType: 'arrow',
            upgrades: [
                { cost: 60, damage: 25, range: 140, fireRate: 900 },
                { cost: 120, damage: 40, range: 160, fireRate: 800 }
            ]
        },
        MAGE: {
            id: 'mage',
            name: '法师塔',
            cost: 120,
            range: 100,
            damage: 25,
            fireRate: 1500,
            color: '#4B0082',
            projectileSpeed: 6,
            projectileType: 'magic',
            splash: 40,
            upgrades: [
                { cost: 100, damage: 40, range: 120, splash: 50, fireRate: 1400 },
                { cost: 180, damage: 60, range: 140, splash: 60, fireRate: 1300 }
            ]
        },
        CANNON: {
            id: 'cannon',
            name: '炮塔',
            cost: 150,
            range: 90,
            damage: 50,
            fireRate: 2000,
            color: '#2F4F4F',
            projectileSpeed: 5,
            projectileType: 'cannonball',
            splash: 60,
            upgrades: [
                { cost: 140, damage: 80, range: 100, splash: 70, fireRate: 1800 },
                { cost: 220, damage: 120, range: 110, splash: 80, fireRate: 1600 }
            ]
        },
        ICE: {
            id: 'ice',
            name: '冰塔',
            cost: 100,
            range: 110,
            damage: 10,
            fireRate: 1200,
            color: '#00CED1',
            projectileSpeed: 7,
            projectileType: 'ice',
            slowEffect: 0.5,
            slowDuration: 2000,
            upgrades: [
                { cost: 80, damage: 18, range: 130, slowEffect: 0.4, fireRate: 1100 },
                { cost: 160, damage: 28, range: 150, slowEffect: 0.3, fireRate: 1000 }
            ]
        }
    },
    
    ENEMY_TYPES: {
        GOBLIN: {
            id: 'goblin',
            name: '哥布林',
            hp: 60,
            speed: 2.5,
            reward: 10,
            color: '#228B22',
            size: 12
        },
        ORC: {
            id: 'orc',
            name: '兽人',
            hp: 120,
            speed: 1.8,
            reward: 20,
            color: '#556B2F',
            size: 14
        },
        TROLL: {
            id: 'troll',
            name: '巨魔',
            hp: 250,
            speed: 1.2,
            reward: 40,
            color: '#8B0000',
            size: 16
        },
        KNIGHT: {
            id: 'knight',
            name: '暗黑骑士',
            hp: 180,
            speed: 1.5,
            reward: 35,
            armor: 0.3,
            color: '#2F2F4F',
            size: 14
        },
        DRAGON: {
            id: 'dragon',
            name: '飞龙',
            hp: 350,
            speed: 2,
            reward: 60,
            flying: true,
            color: '#800080',
            size: 18
        }
    },
    
    HERO_TYPES: {
        WARRIOR: {
            id: 'warrior',
            name: '战士',
            hp: 300,
            damage: 30,
            range: 80,
            attackSpeed: 1000,
            color: '#FFD700',
            ability: { name: '旋风斩', cooldown: 15000, damage: 80, range: 100 },
            size: 14
        },
        MAGE: {
            id: 'mage_hero',
            name: '法师',
            hp: 200,
            damage: 45,
            range: 120,
            attackSpeed: 1500,
            color: '#9400D3',
            ability: { name: '暴风雪', cooldown: 20000, damage: 40, range: 150, slow: 0.3 },
            size: 14
        }
    },
    
    MAPS: [
        {
            id: 1,
            name: '翡翠森林',
            waves: 10,
            bgColor: '#1a3a1a',
            pathColor: '#8B7355',
            path: [
                {x: 0, y: 12},
                {x: 5, y: 12},
                {x: 5, y: 5},
                {x: 12, y: 5},
                {x: 12, y: 18},
                {x: 20, y: 18},
                {x: 20, y: 8},
                {x: 28, y: 8},
                {x: 28, y: 16},
                {x: 32, y: 16}
            ]
        },
        {
            id: 2,
            name: '荒芜之地',
            waves: 12,
            bgColor: '#3a2a1a',
            pathColor: '#6B5B45',
            path: [
                {x: 16, y: 0},
                {x: 16, y: 6},
                {x: 4, y: 6},
                {x: 4, y: 12},
                {x: 24, y: 12},
                {x: 24, y: 18},
                {x: 8, y: 18},
                {x: 8, y: 24}
            ]
        },
        {
            id: 3,
            name: '暗影城堡',
            waves: 15,
            bgColor: '#1a1a2e',
            pathColor: '#4a4a6a',
            path: [
                {x: 0, y: 4},
                {x: 8, y: 4},
                {x: 8, y: 12},
                {x: 16, y: 12},
                {x: 16, y: 4},
                {x: 24, y: 4},
                {x: 24, y: 20},
                {x: 16, y: 20},
                {x: 16, y: 16},
                {x: 32, y: 16}
            ]
        }
    ]
};

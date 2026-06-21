import os

base_dir = "/Users/clawbox/game-portal/kingdom-rush/js"

config_js = """
const CONFIG = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    FPS: 60,
    
    STARTING_GOLD: 0,
    
    WEAPON_TIERS: [
        { id: 'bow', name: '长弓', damage: 20, speed: 10, fireRate: 500, sprite: 'ARROW', color: '#FFFFFF' },
        { id: 'crossbow', name: '诸葛连弩', damage: 45, speed: 15, fireRate: 350, sprite: 'BOLT', color: '#FFD700' },
        { id: 'trebuchet', name: '霹雳车', damage: 120, speed: 8, fireRate: 800, sprite: 'ROCK', color: '#A9A9A9', splash: 80 },
        { id: 'ballista', name: '八牛床弩', damage: 60, speed: 30, fireRate: 150, sprite: 'BALLISTA', color: '#00FFFF', pierce: true },
        { id: 'firedragon', name: '火龙出水', damage: 400, speed: 12, fireRate: 1000, sprite: 'DRAGON', color: '#FF4500', homing: true, splash: 150 },
        { id: 'zhentianlei', name: '万人敌(震天雷)', damage: 3000, speed: 5, fireRate: 2500, sprite: 'BOMB_WEAPON', color: '#FF0000', splash: 600 }
    ],

    UPGRADES: [
        { name: '神兵锻造', cost: 150, costMult: 2.5, type: 'weapon' },
        { name: '轻功神行', cost: 100, fireRateMult: 0.85, costMult: 1.5, type: 'speed' },
        { name: '万箭齐发', cost: 300, arrows: 1, costMult: 2.0, type: 'arrows' }
    ],
    
    ENEMY_TYPES: {
        INFANTRY: { id: 'infantry', name: '黄巾军', hp: 30, speed: 1.5, reward: 5, color: '#FFD700', size: 15 },
        CAVALRY: { id: 'cavalry', name: '西凉铁骑', hp: 80, speed: 2.2, reward: 15, color: '#8B4513', size: 20 },
        HEAVY: { id: 'heavy', name: '铁浮屠', hp: 250, speed: 0.6, reward: 30, color: '#808080', size: 25 },
        BOSS_LUBU: { id: 'boss_lubu', name: '无双吕布(飞将)', hp: 1500, speed: 0.4, reward: 500, color: '#FF0000', size: 40, jumpInterval: 1500, jumpRange: 2 },
        BOSS_ZHANGJIAO: { id: 'boss_zhangjiao', name: '天公张角(妖术)', hp: 2000, speed: 0.3, reward: 800, color: '#FFD700', size: 45, jumpInterval: 800, jumpRange: 1 },
        BOSS_DONGZHUO: { id: 'boss_dongzhuo', name: '魔王董卓(肉山)', hp: 3000, speed: 0.2, reward: 1000, color: '#8A2BE2', size: 50, jumpInterval: 3000, jumpRange: 3 }
    },

    ITEMS: {
        BOMB: { id: 'bomb', color: '#FF4500', size: 15, text: '🔥', name: '业火红莲(全屏轰炸)' },
        FREEZE: { id: 'freeze', color: '#00FFFF', size: 15, text: '📜', name: '奇门遁甲(全员罚站)' },
        HEAL: { id: 'heal', color: '#32CD32', size: 15, text: '🥟', name: '军粮包子(回血+钱)' },
        RAPID: { id: 'rapid', color: '#FF00FF', size: 15, text: '🥁', name: '击鼓进军(攻速拉满)' },
        KNOCKBACK: { id: 'knockback', color: '#FFFFFF', size: 15, text: '🦁', name: '张飞怒吼(全员击退)' },
        RICH: { id: 'rich', color: '#FFD700', size: 15, text: '💰', name: '劫取辎重(+500G)' },
        MULTISHOT: { id: 'multishot', color: '#00FF00', size: 15, text: '🏹', name: '草船借箭(弓弩暴走)' },
        POISON: { id: 'poison', color: '#8B0000', size: 15, text: '🍷', name: '鸩酒(扣除200G)' },
        SLOW: { id: 'slow', color: '#808080', size: 15, text: '🐢', name: '深陷泥沼(攻速骤降)' },
        DISARM: { id: 'disarm', color: '#000000', size: 15, text: '💨', name: '妖风大作(缴械三秒)' }
    }
};
"""

sprites_js = """
const SPRITE_PALETTE = {
    '0': 'transparent',
    '1': '#000000', // Outline/Eyes
    '2': '#FFCDB2', // Skin
    '3': '#FFFFFF', // White
    '4': '#FF0000', // Red (Lu Bu)
    '5': '#8B4513', // Brown
    '6': '#808080', // Grey
    '7': '#FFD700', // Gold (Zhang Jiao)
    '8': '#8A2BE2', // Purple (Dong Zhuo)
    '9': '#006400', // Dark Green
    'A': '#00FFFF', // Cyan
    'B': '#32CD32'  // Lime
};

const SPRITES = {
    HERO: [
        "00004440000",
        "00004440000",
        "00077777000",
        "00677777600",
        "06622222660",
        "06612221660",
        "00066666000",
        "00CCCCCCC00",
        "06C6CCC6C60",
        "066C666C660",
        "00660006600"
    ],
    INFANTRY: [
        "000777000",
        "007777700",
        "002121200",
        "002222200",
        "005555500",
        "065555560",
        "005555500",
        "001101100"
    ],
    CAVALRY: [
        "00000220000",
        "00002120000",
        "00004440000",
        "00554445500",
        "05555555550",
        "55155555155",
        "55555555555",
        "05500000550",
        "01100000110"
    ],
    HEAVY: [
        "0006666000",
        "0066666600",
        "0666116660",
        "0666666660",
        "0666666660",
        "6666666666",
        "6666666666",
        "6666666666",
        "0666006660",
        "0666006660",
        "0111001110"
    ],
    BOSS_LUBU: [
        "000044440000",
        "000444444000",
        "004144441400",
        "004441144400",
        "000444444000",
        "004444444400",
        "044044440440",
        "000044440000",
        "000010010000"
    ],
    BOSS_ZHANGJIAO: [
        "000077770000",
        "000777777000",
        "007177771700",
        "007771177700",
        "000777777000",
        "007777777700",
        "077077770770",
        "000077770000",
        "000010010000"
    ],
    BOSS_DONGZHUO: [
        "000088880000",
        "000888888000",
        "008188881800",
        "008881188800",
        "000888888000",
        "008888888800",
        "088088880880",
        "000088880000",
        "000010010000"
    ],
    ARROW: [
        "0110", "1661", "0110", "0550", "0550", "0550", "0550", "1441", "1441"
    ],
    BOLT: [
        "0770", "7777", "7777", "0770"
    ],
    ROCK: [
        "06660", "66366", "63666", "66666", "06660"
    ],
    BALLISTA: [
        "AA", "33", "33", "33", "33", "33", "33", "33", "33", "AA"
    ],
    DRAGON: [
        "004400", "047740", "043340", "033330", "033330", "033330", "166661", "166661", "440044"
    ],
    BOMB_WEAPON: [
        "00411400", "04133140", "41333314", "41333314", "41333314", "41333314", "04133140", "00411400"
    ]
};

function drawSprite(ctx, spriteObj, x, y, sizeMultiplier, dynamicColor) {
    if (!spriteObj) return;
    const rows = spriteObj.length;
    const cols = spriteObj[0].length;
    const pSize = sizeMultiplier;
    
    const startX = x - (cols * pSize) / 2;
    const startY = y - (rows * pSize) / 2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const char = spriteObj[r][c];
            if (char === '0') continue;
            
            let color = SPRITE_PALETTE[char];
            if (char === 'C') color = dynamicColor;
            
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(startX + c * pSize, startY + r * pSize, pSize, pSize);
            }
        }
    }
}
"""

with open(os.path.join(base_dir, 'config.js'), 'w') as f:
    f.write(config_js)

with open(os.path.join(base_dir, 'sprites.js'), 'w') as f:
    f.write(sprites_js)

main_path = os.path.join(base_dir, 'main.js')
with open(main_path, 'r') as f:
    main_content = f.read()

# Fix Boss references in main.js
main_content = main_content.replace(
    """const bossTypes = [CONFIG.ENEMY_TYPES.BOSS_DOGE, CONFIG.ENEMY_TYPES.BOSS_CXK, CONFIG.ENEMY_TYPES.BOSS_BAOAN];""",
    """const bossTypes = [CONFIG.ENEMY_TYPES.BOSS_LUBU, CONFIG.ENEMY_TYPES.BOSS_ZHANGJIAO, CONFIG.ENEMY_TYPES.BOSS_DONGZHUO];"""
)

# Fix sound effect references in shoot()
main_content = main_content.replace(
    """if (weapon.id === 'cannon' || weapon.id === 'nuke') Audio.playExplosion();""",
    """if (weapon.id === 'trebuchet' || weapon.id === 'zhentianlei') Audio.playExplosion();"""
)

# Fix projectile size logic
main_content = main_content.replace(
    """const size = (p.sprite === 'NUKE') ? 4 : (p.sprite === 'CANNONBALL' || p.sprite === 'MISSILE') ? 3 : 2;""",
    """const size = (p.sprite === 'BOMB_WEAPON') ? 4 : (p.sprite === 'ROCK' || p.sprite === 'DRAGON') ? 3 : 2;"""
)

with open(main_path, 'w') as f:
    f.write(main_content)

print("Three Kingdoms Theme applied successfully!")

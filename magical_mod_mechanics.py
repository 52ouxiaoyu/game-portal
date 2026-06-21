import os

base_dir = "/Users/clawbox/game-portal/kingdom-rush/js"

# 1. Update config.js
config_js = """
const CONFIG = {
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    FPS: 60,
    
    STARTING_GOLD: 200,
    
    WEAPON_TIERS: [
        { id: 'bow', name: '长弓', damage: 20, speed: 10, fireRate: 500, sprite: 'ARROW', color: '#FFFFFF' },
        { id: 'crossbow', name: '诸葛连弩', damage: 45, speed: 15, fireRate: 350, sprite: 'BOLT', color: '#FFD700' },
        { id: 'trebuchet', name: '霹雳车', damage: 120, speed: 8, fireRate: 800, sprite: 'ROCK', color: '#A9A9A9', splash: 80 },
        { id: 'ballista', name: '八牛床弩', damage: 60, speed: 30, fireRate: 150, sprite: 'BALLISTA', color: '#00FFFF', pierce: true },
        { id: 'axe', name: '双刃回旋斧', damage: 150, speed: 15, fireRate: 600, sprite: 'AXE', color: '#FF4500', pierce: true, boomerang: true },
        { id: 'shockwave', name: '伏波冲击波', damage: 200, speed: 6, fireRate: 1000, sprite: 'SHOCKWAVE', color: '#00BFFF', pierce: true, isWave: true },
        { id: 'fan', name: '冰魄羽扇', damage: 80, speed: 12, fireRate: 400, sprite: 'FAN', color: '#E0FFFF', freeze: true },
        { id: 'firedragon', name: '火龙出水', damage: 400, speed: 12, fireRate: 1000, sprite: 'DRAGON', color: '#FF4500', homing: true, splash: 150 },
        { id: 'sword', name: '太虚剑阵', damage: 180, speed: 20, fireRate: 150, sprite: 'SWORD', color: '#FFD700', homing: true, pierce: true },
        { id: 'zhentianlei', name: '万人敌(震天雷)', damage: 5000, speed: 5, fireRate: 2500, sprite: 'BOMB_WEAPON', color: '#FF0000', splash: 600 }
    ],

    UPGRADES: [
        { name: '神兵锻造', cost: 80, costMult: 2.0, type: 'weapon' },
        { name: '轻功神行', cost: 50, fireRateMult: 0.85, costMult: 1.5, type: 'speed' },
        { name: '万箭齐发', cost: 150, arrows: 1, costMult: 2.0, type: 'arrows' }
    ],
    
    ENEMY_TYPES: {
        INFANTRY: { id: 'infantry', name: '黄巾军', hp: 30, speed: 1.0, reward: 10, color: '#FFD700', size: 15 },
        CAVALRY: { id: 'cavalry', name: '西凉铁骑', hp: 80, speed: 1.8, reward: 25, color: '#8B4513', size: 20 },
        HEAVY: { id: 'heavy', name: '铁浮屠', hp: 250, speed: 0.4, reward: 50, color: '#808080', size: 25 },
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

with open(os.path.join(base_dir, 'config.js'), 'w') as f:
    f.write(config_js)

# 2. Update sprites.js
with open(os.path.join(base_dir, 'sprites.js'), 'r') as f:
    sprites_content = f.read()

new_sprites = """    BOMB_WEAPON: [
        "00411400", "04133140", "41333314", "41333314", "41333314", "41333314", "04133140", "00411400"
    ],
    AXE: [
        "001100", "016610", "163361", "163361", "016610", "001100"
    ],
    SHOCKWAVE: [
        "0000000000000000",
        "A33333333333333A",
        "0A333333333333A0",
        "00AAAAAAAAAAAA00",
        "0000000000000000"
    ],
    FAN: [
        "003300", "03A300", "3AAA30", "3A3A30", "033300", "005000"
    ],
    SWORD: [
        "00300", "03A30", "03A30", "03A30", "03A30", "01710", "00700"
    ]
};"""
sprites_content = sprites_content.replace("""    BOMB_WEAPON: [
        "00411400", "04133140", "41333314", "41333314", "41333314", "41333314", "04133140", "00411400"
    ]
};""", new_sprites)

with open(os.path.join(base_dir, 'sprites.js'), 'w') as f:
    f.write(sprites_content)

# 3. Update main.js
with open(os.path.join(base_dir, 'main.js'), 'r') as f:
    main_content = f.read()

# Modify projectile creation in shoot()
target_projectile = """            this.projectiles.push({
                heroOwner: hero,
                x: targetX,
                y: hero.y - 20,
                vx: vx_straight,
                vy: -weapon.speed,
                damage: weapon.damage,
                color: weapon.color,
                sprite: weapon.sprite,
                homing: weapon.homing,
                splash: weapon.splash,
                pierce: weapon.pierce,
                piercedEnemies: new Set(),
                speedMultiplier: weapon.speed,
                alive: true
            });"""

replacement_projectile = """            this.projectiles.push({
                heroOwner: hero,
                x: targetX,
                y: hero.y - 20,
                vx: vx_straight,
                vy: -weapon.speed,
                damage: weapon.damage,
                color: weapon.color,
                sprite: weapon.sprite,
                homing: weapon.homing,
                splash: weapon.splash,
                pierce: weapon.pierce,
                boomerang: weapon.boomerang,
                isWave: weapon.isWave,
                freeze: weapon.freeze,
                rotation: 0,
                piercedEnemies: new Set(),
                speedMultiplier: weapon.speed,
                alive: true
            });"""
main_content = main_content.replace(target_projectile, replacement_projectile)

# Modify projectile rendering
target_proj_render = """        this.projectiles.forEach(p => {
            const size = (p.sprite === 'BOMB_WEAPON') ? 4 : (p.sprite === 'ROCK' || p.sprite === 'DRAGON') ? 3 : 2;
            drawSprite(ctx, SPRITES[p.sprite] || SPRITES.ARROW, p.x, p.y, size, p.color);
        });"""

replacement_proj_render = """        this.projectiles.forEach(p => {
            const size = (p.sprite === 'BOMB_WEAPON') ? 4 : (p.sprite === 'ROCK' || p.sprite === 'DRAGON' || p.sprite === 'SHOCKWAVE') ? 3 : 2;
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.sprite === 'AXE') {
                p.rotation += 0.3;
                ctx.rotate(p.rotation);
            } else if (p.sprite === 'SWORD' || p.sprite === 'DRAGON') {
                ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI/2);
            }
            drawSprite(ctx, SPRITES[p.sprite] || SPRITES.ARROW, 0, 0, size, p.color);
            ctx.restore();
        });"""
main_content = main_content.replace(target_proj_render, replacement_proj_render)

# Modify projectile update logic
target_proj_update = """        this.projectiles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.homing) {"""

replacement_proj_update = """        this.projectiles.forEach(p => {
            if (p.boomerang) {
                p.vy += 0.2; // Gravity makes it come back
            }
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.homing) {"""
main_content = main_content.replace(target_proj_update, replacement_proj_update)

# Add freeze effect to collision
target_hit_logic = """                    e.hp -= p.damage;
                    e.hitTimer = 5;"""

replacement_hit_logic = """                    e.hp -= p.damage;
                    e.hitTimer = 5;
                    if (p.freeze) {
                        e.frozenTimer = 180; // Freeze for 3 seconds
                    }"""
main_content = main_content.replace(target_hit_logic, replacement_hit_logic)

# Replace explosion check 
target_explosion_check = """if (weapon.id === 'trebuchet' || weapon.id === 'zhentianlei') Audio.playExplosion();"""
replacement_explosion_check = """if (weapon.id === 'trebuchet' || weapon.id === 'zhentianlei' || weapon.id === 'shockwave') Audio.playExplosion();"""
main_content = main_content.replace(target_explosion_check, replacement_explosion_check)

# Add hitbox expansion for shockwave
target_collision_check = """const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < e.type.size + 10) {"""
replacement_collision_check = """let hitbox = e.type.size + 10;
                if (p.isWave) hitbox += 60; // Much wider hitbox for shockwave
                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < hitbox) {"""
main_content = main_content.replace(target_collision_check, replacement_collision_check)

with open(main_path, 'w') as f:
    f.write(main_content)

print("Gameplay expansion applied successfully!")

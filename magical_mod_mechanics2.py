import os

base_dir = "/Users/clawbox/game-portal/kingdom-rush/js"
main_path = os.path.join(base_dir, 'main.js')

with open(os.path.join(base_dir, 'config.js'), 'r') as f:
    config_content = f.read()

# Already wrote config.js and sprites.js in the first script, but let's redo to be safe, actually no, the first script DID write config.js and sprites.js! It only failed at the end when writing main.js!
# Let me just patch main.js.

with open(main_path, 'r') as f:
    main_content = f.read()

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

target_hit_logic = """                    e.hp -= p.damage;
                    e.hitTimer = 5;"""

replacement_hit_logic = """                    e.hp -= p.damage;
                    e.hitTimer = 5;
                    if (p.freeze) {
                        e.frozenTimer = 180; // Freeze for 3 seconds
                    }"""
main_content = main_content.replace(target_hit_logic, replacement_hit_logic)

target_explosion_check = """if (weapon.id === 'trebuchet' || weapon.id === 'zhentianlei') Audio.playExplosion();"""
replacement_explosion_check = """if (weapon.id === 'trebuchet' || weapon.id === 'zhentianlei' || weapon.id === 'shockwave') Audio.playExplosion();"""
main_content = main_content.replace(target_explosion_check, replacement_explosion_check)

target_collision_check = """const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < e.type.size + 10) {"""
replacement_collision_check = """let hitbox = e.type.size + 10;
                if (p.isWave) hitbox += 60; // Much wider hitbox for shockwave
                const dist = Math.hypot(p.x - e.x, p.y - e.y);
                if (dist < hitbox) {"""
main_content = main_content.replace(target_collision_check, replacement_collision_check)

with open(main_path, 'w') as f:
    f.write(main_content)

print("Gameplay expansion main.js patched successfully!")

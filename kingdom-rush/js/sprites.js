const Sprites = {
    drawTower(ctx, x, y, type, level) {
        const size = CONFIG.TILE_SIZE;
        const half = size / 2;
        
        ctx.save();
        ctx.translate(x + half, y + half);
        
        const colors = CONFIG.TOWER_TYPES[type.toUpperCase()];
        const baseColor = colors.color;
        
        ctx.fillStyle = baseColor;
        ctx.fillRect(-12, -12, 24, 24);
        
        ctx.fillStyle = this.lighten(baseColor, 30);
        ctx.fillRect(-10, -10, 20, 4);
        
        ctx.fillStyle = this.darken(baseColor, 30);
        ctx.fillRect(-10, 6, 20, 4);
        
        if (level > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-2, -8, 4, 4);
            if (level > 1) {
                ctx.fillRect(-6, -8, 4, 4);
                ctx.fillRect(2, -8, 4, 4);
            }
        }
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    drawEnemy(ctx, x, y, type, hp, maxHp) {
        const enemy = CONFIG.ENEMY_TYPES[type.toUpperCase()];
        const size = enemy.size;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.darken(enemy.color, 40);
        ctx.beginPath();
        ctx.arc(0, 0, size - 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-3, -3, 2, 2);
        ctx.fillRect(1, -3, 2, 2);
        
        if (hp < maxHp) {
            const hpWidth = (size * 2) * (hp / maxHp);
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(-size, -size - 6, size * 2, 4);
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(-size, -size - 6, hpWidth, 4);
        }
        
        if (enemy.flying) {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(-size - 4, -2);
            ctx.lineTo(-size + 2, -6);
            ctx.lineTo(-size + 2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(size + 4, -2);
            ctx.lineTo(size - 2, -6);
            ctx.lineTo(size - 2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
    },
    
    drawHero(ctx, x, y, type, facingRight) {
        const hero = CONFIG.HERO_TYPES[type.toUpperCase()];
        const size = hero.size;
        
        ctx.save();
        ctx.translate(x, y);
        if (!facingRight) ctx.scale(-1, 1);
        
        ctx.fillStyle = hero.color;
        ctx.fillRect(-size/2, -size, size, size * 1.5);
        
        ctx.fillStyle = this.lighten(hero.color, 40);
        ctx.fillRect(-size/2 + 2, -size + 2, size - 4, 4);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -size + 4, 2, 2);
        ctx.fillRect(2, -size + 4, 2, 2);
        
        ctx.fillStyle = hero.color;
        ctx.fillRect(-size/2 - 4, -size/2, 4, 8);
        ctx.fillRect(size/2, -size/2, 4, 8);
        
        ctx.restore();
    },
    
    drawProjectile(ctx, x, y, type) {
        ctx.save();
        ctx.translate(x, y);
        
        switch(type) {
            case 'arrow':
                ctx.fillStyle = '#D2691E';
                ctx.fillRect(-1, -4, 2, 8);
                ctx.fillStyle = '#C0C0C0';
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(-2, -2);
                ctx.lineTo(2, -2);
                ctx.closePath();
                ctx.fill();
                break;
            case 'magic':
                ctx.fillStyle = '#9400D3';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#DDA0DD';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
            case 'cannonball':
                ctx.fillStyle = '#2F2F2F';
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#4a4a4a';
                ctx.beginPath();
                ctx.arc(-1, -1, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'ice':
                ctx.fillStyle = '#00CED1';
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(4, 0);
                ctx.lineTo(0, 5);
                ctx.lineTo(-4, 0);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                break;
        }
        ctx.restore();
    },
    
    drawAbilityEffect(ctx, x, y, type, radius, progress) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = 1 - progress;
        
        if (type === 'whirlwind') {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, radius * progress, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'blizzard') {
            ctx.fillStyle = '#ADD8E6';
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const r = radius * progress;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                ctx.fillRect(px - 2, py - 2, 4, 4);
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
    },
    
    lighten(color, amount) {
        const r = Math.min(255, parseInt(color.slice(1,3), 16) + amount);
        const g = Math.min(255, parseInt(color.slice(3,5), 16) + amount);
        const b = Math.min(255, parseInt(color.slice(5,7), 16) + amount);
        return `rgb(${r},${g},${b})`;
    },
    
    darken(color, amount) {
        const r = Math.max(0, parseInt(color.slice(1,3), 16) - amount);
        const g = Math.max(0, parseInt(color.slice(3,5), 16) - amount);
        const b = Math.max(0, parseInt(color.slice(5,7), 16) - amount);
        return `rgb(${r},${g},${b})`;
    }
};

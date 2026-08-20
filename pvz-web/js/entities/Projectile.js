class Projectile extends Entity {
    constructor(game, x, y, row) {
        super(game, x, y);
        this.row = row;
        this.speed = 300; // pixels per second
        this.damage = 20;
        this.radius = 10;
        
        // Z-sorting: keep projectiles above plants
        this.yOffset = -15; // Visually shoot from the snout
    }
    
    update(deltaTime) {
        this.x += this.speed * deltaTime;
        
        // Off screen check
        if (this.x > this.game.canvas.width) {
            this.isDead = true;
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = '#90EE90'; // Light green pea
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.yOffset, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

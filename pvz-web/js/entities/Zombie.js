class Zombie extends Entity {
    constructor(game, row, type = 'normal') {
        const x = game.canvas.width + 50;
        const y = game.board.offsetY + row * game.board.cellHeight + game.board.cellHeight / 2;
        super(game, x, y);
        this.row = row;
        this.type = type;
        
        this.hp = 200; // Normal zombie hp
        this.maxHp = 200;
        this.speed = 30; // pixels per second (very slow)
        this.damage = 50; // dps when eating
        
        this.state = 'WALKING'; // WALKING, EATING, DYING
        this.eatTarget = null; // Reference to the plant being eaten
        
        this.flashTimer = 0; // For damage flashing
    }
    
    update(deltaTime) {
        if (this.hp <= 0) {
            this.state = 'DYING';
        }
        
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
        }
        
        if (this.state === 'DYING') {
            // Simplified death animation (just disappear for now)
            this.isDead = true;
            return;
        }
        
        if (this.state === 'WALKING') {
            this.x -= this.speed * deltaTime;
            
            // Check if reached house
            if (this.x < 150) { // House line
                this.game.gameOver();
            }
            
            // Check collision with plant in same row
            const plant = this.game.entities.find(e => 
                e instanceof Plant && 
                e.row === this.row && 
                Math.abs(e.x - this.x) < 40 // Collision distance
            );
            
            if (plant && !plant.isDead) {
                this.state = 'EATING';
                this.eatTarget = plant;
            }
        } 
        else if (this.state === 'EATING') {
            if (this.eatTarget && !this.eatTarget.isDead) {
                this.eatTarget.hp -= this.damage * deltaTime;
            } else {
                // Target is dead, resume walking
                this.state = 'WALKING';
                this.eatTarget = null;
            }
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        this.flashTimer = 0.1; // Flash white for 0.1s
    }
    
    draw(ctx) {
        ctx.save();
        
        if (this.flashTimer > 0) {
            ctx.fillStyle = '#FFFFFF'; // White flash
        } else {
            ctx.fillStyle = '#8B4513'; // Saddle brown body
        }
        
        // Draw body (rectangle)
        const width = 30;
        const height = 70;
        ctx.fillRect(this.x - width/2, this.y - height/2 - 10, width, height);
        
        // Draw head
        ctx.fillStyle = this.flashTimer > 0 ? '#FFFFFF' : '#A9A9A9'; // Gray head
        ctx.beginPath();
        ctx.arc(this.x, this.y - height/2 - 20, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Health bar (for debug/MVP)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 20, this.y - 70, 40, 5);
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x - 20, this.y - 70, 40 * (this.hp / this.maxHp), 5);
        
        ctx.restore();
    }
}

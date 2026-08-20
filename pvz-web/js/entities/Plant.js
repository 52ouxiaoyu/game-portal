class Plant extends Entity {
    constructor(game, type) {
        super(game, 0, 0); // Position will be set by Board
        this.type = type;
        this.col = -1; // Set by Board
        
        // Define properties based on type (MVP: simple properties)
        if (type === 'peashooter') {
            this.hp = 300;
            this.color = '#00FF00'; // Green
            this.fireRate = 1.5; // seconds
            this.fireTimer = 0;
            this.cost = 100;
        } else if (type === 'sunflower') {
            this.hp = 300;
            this.color = '#FFFF00'; // Yellow
            this.sunRate = 10; // seconds
            this.sunTimer = 0;
            this.cost = 50;
        }
    }
    
    update(deltaTime) {
        if (this.hp <= 0) {
            this.isDead = true;
            this.game.board.grid[this.row][this.col] = null; // Clear from grid
            return;
        }
        
        // MVP Logic
        if (this.type === 'peashooter') {
            this.fireTimer += deltaTime;
            if (this.fireTimer >= this.fireRate) {
                // Check if there are zombies in the same lane ahead of us
                const hasZombieAhead = this.game.entities.some(e => 
                    e instanceof Zombie && 
                    e.row === this.row && 
                    e.x > this.x && 
                    !e.isDead
                );
                
                if (hasZombieAhead) {
                    this.fireTimer = 0;
                    this.game.entities.push(new Projectile(this.game, this.x + 20, this.y, this.row));
                } else {
                    // Cap timer so it fires immediately when zombie appears
                    this.fireTimer = this.fireRate; 
                }
            }
        } else if (this.type === 'sunflower') {
            this.sunTimer += deltaTime;
            if (this.sunTimer >= this.sunRate) {
                this.sunTimer = 0;
                // Generate a sun entity
                const targetY = this.y + 20; // Fall slightly below
                this.game.entities.push(new Sun(this.game, this.x, this.y - 20, targetY));
            }
        }
    }
    
    draw(ctx) {
        // Simple shape drawing for MVP
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.type === 'peashooter') {
            // Draw snout
            ctx.fillStyle = '#008000';
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 5, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'sunflower') {
            // Draw petals (simplified)
            ctx.fillStyle = '#FFA500'; // Orange border
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.stroke(); // Just outline for petals concept
        }
    }
}

class Plant extends Entity {
    constructor(game, type) {
        super(game, 0, 0); // Position will be set by Board
        this.type = type;
        this.col = -1; // Set by Board
        
        if (type === 'peashooter') {
            this.hp = 300;
            this.fireRate = 1.5;
            this.fireTimer = 0;
            this.element.src = 'assets/images/Plants/Peashooter/Peashooter.gif';
            this.yOffset = -20; // Offset for GIF centering
        } else if (type === 'sunflower') {
            this.hp = 300;
            this.sunRate = 10;
            this.sunTimer = 0;
            this.element.src = 'assets/images/Plants/SunFlower/SunFlower1.gif';
            this.yOffset = -20;
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.element.style.top = `${this.y + this.yOffset}px`;
        
        if (this.hp <= 0) {
            this.isDead = true;
            this.game.board.grid[this.row][this.col] = null; // Clear from grid
            return;
        }
        
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
                    this.game.entities.push(new Projectile(this.game, this.x + 20, this.y - 15, this.row));
                } else {
                    this.fireTimer = this.fireRate; 
                }
            }
        } else if (this.type === 'sunflower') {
            this.sunTimer += deltaTime;
            if (this.sunTimer >= this.sunRate) {
                this.sunTimer = 0;
                const targetY = this.y + 20;
                this.game.entities.push(new Sun(this.game, this.x, this.y - 20, targetY));
            }
        }
    }
}

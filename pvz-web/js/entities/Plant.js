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
            this.sunRate = 24.0; // Native PVZ is 24 seconds
            this.sunTimer = 0;
            this.element.src = 'assets/images/Plants/SunFlower/SunFlower1.gif';
            this.yOffset = -20;
        } else if (type === 'wallnut') {
            this.hp = 4000;
            this.element.src = 'assets/images/Plants/WallNut/WallNut.gif';
            this.yOffset = -15;
        } else if (type === 'cherrybomb') {
            this.hp = 300;
            this.element.src = 'assets/images/Plants/CherryBomb/CherryBomb.gif';
            this.yOffset = -15;
            this.explodeTimer = 1.0; // 1 second to explode
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
        } else if (this.type === 'wallnut') {
            if (this.hp < 1333 && this.element.src.indexOf('Wallnut_cracked2') === -1) {
                // Not perfectly smooth without proper preloading, but works
                // this.element.src = 'assets/images/Plants/WallNut/Wallnut_cracked2.gif';
            } else if (this.hp < 2666 && this.element.src.indexOf('Wallnut_cracked1') === -1 && this.hp >= 1333) {
                // this.element.src = 'assets/images/Plants/WallNut/Wallnut_cracked1.gif';
            }
        } else if (this.type === 'cherrybomb') {
            if (this.explodeTimer > 0) {
                this.explodeTimer -= deltaTime;
                if (this.explodeTimer <= 0) {
                    this.game.audioManager.play('splat'); // Use splat/explosion
                    this.element.src = 'assets/images/Plants/CherryBomb/Boom.gif';
                    
                    // Kill zombies in 3x3 area (roughly within 120px X and 1 row Y)
                    const zombies = this.game.entities.filter(e => e instanceof Zombie && !e.isDead);
                    for (let z of zombies) {
                        if (Math.abs(z.row - this.row) <= 1 && Math.abs(z.x - this.x) < 150) {
                            z.hp = 0;
                        }
                    }
                    
                    setTimeout(() => {
                        this.hp = 0; // Trigger death
                    }, 500); // Wait for boom animation
                }
            }
        }
    }
}

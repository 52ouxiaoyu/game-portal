class Projectile extends Entity {
    constructor(game, x, y, row) {
        super(game, x, y);
        this.row = row;
        this.speed = 300; // pixels per second
        this.damage = 20;
        this.radius = 10;
        
        this.element.src = 'assets/images/Plants/PB00.gif'; // Assuming this exists or Pea.gif
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.x += this.speed * deltaTime;
        
        // Off screen check
        if (this.x > this.game.canvas ? this.game.canvas.width : 900) {
            this.isDead = true;
        }
    }
}

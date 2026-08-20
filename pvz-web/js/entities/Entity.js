class Entity {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        
        // Z-sorting: entities with higher y value (closer to screen bottom) are drawn last
        this.zIndex = 0; 
        
        this.isDead = false;
        
        // For grid-based logic
        this.row = -1;
    }
    
    update(deltaTime) {
        // Base update method
    }
    
    draw(ctx) {
        // Base draw method (fallback)
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
}

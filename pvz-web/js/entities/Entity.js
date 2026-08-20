class Entity {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        
        this.isDead = false;
        this.row = -1;
        
        this.element = document.createElement('img');
        this.element.className = 'entity';
        this.element.style.pointerEvents = 'none'; // Prevent entities from blocking clicks
        this.game.entityLayer.appendChild(this.element);
    }
    
    update(deltaTime) {
        // Update DOM element position
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

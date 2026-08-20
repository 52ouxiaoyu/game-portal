class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.lastTime = 0;
        this.entities = []; // All game objects
        
        this.sunCount = 50;
        this.sunCountElement = document.getElementById('sun-count');
        
        this.state = 'PLAYING'; // PLAYING, GAMEOVER
        
        this.board = new Board(this);
        this.inputManager = new InputManager(this);
        this.waveManager = new WaveManager(this);
        this.collisionManager = new CollisionManager(this);
        
        this.skySunTimer = 0;
        this.skySunInterval = 8; // Drop a sun every 8 seconds
        
        this.initUI();
        
        // Start loop
        requestAnimationFrame((t) => this.loop(t));
    }
    
    initUI() {
        const seedBank = document.getElementById('seed-bank');
        
        const seeds = [
            { type: 'sunflower', cost: 50, name: '向日葵' },
            { type: 'peashooter', cost: 100, name: '豌豆射手' }
        ];
        
        seeds.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seed-card';
            card.dataset.type = s.type;
            card.dataset.cost = s.cost;
            card.innerHTML = `
                <div>${s.name}</div>
                <div class="cost">${s.cost}</div>
                <div class="cooldown-overlay"></div>
            `;
            seedBank.appendChild(card);
        });
        
        this.updateUICosts();
    }
    
    addSun(amount) {
        this.sunCount += amount;
        this.sunCountElement.innerText = this.sunCount;
        this.updateUICosts();
    }
    
    tryPlanting(type, row, col) {
        // Find cost
        const card = document.querySelector(`.seed-card[data-type="${type}"]`);
        if (!card) return;
        const cost = parseInt(card.dataset.cost);
        
        if (this.sunCount >= cost && this.board.canPlant(row, col)) {
            let plant;
            if (type === 'peashooter') plant = new Plant(this, 'peashooter');
            if (type === 'sunflower') plant = new Plant(this, 'sunflower');
            
            if (plant && this.board.addPlant(plant, row, col)) {
                this.sunCount -= cost;
                this.sunCountElement.innerText = this.sunCount;
                this.updateUICosts();
                
                // MVP: No cooldown implemented yet, just cost check
            }
        }
    }
    
    updateUICosts() {
        const cards = document.querySelectorAll('.seed-card');
        cards.forEach(card => {
            const cost = parseInt(card.dataset.cost);
            if (this.sunCount >= cost) {
                card.classList.remove('disabled');
            } else {
                card.classList.add('disabled');
            }
        });
    }
    
    gameOver() {
        this.state = 'GAMEOVER';
        alert("The zombies ate your brains!");
    }
    
    loop(timestamp) {
        // Delta time in seconds
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Cap deltaTime to prevent huge jumps if tab was inactive
        const dt = Math.min(deltaTime, 0.1); 
        
        this.update(dt);
        this.draw();
        
        if (this.state === 'PLAYING') {
            requestAnimationFrame((t) => this.loop(t));
        }
    }
    
    update(deltaTime) {
        this.waveManager.update(deltaTime);
        this.collisionManager.update();
        
        // Sky sun generation
        this.skySunTimer += deltaTime;
        if (this.skySunTimer >= this.skySunInterval) {
            this.skySunTimer = 0;
            const randomX = this.board.offsetX + Math.random() * (this.board.cols * this.board.cellWidth);
            this.entities.push(new Sun(this, randomX, -50));
        }
        
        // Update all entities
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update(deltaTime);
        }
        
        // Remove dead entities
        this.entities = this.entities.filter(e => !e.isDead);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board (lawn)
        this.board.draw(this.ctx);
        
        // Sort entities by Y coordinate for Z-sorting (pseudo-3D effect)
        // Projectiles should generally render above everything else in their row
        this.entities.sort((a, b) => {
            if (a.y === b.y) {
                // If same Y, projecties go on top
                if (a instanceof Projectile) return 1;
                if (b instanceof Projectile) return -1;
                return 0;
            }
            return a.y - b.y;
        });
        
        // Draw entities
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
    }
}

// Start game when page loads
window.onload = () => {
    new Game();
};

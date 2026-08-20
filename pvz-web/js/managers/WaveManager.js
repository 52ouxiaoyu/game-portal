class WaveManager {
    constructor(game) {
        this.game = game;
        this.timeElapsed = 0;
        this.nextSpawnTime = 5; 
        
        this.spawnInterval = 10;
    }
    
    update(deltaTime) {
        this.timeElapsed += deltaTime;
        
        if (this.timeElapsed >= this.nextSpawnTime) {
            this.spawnZombie();
            
            this.spawnInterval = Math.max(2, this.spawnInterval - 0.2);
            this.nextSpawnTime = this.timeElapsed + this.spawnInterval;
        }
    }
    
    spawnZombie() {
        const row = Math.floor(Math.random() * this.game.board.rows);
        
        // As time passes, higher chance of conehead
        const coneChance = Math.min(0.5, this.timeElapsed / 300); // Caps at 50% after 5 mins
        const type = Math.random() < coneChance ? 'conehead' : 'normal';
        
        this.game.entities.push(new Zombie(this.game, row, type));
    }
}

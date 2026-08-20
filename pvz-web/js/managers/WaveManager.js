class WaveManager {
    constructor(game) {
        this.game = game;
        this.timeElapsed = 0;
        this.nextSpawnTime = 5; // First zombie in 5 seconds
        
        // Simple MVP progression
        this.spawnInterval = 10;
    }
    
    update(deltaTime) {
        this.timeElapsed += deltaTime;
        
        if (this.timeElapsed >= this.nextSpawnTime) {
            this.spawnZombie();
            
            // Decrease spawn interval over time to make it harder, cap at 3s
            this.spawnInterval = Math.max(3, this.spawnInterval - 0.5);
            this.nextSpawnTime = this.timeElapsed + this.spawnInterval;
        }
        
        // Random falling suns from sky
        if (Math.random() < 0.005) { // roughly every couple of seconds given ~60fps, wait, random() < 0.005 per frame is ~0.3s. Let's use timer.
            // Will fix logic below
        }
    }
    
    spawnZombie() {
        const row = Math.floor(Math.random() * this.game.board.rows);
        this.game.entities.push(new Zombie(this.game, row, 'normal'));
    }
}

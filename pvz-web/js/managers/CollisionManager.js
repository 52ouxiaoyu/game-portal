class CollisionManager {
    constructor(game) {
        this.game = game;
    }
    
    update() {
        // Optimize: we only need to check collisions between Projectiles and Zombies
        // Plant/Zombie collision is handled by Zombie walking logic.
        
        const projectiles = this.game.entities.filter(e => e instanceof Projectile && !e.isDead);
        const zombies = this.game.entities.filter(e => e instanceof Zombie && !e.isDead);
        
        for (let p of projectiles) {
            for (let z of zombies) {
                // Must be in the same row
                if (p.row === z.row) {
                    // Simple AABB (or radius to rect) collision
                    // Zombie rect is roughly x-15 to x+15
                    if (p.x + p.radius > z.x - 15 && p.x - p.radius < z.x + 15) {
                        p.isDead = true; // Destroy projectile
                        z.takeDamage(p.damage);
                        break; // Projectile can only hit one zombie
                    }
                }
            }
        }
    }
}

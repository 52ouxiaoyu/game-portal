class Zombie extends Entity {
    constructor(game, row, type = 'normal') {
        const x = 950;
        const y = game.board.offsetY + row * game.board.cellHeight + game.board.cellHeight / 2 - 20;
        super(game, x, y);
        this.row = row;
        this.type = type;
        
        this.speed = 20; 
        this.damage = 50; 
        this.state = 'WALKING';
        this.eatTarget = null;
        this.yOffset = -30;
        
        if (type === 'normal') {
            this.hp = 200;
            this.maxHp = 200;
            this.element.src = 'assets/images/Zombies/Zombie/Zombie.gif';
            this.walkSrc = 'assets/images/Zombies/Zombie/Zombie.gif';
            this.attackSrc = 'assets/images/Zombies/Zombie/ZombieAttack.gif';
            this.dieSrc = 'assets/images/Zombies/Zombie/ZombieDie.gif';
        } else if (type === 'conehead') {
            this.hp = 560; // 370 for cone + 190 for zombie roughly in original
            this.maxHp = 560;
            this.element.src = 'assets/images/Zombies/ConeheadZombie/ConeheadZombie.gif';
            this.walkSrc = 'assets/images/Zombies/ConeheadZombie/ConeheadZombie.gif';
            this.attackSrc = 'assets/images/Zombies/ConeheadZombie/ConeheadZombieAttack.gif';
            this.dieSrc = 'assets/images/Zombies/Zombie/ZombieDie.gif'; // Fallback to normal die
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.element.style.top = `${this.y + this.yOffset}px`;
        
        // Handle cone falling off
        if (this.type === 'conehead' && this.hp <= 200 && this.state !== 'DYING') {
            this.type = 'normal';
            this.walkSrc = 'assets/images/Zombies/Zombie/Zombie.gif';
            this.attackSrc = 'assets/images/Zombies/Zombie/ZombieAttack.gif';
            this.element.src = this.state === 'EATING' ? this.attackSrc : this.walkSrc;
        }
        
        if (this.hp <= 0 && this.state !== 'DYING') {
            this.state = 'DYING';
            this.element.src = this.dieSrc;
            setTimeout(() => { this.isDead = true; }, 2000); 
        }
        
        if (this.state === 'DYING') return;
        
        if (this.state === 'WALKING') {
            this.x -= this.speed * deltaTime;
            
            if (this.x < 150) { 
                this.game.gameOver();
            }
            
            const plant = this.game.entities.find(e => 
                e instanceof Plant && 
                e.row === this.row && 
                Math.abs(e.x - this.x) < 40 
            );
            
            if (plant && !plant.isDead) {
                this.state = 'EATING';
                this.eatTarget = plant;
                this.element.src = this.attackSrc;
            }
        } 
        else if (this.state === 'EATING') {
            if (this.eatTarget && !this.eatTarget.isDead) {
                this.eatTarget.hp -= this.damage * deltaTime;
                if (!this.chompTimer) this.chompTimer = 0;
                this.chompTimer -= deltaTime;
                if (this.chompTimer <= 0) {
                    this.game.audioManager.play('chomp');
                    this.chompTimer = 1.0; 
                }
            } else {
                this.state = 'WALKING';
                this.eatTarget = null;
                this.element.src = this.walkSrc;
            }
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        // Optional: briefly change brightness or show hit effect
    }
}

class AudioManager {
    constructor() {
        this.sounds = {
            bgm: new Audio('assets/audio/uraniwani.mp3'),
            plant: new Audio('assets/audio/plant_water.mp3'),
            chomp: new Audio('assets/audio/chomp.mp3'),
            sun: new Audio('assets/audio/points.mp3'),
            lose: new Audio('assets/audio/losemusic.mp3'),
            btn: new Audio('assets/audio/buttonclick.mp3'),
            splat: new Audio('assets/audio/bowlingimpact.mp3')
        };
        this.sounds.bgm.loop = true;
    }
    
    play(name) {
        if (this.sounds[name]) {
            // Clone node to allow overlapping sounds
            if (name !== 'bgm' && name !== 'lose') {
                const s = this.sounds[name].cloneNode();
                s.play().catch(e => console.log(e));
            } else {
                this.sounds[name].play().catch(e => console.log(e));
            }
        }
    }
    
    stop(name) {
        if (this.sounds[name]) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
        }
    }
}

class Game {
    constructor() {
        this.entityLayer = document.getElementById('entity-layer');
        
        this.lastTime = 0;
        this.entities = []; 
        
        this.sunCount = 50;
        this.sunCountElement = document.getElementById('sun-count');
        
        this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
        
        this.board = new Board(this);
        this.inputManager = new InputManager(this);
        this.waveManager = new WaveManager(this);
        this.collisionManager = new CollisionManager(this);
        this.audioManager = new AudioManager();
        
        this.skySunTimer = 0;
        this.skySunInterval = 8; 
        
        this.initUI();
        this.showMenu();
    }
    
    showMenu() {
        const menu = document.createElement('div');
        menu.id = 'start-menu';
        menu.style.position = 'absolute';
        menu.style.top = '0';
        menu.style.left = '0';
        menu.style.width = '100%';
        menu.style.height = '100%';
        menu.style.backgroundColor = 'rgba(0,0,0,0.8)';
        menu.style.zIndex = '2000';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.justifyContent = 'center';
        menu.style.alignItems = 'center';
        
        const logo = document.createElement('img');
        logo.src = 'assets/images/interface/Logo.png';
        logo.style.marginBottom = '20px';
        menu.appendChild(logo);
        
        const startBtn = document.createElement('div');
        startBtn.style.backgroundImage = "url('assets/images/interface/SelectorScreen_WoodSign2_32.png')";
        startBtn.style.width = '200px';
        startBtn.style.height = '100px';
        startBtn.style.backgroundSize = 'contain';
        startBtn.style.backgroundRepeat = 'no-repeat';
        startBtn.style.backgroundPosition = 'center';
        startBtn.style.cursor = 'pointer';
        startBtn.style.display = 'flex';
        startBtn.style.alignItems = 'center';
        startBtn.style.justifyContent = 'center';
        startBtn.style.color = 'white';
        startBtn.style.fontSize = '24px';
        startBtn.style.fontWeight = 'bold';
        startBtn.innerText = 'Start Adventure';
        
        startBtn.onclick = () => {
            document.getElementById('game-container').removeChild(menu);
            this.state = 'PLAYING';
            this.audioManager.play('bgm');
            requestAnimationFrame((t) => this.loop(t));
        };
        
        menu.appendChild(startBtn);
        document.getElementById('game-container').appendChild(menu);
    }

    
    initUI() {
        const seedBank = document.getElementById('seed-bank');
        
        // Added cooldown in seconds
        this.seeds = [
            { type: 'sunflower', cost: 50, cooldown: 7.5, img: 'assets/images/Card/Plants/SunFlower.png' },
            { type: 'peashooter', cost: 100, cooldown: 7.5, img: 'assets/images/Card/Plants/Peashooter.png' }
        ];
        
        this.cooldowns = {
            'sunflower': 0,
            'peashooter': 0
        };
        
        this.seeds.forEach(s => {
            const card = document.createElement('div');
            card.className = 'seed-card';
            card.dataset.type = s.type;
            card.dataset.cost = s.cost;
            card.dataset.cooldown = s.cooldown;
            card.style.backgroundImage = `url('${s.img}')`;
            card.innerHTML = `
                <div class="cooldown-overlay"></div>
            `;
            seedBank.appendChild(card);
        });
        
        this.updateUI();
    }
    
    addSun(amount) {
        this.sunCount += amount;
        this.sunCountElement.innerText = this.sunCount;
        this.updateUI();
    }
    
    tryPlanting(type, row, col) {
        if (this.cooldowns[type] > 0) return; // Still cooling down
        
        const seed = this.seeds.find(s => s.type === type);
        if (!seed) return;
        
        if (this.sunCount >= seed.cost && this.board.canPlant(row, col)) {
            let plant;
            if (type === 'peashooter') plant = new Plant(this, 'peashooter');
            if (type === 'sunflower') plant = new Plant(this, 'sunflower');
            
            if (plant && this.board.addPlant(plant, row, col)) {
                this.sunCount -= seed.cost;
                this.sunCountElement.innerText = this.sunCount;
                this.cooldowns[type] = seed.cooldown; // Start cooldown
                this.updateUI();
                this.audioManager.play('plant');
            }
        }
    }
    
    updateUI() {
        const cards = document.querySelectorAll('.seed-card');
        cards.forEach(card => {
            const type = card.dataset.type;
            const cost = parseInt(card.dataset.cost);
            const totalCooldown = parseFloat(card.dataset.cooldown);
            const currentCooldown = this.cooldowns[type];
            
            const overlay = card.querySelector('.cooldown-overlay');
            
            // Check if on cooldown
            if (currentCooldown > 0) {
                card.classList.add('disabled');
                const percent = (currentCooldown / totalCooldown) * 100;
                overlay.style.height = `${percent}%`;
            } else {
                overlay.style.height = '0%';
                if (this.sunCount >= cost) {
                    card.classList.remove('disabled');
                } else {
                    card.classList.add('disabled'); // Not enough sun
                }
            }
        });
    }
    
    gameOver() {
        if (this.state === 'GAMEOVER') return;
        this.state = 'GAMEOVER';
        this.audioManager.stop('bgm');
        this.audioManager.play('lose');
        
        // Add ZombiesWon.png overlay
        const wonImg = document.createElement('img');
        wonImg.src = 'assets/images/ZombiesWon.png';
        wonImg.style.position = 'absolute';
        wonImg.style.top = '50%';
        wonImg.style.left = '50%';
        wonImg.style.transform = 'translate(-50%, -50%)';
        wonImg.style.zIndex = '1000';
        document.getElementById('game-container').appendChild(wonImg);
    }
    
    loop(timestamp) {
        // Delta time in seconds
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Cap deltaTime to prevent huge jumps if tab was inactive
        const dt = Math.min(deltaTime, 0.1); 
        
        if (this.state === 'PLAYING') {
            this.update(dt);
            requestAnimationFrame((t) => this.loop(t));
        }
    }
    
    update(deltaTime) {
        this.waveManager.update(deltaTime);
        this.collisionManager.update();
        
        // Update cooldowns
        let uiNeedsUpdate = false;
        for (let type in this.cooldowns) {
            if (this.cooldowns[type] > 0) {
                this.cooldowns[type] -= deltaTime;
                if (this.cooldowns[type] < 0) this.cooldowns[type] = 0;
                uiNeedsUpdate = true;
            }
        }
        if (uiNeedsUpdate) this.updateUI();
        
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
        
        // Clean up dead entities (remove from DOM and array)
        this.entities = this.entities.filter(e => {
            if (e.isDead) {
                if (e.element && e.element.parentNode) {
                    e.element.parentNode.removeChild(e.element);
                }
                return false;
            }
            return true;
        });
        
        // Z-Sorting using element zIndex
        this.entities.forEach(e => {
            if (e.element) {
                let z = Math.floor(e.y);
                if (e instanceof Projectile) z += 1000; // Projectiles always on top of row
                e.element.style.zIndex = z;
            }
        });
    }
}

// Start game when page loads
window.onload = () => {
    new Game();
};

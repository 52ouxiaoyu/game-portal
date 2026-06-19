class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.ui = new UI(this.renderer, this);
        
        this.state = 'menu';
        this.currentMap = null;
        this.gameMap = null;
        this.waveManager = null;
        
        this.gold = CONFIG.STARTING_GOLD;
        this.lives = CONFIG.STARTING_LIVES;
        
        this.towers = [];
        this.projectiles = [];
        this.heroes = [];
        this.abilityEffects = [];
        
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.placementMode = null;
        this.currentButtons = [];
        
        this.hero1 = null;
        this.hero2 = null;
        this.activeHero = null;
        
        this.paused = false;
        this.gameOver = false;
        this.victory = false;
        
        this.lastTime = 0;
        this.animationId = null;
        
        this.initEventListeners();
        Audio.init();
        
        this.showMainMenu();
        this.gameLoop(0);
    }
    
    initEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.cancelPlacement();
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    handleClick(e) {
        const pos = this.getMousePos(e);
        
        switch(this.state) {
            case 'menu':
                this.handleMenuClick(pos);
                break;
            case 'howto':
                this.handleHowToPlayClick(pos);
                break;
            case 'levelselect':
                this.handleLevelSelectClick(pos);
                break;
            case 'playing':
                this.handleGameClick(pos);
                break;
            case 'paused':
                this.handlePauseClick(pos);
                break;
            case 'gameover':
                this.handleGameOverClick(pos);
                break;
            case 'victory':
                this.handleVictoryClick(pos);
                break;
        }
    }
    
    handleMouseMove(e) {
        if (this.state !== 'playing') return;
        
        const pos = this.getMousePos(e);
        const grid = Utils.pixelToGrid(pos.x, pos.y);
        this.ui.hoveredCell = grid;
    }
    
    handleKeyDown(e) {
        if (this.state === 'playing') {
            switch(e.key) {
                case 'Escape':
                    this.cancelPlacement();
                    this.selectedPlacedTower = null;
                    break;
                case ' ':
                    e.preventDefault();
                    if (!this.waveManager.waveActive) {
                        this.waveManager.startWave();
                    }
                    break;
                case '1':
                    this.startPlacement('ARCHER');
                    break;
                case '2':
                    this.startPlacement('MAGE');
                    break;
                case '3':
                    this.startPlacement('CANNON');
                    break;
                case '4':
                    this.startPlacement('ICE');
                    break;
                case 'p':
                case 'P':
                    this.state = 'paused';
                    break;
            }
        } else if (this.state === 'paused' && e.key === 'p') {
            this.state = 'playing';
        }
    }
    
    handleMenuClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action === 'start') {
            this.state = 'levelselect';
            this.currentButtons = this.ui.renderLevelSelect();
        } else if (action === 'how') {
            this.state = 'howto';
            this.currentButtons = this.ui.renderHowToPlay();
        }
    }
    
    handleHowToPlayClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action === 'back') {
            this.showMainMenu();
        }
    }
    
    handleLevelSelectClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action && action.startsWith('map_')) {
            const mapId = parseInt(action.split('_')[1]);
            this.startGame(mapId);
        } else if (action === 'back') {
            this.showMainMenu();
        }
    }
    
    handleGameClick(pos) {
        if (pos.x >= this.ui.towerPanel.x && pos.x <= this.ui.towerPanel.x + this.ui.towerPanel.width) {
            const towerType = this.ui.getTowerAtPosition(pos.x, pos.y);
            if (towerType) {
                this.startPlacement(towerType);
                return;
            }
        }
        
        if (this.selectedPlacedTower) {
            const action = this.ui.handleTowerInfoClick(pos.x, pos.y);
            if (action === 'upgrade') {
                this.upgradeTower(this.selectedPlacedTower);
                return;
            } else if (action === 'sell') {
                this.sellTower(this.selectedPlacedTower);
                return;
            }
        }
        
        if (this.placementMode) {
            const grid = Utils.pixelToGrid(pos.x, pos.y);
            this.placeTower(grid.x, grid.y);
            return;
        }
        
        const grid = Utils.pixelToGrid(pos.x, pos.y);
        if (this.gameMap && this.gameMap.grid[grid.y] && this.gameMap.grid[grid.y][grid.x]) {
            const cell = this.gameMap.grid[grid.y][grid.x];
            if (cell.tower) {
                this.selectedPlacedTower = cell.tower;
                this.ui.selectedPlacedTower = cell.tower;
                return;
            }
        }
        
        if (this.hero1) {
            const dist = Utils.distance(pos.x, pos.y, this.hero1.x, this.hero1.y);
            if (dist < 20) {
                this.activeHero = this.hero1;
                return;
            }
        }
        if (this.hero2) {
            const dist = Utils.distance(pos.x, pos.y, this.hero2.x, this.hero2.y);
            if (dist < 20) {
                this.activeHero = this.hero2;
                return;
            }
        }
        
        if (this.activeHero) {
            this.activeHero.moveTo(pos.x, pos.y);
        }
        
        this.selectedPlacedTower = null;
        this.ui.selectedPlacedTower = null;
    }
    
    handlePauseClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action === 'resume') {
            this.state = 'playing';
        } else if (action === 'menu') {
            this.showMainMenu();
        }
    }
    
    handleGameOverClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action === 'retry') {
            this.startGame(this.currentMap.id);
        } else if (action === 'menu') {
            this.showMainMenu();
        }
    }
    
    handleVictoryClick(pos) {
        const action = this.ui.getButtonClick(pos.x, pos.y, this.currentButtons);
        if (action === 'next') {
            const nextMapId = this.currentMap.id + 1;
            const nextMap = CONFIG.MAPS.find(m => m.id === nextMapId);
            if (nextMap) {
                this.startGame(nextMapId);
            } else {
                this.showMainMenu();
            }
        } else if (action === 'menu') {
            this.showMainMenu();
        }
    }
    
    showMainMenu() {
        this.state = 'menu';
        this.currentButtons = this.ui.renderMainMenu();
    }
    
    startGame(mapId) {
        this.currentMap = CONFIG.MAPS.find(m => m.id === mapId);
        if (!this.currentMap) return;
        
        this.gameMap = new GameMap(this.currentMap);
        this.waveManager = new WaveManager(this.currentMap);
        
        this.gold = CONFIG.STARTING_GOLD;
        this.lives = CONFIG.STARTING_LIVES;
        
        this.towers = [];
        this.projectiles = [];
        this.abilityEffects = [];
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.placementMode = null;
        
        const startPos = this.gameMap.pathPixels[0];
        const midPos = this.gameMap.pathPixels[Math.floor(this.gameMap.pathPixels.length / 2)];
        
        this.hero1 = new Hero('WARRIOR', startPos.x, startPos.y);
        this.hero2 = new Hero('MAGE', midPos.x, midPos.y);
        this.activeHero = this.hero1;
        
        this.paused = false;
        this.gameOver = false;
        this.victory = false;
        
        this.state = 'playing';
        Audio.resume();
    }
    
    startPlacement(towerType) {
        const config = CONFIG.TOWER_TYPES[towerType];
        if (this.gold >= config.cost) {
            this.placementMode = towerType;
            this.selectedPlacedTower = null;
        }
    }
    
    cancelPlacement() {
        this.placementMode = null;
    }
    
    placeTower(gridX, gridY) {
        if (!this.placementMode) return;
        
        const config = CONFIG.TOWER_TYPES[this.placementMode];
        
        if (!this.gameMap.canBuild(gridX, gridY)) return;
        if (this.gold < config.cost) return;
        
        const tower = new Tower(this.placementMode, gridX, gridY);
        if (this.gameMap.placeTower(gridX, gridY, tower)) {
            this.towers.push(tower);
            this.gold -= config.cost;
            Audio.playPlace();
            this.placementMode = null;
        }
    }
    
    upgradeTower(tower) {
        const cost = tower.getUpgradeCost();
        if (cost === null || this.gold < cost) return;
        
        if (tower.upgrade()) {
            this.gold -= cost;
            Audio.playPlace();
        }
    }
    
    sellTower(tower) {
        const value = tower.getSellValue();
        this.gold += value;
        this.gameMap.removeTower(tower.gridX, tower.gridY);
        this.towers = this.towers.filter(t => t !== tower);
        this.selectedPlacedTower = null;
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(timestamp, deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(currentTime, deltaTime) {
        if (this.state !== 'playing' || this.paused) return;
        
        if (this.waveManager) {
            this.waveManager.update(currentTime, deltaTime);
            
            const aliveEnemies = this.waveManager.getAliveEnemies();
            const endEnemies = this.waveManager.getEndEnemies();
            
            for (const enemy of endEnemies) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.state = 'gameover';
                    Audio.playGameOver();
                    this.currentButtons = this.ui.renderGameOver(this.waveManager.currentWave);
                    return;
                }
            }
            
            for (const tower of this.towers) {
                const projectile = tower.update(currentTime, aliveEnemies);
                if (projectile) {
                    this.projectiles.push(projectile);
                }
            }
            
            if (this.waveManager.waveComplete) {
                this.gold += CONFIG.GOLD_PER_WAVE;
                Audio.playWaveComplete();
                
                if (this.waveManager.allWavesComplete) {
                    this.victory = true;
                    this.state = 'victory';
                    Audio.playVictory();
                    this.currentButtons = this.ui.renderVictory(this.waveManager.currentWave);
                    return;
                }
            }
        }
        
        for (const hero of [this.hero1, this.hero2]) {
            if (hero) {
                hero.update(currentTime, this.waveManager ? this.waveManager.getAliveEnemies() : []);
            }
        }
        
        for (const projectile of this.projectiles) {
            projectile.update(this.waveManager ? this.waveManager.getAliveEnemies() : []);
        }
        this.projectiles = this.projectiles.filter(p => p.alive);
        
        for (const effect of this.abilityEffects) {
            effect.progress += 0.02;
        }
        this.abilityEffects = this.abilityEffects.filter(e => e.progress < 1);
    }
    
    render() {
        this.renderer.clear();
        
        switch(this.state) {
            case 'menu':
                this.currentButtons = this.ui.renderMainMenu();
                break;
            case 'howto':
                this.currentButtons = this.ui.renderHowToPlay();
                break;
            case 'levelselect':
                this.currentButtons = this.ui.renderLevelSelect();
                break;
            case 'playing':
            case 'paused':
                this.renderGame();
                if (this.state === 'paused') {
                    this.currentButtons = this.ui.renderPause();
                }
                break;
            case 'gameover':
                this.renderGame();
                this.currentButtons = this.ui.renderGameOver(this.waveManager.currentWave);
                break;
            case 'victory':
                this.renderGame();
                this.currentButtons = this.ui.renderVictory(this.waveManager.currentWave);
                break;
        }
    }
    
    renderGame() {
        if (this.gameMap) {
            this.gameMap.render(this.renderer.ctx);
        }
        
        if (this.placementMode && this.ui.hoveredCell) {
            const grid = this.ui.hoveredCell;
            this.ui.renderPlacementPreview(grid.x, grid.y, this.placementMode);
        }
        
        for (const tower of this.towers) {
            tower.render(this.renderer.ctx);
        }
        
        if (this.selectedPlacedTower) {
            this.selectedPlacedTower.renderRange(this.renderer.ctx);
        }
        
        if (this.waveManager) {
            this.waveManager.render(this.renderer.ctx);
        }
        
        for (const projectile of this.projectiles) {
            projectile.render(this.renderer.ctx);
        }
        
        for (const hero of [this.hero1, this.hero2]) {
            if (hero) {
                hero.render(this.renderer.ctx);
            }
        }
        
        for (const effect of this.abilityEffects) {
            Sprites.drawAbilityEffect(
                this.renderer.ctx,
                effect.x, effect.y,
                effect.type, effect.radius, effect.progress
            );
        }
        
        this.ui.renderHUD({
            gold: this.gold,
            lives: this.lives,
            wave: this.waveManager ? this.waveManager.currentWave : 0,
            totalWaves: this.currentMap ? this.currentMap.waves : 0
        });
        
        if (this.selectedPlacedTower) {
            this.ui.renderTowerInfo(this.selectedPlacedTower);
        }
    }
}

window.addEventListener('load', () => {
    new Game();
});

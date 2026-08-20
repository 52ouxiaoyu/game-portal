class InputManager {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('game-container');
        this.dragGhost = document.getElementById('drag-ghost');
        
        this.selectedSeed = null;
        this.isShovelSelected = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('seed-bank').addEventListener('mousedown', (e) => {
            const card = e.target.closest('.seed-card');
            if (card && !card.classList.contains('disabled')) {
                const type = card.dataset.type;
                const cost = parseInt(card.dataset.cost);
                
                if (this.game.sunCount >= cost) {
                    this.selectedSeed = type;
                    this.isShovelSelected = false;
                    this.updateDragGhost(e.clientX, e.clientY, type);
                    this.game.audioManager.play('btn');
                }
            }
        });
        
        document.getElementById('shovel').addEventListener('mousedown', (e) => {
            this.isShovelSelected = true;
            this.selectedSeed = null;
            this.updateDragGhost(e.clientX, e.clientY, 'shovel');
            this.game.audioManager.play('btn');
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.selectedSeed || this.isShovelSelected) {
                this.dragGhost.style.left = e.clientX + 'px';
                this.dragGhost.style.top = e.clientY + 'px';
            }
        });
        
        this.container.addEventListener('mouseup', (e) => {
            if (this.selectedSeed || this.isShovelSelected) {
                const rect = this.container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const gridPos = this.game.board.getGridPos(mouseX, mouseY);
                
                if (gridPos) {
                    if (this.selectedSeed) {
                        this.game.tryPlanting(this.selectedSeed, gridPos.row, gridPos.col);
                    } else if (this.isShovelSelected) {
                        this.game.board.removePlant(gridPos.row, gridPos.col);
                    }
                }
                
                this.selectedSeed = null;
                this.isShovelSelected = false;
                this.dragGhost.style.display = 'none';
            }
        });
    }
    
    updateDragGhost(x, y, type) {
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.left = x + 'px';
        this.dragGhost.style.top = y + 'px';
        
        if (type === 'peashooter') {
            this.dragGhost.style.backgroundImage = "url('assets/images/Plants/Peashooter/Peashooter.gif')";
        } else if (type === 'sunflower') {
            this.dragGhost.style.backgroundImage = "url('assets/images/Plants/SunFlower/SunFlower.gif')";
        } else if (type === 'shovel') {
            this.dragGhost.style.backgroundImage = "url('assets/images/interface/Shovel/0.gif')";
        }
    }
}

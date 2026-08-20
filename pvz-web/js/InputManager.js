class InputManager {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.dragGhost = document.getElementById('drag-ghost');
        
        this.selectedSeed = null; // e.g., 'peashooter'
        this.isShovelSelected = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Handle UI clicks (Seed Bank)
        document.getElementById('seed-bank').addEventListener('mousedown', (e) => {
            const card = e.target.closest('.seed-card');
            if (card && !card.classList.contains('disabled')) {
                const type = card.dataset.type;
                const cost = parseInt(card.dataset.cost);
                
                if (this.game.sunCount >= cost) {
                    this.selectedSeed = type;
                    this.isShovelSelected = false;
                    this.updateDragGhost(e.clientX, e.clientY, type);
                }
            }
        });
        
        // Handle Shovel click
        document.getElementById('shovel').addEventListener('mousedown', (e) => {
            this.isShovelSelected = true;
            this.selectedSeed = null;
            this.updateDragGhost(e.clientX, e.clientY, 'shovel');
        });
        
        // Global mouse move for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.selectedSeed || this.isShovelSelected) {
                this.dragGhost.style.left = e.clientX + 'px';
                this.dragGhost.style.top = e.clientY + 'px';
            }
        });
        
        // Global mouse up for dropping/planting
        document.addEventListener('mouseup', (e) => {
            if (this.selectedSeed || this.isShovelSelected) {
                // Determine if we dropped over the canvas grid
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                const gridPos = this.game.board.getGridPos(mouseX, mouseY);
                
                if (gridPos) {
                    if (this.selectedSeed) {
                        // Try planting
                        this.game.tryPlanting(this.selectedSeed, gridPos.row, gridPos.col);
                    } else if (this.isShovelSelected) {
                        // Try shoveling
                        this.game.board.removePlant(gridPos.row, gridPos.col);
                    }
                }
                
                // Reset selection
                this.selectedSeed = null;
                this.isShovelSelected = false;
                this.dragGhost.style.display = 'none';
            }
        });
        
        // Canvas click for collecting suns
        this.canvas.addEventListener('mousedown', (e) => {
            // Ignore if we are dragging something
            if (this.selectedSeed || this.isShovelSelected) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check for suns (iterate backwards to click topmost)
            for (let i = this.game.entities.length - 1; i >= 0; i--) {
                const entity = this.game.entities[i];
                if (entity instanceof Sun && entity.state !== 'COLLECTED') {
                    // Simple distance check
                    const dist = Math.hypot(entity.x - mouseX, entity.y - mouseY);
                    if (dist < entity.radius * 1.5) { // slightly larger hit box
                        entity.collect();
                        return; // Only collect one sun per click
                    }
                }
            }
        });
    }
    
    updateDragGhost(x, y, type) {
        this.dragGhost.style.display = 'block';
        this.dragGhost.style.left = x + 'px';
        this.dragGhost.style.top = y + 'px';
        
        if (type === 'peashooter') {
            this.dragGhost.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
            this.dragGhost.innerText = 'Pea';
        } else if (type === 'sunflower') {
            this.dragGhost.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
            this.dragGhost.innerText = 'Sun';
        } else if (type === 'shovel') {
            this.dragGhost.style.backgroundColor = 'rgba(200, 200, 200, 0.8)';
            this.dragGhost.innerText = 'Shv';
        }
    }
}

class UI {
    constructor(renderer, game) {
        this.renderer = renderer;
        this.ctx = renderer.ctx;
        this.game = game;
        this.selectedTower = null;
        this.selectedPlacedTower = null;
        this.hoveredCell = null;
        this.placementMode = null;
        
        this.towerPanel = {
            x: CONFIG.CANVAS_WIDTH - 160,
            y: 10,
            width: 150,
            height: 200
        };
        
        this.towerTypes = ['ARCHER', 'MAGE', 'CANNON', 'ICE'];
        this.towerInfoButtons = [];
    }
    
    getTowerAtPosition(x, y) {
        const panel = this.towerPanel;
        for (let i = 0; i < this.towerTypes.length; i++) {
            const ty = panel.y + 40 + i * 40;
            if (x >= panel.x + 10 && x <= panel.x + panel.width - 10 &&
                y >= ty && y <= ty + 35) {
                return this.towerTypes[i];
            }
        }
        return null;
    }
    
    getButtonClick(x, y, buttons) {
        for (const btn of buttons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                return btn.action;
            }
        }
        return null;
    }
    
    renderHUD(gameState) {
        const panel = this.towerPanel;
        
        this.renderer.drawPanel(panel.x, panel.y, panel.width, panel.height);
        
        this.renderer.drawText('防御塔 Towers', panel.x + 10, panel.y + 10, 14, '#FFD700');
        
        for (let i = 0; i < this.towerTypes.length; i++) {
            const type = this.towerTypes[i];
            const config = CONFIG.TOWER_TYPES[type];
            const ty = panel.y + 40 + i * 40;
            
            const isSelected = this.placementMode === type;
            this.renderer.drawButton(
                panel.x + 10, ty,
                panel.width - 20, 35,
                `${config.name} $${config.cost}`,
                isSelected ? '#6a6a8a' : '#3a3a5a',
                isSelected
            );
        }
        
        this.renderer.drawPanel(10, 10, 200, 80);
        this.renderer.drawText(`金币: ${gameState.gold}`, 20, 20, 16, '#FFD700');
        this.renderer.drawText(`生命: ${gameState.lives}`, 20, 45, 16, '#FF6B6B');
        this.renderer.drawText(`波次: ${gameState.wave}/${gameState.totalWaves}`, 20, 70, 16, '#4ECDC4');
    }
    
    renderTowerInfo(tower) {
        if (!tower) return;
        
        const panel = this.towerPanel;
        const infoY = panel.y + panel.height + 10;
        
        this.renderer.drawPanel(panel.x, infoY, panel.width, 130);
        
        this.renderer.drawText(tower.config.name, panel.x + 10, infoY + 10, 14, '#FFD700');
        this.renderer.drawText(`等级: ${tower.level + 1}`, panel.x + 10, infoY + 30, 12, '#FFFFFF');
        this.renderer.drawText(`伤害: ${tower.damage}`, panel.x + 10, infoY + 45, 12, '#FF6B6B');
        this.renderer.drawText(`范围: ${tower.range}`, panel.x + 10, infoY + 60, 12, '#4ECDC4');
        
        this.towerInfoButtons = [];
        
        const upgradeCost = tower.getUpgradeCost();
        if (upgradeCost !== null) {
            const canUpgrade = this.game && this.game.gold >= upgradeCost;
            this.renderer.drawButton(
                panel.x + 10, infoY + 80,
                panel.width - 20, 25,
                `升级 $${upgradeCost}`,
                canUpgrade ? '#4CAF50' : '#666'
            );
            this.towerInfoButtons.push({
                x: panel.x + 10, y: infoY + 80,
                width: panel.width - 20, height: 25,
                action: 'upgrade'
            });
        }
        
        this.renderer.drawButton(
            panel.x + 10, infoY + 110,
            panel.width - 20, 25,
            `出售 $${tower.getSellValue()}`,
            '#F44336'
        );
        this.towerInfoButtons.push({
            x: panel.x + 10, y: infoY + 110,
            width: panel.width - 20, height: 25,
            action: 'sell'
        });
    }
    
    handleTowerInfoClick(x, y) {
        for (const btn of this.towerInfoButtons) {
            if (x >= btn.x && x <= btn.x + btn.width &&
                y >= btn.y && y <= btn.y + btn.height) {
                return btn.action;
            }
        }
        return null;
    }
    
    renderPlacementPreview(gridX, gridY, towerType) {
        if (gridX < 0 || gridX >= CONFIG.GRID_COLS || gridY < 0 || gridY >= CONFIG.GRID_ROWS) return;
        
        const config = CONFIG.TOWER_TYPES[towerType];
        const x = gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const y = gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        Sprites.drawTower(this.ctx, gridX * CONFIG.TILE_SIZE, gridY * CONFIG.TILE_SIZE, towerType.toLowerCase(), 0);
        this.ctx.globalAlpha = 0.3;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, config.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    renderMainMenu() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('像素塔防', CONFIG.CANVAS_WIDTH / 2, 150, 48, '#FFD700', 'center');
        this.renderer.drawText('Pixel Tower Defense', CONFIG.CANVAS_WIDTH / 2, 210, 20, '#888888', 'center');
        
        const buttons = [];
        const buttonWidth = 200;
        const buttonHeight = 50;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        buttons.push({ x: startX, y: 300, width: buttonWidth, height: buttonHeight, action: 'start' });
        buttons.push({ x: startX, y: 370, width: buttonWidth, height: buttonHeight, action: 'how' });
        buttons.push({ x: startX, y: 440, width: buttonWidth, height: buttonHeight, action: 'quit' });
        
        this.renderer.drawButton(startX, 300, buttonWidth, buttonHeight, '开始游戏 START');
        this.renderer.drawButton(startX, 370, buttonWidth, buttonHeight, '游戏说明 HOW TO');
        this.renderer.drawButton(startX, 440, buttonWidth, buttonHeight, '退出游戏 QUIT');
        
        return buttons;
    }
    
    renderHowToPlay() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('游戏说明 HOW TO', CONFIG.CANVAS_WIDTH / 2, 50, 32, '#FFD700', 'center');
        
        const instructions = [
            '1. 选择右侧防御塔类型',
            '2. 点击地图空地放置防御塔',
            '3. 防御塔自动攻击路径上的敌人',
            '4. 消灭所有敌人获得金币',
            '5. 升级或出售已放置的防御塔',
            '6. 使用英雄特殊技能',
            '7. 保护基地不被敌人入侵',
            '',
            '快捷键:',
            'ESC - 取消选择',
            '空格 - 开始下一波',
            '1-4 - 快速选择防御塔'
        ];
        
        instructions.forEach((text, i) => {
            this.renderer.drawText(text, 200, 120 + i * 30, 16, '#CCCCCC');
        });
        
        const buttons = [];
        const buttonWidth = 150;
        const buttonHeight = 40;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        buttons.push({ x: startX, y: 550, width: buttonWidth, height: buttonHeight, action: 'back' });
        this.renderer.drawButton(startX, 550, buttonWidth, buttonHeight, '返回 BACK');
        
        return buttons;
    }
    
    renderLevelSelect() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('选择关卡 SELECT LEVEL', CONFIG.CANVAS_WIDTH / 2, 80, 32, '#FFD700', 'center');
        
        const buttons = [];
        const buttonWidth = 250;
        const buttonHeight = 60;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        CONFIG.MAPS.forEach((map, i) => {
            const y = 180 + i * 100;
            buttons.push({ x: startX, y, width: buttonWidth, height: buttonHeight, action: `map_${map.id}` });
            this.renderer.drawButton(startX, y, buttonWidth, buttonHeight, `${map.name} (${map.waves}波)`);
        });
        
        const backY = 180 + CONFIG.MAPS.length * 100 + 20;
        buttons.push({ x: startX, y: backY, width: buttonWidth, height: buttonHeight, action: 'back' });
        this.renderer.drawButton(startX, backY, buttonWidth, buttonHeight, '返回 BACK');
        
        return buttons;
    }
    
    renderGameOver(wave) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('游戏结束 GAME OVER', CONFIG.CANVAS_WIDTH / 2, 250, 48, '#FF4444', 'center');
        this.renderer.drawText(`坚持到第 ${wave} 波 Survived ${wave} waves`, CONFIG.CANVAS_WIDTH / 2, 320, 24, '#FFFFFF', 'center');
        
        const buttons = [];
        const buttonWidth = 150;
        const buttonHeight = 50;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        buttons.push({ x: startX, y: 400, width: buttonWidth, height: buttonHeight, action: 'retry' });
        buttons.push({ x: startX + buttonWidth + 20, y: 400, width: buttonWidth, height: buttonHeight, action: 'menu' });
        
        this.renderer.drawButton(startX, 400, buttonWidth, buttonHeight, '重新开始 RESTART');
        this.renderer.drawButton(startX + buttonWidth + 20, 400, buttonWidth, buttonHeight, '返回菜单 MENU');
        
        return buttons;
    }
    
    renderVictory(wave) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('胜利! VICTORY!', CONFIG.CANVAS_WIDTH / 2, 250, 48, '#FFD700', 'center');
        this.renderer.drawText(`成功防守 ${wave} 波攻击 Defended ${wave} waves`, CONFIG.CANVAS_WIDTH / 2, 320, 24, '#FFFFFF', 'center');
        
        const buttons = [];
        const buttonWidth = 150;
        const buttonHeight = 50;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        buttons.push({ x: startX, y: 400, width: buttonWidth, height: buttonHeight, action: 'next' });
        buttons.push({ x: startX + buttonWidth + 20, y: 400, width: buttonWidth, height: buttonHeight, action: 'menu' });
        
        this.renderer.drawButton(startX, 400, buttonWidth, buttonHeight, '下一关 NEXT');
        this.renderer.drawButton(startX + buttonWidth + 20, 400, buttonWidth, buttonHeight, '返回菜单 MENU');
        
        return buttons;
    }
    
    renderPause() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderer.drawText('暂停 PAUSED', CONFIG.CANVAS_WIDTH / 2, 300, 48, '#FFFFFF', 'center');
        
        const buttons = [];
        const buttonWidth = 150;
        const buttonHeight = 50;
        const startX = CONFIG.CANVAS_WIDTH / 2 - buttonWidth / 2;
        
        buttons.push({ x: startX, y: 400, width: buttonWidth, height: buttonHeight, action: 'resume' });
        buttons.push({ x: startX, y: 470, width: buttonWidth, height: buttonHeight, action: 'menu' });
        
        this.renderer.drawButton(startX, 400, buttonWidth, buttonHeight, '继续 RESUME');
        this.renderer.drawButton(startX, 470, buttonWidth, buttonHeight, '返回菜单 MENU');
        
        return buttons;
    }
}

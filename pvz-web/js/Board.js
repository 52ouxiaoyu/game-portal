class Board {
    constructor(game) {
        this.game = game;
        this.rows = 5;
        this.cols = 9;
        
        // Coordinates for the top-left of the first cell
        this.offsetX = 220; 
        this.offsetY = 100;
        
        this.cellWidth = 72;
        this.cellHeight = 96;
        
        // 2D Array to track plants in each cell
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = null; // null means empty
            }
        }
    }
    
    draw(ctx) {
        // Draw the lawn (checkerboard pattern for visibility during prototyping)
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.offsetX + c * this.cellWidth;
                const y = this.offsetY + r * this.cellHeight;
                
                // Checkerboard colors
                if ((r + c) % 2 === 0) {
                    ctx.fillStyle = '#4CAF50'; // Light green
                } else {
                    ctx.fillStyle = '#45a049'; // Darker green
                }
                ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            }
        }
    }
    
    // Converts pixel coordinates to grid coordinates (row, col)
    getGridPos(x, y) {
        if (x < this.offsetX || x >= this.offsetX + this.cols * this.cellWidth ||
            y < this.offsetY || y >= this.offsetY + this.rows * this.cellHeight) {
            return null; // Outside the board
        }
        
        const col = Math.floor((x - this.offsetX) / this.cellWidth);
        const row = Math.floor((y - this.offsetY) / this.cellHeight);
        return { row, col };
    }
    
    // Checks if a cell is empty
    canPlant(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
        return this.grid[row][col] === null;
    }
    
    // Adds a plant to the grid
    addPlant(plant, row, col) {
        if (this.canPlant(row, col)) {
            this.grid[row][col] = plant;
            plant.row = row;
            plant.col = col;
            
            // Set plant's exact pixel position based on grid
            plant.x = this.offsetX + col * this.cellWidth + this.cellWidth / 2;
            plant.y = this.offsetY + row * this.cellHeight + this.cellHeight / 2;
            
            this.game.entities.push(plant);
            return true;
        }
        return false;
    }
    
    // Removes a plant from the grid
    removePlant(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            const plant = this.grid[row][col];
            if (plant) {
                plant.hp = 0; // Trigger death
                this.grid[row][col] = null;
            }
        }
    }
}

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.ctx.imageSmoothingEnabled = false;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawText(text, x, y, size = 16, color = '#FFFFFF', align = 'left') {
        this.ctx.save();
        this.ctx.font = `${size}px 'Courier New', monospace`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
    
    drawButton(x, y, width, height, text, color = '#4a4a6a', hover = false) {
        this.ctx.save();
        
        this.ctx.fillStyle = hover ? '#6a6a8a' : color;
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        this.ctx.font = '14px "Courier New", monospace';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width / 2, y + height / 2);
        
        this.ctx.restore();
    }
    
    drawPanel(x, y, width, height, alpha = 0.8) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(20, 20, 40, ${alpha})`;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#4a4a6a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.restore();
    }
    
    drawProgressBar(x, y, width, height, progress, color = '#4CAF50') {
        this.ctx.save();
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width * progress, height);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.restore();
    }
}

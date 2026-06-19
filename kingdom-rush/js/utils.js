const Utils = {
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * CONFIG.TILE_SIZE,
            y: gridY * CONFIG.TILE_SIZE
        };
    },
    
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / CONFIG.TILE_SIZE),
            y: Math.floor(pixelY / CONFIG.TILE_SIZE)
        };
    },
    
    isOnPath(gridX, gridY, path) {
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = path[i];
            const p2 = path[i + 1];
            
            if (p1.x === p2.x) {
                const minY = Math.min(p1.y, p2.y);
                const maxY = Math.max(p1.y, p2.y);
                if (gridX === p1.x && gridY >= minY && gridY <= maxY) return true;
            } else {
                const minX = Math.min(p1.x, p2.x);
                const maxX = Math.max(p1.x, p2.x);
                if (gridY === p1.y && gridX >= minX && gridX <= maxX) return true;
            }
        }
        return false;
    },
    
    getPathPixels(path) {
        const pixels = [];
        for (let i = 0; i < path.length - 1; i++) {
            const p1 = this.gridToPixel(path[i].x, path[i].y);
            const p2 = this.gridToPixel(path[i + 1].x, path[i + 1].y);
            
            const dist = this.distance(p1.x, p1.y, p2.x, p2.y);
            const steps = Math.ceil(dist / 4);
            
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                pixels.push({
                    x: this.lerp(p1.x, p2.x, t) + CONFIG.TILE_SIZE / 2,
                    y: this.lerp(p1.y, p2.y, t) + CONFIG.TILE_SIZE / 2
                });
            }
        }
        return pixels;
    }
};

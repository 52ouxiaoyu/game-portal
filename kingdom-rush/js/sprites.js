
const SPRITE_PALETTE = {
    '0': 'transparent',
    '1': '#000000', // Outline/Eyes
    '2': '#FFCDB2', // Skin
    '3': '#FFFFFF', // White
    '4': '#FF0000', // Red
    '5': '#8B4513', // Brown
    '6': '#808080', // Grey
    '7': '#FFD700', // Gold
    '8': '#8A2BE2', // Purple
    '9': '#006400', // Dark Green
    'A': '#00FFFF', // Cyan
    'B': '#32CD32'  // Lime
};

const SPRITES = {
    HERO: [
        "00004440000",
        "00004440000",
        "00077777000",
        "00677777600",
        "06622222660",
        "06612221660",
        "00066666000",
        "00CCCCCCC00",
        "06C6CCC6C60",
        "066C666C660",
        "00660006600"
    ],
    INFANTRY: [
        "000777000",
        "007777700",
        "002121200",
        "002222200",
        "005555500",
        "065555560",
        "005555500",
        "001101100"
    ],
    CAVALRY: [
        "00000220000",
        "00002120000",
        "00004440000",
        "00554445500",
        "05555555550",
        "55155555155",
        "55555555555",
        "05500000550",
        "01100000110"
    ],
    HEAVY: [
        "0006666000",
        "0066666600",
        "0666116660",
        "0666666660",
        "0666666660",
        "6666666666",
        "6666666666",
        "6666666666",
        "0666006660",
        "0666006660",
        "0111001110"
    ],
    BOSS: [
        "00000888800000",
        "00008888880000",
        "00088488488000",
        "00888888888800",
        "08881188118880",
        "08888888888880",
        "88888844888888",
        "88888888888888",
        "88888888888888",
        "08888888888880",
        "08888000088880",
        "00110000001100"
    ],
    ARROW: [
        "0110", "1661", "0110", "0550", "0550", "0550", "0550", "1441", "1441"
    ],
    BULLET: [
        "0770", "7777", "7777", "0770"
    ],
    CANNONBALL: [
        "06660", "66366", "63666", "66666", "06660"
    ],
    LASER: [
        "AA", "33", "33", "33", "33", "33", "33", "33", "33", "AA"
    ],
    MISSILE: [
        "004400", "047740", "043340", "033330", "033330", "033330", "166661", "166661", "440044"
    ],
    NUKE: [
        "00B11B00", "0B1331B0", "B133331B", "B133331B", "B133331B", "B133331B", "0B1331B0", "00B11B00"
    ]
};

function drawSprite(ctx, spriteObj, x, y, sizeMultiplier, dynamicColor) {
    if (!spriteObj) return;
    const rows = spriteObj.length;
    const cols = spriteObj[0].length;
    const pSize = sizeMultiplier;
    
    const startX = x - (cols * pSize) / 2;
    const startY = y - (rows * pSize) / 2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const char = spriteObj[r][c];
            if (char === '0') continue;
            
            let color = SPRITE_PALETTE[char];
            if (char === 'C') color = dynamicColor;
            
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(startX + c * pSize, startY + r * pSize, pSize, pSize);
            }
        }
    }
}

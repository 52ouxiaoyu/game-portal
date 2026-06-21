
const SPRITE_PALETTE = {
    '0': 'transparent',
    '1': '#000000', // Outline
    '2': '#FFCDB2', // Skin
    '3': '#FFFFFF', // White
    '4': '#FF0000', // Red
    '5': '#A0522D', // Wood/Brown
    '6': '#808080', // Metal/Grey
    '7': '#FFD700', // Gold
};

const SPRITES = {
    HERO: [
        "0001111000",
        "0012222100",
        "0121221210",
        "0122222210",
        "0011111100",
        "011CCCC110", // C = color (dynamic)
        "1C1CCCC1C1",
        "1C1CCCC1C1",
        "0111111110",
        "0011001100",
        "0111001110"
    ],
    GOBLIN: [
        "00111100",
        "01GGGG10", // G = green
        "1G1GG1G1",
        "1GGGGGG1",
        "011GG110",
        "01GGGG10",
        "1G1001G1",
        "11000011"
    ],
    ORC: [
        "0011111100",
        "01OOOOOO10", // O = Olive
        "1O1OOOO1O1",
        "1O4OOOO4O1",
        "1OOOOOOOO1",
        "011OOOO110",
        "01OOOOOO10",
        "1O100001O1",
        "1100000011"
    ],
    TROLL: [
        "001111111100",
        "01TTTTTTTT10", // T = Dark Red
        "1T1TTTTTT1T1",
        "1T4TTTTTT4T1",
        "1TTTTTTTTTT1",
        "1TT111111TT1",
        "01TTTTTTTT10",
        "01TTTTTTTT10",
        "1T11000011T1",
        "110000000011"
    ],
    ARROW: [
        "0110",
        "1661",
        "0110",
        "0550",
        "0550",
        "0550",
        "0550",
        "1331",
        "1331"
    ]
};

function drawSprite(ctx, spriteObj, x, y, sizeMultiplier, dynamicColor) {
    if (!spriteObj) return;
    const rows = spriteObj.length;
    const cols = spriteObj[0].length;
    const pSize = sizeMultiplier;
    
    // x and y are the center of the sprite
    const startX = x - (cols * pSize) / 2;
    const startY = y - (rows * pSize) / 2;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const char = spriteObj[r][c];
            if (char === '0') continue;
            
            let color = SPRITE_PALETTE[char];
            if (char === 'C') color = dynamicColor;
            if (char === 'G') color = '#32CD32'; // Green
            if (char === 'O') color = '#556B2F'; // Olive
            if (char === 'T') color = '#8B0000'; // Dark Red
            
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(startX + c * pSize, startY + r * pSize, pSize, pSize);
            }
        }
    }
}

const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `<!DOCTYPE html><html><body><canvas id="gameCanvas" width="800" height="600"></canvas></body></html>`;
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

// Mock AudioContext and requestAnimationFrame
window.AudioContext = class {
    createOscillator() { return { start(){}, stop(){}, frequency: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){} } }
    createGain() { return { gain: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){} } }
};
window.requestAnimationFrame = () => {};

// Mock Canvas 2D Context
const canvas = window.document.getElementById('gameCanvas');
canvas.getContext = function() {
    return {
        save: () => {}, restore: () => {}, beginPath: () => {}, ellipse: () => {}, fill: () => {},
        fillRect: () => {}, strokeRect: () => {}, fillText: () => {}, translate: () => {}, scale: () => {},
        clearRect: () => {}, measureText: () => ({width: 10}), drawImage: () => {}, moveTo: () => {},
        lineTo: () => {}, stroke: () => {}
    };
};

const scripts = [
    '/Users/clawbox/game-portal/kingdom-rush/js/config.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/sprites.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/audio.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/utils.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/renderer.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/ui.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/main.js'
];

for (let s of scripts) {
    if (fs.existsSync(s)) {
        const code = fs.readFileSync(s, 'utf8');
        dom.window.eval(code);
    }
}

try {
    dom.window.eval(`
        const game = new Game('gameCanvas');
        game.startGame();
        game.spawnEnemy(true); 
        game.update(100, 16);
        game.render();
    `);
    console.log("No error!");
} catch(e) {
    console.log("ERROR THROWN:");
    console.log(e);
}

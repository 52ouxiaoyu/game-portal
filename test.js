const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `<!DOCTYPE html><html><body><canvas id="gameCanvas" width="800" height="600"></canvas></body></html>`;
const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;

// Mock AudioContext and requestAnimationFrame
window.AudioContext = class {
    createOscillator() { return { start(){}, stop(){}, frequency: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){} } }
    createGain() { return { gain: { setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){} } }
};
window.requestAnimationFrame = () => {};

// Load scripts
const config = fs.readFileSync('/Users/clawbox/game-portal/kingdom-rush/js/config.js', 'utf8');
const sprites = fs.readFileSync('/Users/clawbox/game-portal/kingdom-rush/js/sprites.js', 'utf8');
const audio = fs.readFileSync('/Users/clawbox/game-portal/kingdom-rush/js/audio.js', 'utf8');
const renderer = fs.readFileSync('/Users/clawbox/game-portal/kingdom-rush/js/renderer.js', 'utf8');
const main = fs.readFileSync('/Users/clawbox/game-portal/kingdom-rush/js/main.js', 'utf8');

try {
    dom.window.eval(config);
    dom.window.eval(sprites);
    dom.window.eval(audio);
    dom.window.eval(renderer);
    dom.window.eval(main);
    
    dom.window.eval(`
        const game = new Game('gameCanvas');
        game.startGame();
        game.spawnEnemy(); // spawn an infantry
        game.spawnEnemy(true); // spawn a boss
        game.update(100, 16);
        game.render();
    `);
    console.log("No error!");
} catch(e) {
    console.log("ERROR THROWN:");
    console.log(e);
}

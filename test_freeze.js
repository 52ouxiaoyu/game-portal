const fs = require('fs');
let code = fs.readFileSync('zombie-shooter/game.js', 'utf8');

const window = {
    innerWidth: 1000,
    innerHeight: 800,
    addEventListener: () => {},
    AudioContext: class {
        createOscillator() { return {frequency:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}}, connect:()=>{}, start:()=>{}, stop:()=>{}}; }
        createGain() { return {gain:{setValueAtTime:()=>{}, exponentialRampToValueAtTime:()=>{}}, connect:()=>{}}; }
    },
    webkitAudioContext: class {}
};
const document = {
    getElementById: (id) => {
        if (id === 'game-canvas') {
            return {
                getContext: () => ({ fillRect: ()=>{}, beginPath: ()=>{}, moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{}, arc: ()=>{}, fillText: ()=>{}, save: ()=>{}, translate: ()=>{}, rotate: ()=>{}, restore: ()=>{}, strokeRect: ()=>{} }),
                width: 1000,
                height: 800
            };
        }
        return { classList: { add: ()=>{}, remove: ()=>{} }, textContent: '' };
    },
    addEventListener: () => {}
};
const localStorage = { getItem: () => '0', setItem: () => {} };
const requestAnimationFrame = (cb) => { };
const performance = { now: () => Date.now() };

eval(code + `
startGame();
keys.KeyW = true;
keys.Space = true;
try {
    for(let i=0; i<100; i++) {
        update();
    }
    console.log("Did not freeze! Bullets: " + bullets.length);
} catch (e) {
    console.log("Error during update:", e);
}
`);

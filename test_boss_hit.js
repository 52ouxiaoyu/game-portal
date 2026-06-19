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
                getContext: () => ({ fillRect: ()=>{}, beginPath: ()=>{}, moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{}, arc: ()=>{}, fillText: ()=>{}, save: ()=>{}, translate: ()=>{}, rotate: ()=>{}, restore: ()=>{}, strokeRect: ()=>{}, roundRect: ()=>{}, ellipse: ()=>{}, drawImage: ()=>{} }),
                width: 1000,
                height: 800
            };
        }
        return { classList: { add: ()=>{}, remove: ()=>{} }, textContent: '' };
    },
    createElement: () => {
        return {
            getContext: () => ({ fillRect: ()=>{}, beginPath: ()=>{}, moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{}, arc: ()=>{}, fillText: ()=>{}, save: ()=>{}, translate: ()=>{}, rotate: ()=>{}, restore: ()=>{}, strokeRect: ()=>{}, roundRect: ()=>{}, ellipse: ()=>{}, drawImage: ()=>{} })
        };
    },
    addEventListener: () => {}
};
const localStorage = { getItem: () => '0', setItem: () => {} };
const requestAnimationFrame = (cb) => { };
const performance = { now: () => Date.now() };

eval(code + `
startGame();
players[0].x = 500; players[0].y = 500;
players[0].facing = {x: 0, y: -1}; // Aim up
let boss = new Zombie(true);
boss.x = 500; boss.y = 400; // Place boss right in front
zombies.push(boss);

try {
    for(let i=0; i<100; i++) {
        if (i === 10) players[0].shoot(); // Shoot boss
        update();
        draw();
    }
    console.log("Did not freeze! Boss HP:", zombies[0].hp);
} catch (e) {
    console.log("Error:", e.stack);
}
`);

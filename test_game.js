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
                getContext: () => ({}),
                width: 1000,
                height: 800
            };
        }
        return { classList: { add: ()=>{}, remove: ()=>{} }, textContent: '' };
    },
    addEventListener: () => {}
};
const localStorage = { getItem: () => '0', setItem: () => {} };
const requestAnimationFrame = (cb) => { setTimeout(cb, 16); };
const performance = { now: () => Date.now() };

eval(code);

startGame();
console.log("Game started. Players:", players.length);

for(let i=0; i<105; i++) {
    update();
}
console.log("Zombies:", zombies.length);
if (zombies.length > 0) {
    console.log("Zombie active:", zombies[0].active, "hp:", zombies[0].hp);
}

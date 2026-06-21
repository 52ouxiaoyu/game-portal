const fs = require('fs');

const scripts = [
    '/Users/clawbox/game-portal/kingdom-rush/js/config.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/sprites.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/audio.js',
    '/Users/clawbox/game-portal/kingdom-rush/js/main.js'
];

let allCode = '';
for (let s of scripts) {
    if (fs.existsSync(s)) {
        allCode += fs.readFileSync(s, 'utf8') + '\n';
    }
}

try {
    // just parse it using new Function
    new Function(allCode);
    console.log("No syntax error in allCode");
} catch(e) {
    console.log("SYNTAX ERROR IN ALLCODE:");
    console.log(e);
}

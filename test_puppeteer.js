const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const html = fs.readFileSync('/Users/clawbox/game-portal/index.html', 'utf8');
  await page.goto('file:///Users/clawbox/game-portal/zombie-shooter/index.html');
  
  // Wait for game to load
  await page.waitForTimeout(1000);
  
  // Inject script to start game and spawn boss
  const result = await page.evaluate(() => {
    try {
        startGame();
        zombies.push(new Zombie(true));
        
        for(let i=0; i<60; i++) {
            update();
            draw();
        }
        return "Success: " + zombies[0].hp;
    } catch(e) {
        return "Error: " + e.stack;
    }
  });
  
  console.log(result);
  await browser.close();
})();

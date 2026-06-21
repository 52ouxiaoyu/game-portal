const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`file://${path.resolve(__dirname, 'zombie-shooter/index.html')}`);
    
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#start-btn');
    await new Promise(r => setTimeout(r, 2000));
    
    await browser.close();
})();

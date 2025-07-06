const puppeteer = require('puppeteer');
const db = require("./firebaseAdmin");

async function artStationScrape(search) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
    });

    const page = await browser.newPage();

    //bot checker bypass by making it look like any other Chrome user 
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.goto(`https://www.artstation.com/search?sort_by=relevance&query=${search}`, {
        waitUntil: 'networkidle2',
    });

    //force lazy scroll a total of 4 times
    for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 1250));
    }

    await page.waitForSelector('img.gallery-grid-background-image');

    //populate array with images from artStation
    const images = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img.gallery-grid-background-image')).map((img) => ({
          src: img.src,
          alt: img.alt || null,
        }));
    });

    await browser.close();
    for (const image of images) {
        await db.collection("generalImages").add({
            url: image.src,
            title: image.alt,
            category: search
            });
    }
}

const searchTerm = process.argv[2];
artStationScrape(searchTerm);
const puppeteer = require('puppeteer');
const { db, admin } = require("./firebaseAdmin");
const crypto = require('crypto');

async function artStationScrape(search) {

    const browser = await puppeteer.launch({
        headless: false,
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

    //force lazy scroll a total of 3 times
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    await page.waitForSelector('a.gallery-grid-link');

    //populate array with images from artStation
    const artworkLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a.gallery-grid-link')).map(a => a.href);
    });
    
    //process all images in batches of 4
    const images = await processInBatches(artworkLinks, 5, (url) => scrapeImageFromPage(url, browser));
    const validImages = images.filter(Boolean);

    await browser.close();
    for (const image of validImages) {
        const id = generateId('artstation', image.src);
      
        await db.collection("generalImages").doc(id).set({
            id: id,
            url: image.src,
            tags: [],
            artist: image.artist,
            colors: [],
            image_vector: [],
            title: image.alt,
            width: image.width,
            height: image.height,
            category: search,
            source: "artStation",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            rand: Math.random()
        }, { merge: true });
    }

    console.log(validImages.length + " images added to db");
}

function generateId(source, url) {
    const hash = crypto.createHash('sha256').update(url).digest('hex');
    return `${source}_${hash}`;
}

//go to each page for higher res images 
async function scrapeImageFromPage(url, browser) {
    const artPage = await browser.newPage();
    try {
        await artPage.goto(url, { waitUntil: 'networkidle2' });
        await artPage.waitForSelector('img.img-fit' || 'img.img-fluid', { timeout: 9000 }).catch(() => {});

        const imageData = await artPage.evaluate(() => {
            const img = document.querySelector('img.img-fit, img.img-fluid');
            const a = document.querySelector(
                '.project-author-name a:not(.pro-badge):not([href^="/subscribe"])'
            );

            if (!img?.src) return null;
            return {
                src: img?.src || null,
                alt: img?.alt || null,
                artist: a?.textContent?.trim() || null,
                width: img?.naturalWidth || img?.width || null,
                height: img?.naturalHeight || img?.height || null,
            };
        });

        if (imageData.src) return imageData;
    } catch (err) {
        console.warn(`Failed to extract image from: ${url} error: ${err}`);
    } finally {
        await artPage.close();
    }

    return null;
}

//batch process to speed up accessing all these pages for images
async function processInBatches(items, batchSize, asyncFn) {
    const results = [];
  
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(asyncFn));
        results.push(...batchResults);

        if (i + batchSize < items.length) {
            console.log("Pausing 7s to avoid 429...");
            await new Promise(resolve => setTimeout(resolve, 7000));
        }
    }
  
    await new Promise(resolve => setTimeout(resolve, 3000));
    return results;
}

const searchTerm = process.argv[2];
artStationScrape(searchTerm);
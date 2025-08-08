const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Fix: Import fetch dynamically for CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function downloadInstagramVideo(reelUrl) {
  console.log('🔗 Opening reelsave.app...');

  // Remove Windows path and let Playwright use bundled Chromium
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer'
    ]
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://reelsave.app', { timeout: 60000 });

    console.log('📝 Entering URL...');
    await page.fill('input[type="url"]', reelUrl);

    console.log('🚀 Submitting form...');
    await page.click('button[type="submit"]');
    await page.waitForSelector('a[href*=".mp4"]', { timeout: 30000 });

    const downloadLink = await page.getAttribute('a[href*=".mp4"]', 'href');
    console.log('📥 Video link:', downloadLink);

    await browser.close();

    console.log('⬇️ Downloading video via fetch...');
    const response = await fetch(downloadLink);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const buffer = await response.buffer();
    const outputPath = path.resolve(__dirname, 'downloaded_reel.mp4');
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
  } catch (error) {
    await browser.close();
    throw new Error('Download failed: ' + error.message);
  }
}

module.exports = downloadInstagramVideo;

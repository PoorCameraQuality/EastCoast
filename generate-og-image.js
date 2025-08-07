const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to OG image dimensions
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 1,
  });
  
  // Load the HTML file
  const htmlPath = path.join(__dirname, 'public', 'og-image.html');
  await page.goto(`file://${htmlPath}`);
  
  // Wait for fonts to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({
    path: path.join(__dirname, 'public', 'og-image.png'),
    type: 'png',
    fullPage: false,
  });
  
  console.log('✅ Open Graph image generated: public/og-image.png');
  await browser.close();
}

// Check if puppeteer is installed
try {
  require('puppeteer');
  generateOGImage().catch(console.error);
} catch (error) {
  console.log('📝 To generate the PNG image, you can:');
  console.log('1. Install Puppeteer: npm install puppeteer');
  console.log('2. Run: node generate-og-image.js');
  console.log('');
  console.log('📝 Or manually:');
  console.log('1. Open public/og-image.html in your browser');
  console.log('2. Take a screenshot (1200x630px)');
  console.log('3. Save as public/og-image.png');
}

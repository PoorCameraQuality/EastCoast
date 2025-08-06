const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeEvents() {
  console.log('🚀 Starting web scraper...');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to your current website
    console.log('📄 Navigating to your website...');
    await page.goto('https://eastcoastkinkevents.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract event data
    console.log('🔍 Extracting event data...');
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('[data-event], .event, .event-item, [class*="event"]');
      
      return Array.from(eventElements).map((element, index) => {
        // Try different selectors to find event information
        const title = element.querySelector('h1, h2, h3, .title, .event-title')?.textContent?.trim() ||
                     element.querySelector('[class*="title"]')?.textContent?.trim() ||
                     `Event ${index + 1}`;
        
        const date = element.querySelector('.date, .event-date, [class*="date"]')?.textContent?.trim() ||
                    element.querySelector('time')?.textContent?.trim() ||
                    '';
        
        const location = element.querySelector('.location, .event-location, [class*="location"]')?.textContent?.trim() ||
                        element.querySelector('[class*="venue"]')?.textContent?.trim() ||
                        '';
        
        const description = element.querySelector('.description, .event-description, [class*="description"]')?.textContent?.trim() ||
                          element.querySelector('p')?.textContent?.trim() ||
                          '';
        
        const link = element.querySelector('a')?.href || '';
        
        return {
          id: index + 1,
          title,
          date,
          location,
          description,
          link,
          category: 'Event', // Default category
          scrapedAt: new Date().toISOString()
        };
      }).filter((event, index) => event.title && event.title !== `Event ${index + 1}`);
    });

    // Also try to find any structured data (JSON-LD)
    const structuredData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map(script => {
        try {
          return JSON.parse(script.textContent);
        } catch (e) {
          return null;
        }
      }).filter(data => data && (data['@type'] === 'Event' || data.type === 'Event'));
    });

    console.log(`✅ Found ${events.length} events`);
    console.log(`✅ Found ${structuredData.length} structured data events`);

    // Save the scraped data
    const scrapedData = {
      events,
      structuredData,
      scrapedAt: new Date().toISOString(),
      source: 'eastcoastkinkevents.com'
    };

    fs.writeFileSync('scraped-events.json', JSON.stringify(scrapedData, null, 2));
    console.log('💾 Saved scraped data to scraped-events.json');

    // Display sample of scraped data
    if (events.length > 0) {
      console.log('\n📋 Sample of scraped events:');
      events.slice(0, 3).forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`  Title: ${event.title}`);
        console.log(`  Date: ${event.date}`);
        console.log(`  Location: ${event.location}`);
        console.log(`  Description: ${event.description.substring(0, 100)}...`);
      });
    }

    return scrapedData;

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
}

// Run the scraper
scrapeEvents()
  .then(data => {
    console.log('\n🎉 Scraping completed successfully!');
    console.log(`📊 Total events found: ${data.events.length}`);
  })
  .catch(error => {
    console.error('💥 Scraping failed:', error);
    process.exit(1);
  }); 
# Web Scraping Documentation

This document explains how to scrape event data from your current Squarespace website and integrate it into your new Next.js application.

## 🚀 Quick Start

### 1. Scrape Your Current Website
```bash
node scraper.js
```
This will:
- Navigate to your current website
- Extract all event information
- Save raw data to `scraped-events.json`

### 2. Clean the Scraped Data
```bash
node process-events.js
```
This will:
- Remove duplicates and empty entries
- Clean up formatting
- Save cleaned data to `cleaned-events.json`

### 3. Update Your Next.js App
```bash
node update-events.js
```
This will:
- Process the cleaned data
- Update `src/data/events.js` with real event data
- Your website will now show real events!

## 📊 What Gets Scraped

The scraper extracts:
- ✅ Event titles
- ✅ Event dates
- ✅ Event locations
- ✅ Event descriptions
- ✅ Event links
- ✅ Event categories

## 🔧 Customization

### Modify the Scraper (`scraper.js`)
- Change the URL to scrape different pages
- Adjust selectors to match your website structure
- Add more data fields as needed

### Modify the Processor (`process-events.js`)
- Adjust filtering rules
- Change category detection logic
- Modify data cleaning rules

### Modify the Updater (`update-events.js`)
- Change how events are categorized
- Adjust description enhancement
- Modify the number of events to include

## 📁 File Structure

```
├── scraper.js              # Web scraper script
├── process-events.js       # Data cleaning script
├── update-events.js        # Data integration script
├── scraped-events.json     # Raw scraped data
├── cleaned-events.json     # Cleaned event data
└── src/
    └── data/
        └── events.js       # Final event data for your app
```

## 🔄 Updating Events

To update your events in the future:

1. **Run the scraper** to get fresh data:
   ```bash
   node scraper.js
   ```

2. **Process the new data**:
   ```bash
   node process-events.js
   ```

3. **Update your app**:
   ```bash
   node update-events.js
   ```

## 🛠️ Troubleshooting

### Common Issues

**Scraper not finding events:**
- Check if your website structure has changed
- Update selectors in `scraper.js`
- Try different CSS selectors

**Data not cleaning properly:**
- Check the raw data in `scraped-events.json`
- Adjust cleaning rules in `process-events.js`

**Events not showing on website:**
- Check the data in `src/data/events.js`
- Verify the import paths in your components
- Check browser console for errors

### Debug Mode

To see what the scraper is doing:
- Set `headless: false` in `scraper.js` to see the browser
- Add `console.log()` statements to debug data processing

## 📈 Results

From your current website, we successfully scraped:
- **95 raw events** found
- **58 cleaned events** after processing
- **20 events** integrated into your app

## 🎯 Next Steps

1. **Test the website** - Visit `http://localhost:4000` to see your real events
2. **Customize the styling** - Adjust the dark theme as needed
3. **Add more features** - Build the education and vendor sections
4. **Set up automation** - Create a scheduled job to update events regularly

## 💡 Tips

- **Backup your data** before running scripts
- **Test on a copy** of your website first
- **Monitor for changes** in your website structure
- **Keep scripts updated** as your website evolves

---

**Your website now has real event data from your current Squarespace site!** 🎉 
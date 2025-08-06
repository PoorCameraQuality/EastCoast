# Event Date Scraping Guide

## Overview
This script automatically checks event websites for updated dates and updates your events data file. It's designed to be run monthly to keep your event listings current.

## How to Use

### 1. Run the Script (Choose one method)

**Method A: Command Line**
```bash
node update-event-dates.js
```

**Method B: Windows Batch File (Easier)**
```bash
update-events.bat
```

### 2. What It Does
- Scrapes configured event websites
- Extracts dates using multiple patterns
- Updates your `src/data/events.js` file with new dates
- Creates automatic backups before making changes
- Provides detailed console output

### 3. Current Events Being Monitored
- **Primal Arts** (https://smsprimalarts.com/)
- **Dark Odyssey** (https://darkodyssey.com/)
- **Crucible Con** (https://www.cruciblecon.com/)

## Adding More Events

To add more events to monitor, edit the `eventScrapers` object in `update-event-dates.js`:

```javascript
const eventScrapers = {
  'your-event-slug': {
    url: 'https://event-website.com/',
    selectors: [
      'h1, h2, h3',
      '.event-date, .date, .event-info',
      'p',
    ],
    datePatterns: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
    ],
    keywords: ['2026', '2025', 'event', 'conference']
  },
  // ... existing events
};
```

## Date Formats Supported
- **Month Day, Year**: "January 15, 2026"
- **MM/DD/YYYY**: "1/15/2026"
- **YYYY-MM-DD**: "2026-01-15"

## Safety Features
- **Automatic Backups**: Creates timestamped backups before changes
- **Future Date Filtering**: Only updates with future dates
- **Error Handling**: Continues processing even if one site fails
- **Respectful Scraping**: Includes delays between requests

## Output Example
```
🚀 Starting event date update process...

🔍 Scraping primal-arts at https://smsprimalarts.com/
📅 Found 3 potential dates:
   - January 15, 2026
   - January 16, 2026
   - January 17, 2026
🔑 Found keywords: 2026, primal, arts, event
✅ Updated primal-arts dates to: January 15, 2026 - January 17, 2026

📊 Summary:
✅ Updated primal-arts: 3 dates found
⏭️  No changes dark-odyssey: 0 dates found
⏭️  No changes crucible-con: 0 dates found

🎉 Event date update process completed!
```

## Troubleshooting

### Common Issues
1. **No dates found**: Website structure may have changed
2. **Connection errors**: Check internet connection and website availability
3. **Parse errors**: Date format may not be supported

### Manual Review
The script shows the first 500 characters of scraped text. Review this to see if the scraping is working correctly.

## Best Practices
- Run monthly to keep data current
- Review console output for accuracy
- Check backup files if needed
- Test with a few events first before adding many

## Legal Considerations
- Respect robots.txt files
- Include delays between requests
- Use appropriate User-Agent headers
- Check website terms of service

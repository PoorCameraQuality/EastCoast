# East Coast Kink Events

A modern, responsive website for discovering and promoting kink events across the East Coast. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Event Discovery**: Browse and search events across the East Coast
- 📅 **Event Calendar**: View events in a calendar format
- 📝 **Event Submission**: Submit and promote your own events
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast Performance**: Optimized for speed and SEO
- 🎨 **Modern UI**: Beautiful, accessible design

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Static export for easy hosting
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/)
   - Or use a package manager like `winget install OpenJS.NodeJS`

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Export static files

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── EventsSection.tsx
│   ├── AboutSection.tsx
│   └── Footer.tsx
└── types/             # TypeScript type definitions
```

## Deployment

### Static Export (Recommended)

This project is configured for static export, making it easy to deploy to any hosting service:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `out` folder** to your hosting provider:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static hosting service

### Hosting Options

**Recommended for beginners:**
- **Netlify**: Free tier, easy deployment
- **Vercel**: Optimized for Next.js, free tier
- **GitHub Pages**: Free, good for static sites

**For self-hosting:**
- **DigitalOcean Droplet**: $5-10/month
- **VPS providers**: Linode, Vultr, AWS

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Content
- Update event data in `src/components/EventsSection.tsx`
- Modify text content in component files
- Add new pages in `src/app/`

### Styling
- Global styles in `src/app/globals.css`
- Component-specific styles using Tailwind classes
- Custom CSS classes defined in `globals.css`

## Content Management

Currently using mock data. To add a CMS:

1. **Headless CMS Options**:
   - Strapi (self-hosted)
   - Contentful
   - Sanity
   - WordPress (headless)

2. **Database Options**:
   - PostgreSQL
   - MongoDB
   - Supabase
   - Firebase

## SEO Optimization

- Meta tags configured in `layout.tsx`
- Semantic HTML structure
- Optimized for search engines
- Fast loading times

## Performance

- Static generation for fast loading
- Optimized images and assets
- Minimal JavaScript bundle
- Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please contact the development team.

---

**Note**: This is a template for East Coast Kink Events. Customize content, styling, and functionality to match your specific needs. 
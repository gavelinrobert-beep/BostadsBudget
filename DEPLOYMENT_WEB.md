# Deployment Instructions - Bostadsbudget Web App

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
4. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# For production deployment
vercel --prod
```

## Environment Configuration

This application doesn't require environment variables for basic functionality.

### Optional: Google Analytics (Future Enhancement)

If you want to add Google Analytics:

1. Create a `.env.local` file:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

2. Add to Vercel environment variables:
   - Go to Project Settings > Environment Variables
   - Add `NEXT_PUBLIC_GA_ID` with your tracking ID

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## Post-Deployment Checklist

- [ ] Verify the site is accessible at your Vercel URL
- [ ] Test the calculator functionality
- [ ] Check that favicon and meta tags are loading correctly
- [ ] Test Open Graph preview on social media (LinkedIn, Facebook, Twitter)
- [ ] Verify mobile responsiveness
- [ ] Check Lighthouse scores (Performance, Accessibility, SEO)

## Icon Assets TODO

The current icons are SVG placeholders. To create production-ready icons:

1. Create a 1024x1024 icon design
2. Generate the following files:
   - `public/icon.svg` - Vector icon (already has placeholder)
   - `public/favicon.ico` - 32x32 favicon
   - `public/apple-touch-icon.png` - 180x180 for iOS
   - `public/opengraph-image.png` - 1200x630 for Open Graph
   
3. Recommended tools:
   - Figma or Adobe Illustrator for design
   - https://realfavicongenerator.net/ for generating all sizes
   - https://www.favicon.cc/ for simple favicon creation

## SEO Optimization Checklist

- [x] Meta title and description configured
- [x] Open Graph tags added
- [x] Twitter Card tags added
- [x] Structured data (JSON-LD) for calculator
- [x] Semantic HTML (header, main, sections)
- [x] Swedish language tag (lang="sv")
- [x] Viewport meta tag
- [ ] Create sitemap.xml (if adding more pages)
- [ ] Create robots.txt (if needed)

## Monitoring and Analytics

Consider adding:
- Google Analytics for traffic monitoring
- Vercel Analytics (built-in, automatic)
- Sentry for error tracking
- Google Search Console for SEO monitoring

## Update Frequency

- Monitor Vercel deployments dashboard
- Automatic deployments on git push to main branch
- Preview deployments for pull requests

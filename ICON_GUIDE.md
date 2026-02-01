# Icon Generation Guide for Bostadsbudget

## Current State

The project currently includes:
- **Web App**: SVG placeholder icon in `public/icon.svg`
- **Mobile App**: Default Expo icons in `bostadsbudget-mobile/assets/`

## Production-Ready Icons TODO

Before deploying to production, create proper branded icons:

### 1. Design the Icon

**Requirements:**
- Size: 1024x1024 pixels (master size)
- Format: PNG with transparent background OR SVG
- Design guidelines:
  - Simple and recognizable at small sizes
  - Works well in both light and dark modes
  - Reflects the housing/budget theme (house icon is good!)
  - Avoid fine details that won't be visible at 16x16 or 32x32

**Design Tools:**
- Figma (free, online): https://figma.com
- Adobe Illustrator (paid)
- Canva (free, easy to use): https://canva.com
- Inkscape (free, open-source): https://inkscape.org

**Current Placeholder:**
The existing `public/icon.svg` shows a simple blue house icon. You can:
- Keep and refine this design
- Create a completely new design
- Hire a designer on Fiverr or 99designs

### 2. Generate Web App Icons

**Required Files for `/public/`:**

1. **favicon.ico** - 32x32, legacy favicon
2. **icon.svg** - Vector icon (modern browsers)
3. **apple-touch-icon.png** - 180x180, iOS home screen
4. **opengraph-image.png** - 1200x630, social media previews
5. **manifest.json** - Already created, update icon paths if needed

**Automated Generation:**

Use https://realfavicongenerator.net/ (recommended):
1. Upload your 1024x1024 PNG
2. Customize appearance for different platforms
3. Download the generated package
4. Extract files to `/public/` folder
5. Update `app/layout.tsx` if icon paths change

**Manual Generation (using ImageMagick):**

```bash
# Install ImageMagick
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick
# Windows: Download from https://imagemagick.org

# From 1024x1024 master icon:
convert icon-1024.png -resize 180x180 public/apple-touch-icon.png
convert icon-1024.png -resize 32x32 public/favicon.ico
cp icon-1024.svg public/icon.svg  # if you have SVG version

# For Open Graph image (1200x630), add your icon to a background
convert -size 1200x630 xc:#3B82F6 \
  icon-1024.png -resize 400x400 -gravity center -composite \
  public/opengraph-image.png
```

### 3. Generate Mobile App Icons

**Required Files for `bostadsbudget-mobile/assets/`:**

1. **icon.png** - 1024x1024, app icon
2. **adaptive-icon.png** - 1024x1024, Android adaptive icon
3. **splash.png** - 1284x2778, splash screen (design with safe area)
4. **favicon.png** - 48x48, for Expo web

**Using Expo Asset Generator:**

```bash
cd bostadsbudget-mobile

# Install expo-asset-utils (optional)
npm install -D @expo/image-utils

# Or use online tool:
# https://www.appicon.co/ - generates all required sizes
# https://apetools.webprofusion.com/#/tools/imagegorilla - alternative
```

**Adaptive Icon Design (Android):**

Android adaptive icons have two layers:
- **Foreground**: Your icon (safe area: 768x768 in center)
- **Background**: Solid color or pattern (full 1024x1024)

The system crops your icon into different shapes (circle, rounded square, etc.).

**Tips:**
- Keep important elements in the center 768x768 safe area
- The outer 256px on each side may be cropped
- Set background color in `app.json` (currently `#3B82F6`)

### 4. Update App Configuration

**Web App (`app/layout.tsx`):**

Already configured, but verify links:
```tsx
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
```

**Mobile App (`bostadsbudget-mobile/app.json`):**

Already configured, but verify paths:
```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#3B82F6"
    }
  }
}
```

### 5. Splash Screen Design

**Dimensions:** 1284x2778 (iPhone 14 Pro Max)

**Safe Area:**
- Keep important content in center
- Avoid edges where notches/status bars appear
- Use same background color as configured in `app.json`

**Quick Splash Screen:**

1. Create 1284x2778 canvas with #3B82F6 background
2. Place your icon (512x512) in center
3. Add app name below icon (optional)
4. Export as PNG
5. Save to `bostadsbudget-mobile/assets/splash.png`

### 6. Test Your Icons

**Web App:**
```bash
npm run dev
# Visit http://localhost:3000
# Check browser tab for favicon
# Check bookmark/home screen appearance
# Test Open Graph: https://www.opengraph.xyz/
```

**Mobile App:**
```bash
cd bostadsbudget-mobile
npx expo start
# Scan QR code with Expo Go
# Check app icon in Expo Go
# Test on actual device: eas build --profile preview
```

**Preview Tools:**
- **Favicon**: https://realfavicongenerator.net/favicon_checker
- **Open Graph**: https://www.opengraph.xyz/ or https://cards-dev.twitter.com/validator
- **iOS Home Screen**: Add to home screen from Safari
- **Android Home Screen**: Add to home screen from Chrome

### 7. Validation Checklist

Before going to production:

**Web:**
- [ ] Favicon visible in browser tab
- [ ] Apple touch icon appears when adding to iOS home screen
- [ ] Open Graph image displays correctly when sharing on social media
- [ ] PWA manifest icons work (if implementing PWA features)
- [ ] Icons display correctly in light and dark mode

**Mobile:**
- [ ] App icon looks good on device home screen
- [ ] Splash screen displays correctly on various screen sizes
- [ ] Android adaptive icon looks good in all shapes (circle, rounded, squircle)
- [ ] No pixelation or blur at any size
- [ ] Icon meets App Store and Play Store guidelines

### 8. Store Guidelines

**Apple App Store:**
- No transparency in app icon (will be removed)
- No alpha channel
- Must fill entire frame
- No rounded corners (iOS adds them)
- Size: 1024x1024 PNG

**Google Play Store:**
- 32-bit PNG with alpha
- Size: 512x512
- Full bleed icon
- File size: under 1 MB

### 9. Resources

**Icon Design Inspiration:**
- https://dribbble.com/search/app-icon
- https://www.behance.net/search/projects?search=app%20icon
- https://www.flaticon.com/ (free icons)
- https://www.iconfinder.com/

**Icon Testing:**
- https://realfavicongenerator.net/
- https://www.opengraph.xyz/
- https://appicon.co/

**Guidelines:**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Google Material Design Icons](https://m3.material.io/styles/icons/overview)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Quick Start (5 Minutes)

If you need icons fast:

1. Create a simple design in Canva (free)
2. Export 1024x1024 PNG
3. Use https://realfavicongenerator.net/ for web icons
4. Use https://www.appicon.co/ for mobile icons
5. Replace files in `/public/` and `bostadsbudget-mobile/assets/`
6. Test locally
7. Deploy!

## Professional Approach

For a polished, professional app:

1. Hire a designer (Fiverr, 99designs, Upwork)
2. Brief: App name, purpose, color scheme, style preferences
3. Request: 1024x1024 master icon + source files
4. Generate all sizes using tools above
5. Iterate based on testing
6. Follow platform guidelines strictly

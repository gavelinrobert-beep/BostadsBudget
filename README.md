# BostadsBudget

A comprehensive housing budget calculator available as both a web application and mobile app. Calculate your true housing costs including mortgage, operations, energy, and renovation expenses.

**Räkna ut din verkliga boendekostnad inklusive renovering och energi.**

## 🏠 Features

- **Mortgage Calculations**: Interest and amortization based on Swedish rules
- **Operating Costs**: Monthly maintenance and utilities
- **Renovation Planning**: Amortized renovation costs over time
- **Loan-to-Value Ratio**: Automatic calculation of belåningsgrad
- **Swedish Standards**: Follows Swedish amortization requirements
- **Cross-Platform**: Available as web app and native mobile app

## 📱 Applications

### Web Application (Next.js)
- Modern, responsive design
- Works on any device with a browser
- SEO optimized
- Progressive Web App ready

### Mobile Application (React Native/Expo)
- Native iOS and Android apps
- Offline functionality
- Touch-optimized interface
- Local data storage

## 🚀 Getting Started

### Web App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000

### Mobile App

```bash
# Navigate to mobile app directory
cd bostadsbudget-mobile

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## 📦 Project Structure

```
BostadsBudget/
├── app/                      # Next.js web app (App Router)
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Main calculator page
│   └── globals.css          # Global styles
├── bostadsbudget-mobile/    # React Native mobile app
│   ├── app/                 # Expo Router pages
│   ├── assets/              # Images and icons
│   ├── lib/                 # Shared calculator logic
│   ├── app.json            # Expo configuration
│   └── eas.json            # EAS Build configuration
├── public/                  # Web app static assets
│   ├── icon.svg            # Vector favicon
│   ├── favicon.ico         # Legacy favicon
│   ├── apple-touch-icon.png # iOS home screen icon
│   └── manifest.json       # PWA manifest
├── src/                     # Shared web app utilities
│   └── lib/
│       ├── calculators.ts  # Core calculation logic
│       └── utils.ts        # Utility functions
├── DEPLOYMENT_WEB.md       # Web deployment guide
├── DEPLOYMENT_MOBILE.md    # Mobile deployment guide
├── ICON_GUIDE.md          # Icon generation guide
├── PRIVACY_POLICY.md      # Privacy policy template
└── TERMS_OF_SERVICE.md    # Terms of service template
```

## 🛠 Technology Stack

### Web App
- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety
- **Deployment**: Vercel

### Mobile App
- **Framework**: Expo SDK 52
- **React**: React 18
- **Navigation**: Expo Router
- **UI Library**: React Native Paper
- **Storage**: AsyncStorage
- **Build**: EAS Build

## 📝 Calculator Logic

The housing budget calculator computes:

1. **Loan Amount**: `bostadspris - kontantinsats`
2. **LTV Ratio**: `(lånebelopp / bostadspris) * 100`
3. **Amortization Requirement**:
   - LTV > 70%: 2% per year
   - LTV 50-70%: 1% per year
   - LTV < 50%: 0% (optional)
4. **Monthly Costs**:
   - Interest: `lånebelopp * årsränta / 12`
   - Amortization: `lånebelopp * amorteringsprocent / 12`
   - Operations: `driftkostnad + elkostnad`
   - Renovation: `renoveringskostnad / renoveringsintervall / 12`

## 🚢 Deployment

### Deploy Web App to Vercel

See [DEPLOYMENT_WEB.md](./DEPLOYMENT_WEB.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import project in Vercel dashboard
3. Deploy automatically

### Deploy Mobile App to Stores

See [DEPLOYMENT_MOBILE.md](./DEPLOYMENT_MOBILE.md) for detailed instructions.

**Quick Overview:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
cd bostadsbudget-mobile
eas build:configure

# Build for iOS and Android
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --latest
```

## 🎨 Branding

### Current Icons
- Placeholder SVG icons are included
- Blue house design (#3B82F6)
- Ready for customization

### Create Production Icons
See [ICON_GUIDE.md](./ICON_GUIDE.md) for comprehensive icon generation guide.

**Quick steps:**
1. Design 1024x1024 master icon
2. Use https://realfavicongenerator.net/ for web
3. Use https://www.appicon.co/ for mobile
4. Replace files in `public/` and `bostadsbudget-mobile/assets/`

## 📋 Pre-Production Checklist

### Web App
- [ ] Create production-ready icons (see ICON_GUIDE.md)
- [ ] Test Open Graph preview on social media
- [ ] Run Lighthouse audit
- [ ] Test on multiple browsers and devices
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (optional)

### Mobile App
- [ ] Create production-ready icons and splash screen
- [ ] Update bundle identifier (iOS) and package name (Android)
- [ ] Test on physical devices (iOS and Android)
- [ ] Complete app store listings
- [ ] Review privacy policy and terms
- [ ] Submit for TestFlight and internal testing
- [ ] Gather beta tester feedback

### Legal
- [ ] Review and customize PRIVACY_POLICY.md
- [ ] Review and customize TERMS_OF_SERVICE.md
- [ ] Consult with legal professional
- [ ] Host policies on public URL
- [ ] Add links to app store listings

## 🔒 Privacy & Security

- **Local Storage Only**: All calculation data stays on user's device
- **No Server Transmission**: Financial information never sent to servers
- **No Account Required**: No user accounts or authentication
- **Anonymous Analytics**: Only anonymous usage stats collected (if enabled)
- **GDPR Compliant**: Follows EU data protection regulations

See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for complete privacy policy.

## 📄 License

[Insert your license here - MIT, Apache 2.0, etc.]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@bostadsbudget.com (update with actual email)

## 🙏 Acknowledgments

- Built with Next.js and Expo
- UI inspired by modern financial calculators
- Calculator logic follows Swedish mortgage regulations

---

**Made with ❤️ for better housing budget planning**

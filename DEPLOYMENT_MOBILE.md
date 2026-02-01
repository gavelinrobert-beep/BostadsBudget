# Deployment Instructions - Bostadsbudget Mobile App

## Prerequisites

### Required
- Expo account (sign up at https://expo.dev)
- EAS CLI installed: `npm install -g eas-cli`
- Apple Developer account (for iOS, $99/year)
- Google Play Developer account (for Android, $25 one-time)

### Setup

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure your project**
   ```bash
   cd bostadsbudget-mobile
   eas build:configure
   ```
   This will create/update your `eas.json` file and link to your Expo project.

## iOS Deployment (TestFlight)

### First-Time Setup

1. **Apple Developer Account**
   - Enroll at https://developer.apple.com
   - Accept all agreements
   - Note your Team ID

2. **App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Bundle ID: `com.bostadsbudget.app`
   - Note your ASC App ID

3. **Update eas.json**
   - Replace `your-apple-id@example.com` with your Apple ID
   - Replace `your-asc-app-id` with your App Store Connect App ID
   - Replace `your-team-id` with your Apple Developer Team ID

### Build for iOS

1. **Create a preview build (for TestFlight)**
   ```bash
   eas build --platform ios --profile preview
   ```
   Or for production:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Wait for build to complete** (usually 10-20 minutes)
   - You'll receive an email when done
   - Or monitor at https://expo.dev

3. **Submit to TestFlight**
   ```bash
   eas submit --platform ios --latest
   ```
   
   Or do it manually:
   - Download the .ipa file from Expo dashboard
   - Use Transporter app or Xcode to upload to App Store Connect

### TestFlight Distribution

1. Go to App Store Connect > TestFlight
2. Wait for Apple's automated review (~1 hour)
3. Add internal testers (up to 100)
4. Add external testers (requires beta review)
5. Share TestFlight invite link

## Android Deployment (Play Store Internal Testing)

### First-Time Setup

1. **Google Play Console**
   - Sign up at https://play.google.com/console
   - Pay $25 one-time registration fee
   - Create new app
   - Package name: `com.bostadsbudget.app`

2. **Service Account Key** (for automated submission)
   
   a. Go to Google Cloud Console
   b. Select your project (or create one)
   c. Enable Google Play Android Developer API
   d. Create Service Account:
      - Name: "EAS Submit"
      - Grant "Service Account User" role
   e. Create JSON key
   f. Download and save as `android-service-account.json`
   
   g. In Google Play Console:
      - Settings > API access
      - Link the service account
      - Grant "Admin" permission

3. **Update eas.json**
   - Ensure `serviceAccountKeyPath` points to your JSON key file

### Build for Android

1. **Create a preview build (APK for testing)**
   ```bash
   eas build --platform android --profile preview
   ```
   
   Or for production (AAB for Play Store):
   ```bash
   eas build --platform android --profile production
   ```

2. **Wait for build to complete** (usually 10-20 minutes)

3. **Submit to Play Store**
   ```bash
   eas submit --platform android --latest
   ```
   
   Or do it manually:
   - Download the .aab file from Expo dashboard
   - Upload to Play Console > Production > Create new release

### Play Store Internal Testing

1. Go to Play Console > Testing > Internal testing
2. Create new release
3. Upload AAB file
4. Add internal testers (email addresses)
5. Testers will receive email with opt-in link

## Build Profiles Explained

### Development
- For local development
- Includes dev client
- iOS: Can run on simulator
- Not for distribution

### Preview
- For testing before production
- iOS: Creates IPA for TestFlight
- Android: Creates APK for direct installation
- For internal testing only

### Production
- For store submission
- iOS: Optimized IPA for App Store
- Android: AAB (App Bundle) for Play Store
- Fully optimized and minified

## Version Management

When releasing updates:

1. **Update version in app.json**
   ```json
   {
     "version": "1.0.1",
     "ios": {
       "buildNumber": "2"
     },
     "android": {
       "versionCode": 2
     }
   }
   ```

2. **Build and submit**
   ```bash
   eas build --platform all --profile production
   eas submit --platform all --latest
   ```

## Privacy Policy & Terms

Before submitting to stores, you need:

1. **Privacy Policy** (see `PRIVACY_POLICY.md`)
   - Host it on a public URL
   - Link in app stores

2. **Terms of Service** (see `TERMS_OF_SERVICE.md`)
   - Host it on a public URL
   - Link in app stores

3. **Update Store Listings**
   - Add privacy policy URL
   - Add terms of service URL (if applicable)

## Common Issues

### iOS Build Fails
- Ensure you have accepted all Apple Developer agreements
- Verify your Apple ID credentials
- Check that bundle identifier is unique and registered

### Android Build Fails
- Verify package name is unique
- Check service account permissions
- Ensure API is enabled in Google Cloud Console

### Submit Fails
- Update eas.json with correct IDs and paths
- Verify service account has proper permissions
- Check that you've completed all store setup steps

## Testing Checklist

Before submitting to stores:

- [ ] Test on physical iOS device (via Expo Go or development build)
- [ ] Test on physical Android device
- [ ] Test all calculator functions
- [ ] Verify app icons and splash screen
- [ ] Test in portrait mode (locked orientation)
- [ ] Test on different screen sizes
- [ ] Test offline behavior (if applicable)
- [ ] Test data persistence (AsyncStorage)
- [ ] Review app permissions (should be minimal)

## Store Submission Checklist

### iOS
- [ ] Verify bundle identifier matches
- [ ] Build number incremented
- [ ] Screenshot created (required sizes)
- [ ] App description written
- [ ] Keywords selected
- [ ] Privacy policy URL added
- [ ] Support URL added
- [ ] TestFlight external test info completed

### Android
- [ ] Verify package name matches
- [ ] Version code incremented
- [ ] Screenshots created (phone & tablet)
- [ ] App description written
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Target audience selected
- [ ] Store listing completed

## Resources

- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Expo Application Services](https://expo.dev/eas)

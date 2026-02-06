# Lithovolt Mobile App

React Native mobile application for Lithovolt Battery Management Platform.

## Features

- **Wholesaler App**: Inventory management, order placement, warranty generation
- **Consumer App**: Warranty registration, QR scanning, warranty verification
- **Cross-platform**: iOS and Android using React Native/Expo

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable components
│   ├── screens/          # App screens
│   │   ├── wholesaler/  # Wholesaler screens
│   │   ├── consumer/    # Consumer screens
│   │   └── auth/        # Auth screens
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── store/            # State management
│   ├── utils/            # Utilities
│   ├── constants/        # Constants
│   └── styles/           # Global styles
├── assets/               # Images, fonts, etc.
├── App.js                # Root component
├── app.json              # Expo config
└── package.json
```

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
# iOS
npm run ios

# Android
npm run android

# Expo Go app (scan QR code)
npm start
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Key Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **Expo Camera** - QR code scanning
- **QRCode** - QR code generation

## Features by Role

### Wholesaler App
- Login/Authentication
- Dashboard with statistics
- View allocated inventory
- Place orders
- Scan battery serial numbers
- Generate warranty certificates
- Sales history
- Profile management

### Consumer App
- OTP-based login
- Scan QR code / Enter serial number
- View warranty details
- Download warranty certificate
- Place orders for batteries/accessories
- Track order status
- Service center locator

## API Integration

API configuration in `src/services/api.js`:
- Base URL from Expo config
- JWT authentication
- Automatic token refresh
- Error handling

## Navigation Structure

### Wholesaler Stack
- Login
- Dashboard
- Inventory
- Orders
- Sales
- Profile

### Consumer Stack
- Welcome/Login
- Home
- Scan QR
- Warranty Details
- Orders
- Profile

## Building for Production

### Android
```bash
# Build APK
expo build:android -t apk

# Build AAB (for Play Store)
expo build:android -t app-bundle
```

### iOS
```bash
# Build for App Store
expo build:ios
```

## App Store Assets

Required assets in `assets/`:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen
- `adaptive-icon.png` - Android adaptive icon
- Screenshots for stores (as per requirements)

## Permissions

### Android
- Camera (QR scanning)
- Storage (document downloads)

### iOS
- Camera (QR scanning)
- Photo Library (document saves)

## Environment Variables

Configure in `app.json` extra field:
- `apiUrl` - Backend API URL

## Testing

```bash
# Run tests
npm test

# E2E testing (future)
# Using Detox or similar
```

## Deployment Checklist

- [ ] Update version in app.json
- [ ] Test on physical devices
- [ ] Generate app icons
- [ ] Create store screenshots
- [ ] Prepare store listing
- [ ] Build production builds
- [ ] Submit to stores

## Development Guidelines

1. Use functional components with hooks
2. Follow React Native best practices
3. Handle offline scenarios
4. Optimize images and assets
5. Test on both iOS and Android
6. Handle permissions properly

## Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
expo start -c  # Clear cache
```

**iOS build fails:**
- Check Xcode version
- Clear derived data

**Android build fails:**
- Check Java/Gradle versions
- Clean Android build

## License

Proprietary - Lithovolt Platform

# Get Handyman — Mobile (React Native / Expo)

The native Android worker app, built with React Native + Expo. Same
enquiries → jobs → invoices → Report flow as the backend, structured as
small, single-purpose components — one per file, each with a short
header comment.

## The services layer (start here)

Every API call in the app goes through `src/services/`:

- **`apiClient.js`** — the ONE Axios instance. Base URL, auth headers,
  401 handling — all in one place.
- **`authService.js`, `settingsService.js`, `enquiryService.js`,
  `jobService.js`, `invoiceService.js`, `reportService.js`** — one small
  function per backend endpoint.
- **`index.js`** — barrel file re-exporting all of the above.

No screen, component, or hook imports axios or fetch directly — they
all call functions from these files. When your backend is ready (or
changes), you only need to touch `apiClient.js` (the base URL) and,
if any endpoint paths differ, the relevant service file. Nothing else
in the app needs to change.

## Quick start

```bash
cd mobile
cp .env.example .env       # set EXPO_PUBLIC_API_URL — see notes below
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android phone (install
it from the Play Store first), or press `a` in the terminal to launch
an Android emulator if you have Android Studio set up.

### Pointing at your backend

- **Android emulator**, backend running on your own machine:
  `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000`
- **Physical phone** on the same WiFi as your backend:
  `EXPO_PUBLIC_API_URL=http://<your-computer's-LAN-IP>:5000`
- **Deployed backend**: `EXPO_PUBLIC_API_URL=https://api.yourdomain.com`

### Building an installable APK

Once you're ready for a real installable file (not just Expo Go):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

This builds an `.apk` you can install directly on any Android phone,
via EAS's free build service (no Android Studio required).

## Where things live

| Folder | Purpose |
|---|---|
| `src/services/` | **the API layer** — see above |
| `src/context/` | Auth, Settings, Toast — app-wide state (AsyncStorage-backed) |
| `src/hooks/` | one data hook per resource, pairing a service with loading/error state |
| `src/theme/` | colors.js / spacing.js — the same palette as the web app |
| `src/components/ui/` | generic building blocks (Button, Card, Chip, Toggle, StatRow…) |
| `src/components/<feature>/` | one small component per piece of UI, feature by feature |
| `src/navigation/` | RootNavigator (login gate) → MainTabNavigator (bottom tabs) → one stack per tab |
| `src/screens/` | one screen per route — composes small components + a data hook |

## Not included yet

- PDF preview / Share (the buttons exist in `InvoiceActions.js`, wired
  to callbacks — plug in `expo-print` + `expo-sharing` there)
- Push notifications
- iOS-specific polish (this was built and tested against Android)
- App icons/splash screen (using Expo defaults — replace `assets/`)

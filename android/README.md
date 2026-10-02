# Bus Ride App - Android Studio & Google Play Store Deployment Guide

This project includes a native Android Studio project located in `/android`, configured with modern Android standards (**Target SDK 34, Min SDK 24, Kotlin 1.9+, AndroidX, Proguard, and Digital Asset Links**).

---

## 📋 Project Specifications
- **Application ID / Package Name**: `et.busride.amhara`
- **Application Name**: `ባስ ራይድ - Bus Ride`
- **Short Name**: `ባስ ራይድ`
- **Target SDK**: `34` (Android 14 / 15 ready - Google Play Store Requirement)
- **Min SDK**: `24` (Android 7.0 Nougat+, supporting >97% of active devices in Ethiopia)
- **Architecture**: Native Android wrapper with Hardware Accelerated WebKit & JavascriptBridge (`WebAppInterface`), Geolocation prompt handling, Camera/QR scanner intent picker, and offline caching.

---

## 🛠️ Step 1: Open & Run in Android Studio

1. **Prerequisites**:
   - Install [Android Studio](https://developer.android.com/studio) (Iguana, Jellyfish, Koala, or Ladybug).
   - Java Development Kit (JDK) 17 (bundled with modern Android Studio).

2. **Open the Project**:
   - Launch Android Studio.
   - Click **Open** (or `File > Open...`).
   - Browse to this repository and select the **`android`** folder (e.g. `/path-to-repo/android`).
   - Allow Gradle to sync dependencies automatically.

3. **Run on an Emulator or Real Device**:
   - Enable **Developer Options** and **USB Debugging** on your physical Android phone (or create a virtual device via Android Studio Device Manager: Pixel 7 / Pixel 8, API 34).
   - Connect phone via USB cable or wireless ADB.
   - Click the green **Run (▶)** button in the top toolbar or press `Shift + F10`.
   - The app will install and open with the splash screen and regional transit interface!

---

## 🔐 Step 2: Generate Release Keystore (For Play Store)

Google Play requires all release applications to be digitally signed with a private cryptographic key.

Run the following command in your terminal:

```bash
keytool -genkey -v -keystore release.jks -alias busride -keyalg RSA -keysize 2048 -validity 10000
```

When prompted:
- **Keystore password**: Enter a secure password (store securely).
- **First and last name**: `Bus Ride Ethiopia Transit`
- **Organizational unit**: `Transit Operations`
- **Organization**: `Bus Ride App SC`
- **City / Locality**: `Bahir Dar`
- **State / Province**: `Amhara`
- **Country Code**: `ET`

Place the generated `release.jks` in `android/app/keystore/release.jks`.

### Extract SHA-256 Fingerprint for Digital Asset Links:
To verify ownership for Trusted Web Activity and Google App Links:
```bash
keytool -list -v -keystore release.jks -alias busride
```
Look for `Certificate fingerprints:` and copy the `SHA256: ...` string into:
`public/.well-known/assetlinks.json`.

---

## 📦 Step 3: Build Signed Android App Bundle (.aab)

Google Play Store accepts **Android App Bundles (`.aab`)** for production releases.

### Method A: Using Android Studio GUI
1. In Android Studio, go to the top menu: **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Select your `release.jks` path, enter your keystore & key password, alias `busride`.
4. Select destination folder and choose **release** build variant.
5. Check **V1 (Jar Signature)** and **V2 (Full APK Signature)** if shown.
6. Click **Finish**. Your `.aab` file will be generated in `android/app/release/app-release.aab`.

### Method B: Using Gradle Terminal Command
```bash
cd android
./gradlew bundleRelease
```
The output file will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Step 4: Publish to Google Play Console

1. **Log in to Play Console**:
   Go to [https://play.google.com/console](https://play.google.com/console) with your Google Play Developer Account.

2. **Create New App**:
   - Click **Create app**.
   - App Name: `Bus Ride - የኢትዮጵያ አውቶቡስ ትራንስፖርት`
   - Default language: `English (United States)` or `Amharic`
   - App or Game: `App`
   - Free or Paid: `Free`
   - Accept Declarations and click **Create app**.

3. **Store Listing Details**:
   - **Short description (80 chars)**:
     `የአማራ ክልል ከተሞች አውቶቡስ ትኬት መቁረጫ እና የቀጥታ ጉዞ መከታተያ መተግበሪያ`
     `Intercity bus booking, live GPS radar & terminal schedules in Amhara, Ethiopia.`
   - **Full description**:
     Highlight key capabilities:
     - Real-time seat reservation across 15 Amhara transit terminals (Bahir Dar, Gondar, Dessie, Debre Markos, Lalibela, etc.)
     - Telebirr & CBE Birr integrated digital payments
     - Offline digital boarding passes with QR codes
     - Multi-role portals for Passengers, Commercial Drivers, Bus Owners & Station Masters
   - **App Icon**: Upload `public/pwa-512x512.png` (512x512 PNG, 32-bit color).
   - **Feature Graphic**: 1024 x 500 PNG/JPEG (banner showing Ethiopian transit routes).
   - **Phone Screenshots**: Take 2 to 8 screenshots of the app tabs (Booking, Live Radar, Dashboards, Offline Ticket).

4. **App Content & Data Safety**:
   - **Location**: Used strictly for transit terminal distance calculation and real-time bus radar tracking.
   - **Camera**: Used only when drivers/passengers choose to scan ticket QR codes or upload luggage photos.
   - **Target Audience**: 13+ (Everyone).
   - **Financial Features**: Commercial bus ticketing (standard transport utility).

5. **Upload App Bundle (`.aab`)**:
   - Navigate to **Production** (or **Testing > Closed testing** for initial beta rollout).
   - Click **Create new release**.
   - Drag and drop `app-release.aab`.
   - Release Name: `1.0.0 (Build 1)`.
   - Release Notes (English & Amharic):
     `Initial production release of Bus Ride App with multi-role dashboards, offline QR passes, and live bus radar.`
   - Click **Next** -> **Review release** -> **Start rollout to Production**!

---

## 💡 Troubleshooting & Tips

- **Cleartext traffic**: Disabled by default in `AndroidManifest.xml` (`usesCleartextTraffic="false"`). All endpoints use secure HTTPS.
- **Offline Mode**: If the traveler is traversing the Blue Nile Gorge or rural highway with zero connectivity, the app's service worker and SQLite cache keep their digital QR pass active!
- **Play App Signing**: When you upload your AAB to Google Play, Google manages the app signing key. Copy Google's generated SHA-256 fingerprint from **Play Console > Setup > App Integrity** into `public/.well-known/assetlinks.json`.

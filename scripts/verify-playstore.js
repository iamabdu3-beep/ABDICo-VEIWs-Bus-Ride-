#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚌 === Checking Android Studio & Google Play Store Readiness === 🚌\n');

const checks = [];

function checkFile(filePath, label) {
  const exists = fs.existsSync(filePath);
  checks.push({ label, status: exists ? 'PASS' : 'FAIL', details: filePath });
  return exists;
}

// 1. Android Studio Project Files
checkFile('android/build.gradle', 'Root build.gradle');
checkFile('android/settings.gradle', 'Root settings.gradle');
checkFile('android/gradle.properties', 'Gradle Properties');
checkFile('android/app/build.gradle', 'App build.gradle (Module)');
checkFile('android/app/proguard-rules.pro', 'Proguard Rules');
checkFile('android/app/src/main/AndroidManifest.xml', 'Android Manifest');
checkFile('android/app/src/main/java/et/busride/amhara/MainActivity.kt', 'MainActivity (Kotlin)');
checkFile('android/app/src/main/java/et/busride/amhara/WebAppInterface.kt', 'WebAppInterface Bridge');

// 2. Play Store & AssetLinks
checkFile('public/.well-known/assetlinks.json', 'Digital Asset Links (.well-known/assetlinks.json)');
checkFile('public/manifest.json', 'PWA Web App Manifest');
checkFile('twa-manifest.json', 'Google Bubblewrap TWA Manifest');

// 3. Icons
checkFile('public/pwa-192x192.png', '192x192 Icon');
checkFile('public/pwa-512x512.png', '512x512 Play Store Icon');
checkFile('public/app-logo.png', 'HD App Logo');

// Summary Output
console.table(checks);

const allPassed = checks.every(c => c.status === 'PASS');
if (allPassed) {
  console.log('\n✅ All Android Studio & Play Store prerequisites are complete and verified!');
  console.log('Ready to open in Android Studio:');
  console.log('  1. Open Android Studio');
  console.log('  2. Click "Open" and select the "/android" directory');
  console.log('  3. Click "Run" or select "Build > Generate Signed Bundle / APK"');
} else {
  console.log('\n❌ Some files are missing. Please inspect the table above.');
  process.exit(1);
}

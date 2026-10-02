# Bus Ride App - Android Proguard Rules

# Keep JavaScript Interface methods so WebView can communicate with native Android
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class et.busride.amhara.WebAppInterface {
    <methods>;
}

# AndroidX WebKit keep rules
-keep class androidx.webkit.** { *; }

# Preserve Line Numbers for Debugging Crashes in Google Play Console
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

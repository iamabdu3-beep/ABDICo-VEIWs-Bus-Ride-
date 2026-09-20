import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Bell,
  WifiOff,
  Sparkles,
  Layers,
  X,
  Share2,
  ExternalLink,
  Shield,
  Vibrate,
  Copy,
  Check,
  Wifi,
  BatteryMedium,
  Bus,
  Radio,
  MapPin,
  Building2,
  Users,
  Volume2,
  PhoneCall,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic, isAndroidDevice, isStandaloneApp, playTerminalChime } from '../utils/haptics';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPrompt: () => void;
  lang: Language;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPrompt,
  lang,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [phonePreviewTab, setPhonePreviewTab] = useState<'app' | 'launcher'>('app');
  const [chimePlayed, setChimePlayed] = useState(false);
  const isAm = lang === 'am';
  const isAndroid = isAndroidDevice();
  const isInstalled = isStandaloneApp();

  if (!isOpen) return null;

  const handleTestChime = () => {
    setChimePlayed(true);
    triggerHaptic([25, 40, 30]);
    playTerminalChime();
    setTimeout(() => setChimePlayed(false), 1200);
  };

  const handleCopyApkCommand = () => {
    triggerHaptic(15);
    navigator.clipboard.writeText(
      'npx @bubblewrap/cli init --manifest=https://ais-dev-iaqi6iwmhmuh7dkl53phji-360328436489.europe-west2.run.app/manifest.json && npx @bubblewrap/cli build'
    );
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
        {/* Close button */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 border-b border-neutral-100 pb-4 shrink-0">
          <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-md shadow-emerald-950/25 border border-emerald-500/40 shrink-0 bg-emerald-800">
            <img
              src="/app-logo.png"
              alt="Bus Ride App Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Android PWA / APK
              </span>
              {isInstalled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAm ? 'ተጭኗል' : 'Installed'}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-0.5 leading-tight">
              {isAm ? 'የአውቶቡስ ጉዞ መተግበሪያ (Bus Ride App)' : 'Bus Ride App - Android'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isAm
                ? 'በስልክዎ እንደ ተፈጥሯዊ መተግበሪያ በመጫን ያለ ኢንተርኔት ትኬቶችን ይመልከቱ'
                : 'Native mobile experience with offline tickets, haptics & departure alerts'}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-4 py-4 flex-1 pr-1">
          {/* Interactive Mobile App Showcase (Created Mobile App with Logo) */}
          <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 text-white shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                {isAm ? 'የተፈጠረው የሞባይል መተግበሪያ ቅድመ እይታ' : 'Created Mobile App Live Preview'}
              </span>

              {/* View Switcher Tabs */}
              <div className="flex bg-neutral-800 p-0.5 rounded-lg text-[10px] font-medium border border-neutral-700">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setPhonePreviewTab('app');
                  }}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    phonePreviewTab === 'app'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {isAm ? '📱 በመተግበሪያ ውስጥ' : '📱 In-App View'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setPhonePreviewTab('launcher');
                  }}
                  className={`px-2 py-1 rounded-md transition cursor-pointer ${
                    phonePreviewTab === 'launcher'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {isAm ? '🏠 ሆም ስክሪን' : '🏠 Home Screen'}
                </button>
              </div>
            </div>

            {/* Android Smartphone Mockup Frame */}
            <div className="w-full max-w-[260px] sm:max-w-[280px] mx-auto bg-neutral-950 rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-neutral-800 relative">
              {/* Speaker slit & camera punch-hole */}
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <div className="w-10 h-1 bg-neutral-800 rounded-full" />
                <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full border border-neutral-700" />
              </div>

              {/* Screen Canvas */}
              <div className="rounded-[1.75rem] overflow-hidden bg-neutral-900 border border-neutral-800/80 flex flex-col justify-between aspect-[9/16] relative text-neutral-100 select-none">
                {/* Android Status Bar */}
                <div className="flex items-center justify-between px-3.5 pt-2 pb-1 text-[10px] font-semibold text-neutral-400 bg-neutral-950/40 backdrop-blur-xs shrink-0 z-20">
                  <span className="font-mono text-neutral-200">10:45</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-emerald-400">5G</span>
                    <Wifi className="w-2.5 h-2.5" />
                    <div className="flex items-center gap-0.5">
                      <BatteryMedium className="w-3 h-3 text-emerald-400" />
                      <span className="text-[8px] font-mono text-neutral-300">98%</span>
                    </div>
                  </div>
                </div>

                {phonePreviewTab === 'app' ? (
                  /* In-App View Screen */
                  <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-emerald-950/80 via-neutral-900 to-neutral-950 p-3 relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                    {/* App Top Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
                      <div className="flex items-center gap-2">
                        <img
                          src="/app-logo.png"
                          alt="Logo"
                          className="w-5 h-5 rounded-md object-cover border border-amber-300/40 shadow-xs"
                        />
                        <span className="text-[11px] font-black tracking-tight text-white">
                          Bus<span className="text-emerald-400">Ride</span> App
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ● Online
                      </span>
                    </div>

                    {/* Prominent Logo & Brand Presentation on Created Mobile App */}
                    <div className="my-auto text-center flex flex-col items-center relative z-10 py-2">
                      <div className="relative group cursor-pointer mb-2.5" onClick={handleTestChime}>
                        {/* Radiant animated pulse ring */}
                        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 opacity-60 blur-xs animate-pulse" />
                        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-emerald-900 flex items-center justify-center p-0.5">
                          <img
                            src="/app-logo.png"
                            alt="Bus Ride App Logo"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        {/* Verified badge */}
                        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-neutral-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-neutral-900">
                          ✓ ET
                        </span>
                      </div>

                      <h5 className="text-xs font-black tracking-tight text-white">
                        Bus Ride App
                      </h5>
                      <p className="text-[10px] text-emerald-300 font-medium">
                        {isAm ? 'የኢትዮጵያ ክልላዊ አውቶቡስ ትራንስፖርት' : 'Ethiopian Regional Transit'}
                      </p>

                      {/* Interactive departure chime simulator */}
                      <button
                        type="button"
                        onClick={handleTestChime}
                        className={`mt-2 px-2.5 py-1.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                          chimePlayed
                            ? 'bg-amber-400 text-neutral-950 ring-2 ring-amber-300 animate-pulse'
                            : 'bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-emerald-600'
                        }`}
                        title="Play terminal chime"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{chimePlayed ? (isAm ? 'የመነሻ ደወል ተሰምቷል!' : 'Chime Sounding...') : (isAm ? 'የመነሻ ደወል ሞክር' : 'Test Audio Chime')}</span>
                      </button>

                      {/* Live Bus Route Snippet */}
                      <div className="mt-2.5 w-full bg-white/5 border border-white/10 rounded-xl p-1.5 text-left text-[9px]">
                        <div className="flex items-center justify-between text-neutral-300 font-semibold mb-0.5">
                          <span>Bahir Dar ➔ Gondar</span>
                          <span className="text-amber-400 font-bold">180 ETB</span>
                        </div>
                        <div className="text-[8px] text-neutral-400">
                          Express Coach • Departs 06:30 AM
                        </div>
                      </div>
                    </div>

                    {/* Mock In-Phone Bottom Navigation Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-around text-neutral-400 text-[8px] shrink-0 z-10">
                      <div className="flex flex-col items-center text-emerald-400 font-bold">
                        <Bus className="w-3 h-3 stroke-[2.5]" />
                        <span>Rides</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Radio className="w-3 h-3" />
                        <span>Radar</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <MapPin className="w-3 h-3" />
                        <span>Map</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Building2 className="w-3 h-3" />
                        <span>Stations</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Users className="w-3 h-3" />
                        <span>Carpool</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Android Home Screen View */
                  <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-neutral-900 to-neutral-950 p-3 relative overflow-hidden">
                    {/* Scenic background stars & silhouette */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Android Clock & Date Widget */}
                    <div className="pt-2 text-center relative z-10">
                      <div className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                        10:45
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium">
                        Sun, Sep 20 • 22°C Bahir Dar
                      </div>

                      {/* Google Search Bar Mockup */}
                      <div className="mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1 flex items-center justify-between text-[9px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-400">G</span>
                          <span>Search or type web address</span>
                        </div>
                        <Compass className="w-3 h-3 text-neutral-300" />
                      </div>
                    </div>

                    {/* Android App Launcher Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-4 pb-2 relative z-10 text-center">
                      {/* Phone App */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                          <PhoneCall className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] text-neutral-300">Phone</span>
                      </div>

                      {/* Messages App */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] text-neutral-300">Messages</span>
                      </div>

                      {/* Bus Ride App (Featuring the Logo) */}
                      <div
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={handleTestChime}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/80 bg-emerald-900 group-hover:scale-105 transition">
                            <img
                              src="/app-logo.png"
                              alt="Bus Ride App Logo Icon"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-neutral-900 animate-pulse">
                            1
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-amber-300 truncate max-w-[54px]">
                          Bus Ride
                        </span>
                      </div>

                      {/* Maps App */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] text-neutral-300">Maps</span>
                      </div>
                    </div>

                    {/* Android Gesture Navigation Bar */}
                    <div className="w-16 h-1 bg-neutral-500/60 rounded-full mx-auto my-0.5 shrink-0" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-2.5 text-[11px] text-neutral-400">
              {isAm
                ? 'የተፈጠረው አርማ በስልክዎ መተግበሪያ እና በመነሻ ስክሪን ላይ በትክክል ይታያል'
                : 'The official logo is displayed directly on the mobile app and phone launcher.'}
            </div>
          </div>

          {/* Main Action Banner */}
          <div className="bg-linear-to-br from-emerald-800 to-teal-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAm ? 'ፈጣን ጭነት በ 1 ንክኪ' : '1-Tap Android WebAPK Installation'}
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                  v1.2.0 • 1.4 MB
                </span>
              </div>

              <p className="text-xs text-emerald-100 mb-3 leading-relaxed">
                {isAm
                  ? 'ይህንን መተግበሪያ በአንድሮይድ ስልክዎ ስክሪን ላይ በመጫን ያለ አሳሽ አድራሻ ባር እና ፈጣን አሰራር ያግኙ።'
                  : 'Install Bus Ride App directly onto your Android device home screen. Works fullscreen without browser bars.'}
              </p>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  onInstallPrompt();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {deferredPrompt
                    ? isAm
                      ? 'አሁን በስልክዎ ላይ ይጫኑ'
                      : 'Install on this Android Device'
                    : isAm
                    ? 'የአንድሮይድ መጫኛ መመሪያ'
                    : 'Open Android Install Guide'}
                </span>
              </button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-600/30 blur-xl pointer-events-none" />
          </div>

          {/* Android App Key Features Grid */}
          <div>
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              {isAm ? 'የአንድሮይድ መተግበሪያ ጥቅሞች' : 'Android App Native Capabilities'}
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900 leading-tight">
                    {isAm ? 'ከመስመር ውጭ (Offline)' : 'Offline Access'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {isAm ? 'ያለ ኔትወርክ ትኬቶች እና QR ኮድ' : 'Tickets & station guides work offline'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2">
                <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900 leading-tight">
                    {isAm ? 'የ30 ደቂቃ ማስጠንቀቂያ' : '30-Min Alert'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {isAm ? 'አውቶቡስ ከመነሳቱ በፊት ድምጽ' : 'Departure chime & platform notice'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2">
                <Vibrate className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900 leading-tight">
                    {isAm ? 'የንዝረት ግብረ-መልስ' : 'Haptic Feedback'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {isAm ? 'መቀመጫ ሲመርጡ ስሜታዊ ንዝረት' : 'Tactile vibration on seat pick & tabs'}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-start gap-2">
                <Share2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900 leading-tight">
                    {isAm ? 'ቀጥታ ማጋራት' : 'Native Share'}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {isAm ? 'በቴሌግራም/ዋትስአፕ ትኬት መላክ' : 'Share via Telegram, WhatsApp, SMS'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to install on Android Chrome Step-by-Step */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
            <h4 className="font-bold text-neutral-800 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              {isAm
                ? 'በክሮም (Chrome) ወይም ሳምሰንግ ኢንተርኔት ላይ እንዴት ይጫናል?'
                : 'Manual Installation via Android Chrome'}
            </h4>

            <ol className="space-y-2 text-neutral-600 pl-4 list-decimal text-[11px]">
              <li>
                {isAm ? (
                  <span>
                    በክሮም አሳሽ ላይ ከላይ በቀኝ በኩል የሚገኘውን <strong>ሦስት ነጥብ (⋮)</strong> ይንኩ።
                  </span>
                ) : (
                  <span>
                    Tap the <strong>three-dots menu (⋮)</strong> at the top-right corner of Chrome.
                  </span>
                )}
              </li>
              <li>
                {isAm ? (
                  <span>
                    ከሚመጡት ምርጫዎች <strong>&quot;Install app&quot;</strong> ወይም <strong>&quot;Add to Home screen&quot;</strong> የሚለውን ይምረጡ።
                  </span>
                ) : (
                  <span>
                    Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </span>
                )}
              </li>
              <li>
                {isAm ? (
                  <span>
                    <strong>&quot;Install&quot;</strong> የሚለውን አረጋግጡ። አውቶቡስ አዶ በስልክዎ ስክሪን ላይ ይቀመጣል!
                  </span>
                ) : (
                  <span>
                    Tap <strong>&quot;Install&quot;</strong>. An Android app icon will appear directly on your home screen and app drawer!
                  </span>
                )}
              </li>
            </ol>
          </div>

          {/* Standalone Google Play Store / APK / Bubblewrap info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-700" />
                {isAm ? 'ለአንድሮይድ ስቱዲዮ / Play Store APK' : 'For Android Studio / Play Store APK'}
              </span>
              <button
                type="button"
                onClick={handleCopyApkCommand}
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy CLI</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-slate-600 text-[10px] mb-1.5 leading-normal">
              {isAm
                ? 'ይህ መተግበሪያ ሙሉ የTWA (Trusted Web Activity) እና WebAPK ድጋፍ አለው። በGoogle Bubblewrap CLI በቀላሉ ወደ APK ወይም AAB ይቀየራል።'
                : 'Fully compliant with Google Play Trusted Web Activity (TWA) and WebAPK standards. Build a signed APK/AAB in minutes:'}
            </p>
            <div className="bg-slate-900 text-emerald-300 font-mono text-[10px] p-2 rounded-lg overflow-x-auto select-all">
              npx @bubblewrap/cli build
            </div>
          </div>

          {/* App Logo & Assets Download */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-[11px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/app-logo.png"
                alt="Logo icon"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-lg object-cover border border-emerald-300 shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <div className="font-bold text-emerald-950 truncate">
                  {isAm ? 'የመተግበሪያ አዶ እና አርማ (HD)' : 'Mobile App Logo & Icon (HD)'}
                </div>
                <div className="text-[10px] text-emerald-700 truncate">
                  1024x1024 PNG • PWA &amp; Play Store Ready
                </div>
              </div>
            </div>
            <a
              href="/app-logo.png"
              download="bus-ride-app-logo.png"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[10px] flex items-center gap-1 shrink-0 transition shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>{isAm ? 'አውርድ' : 'Download'}</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close'}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onInstallPrompt();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAm ? 'ጫን' : 'Install App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

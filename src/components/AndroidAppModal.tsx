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
  Code2,
  Terminal,
  FolderOpen,
  KeyRound,
  Play,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  FileCode,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic, isAndroidDevice, isStandaloneApp, playTerminalChime } from '../utils/haptics';
import { MobileLoginScreen } from './MobileLoginScreen';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPrompt: () => void;
  lang: Language;
  initialTab?: 'preview' | 'studio' | 'playstore' | 'keystore';
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPrompt,
  lang,
  initialTab = 'preview',
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'preview' | 'studio' | 'playstore' | 'keystore'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [phonePreviewTab, setPhonePreviewTab] = useState<'app' | 'login' | 'signup' | 'launcher'>('signup');
  const [chimePlayed, setChimePlayed] = useState(false);
  const [customSha256, setCustomSha256] = useState('14:6D:E9:7F:8E:C1:DB:49:89:98:B7:A3:96:64:47:04:93:36:03:28:43:64:89:EU:RO:PE:WE:ST:20:26:09');

  const isAm = lang === 'am';
  const isAndroid = isAndroidDevice();
  const isInstalled = isStandaloneApp();

  if (!isOpen) return null;

  const handleCopyText = (text: string, key: string) => {
    triggerHaptic(15);
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestChime = () => {
    setChimePlayed(true);
    triggerHaptic([25, 40, 30]);
    playTerminalChime();
    setTimeout(() => setChimePlayed(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94vh]">
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
        <div className="flex items-start gap-3.5 border-b border-neutral-100 pb-3 shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md shadow-emerald-950/25 border border-emerald-500/40 shrink-0 bg-emerald-800">
            <img
              src="/app-logo.png"
              alt={isAm ? 'ባስ ራይድ' : 'Bus Ride'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                Android Studio &amp; Play Store
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Target SDK 34 • Kotlin
              </span>
              {isInstalled && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAm ? 'ተጭኗል' : 'Installed'}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-xl font-black text-neutral-900 mt-1 leading-tight truncate">
              {isAm ? 'ባስ ራይድ - አንድሮይድ ስቱዲዮ እና Play Store' : 'Bus Ride App - Android Studio & Play Store Hub'}
            </h3>
            <p className="text-xs text-neutral-500 truncate sm:whitespace-normal">
              {isAm
                ? 'የተሟላ የአንድሮይድ ስቱዲዮ ፕሮጀክት፣ የGoogle Play Store ማሰራጫ መመሪያ እና የሞባይል ቅድመ እይታ'
                : 'Native Android Studio project, Google Play Console deployment guides & mobile simulator'}
            </p>
          </div>
        </div>

        {/* Top-Level Navigation Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl text-xs font-semibold gap-1 mt-3 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveMainTab('preview');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainTab === 'preview'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isAm ? '📱 የሞባይል እይታ' : '📱 Mobile Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveMainTab('studio');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainTab === 'studio'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>{isAm ? '🛠️ አንድሮይድ ስቱዲዮ' : '🛠️ Android Studio'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveMainTab('playstore');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainTab === 'playstore'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-sky-700" />
            <span>{isAm ? '🚀 Play Store ኮንሶል' : '🚀 Play Store Guide'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveMainTab('keystore');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainTab === 'keystore'
                ? 'bg-white text-emerald-950 font-bold shadow-xs'
                : 'text-neutral-600 hover:text-neutral-950 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>{isAm ? '🔐 ኪይስቶር & AssetLinks' : '🔐 Keystore & Links'}</span>
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto space-y-4 py-3 flex-1 pr-1 mt-1">
          {/* TAB 1: MOBILE APP PREVIEW */}
          {activeMainTab === 'preview' && (
            <div className="space-y-4">
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
                      className={`px-1.5 sm:px-2 py-1 rounded-md transition cursor-pointer ${
                        phonePreviewTab === 'app'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isAm ? '📱 መተግበሪያ' : '📱 App'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setPhonePreviewTab('login');
                      }}
                      className={`px-1.5 sm:px-2 py-1 rounded-md transition cursor-pointer ${
                        phonePreviewTab === 'login'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isAm ? '🔐 መግቢያ' : '🔐 Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setPhonePreviewTab('signup');
                      }}
                      className={`px-1.5 sm:px-2 py-1 rounded-md transition cursor-pointer ${
                        phonePreviewTab === 'signup'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isAm ? '✨ ምዝገባ' : '✨ Sign Up'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setPhonePreviewTab('launcher');
                      }}
                      className={`px-1.5 sm:px-2 py-1 rounded-md transition cursor-pointer ${
                        phonePreviewTab === 'launcher'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isAm ? '🏠 ሆም' : '🏠 Home'}
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
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                        {/* App Top Bar */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
                          <div className="flex items-center gap-2">
                            <img
                              src="/app-logo.png"
                              alt={isAm ? 'ባስ ራይድ' : 'Bus Ride'}
                              className="w-5 h-5 rounded-md object-cover border border-amber-300/40 shadow-xs"
                            />
                            <span className="text-[11px] font-black tracking-tight text-white">
                              {isAm ? 'ባስ ራይድ' : <span>Bus<span className="text-emerald-400">Ride</span> App</span>}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ● Online
                          </span>
                        </div>

                        {/* Logo & Brand Presentation */}
                        <div className="my-auto text-center flex flex-col items-center relative z-10 py-2">
                          <div className="relative group cursor-pointer mb-2.5" onClick={handleTestChime}>
                            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 opacity-60 blur-xs animate-pulse" />
                            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/80 bg-emerald-900 flex items-center justify-center p-0.5">
                              <img
                                src="/app-logo.png"
                                alt={isAm ? 'ባስ ራይድ' : 'Bus Ride'}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-neutral-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md border border-neutral-900">
                              ✓ ET
                            </span>
                          </div>

                          <h5 className="text-xs font-black tracking-tight text-white">
                            {isAm ? 'ባስ ራይድ' : 'Bus Ride App'}
                          </h5>
                          <p className="text-[10px] text-emerald-300 font-medium">
                            {isAm ? 'የኢትዮጵያ ክልላዊ አውቶቡስ ትራንስፖርት' : 'Ethiopian Regional Transit'}
                          </p>

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

                        {/* Bottom Navigation Mockup */}
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
                    ) : phonePreviewTab === 'login' ? (
                      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
                        <MobileLoginScreen
                          lang={lang}
                          initialMode="login"
                          onLoginSuccess={() => triggerHaptic(20)}
                          isEmbeddedInPhoneMockup={true}
                        />
                      </div>
                    ) : phonePreviewTab === 'signup' ? (
                      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950">
                        <MobileLoginScreen
                          lang={lang}
                          initialMode="signup"
                          onLoginSuccess={() => triggerHaptic(20)}
                          isEmbeddedInPhoneMockup={true}
                        />
                      </div>
                    ) : (
                      /* Home Screen View */
                      <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-neutral-900 to-neutral-950 p-3 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

                        <div className="pt-2 text-center relative z-10">
                          <div className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                            10:45
                          </div>
                          <div className="text-[10px] text-neutral-400 font-medium">
                            Sun, Sep 20 • 22°C Bahir Dar
                          </div>

                          <div className="mt-3 bg-white/10 border border-white/15 rounded-full px-3 py-1 flex items-center justify-between text-[9px] text-neutral-400">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-blue-400">G</span>
                              <span>Search or type web address</span>
                            </div>
                            <Compass className="w-3 h-3 text-neutral-300" />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-4 pb-2 relative z-10 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                              <PhoneCall className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] text-neutral-300">Phone</span>
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] text-neutral-300">Messages</span>
                          </div>

                          <div
                            className="flex flex-col items-center gap-1 cursor-pointer group"
                            onClick={handleTestChime}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/80 bg-emerald-900 group-hover:scale-105 transition">
                                <img
                                  src="/app-logo.png"
                                  alt={isAm ? 'ባስ ራይድ' : 'Bus Ride'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-neutral-900 animate-pulse">
                                1
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-amber-300 truncate max-w-[58px]">
                              {isAm ? 'ባስ ራይድ' : 'Bus Ride'}
                            </span>
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] text-neutral-300">Maps</span>
                          </div>
                        </div>

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

              {/* 1-Tap WebAPK Installation */}
              <div className="bg-linear-to-br from-emerald-800 to-teal-950 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {isAm ? 'ፈጣን ጭነት በ 1 ንክኪ' : '1-Tap Android Installation'}
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">
                      v1.0.0 • Offline Ready
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
              </div>

              {/* Native Capabilities Grid */}
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
            </div>
          )}

          {/* TAB 2: ANDROID STUDIO PROJECT GUIDE */}
          {activeMainTab === 'studio' && (
            <div className="space-y-4">
              {/* Architecture Overview */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-300">
                      Android Studio Project Root
                    </span>
                  </div>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded font-mono">
                    /android
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {isAm
                    ? 'የአንድሮይድ ስቱዲዮ ፕሮጀክቱ በ `/android` ፎልደር ውስጥ ተዘጋጅቷል። በውስጡ የKotlin MainActivity፣ WebKit ሃርድዌር አክስሌሬሽን፣ የጂፒኤስ ፍቃድ መጠየቂያ፣ የካሜራ QR ስካነር እና የጃቫስክሪፕት ድልድይ (WebAppInterface) ተካቷል።'
                    : 'The native Android Studio project is fully generated in the `/android` directory, complete with Kotlin MainActivity, WebKit hardware acceleration, GPS location permissions, camera QR file picker, and JavaScript bridge.'}
                </p>

                {/* File Tree Mini-Card */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span>📁 android/</span>
                  </div>
                  <div className="pl-4">├── 📄 build.gradle (AGP 8.3.0 + Kotlin 1.9.22)</div>
                  <div className="pl-4">├── 📄 settings.gradle (BusRideApp root)</div>
                  <div className="pl-4">├── 📁 gradle/wrapper/ (Gradle 8.4)</div>
                  <div className="pl-4">└── 📁 app/</div>
                  <div className="pl-8">├── 📄 build.gradle (et.busride.amhara • TargetSdk 34)</div>
                  <div className="pl-8">├── 📄 proguard-rules.pro (Code shrinker &amp; obfuscator)</div>
                  <div className="pl-8">└── 📁 src/main/</div>
                  <div className="pl-12">├── 📄 AndroidManifest.xml (GPS, Camera, App Links)</div>
                  <div className="pl-12">└── 📁 java/et/busride/amhara/</div>
                  <div className="pl-16">├── 📄 MainActivity.kt (WebView + Refresh + Fallback)</div>
                  <div className="pl-16">└── 📄 WebAppInterface.kt (Native Haptics &amp; Toast)</div>
                </div>
              </div>

              {/* How to Open & Run in Android Studio */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
                <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-700" />
                  {isAm ? 'በአንድሮይድ ስቱዲዮ እንዴት ይከፈታል?' : 'How to Open & Run in Android Studio'}
                </h4>

                <div className="space-y-2.5 text-neutral-700 text-[11px]">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <strong>Open Android Studio</strong> (Iguana, Jellyfish, or Koala) and select <strong>&quot;Open&quot;</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      Navigate to this project folder and select the <strong><code>/android</code></strong> directory.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      Let Gradle sync dependencies automatically (Internet, AndroidX, WebKit).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      Connect your Android phone via USB (with USB Debugging ON) or select an Emulator (Pixel 8 API 34).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      5
                    </span>
                    <div>
                      Click the green <strong>Run (▶)</strong> button (or <code>Shift + F10</code>). The app will build and install!
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Commands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-700" />
                    {isAm ? 'የGradle ተርሚናል ትዕዛዞች' : 'Terminal Build Commands'}
                  </span>
                  <span className="text-[10px] text-neutral-500">Run in project root</span>
                </div>

                {/* Build Debug APK Command */}
                <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs flex items-center justify-between gap-2 border border-slate-800">
                  <div className="min-w-0 font-mono text-[11px] truncate">
                    <span className="text-neutral-500"># Build Debug APK</span>
                    <br />
                    <span className="text-emerald-400">cd android &amp;&amp; ./gradlew assembleDebug</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('cd android && ./gradlew assembleDebug', 'cmd-debug')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedKey === 'cmd-debug' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Build Release Bundle Command */}
                <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs flex items-center justify-between gap-2 border border-slate-800">
                  <div className="min-w-0 font-mono text-[11px] truncate">
                    <span className="text-neutral-500"># Build Play Store Bundle (.aab)</span>
                    <br />
                    <span className="text-amber-400">cd android &amp;&amp; ./gradlew bundleRelease</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('cd android && ./gradlew bundleRelease', 'cmd-release')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    title="Copy command"
                  >
                    {copiedKey === 'cmd-release' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE PLAY STORE CONSOLE */}
          {activeMainTab === 'playstore' && (
            <div className="space-y-4">
              {/* Play Store Readiness Badge */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-sky-900 to-indigo-950 text-white shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    <span className="font-bold text-sm">Google Play Store Compliance</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30">
                    Ready for Console
                  </span>
                </div>
                <p className="text-xs text-sky-100 leading-relaxed">
                  {isAm
                    ? 'መተግበሪያው በGoogle Play Store ፖሊሲ መሰረት ተዘጋጅቷል፡ Target SDK 34 (Android 14/15)፣ 512x512 አዶ፣ Digital Asset Links ድጋፍ፣ እና የውሂብ ደህንነት (Data Safety) ማሟያዎች።'
                    : 'The project strictly complies with latest Google Play Store guidelines: Target SDK 34, 512x512 high-res app icon, Digital Asset Links verification, and transparent location/camera declarations.'}
                </p>
              </div>

              {/* 5-Step Play Store Roadmap */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-700" />
                  {isAm ? 'የGoogle Play Store ማሰራጫ 5 ደረጃዎች' : '5-Step Google Play Console Publishing Guide'}
                </h4>

                {/* Step 1 */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">1</span>
                      Create App in Play Console
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">play.google.com/console</span>
                  </div>
                  <p className="text-neutral-600 text-[11px]">
                    Click <strong>Create App</strong>. Name: <code>Bus Ride - የኢትዮጵያ አውቶቡስ ትራንስፖርት</code>. Select Category: <strong>Travel &amp; Local</strong>. Default Language: <strong>Amharic or English</strong>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">2</span>
                      Store Listing &amp; Metadata
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyText(
                          'የአማራ ክልል ከተሞች አውቶቡስ ትኬት መቁረጫ እና የቀጥታ ጉዞ መከታተያ መተግበሪያ\nIntercity bus booking, live GPS radar & terminal schedules in Amhara, Ethiopia.',
                          'desc'
                        )
                      }
                      className="text-[10px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Metadata</span>
                    </button>
                  </div>
                  <div className="text-neutral-600 text-[11px] space-y-1">
                    <div><strong>Short Description (80 chars):</strong> <code>የአማራ ክልል ከተሞች አውቶቡስ ትኬት መቁረጫ እና የቀጥታ ጉዞ መከታተያ መተግበሪያ</code></div>
                    <div><strong>Icon:</strong> Use <code>public/pwa-512x512.png</code> (512x512 PNG included in repo).</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">3</span>
                      App Content &amp; Data Safety
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px]">
                    Declare permissions: <strong>Location</strong> (GPS Live Radar and nearest terminal discovery) and <strong>Camera</strong> (ticket QR code scanning). Age rating: <strong>13+ (Everyone)</strong>. No ads.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">4</span>
                      Upload Android App Bundle (.aab)
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px]">
                    In Android Studio: <strong>Build &gt; Generate Signed Bundle / APK &gt; Android App Bundle</strong>. Upload <code>android/app/build/outputs/bundle/release/app-release.aab</code>.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-neutral-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center">5</span>
                      Production Rollout
                    </span>
                  </div>
                  <p className="text-neutral-600 text-[11px]">
                    Create release in <strong>Closed Testing</strong> or <strong>Production</strong>. Add release notes in English &amp; Amharic and click <strong>&quot;Start Rollout to Production&quot;</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KEYSTORE & ASSETLINKS */}
          {activeMainTab === 'keystore' && (
            <div className="space-y-4">
              {/* Keystore generation terminal box */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    1. Generate Release Keystore (Terminal)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'keytool -genkey -v -keystore release.jks -alias busride -keyalg RSA -keysize 2048 -validity 10000',
                        'keystore-cmd'
                      )
                    }
                    className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-bold cursor-pointer"
                  >
                    {copiedKey === 'keystore-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'keystore-cmd' ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 font-mono text-[10px] text-amber-200 overflow-x-auto select-all">
                  keytool -genkey -v -keystore release.jks -alias busride -keyalg RSA -keysize 2048 -validity 10000
                </div>
                <p className="text-[10px] text-neutral-400 mt-2">
                  Place the generated <code>release.jks</code> in <code>android/app/keystore/release.jks</code>.
                </p>
              </div>

              {/* Digital Asset Links */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    2. Digital Asset Links (.well-known/assetlinks.json)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Active in /public
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Digital Asset Links verifies that your Android app (<code>et.busride.amhara</code>) owns this web domain. It removes the URL bar in Trusted Web Activity and enables instant deep linking from SMS, Telegram, and web links.
                </p>

                {/* Fingerprint editor */}
                <div className="space-y-1.5 mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Your Keystore SHA-256 Fingerprint:
                  </label>
                  <input
                    type="text"
                    value={customSha256}
                    onChange={(e) => setCustomSha256(e.target.value)}
                    placeholder="AA:BB:CC:DD:..."
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="text-[9px] text-slate-500">
                    Get your fingerprint using: <code>keytool -list -v -keystore release.jks -alias busride</code>
                  </div>
                </div>

                {/* Preview of JSON */}
                <div className="bg-slate-900 text-emerald-300 font-mono text-[10px] p-3 rounded-xl overflow-x-auto relative">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        JSON.stringify(
                          [
                            {
                              relation: ['delegate_permission/common.handle_all_urls'],
                              target: {
                                namespace: 'android_app',
                                package_name: 'et.busride.amhara',
                                sha256_cert_fingerprints: [customSha256],
                              },
                            },
                          ],
                          null,
                          2
                        ),
                        'assetlinks-json'
                      )
                    }
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    title="Copy assetlinks.json"
                  >
                    {copiedKey === 'assetlinks-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <pre className="text-[10px] leading-tight">
{`[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "et.busride.amhara",
      "sha256_cert_fingerprints": [
        "${customSha256}"
      ]
    }
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[10px] text-neutral-500 hidden sm:flex items-center gap-1 font-mono">
            <span>et.busride.amhara</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
            >
              {isAm ? 'ዝጋ' : 'Close'}
            </button>

            {activeMainTab === 'preview' ? (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  onInstallPrompt();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isAm ? 'ጫን' : 'Install App'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  handleCopyText('npm run playstore:verify', 'verify-cmd');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition cursor-pointer shadow-xs"
              >
                {copiedKey === 'verify-cmd' ? <Check className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'verify-cmd' ? (isAm ? 'ተቀድቷል!' : 'Copied!') : (isAm ? 'ማረጋገጫ አሂድ' : 'Run Verification')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

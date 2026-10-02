import React, { useState } from 'react';
import { AppCategory, AppModule, Language, UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { triggerHaptic } from '../utils/haptics';
import {
  LogIn,
  UserPlus,
  Bus,
  MapPin,
  Sparkles,
  ShieldCheck,
  Ticket,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Radio,
  Clock,
  User,
  Check,
  CreditCard,
  Building2,
  LayoutDashboard,
  Award,
  AlertTriangle,
  ClipboardList,
  Activity,
  Send,
  PlusCircle,
  TrendingUp,
  Phone,
  Briefcase,
} from 'lucide-react';

export interface FrontHeroBannerProps {
  lang: Language;
  currentUser?: UserProfile | null;
  currentCategory?: AppCategory;
  onSelectCategory?: (category: AppCategory) => void;
  onSelectModule?: (mod: AppModule) => void;
  onOpenLogin: (role?: UserRole, mode?: 'login' | 'signup') => void;
  onOpenSignUp: () => void;
  onSelectCorridor?: (originId: string, destId: string) => void;
  onOpenMyTickets?: () => void;
  onOpenDriverPortal?: () => void;
  onOpenAdminPortal?: () => void;
  onOpenDashboards?: () => void;
  onLogout?: () => void;
  ticketCount?: number;
  onOpenTripPlanner?: () => void;
  onOpenTerminalMonitor?: () => void;
  preferredTerminalName?: string;
  preferredTerminalStatus?: 'normal' | 'delayed' | 'cancelled';
  preferredTerminalDelayMin?: number;
}

const POPULAR_CORRIDORS = [
  { originId: 'bahir-dar', destId: 'gondar', nameEn: 'Bahir Dar ➔ Gondar', nameAm: 'ባሕር ዳር ➔ ጎንደር', duration: '3h 30m' },
  { originId: 'dessie', destId: 'debre-birhan', nameEn: 'Dessie ➔ Debre Birhan', nameAm: 'ደሴ ➔ ደብረ ብርሃን', duration: '4h 15m' },
  { originId: 'woldiya', destId: 'lalibela', nameEn: 'Woldiya ➔ Lalibela', nameAm: 'ወልዲያ ➔ ላሊበላ', duration: '3h 00m' },
  { originId: 'debre-markos', destId: 'addis-ababa', nameEn: 'Debre Markos ➔ Addis Ababa', nameAm: 'ደብረ ማርቆስ ➔ አዲስ አበባ', duration: '5h 30m' },
];

export const FrontHeroBanner: React.FC<FrontHeroBannerProps> = ({
  lang,
  currentUser,
  currentCategory = 'users',
  onSelectCategory,
  onSelectModule,
  onOpenLogin,
  onOpenSignUp,
  onSelectCorridor,
  onOpenMyTickets,
  onOpenDriverPortal,
  onOpenAdminPortal,
  onOpenDashboards,
  onLogout,
  ticketCount = 0,
  onOpenTripPlanner,
  onOpenTerminalMonitor,
  preferredTerminalName,
  preferredTerminalStatus = 'normal',
  preferredTerminalDelayMin,
}) => {
  const isAm = lang === 'am';
  const [isMinimized, setIsMinimized] = useState(false);

  // Background gradient theme based on active category
  const themeGradients = {
    users: 'from-emerald-950 via-emerald-900 to-slate-950 border-emerald-800/60',
    driver: 'from-amber-950 via-amber-900 to-neutral-950 border-amber-800/60',
    administration: 'from-rose-950 via-rose-900 to-neutral-950 border-rose-800/60',
    business_owners: 'from-blue-950 via-blue-900 to-slate-950 border-blue-800/60',
  };

  const activeGradient = themeGradients[currentCategory] || themeGradients.users;

  return (
    <div className={`w-full bg-gradient-to-r ${activeGradient} text-white rounded-2xl overflow-hidden shadow-xl border mb-6 relative transition-colors duration-300`}>
      {/* Background soft aura */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar / Minimize toggle */}
      <div className="relative z-10 px-4 sm:px-6 pt-4 pb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
            {currentCategory === 'users'
              ? isAm ? 'የአማራ ክልል የሕዝብ ትራንስፖርት ፖርታል' : 'Amhara Regional Public Transit Portal'
              : currentCategory === 'driver'
              ? isAm ? 'የአውቶቡስ አሽከርካሪ ኮክፒትና ኦፕሬሽን' : 'Commercial Bus Cockpit & Fleet Command'
              : currentCategory === 'administration'
              ? isAm ? 'የትራንስፖርት ባለስልጣን የመቆጣጠሪያ ማዕከል' : 'Regional Transport Authority Dispatch Command'
              : isAm ? 'የአውቶቡስ ባለንብረቶች ፍሊትና ፋይናንስ' : 'Fleet Operators & Commercial Management'}
          </span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="text-xs text-white/70 hidden sm:inline font-mono">
            {currentCategory === 'users'
              ? '15 Connected Terminals'
              : currentCategory === 'driver'
              ? 'Live Telemetry & Manifest'
              : currentCategory === 'administration'
              ? 'Regional Safety & Bay Radar'
              : 'Fleet Revenue & Analytics'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preferred Terminal Disruption Monitor Chip */}
          {onOpenTerminalMonitor && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onOpenTerminalMonitor();
              }}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                preferredTerminalStatus === 'cancelled'
                  ? 'bg-rose-900/90 hover:bg-rose-800 text-rose-100 border-rose-600'
                  : preferredTerminalStatus === 'delayed'
                  ? 'bg-amber-900/90 hover:bg-amber-800 text-amber-100 border-amber-500'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
              title="Click to view Terminal Disruption Radar & Notification Preferences"
            >
              <Radio className={`w-3.5 h-3.5 ${preferredTerminalStatus !== 'normal' ? 'animate-pulse text-amber-300' : 'text-emerald-300'}`} />
              <span className="truncate max-w-[160px] sm:max-w-xs">
                {preferredTerminalName || 'Terminal'}:{' '}
                {preferredTerminalStatus === 'cancelled'
                  ? isAm ? 'ተዘግቷል' : 'Suspended'
                  : preferredTerminalStatus === 'delayed'
                  ? `+${preferredTerminalDelayMin || 45}m ${isAm ? 'ዘግይቷል' : 'Delay'}`
                  : isAm ? 'መደበኛ' : 'Normal'}
              </span>
            </button>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsMinimized(!isMinimized);
            }}
            className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg border border-white/15 transition cursor-pointer"
          >
            <span>{isMinimized ? (isAm ? 'አሳይ' : 'Show') : (isAm ? 'አሳንስ' : 'Minimize')}</span>
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="relative z-10 p-5 sm:p-7 pt-4 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* ======================================================== */}
            {/* CONTEXT-AWARE HERO CONTENT PER CATEGORY */}
            {/* ======================================================== */}

            {/* 1. USERS CATEGORY HERO */}
            {currentCategory === 'users' && (
              <div className="space-y-2.5 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {isAm ? (
                    <span>
                      የአማራ ክልል ከተሞች <span className="text-emerald-450 text-emerald-400">የአውቶቡስና የጋራ</span> ጉዞ ኔትወርክ
                    </span>
                  ) : (
                    <span>
                      Modern Intercity <span className="text-emerald-400">Bus Transit & Rideshare</span> Across Amhara
                    </span>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                  {isAm
                    ? 'ከባሕር ዳር፣ ጎንደር፣ ደሴ፣ ደብረ ብርሃን እና ላሊበላ መናኸሪያዎች ቀጥታ የተያያዘ የትኬት፣ የመርሐ-ግብር እና የቀጥታ አውቶቡስ መገኛ መከታተያ።'
                    : 'Cashless Telebirr booking, verified drivers, live corridor weather warnings, and direct dispatch connecting 15 regional hubs.'}
                </p>

                {/* Key Metrics */}
                <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-emerald-200/90 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong>15</strong> Connected Terminals</span>
                  </span>
                  <span aria-hidden="true" className="text-emerald-700">·</span>
                  <span><strong>48</strong> Intercity Routes</span>
                  <span aria-hidden="true" className="text-emerald-700">·</span>
                  <span><strong>120+</strong> Daily Departures</span>
                  <span aria-hidden="true" className="text-emerald-700">·</span>
                  <span className="text-amber-300 font-semibold">100% Cashless (Telebirr & CBE)</span>
                </div>
              </div>
            )}

            {/* 2. DRIVER CATEGORY HERO */}
            {currentCategory === 'driver' && (
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                    {isAm ? 'የተመደበ ፈረቃ፡ ሰላም ባስ' : 'Assigned Shift: Selam Bus Line SC'}
                  </span>
                  <span className="text-xs text-amber-200/80 font-mono">Scania HD (ET 03-A88219)</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {isAm ? (
                    <span>
                      የአሽከርካሪ ኮክፒት፡ <span className="text-amber-400">ባሕር ዳር ➔ ጎንደር</span> (06:30 AM)
                    </span>
                  ) : (
                    <span>
                      Driver Cockpit & Route Command: <span className="text-amber-400">Bahir Dar ➔ Gondar</span>
                    </span>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
                  {isAm
                    ? 'የተሳፋሪዎችን የመሳፈሪያ ትኬት በQR ስካን ያድርጉ፣ የቅድመ-ጉዞ ቴክኒካል ፍተሻ ያረጋግጡና የአፈጻጸም ሜዳሊያዎችዎን ይከታተሉ።'
                    : 'Real-time telemetry, passenger manifest check-in, pre-trip vehicle readiness inspection, and verified performance badges.'}
                </p>

                {/* Driver Live Badges & Highlights */}
                <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-amber-200/90 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span><strong>4.9 ★</strong> Rating</span>
                  </span>
                  <span aria-hidden="true" className="text-amber-700">·</span>
                  <span><strong>42/45</strong> Boarded (93%)</span>
                  <span aria-hidden="true" className="text-amber-700">·</span>
                  <span>Platform Bay #4</span>
                  <span aria-hidden="true" className="text-amber-700">·</span>
                  <span className="text-emerald-300 font-semibold">Speed Governor Active (80 km/h limit)</span>
                </div>
              </div>
            )}

            {/* 3. ADMINISTRATION CATEGORY HERO */}
            {currentCategory === 'administration' && (
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[11px] font-bold">
                    {isAm ? 'የአማራ ክልል ትራንስፖርት ቢሮ' : 'Amhara Regional Transport Bureau'}
                  </span>
                  <span className="text-xs text-rose-200/80 font-mono">15 Hubs Monitored</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {isAm ? (
                    <span>
                      የክልል ትራንስፖርት ቁጥጥርና <span className="text-rose-450 text-rose-400">የአደጋ ማስጠንቀቂያ</span> ማዕከል
                    </span>
                  ) : (
                    <span>
                      Regional Dispatch Authority & <span className="text-rose-400">Terminal Safety Radar</span>
                    </span>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed font-normal">
                  {isAm
                    ? 'በ15ቱ የመናኸሪያ ተርሚናሎች ላይ የመጨናነቅ ደረጃን ይቆጣጠሩ፣ የአደጋ ጊዜ የጉዞ ማስጠንቀቂያዎችን ያሰራጩና የመጫኛ በሮችን ያስተዳድሩ።'
                    : 'Terminal congestion monitoring across 15 regional stations, emergency highway disruption broadcasts, and safety regulation enforcement.'}
                </p>

                {/* Admin Live Highlights */}
                <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rose-200/90 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span><strong>14</strong> Normal Terminals</span>
                  </span>
                  <span aria-hidden="true" className="text-rose-700">·</span>
                  <span className="text-amber-300"><strong>1</strong> Weather Advisory Active</span>
                  <span aria-hidden="true" className="text-rose-700">·</span>
                  <span><strong>120+</strong> Scheduled Dispatches</span>
                  <span aria-hidden="true" className="text-rose-700">·</span>
                  <span className="text-white font-mono">994 Hotline 24/7 Active</span>
                </div>
              </div>
            )}

            {/* 4. BUSINESS OWNERS HERO */}
            {currentCategory === 'business_owners' && (
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[11px] font-bold">
                    {isAm ? 'የአውቶቡስ ባለንብረቶችና ፍሊት' : 'Commercial Fleet Operator Executive Deck'}
                  </span>
                  <span className="text-xs text-blue-200/80 font-mono">Tana Express & Fleet Line</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {isAm ? (
                    <span>
                      የአውቶቡስ ፍሊት ክትትልና <span className="text-blue-400">የገቢ ፋይናንስ</span> ትንተና
                    </span>
                  ) : (
                    <span>
                      Commercial Fleet Operations & <span className="text-blue-400">Revenue Analytics</span>
                    </span>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
                  {isAm
                    ? 'በእንቅስቃሴ ላይ ያሉ አውቶቡሶችን በGPS ይከታተሉ፣ ዕለታዊ የተጣራ ገቢ ይገምግሙ፣ አዳዲስ የጉዞ መርሐ-ግብሮችን ይመድቡና ፈቃዶችን ያድሱ።'
                    : 'Monitor active buses, daily gross passenger fares, dispatch new intercity departures, and manage driver rosters.'}
                </p>

                {/* Fleet Highlights */}
                <div className="pt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-200/90 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-blue-300" />
                    <span><strong>8</strong> Active Vehicles</span>
                  </span>
                  <span aria-hidden="true" className="text-blue-700">·</span>
                  <span><strong>92.4%</strong> Average Occupancy</span>
                  <span aria-hidden="true" className="text-blue-700">·</span>
                  <span className="text-emerald-300 font-bold">ETB 142,600 Daily Gross</span>
                  <span aria-hidden="true" className="text-blue-700">·</span>
                  <span>Fuel Efficiency 96.1%</span>
                </div>
              </div>
            )}

            {/* Right: Auth Action Card / Personalized Member Card */}
            <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-xl space-y-3">
              {currentUser ? (
                /* Authenticated State */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md ${
                        currentUser.role === 'admin'
                          ? 'bg-rose-600'
                          : currentUser.role === 'driver'
                          ? 'bg-amber-600'
                          : currentUser.role === 'bus_owner'
                          ? 'bg-blue-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {currentUser.avatarBadge || 'U'}
                    </div>
                    <div className="truncate">
                      <span className="text-xs text-white/70 font-medium block">
                        {isAm ? 'ንቁ መለያ' : 'Active Persona'}
                      </span>
                      <span className="text-sm font-extrabold text-white block truncate">
                        {isAm ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                        {currentUser.role === 'admin'
                          ? isAm ? 'የመናኸሪያ አስተዳዳሪ' : 'Terminal Dispatch Admin'
                          : currentUser.role === 'driver'
                          ? isAm ? 'ፈቃድ ያለው አሽከርካሪ' : 'Licensed Coach Driver'
                          : currentUser.role === 'bus_owner'
                          ? isAm ? 'የአውቶቡስ ባለንብረት' : 'Fleet Bus Owner'
                          : isAm ? 'የተረጋገጠ ተሳፋሪ' : 'Verified Passenger'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Logged in user */}
                  <div className="space-y-1.5 pt-1">
                    {onOpenDashboards && (
                      <button
                        onClick={onOpenDashboards}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{isAm ? 'ዳሽቦርድ ክፈት' : 'Open Transit Dashboard'}</span>
                      </button>
                    )}

                    {currentUser.role === 'passenger' && onOpenMyTickets && (
                      <button
                        onClick={onOpenMyTickets}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Ticket className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isAm ? 'የእኔ ትኬቶች' : 'My Travel Tickets'}</span>
                        </span>
                        <span className="bg-emerald-900/60 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                          {ticketCount}
                        </span>
                      </button>
                    )}

                    {currentUser.role === 'driver' && onOpenDriverPortal && (
                      <button
                        onClick={onOpenDriverPortal}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Bus className="w-3.5 h-3.5" />
                        <span>{isAm ? 'የአሽከርካሪ ፖርታል ክፈት' : 'Open Driver Console'}</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' && onOpenAdminPortal && (
                      <button
                        onClick={onOpenAdminPortal}
                        className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isAm ? 'የመናኸሪያ አስተዳደር ማዕከል' : 'Dispatch Command Center'}</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <button
                        onClick={() => onOpenLogin()}
                        className="text-white/80 hover:text-white underline cursor-pointer"
                      >
                        {isAm ? 'መለያ ቀይር' : 'Switch Persona'}
                      </button>
                      {onLogout && (
                        <button
                          onClick={onLogout}
                          className="text-rose-300 hover:text-rose-200 font-semibold cursor-pointer"
                        >
                          {isAm ? 'ውጣ' : 'Sign Out'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Unauthenticated State */
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAm ? 'የተሳፋሪና የአሽከርካሪ መለያ' : 'Sign In or Join Regional Transit'}
                    </span>
                    <span className="text-[11px] text-white/70 block">
                      {isAm ? 'ትኬት ለመቁረጥ ወይም ተሳፋሪዎችን ለመጫን' : 'Access cashless boarding & dispatch'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(12);
                        onOpenLogin(undefined, 'login');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isAm ? 'ግባ' : 'Sign In'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(12);
                        onOpenSignUp();
                      }}
                      className="py-2.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 border border-white/25"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAm ? 'ተመዝገብ' : 'Sign Up'}</span>
                    </button>
                  </div>

                  {/* 1-Click Fast Demo Switcher */}
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-amber-300/90 block mb-1.5 tracking-wider">
                      {isAm ? 'ፈጣን የሙከራ መለያዎች (Demo):' : '1-Click Persona Logins:'}
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          onOpenLogin('passenger', 'login');
                        }}
                        className="flex-1 py-1 px-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium transition cursor-pointer truncate"
                        title="Sign in as Passenger Abebe Bikila"
                      >
                        👤 {isAm ? 'ተሳፋሪ' : 'Passenger'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          onOpenLogin('driver', 'login');
                        }}
                        className="flex-1 py-1 px-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium transition cursor-pointer truncate"
                        title="Sign in as Bus Driver Kassahun Worku"
                      >
                        🚌 {isAm ? 'ሹፌር' : 'Driver'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          onOpenLogin('bus_owner', 'login');
                        }}
                        className="flex-1 py-1 px-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium transition cursor-pointer truncate"
                        title="Sign in as Bus Owner Belayneh Kassa"
                      >
                        🏢 {isAm ? 'ባለንብረት' : 'Owner'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          onOpenLogin('admin', 'login');
                        }}
                        className="flex-1 py-1 px-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium transition cursor-pointer truncate"
                        title="Sign in as Station Master Yonas Getachew"
                      >
                        🛡️ {isAm ? 'አስተዳዳሪ' : 'Admin'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Corridor Selection Ribbon - Displayed in Users mode */}
          {currentCategory === 'users' && onSelectCorridor && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAm ? 'ታዋቂ የቀጥታ አውቶቡስ መስመሮች (Popular Corridors):' : 'Popular Express Bus Corridors:'}</span>
                </span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  {isAm ? 'ለመምረጥ ይጫኑ' : 'Click to filter departures'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_CORRIDORS.map((c) => (
                  <button
                    key={`${c.originId}-${c.destId}`}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      onSelectCorridor(c.originId, c.destId);
                    }}
                    className="p-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400 text-left transition cursor-pointer group"
                  >
                    <span className="block text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                      {isAm ? c.nameAm : c.nameEn}
                    </span>
                    <span className="block text-[10px] text-emerald-300 font-mono mt-0.5">
                      {c.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Driver Operational Shortcuts Ribbon */}
          {currentCategory === 'driver' && onSelectModule && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAm ? 'ፈጣን የአሽከርካሪ ትዕዛዞች፡' : 'Quick Cockpit Triggers:'}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('manifest');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'የተሳፋሪዎች ማኒፌስት' : 'Passenger Manifest'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('safety_check');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAm ? 'የቅድመ-ጉዞ ፍተሻ' : 'Pre-Trip Inspection'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('badges');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400/50 text-xs font-bold text-amber-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'የአፈጻጸም ሜዳሊያዎች' : 'Performance Badges'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('incident');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-xs font-bold text-rose-200 flex items-center gap-1.5 transition cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                <span>{isAm ? 'የመንገድ ጥንቃቄ ሪፖርት' : 'Hazard Report'}</span>
              </button>
            </div>
          )}

          {/* Admin Operational Shortcuts Ribbon */}
          {currentCategory === 'administration' && onSelectModule && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-rose-200 flex items-center gap-1.5 mr-1">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAm ? 'የአስተዳደር ትዕዛዞች፡' : 'Dispatch Actions:'}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('traffic_radar');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-rose-300" />
                <span>{isAm ? 'የመናኸሪያ መጨናነቅ' : 'Terminal Radar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('alerts_broadcast');
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600/40 hover:bg-rose-600/60 border border-rose-400/50 text-xs font-bold text-rose-100 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'የአስቸኳይ ጥንቃቄ ስርጭት' : 'Broadcast Advisory'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('weather_monitor');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-300" />
                <span>{isAm ? 'የአየር ሁኔታ መቆጣጠሪያ' : 'Weather Monitor'}</span>
              </button>
            </div>
          )}

          {/* Business Owner Operational Shortcuts Ribbon */}
          {currentCategory === 'business_owners' && onSelectModule && (
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5 mr-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>{isAm ? 'የባለንብረት ትዕዛዞች፡' : 'Fleet Actions:'}</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('dispatch_trip');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600/50 hover:bg-blue-600/70 border border-blue-400/50 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'አዲስ ጉዞ መመደብ' : 'Schedule Departure'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('fleet');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <Bus className="w-3.5 h-3.5 text-blue-300" />
                <span>{isAm ? 'የፍሊት ቁጥጥር' : 'Fleet Telemetry'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule('financials');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAm ? 'የፋይናንስ ትንተና' : 'Revenue Analytics'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  Radio,
  Building2,
  Users,
  Ticket,
  PlusCircle,
  Globe,
  ShieldCheck,
  BellRing,
  Clock,
  Smartphone,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  Contrast,
  SlidersHorizontal,
  Star,
  Compass,
  LayoutDashboard,
  Phone,
  Briefcase,
  ArrowRightLeft,
} from 'lucide-react';
import { AppCategory, Language, UserProfile, UserRole } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import { MOCK_USERS } from '../data/mockUsers';

interface NavbarProps {
  activeTab: 'booking' | 'planner' | 'map' | 'tracker' | 'directory' | 'carpool' | 'dashboard' | string;
  setActiveTab: (tab: any) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  ticketCount: number;
  currentCategory?: AppCategory;
  onSelectCategory?: (category: AppCategory) => void;
  hasActiveAlert?: boolean;
  activeAlertMinutes?: number | null;
  transitClockTime?: string;
  currentUser?: UserProfile | null;
  highContrastMode: boolean;
  onToggleHighContrast: (enabled: boolean) => void;
  onOpenAccessibilitySettings?: () => void;
  onOpenLogin: (preferredRole?: UserRole) => void;
  onOpenSignUp?: () => void;
  onOpenDriverPortal?: () => void;
  onOpenAdminPortal?: () => void;
  onLogout?: () => void;
  onOpenMyTickets: () => void;
  onOpenPostRide: () => void;
  onTriggerDepartureAlert?: () => void;
  onOpenAlertToast?: () => void;
  onInstallApp?: () => void;
  onOpenTerminalMonitor?: () => void;
  onOpenUssdDialer?: () => void;
  onOpenCallCenter?: () => void;
  onOpenSmsBooking?: () => void;
  preferredTerminalName?: string;
  preferredTerminalStatus?: 'normal' | 'delayed' | 'cancelled';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  ticketCount,
  hasActiveAlert = false,
  activeAlertMinutes,
  transitClockTime = '06:05 AM',
  currentUser = null,
  highContrastMode,
  onToggleHighContrast,
  onOpenAccessibilitySettings,
  onOpenLogin,
  onOpenSignUp,
  onOpenDriverPortal,
  onOpenAdminPortal,
  onLogout,
  onOpenMyTickets,
  onOpenPostRide,
  onTriggerDepartureAlert,
  onOpenAlertToast,
  onInstallApp,
  onOpenTerminalMonitor,
  onOpenUssdDialer,
  onOpenCallCenter,
  onOpenSmsBooking,
  currentCategory = 'users',
  onSelectCategory,
  preferredTerminalName,
  preferredTerminalStatus = 'normal',
}) => {
  const t = translations[lang];
  const isAm = lang === 'am';
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Fast switch to persona helper
  const handleFastSwitchPersona = (role: UserRole) => {
    let target = MOCK_USERS.find((u) => u.role === role);
    if (target && onOpenLogin) {
      onOpenLogin(role);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/90 shadow-xs">
      {/* 1. TOP UTILITY MICRO BAR (Government Authority & Clock & A11y) */}
      <div className="bg-emerald-950 text-emerald-100 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {lang === 'en'
                ? 'Amhara Regional Transport Authority Dispatch • 15 Connected Terminals'
                : 'የአማራ ክልል ትራንስፖርት ባለስልጣን • 15 የተገናኙ መናኸሪያዎች'}
            </span>
          </span>
          <span className="hidden md:inline text-emerald-700">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-200 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'en' ? 'Transit Clock:' : 'የመርሐ-ግብር ሰዓት፡'} {transitClockTime}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Active 30m Departure Alert Indicator */}
          {hasActiveAlert && (
            <button
              onClick={() => {
                if (onOpenAlertToast) onOpenAlertToast();
                else if (onTriggerDepartureAlert) onTriggerDepartureAlert();
              }}
              className="flex items-center gap-1 bg-amber-400 text-neutral-950 px-2 py-0.5 rounded text-[11px] font-bold shadow-xs animate-pulse cursor-pointer"
            >
              <BellRing className="w-3 h-3 text-neutral-950" />
              <span>
                {isAm ? `በ ${activeAlertMinutes || 25}ደ ይነሳል` : `Departs in ${activeAlertMinutes || 25}m`}
              </span>
            </button>
          )}

          {/* 24/7 Hotline Badge */}
          {onOpenCallCenter && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onOpenCallCenter();
              }}
              className="flex items-center gap-1 text-amber-300 hover:text-white px-1.5 py-0.5 text-[11px] font-bold transition cursor-pointer"
              title="24/7 Transit Helpline (994)"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>994 <span className="hidden sm:inline font-normal text-emerald-200">Hotline</span></span>
            </button>
          )}

          <span className="text-emerald-800 hidden sm:inline">|</span>

          {/* Language Switcher */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setLang(lang === 'en' ? 'am' : 'en');
            }}
            className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 text-white px-2 py-0.5 rounded transition font-medium cursor-pointer text-[11px] border border-emerald-700/50"
            title="Toggle Language / ቋንቋ ቀይር"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span>{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
          </button>

          {/* High Contrast Mode Android Accessibility Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={highContrastMode}
            onClick={() => {
              triggerHaptic(20);
              onToggleHighContrast(!highContrastMode);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer active:scale-95 ${
              highContrastMode
                ? 'bg-amber-300 text-black border border-black shadow-xs font-black'
                : 'bg-emerald-900/80 hover:bg-emerald-800 text-white border border-emerald-700/50'
            }`}
            title={
              highContrastMode
                ? isAm
                  ? 'ከፍተኛ ንፅፅር በርቷል (WCAG AAA) - ለማጥፋት ይጫኑ'
                  : 'High Contrast Mode ON (WCAG AAA 7:1) - Click to turn off'
                : isAm
                  ? 'ከፍተኛ የንፅፅር ሁነታን ያብሩ'
                  : 'Turn on High Contrast Mode'
            }
          >
            <Contrast className={`w-3 h-3 ${highContrastMode ? 'text-black stroke-[2.5]' : 'text-amber-300'}`} />
            <span className="hidden sm:inline">
              {isAm ? 'ንፅፅር' : 'A11y'}
            </span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-black uppercase ${
                highContrastMode ? 'bg-black text-amber-300' : 'bg-emerald-950 text-emerald-200'
              }`}
            >
              {highContrastMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Accessibility Settings dialog */}
          {onOpenAccessibilitySettings && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onOpenAccessibilitySettings();
              }}
              className="p-1 rounded bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition cursor-pointer"
              title={t.accessibilitySettings}
              aria-label={t.accessibilitySettings}
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div
          onClick={() => {
            if (onSelectCategory) onSelectCategory('users');
            setActiveTab('booking');
          }}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-emerald-600/30 shrink-0 bg-emerald-800 flex items-center justify-center">
            <img
              src="/app-logo.png"
              alt={lang === 'am' ? 'ባስ ራይድ' : 'Bus Ride'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-neutral-900">
                {lang === 'am' ? (
                  <span>ባስ ራይድ</span>
                ) : (
                  <span>
                    Bus<span className="text-emerald-700">Ride</span>
                  </span>
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                {lang === 'en' ? 'Transit' : 'ትራንስፖርት'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block leading-tight">
              {lang === 'en' ? 'Amhara Regional Intercity Network' : 'የአማራ ክልል ከተሞች የትራንስፖርት መረብ'}
            </p>
          </div>
        </div>

        {/* 4 PRIMARY STAKEHOLDER PORTAL TABS (Desktop & Tablet) */}
        <nav aria-label="Portal Categories Architecture" className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          {/* 1. Users Category */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (onSelectCategory) onSelectCategory('users');
              else setActiveTab('booking');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentCategory === 'users'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isAm ? 'ተጠቃሚዎች' : 'Users & Commuters'}</span>
          </button>

          {/* 2. Driver Category */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (onSelectCategory) onSelectCategory('driver');
              else setActiveTab('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentCategory === 'driver'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>{isAm ? 'ሹፌር' : 'Commercial Driver'}</span>
          </button>

          {/* 3. Administration Category */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (onSelectCategory) onSelectCategory('administration');
              else setActiveTab('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentCategory === 'administration'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAm ? 'አስተዳደር' : 'Administration'}</span>
          </button>

          {/* 4. Business Owners Category */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              if (onSelectCategory) onSelectCategory('business_owners');
              else setActiveTab('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              currentCategory === 'business_owners'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isAm ? 'ባለንብረቶች' : 'Fleet Owners'}</span>
          </button>
        </nav>

        {/* Right Side Actions: Tickets, Terminal Radar & Profile Switcher */}
        <div className="flex items-center gap-2">
          {/* Post Shared Ride button for commuters */}
          <button
            onClick={onOpenPostRide}
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.postRide}</span>
          </button>

          {/* Terminal Radar Button */}
          {onOpenTerminalMonitor && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onOpenTerminalMonitor();
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                preferredTerminalStatus === 'cancelled'
                  ? 'bg-rose-100 text-rose-950 border-rose-400'
                  : preferredTerminalStatus === 'delayed'
                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
              }`}
              title="Terminal Radar & Disruption Monitor"
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  preferredTerminalStatus !== 'normal' ? 'text-rose-600 animate-pulse' : 'text-neutral-600'
                }`}
              />
              <span className="hidden md:inline">
                {isAm ? 'መናኸሪያ' : 'Terminal Radar'}
              </span>
              {preferredTerminalStatus !== 'normal' && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              )}
            </button>
          )}

          {/* My Tickets Button */}
          <button
            onClick={onOpenMyTickets}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition cursor-pointer active:scale-95"
            title={t.myTickets}
          >
            <Ticket className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.myTickets}</span>
            {ticketCount > 0 && (
              <span className="w-5 h-5 -mr-1 rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] flex items-center justify-center">
                {ticketCount}
              </span>
            )}
          </button>

          {/* User Profile / Persona Dropdown Switcher */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`flex items-center gap-2 py-1 px-2 rounded-xl border text-xs font-bold transition cursor-pointer shadow-2xs ${
                  currentUser.role === 'admin'
                    ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100'
                    : currentUser.role === 'driver'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                    : currentUser.role === 'bus_owner'
                    ? 'bg-blue-50 border-blue-300 text-blue-950 hover:bg-blue-100'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg text-white font-black text-[10px] flex items-center justify-center ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-700'
                      : currentUser.role === 'driver'
                      ? 'bg-amber-600'
                      : currentUser.role === 'bus_owner'
                      ? 'bg-blue-700'
                      : 'bg-emerald-700'
                  }`}
                >
                  {currentUser.avatarBadge || 'U'}
                </div>
                <div className="text-left hidden sm:block max-w-[110px] truncate">
                  <span className="block text-[11px] font-bold leading-tight truncate">
                    {isAm ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName}
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-wider opacity-75 block">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Profile Dropdown Menu with 1-Click Persona Switcher */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-black text-neutral-900">{isAm ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{currentUser.phoneNumber}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        currentUser.role === 'admin'
                          ? 'bg-rose-100 text-rose-900'
                          : currentUser.role === 'driver'
                          ? 'bg-amber-100 text-amber-900'
                          : currentUser.role === 'bus_owner'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {currentUser.role === 'admin'
                        ? 'Regional Authority Dispatcher'
                        : currentUser.role === 'driver'
                        ? 'Commercial Bus Captain'
                        : currentUser.role === 'bus_owner'
                        ? 'Bus Fleet Owner'
                        : 'Commuter / Passenger'}
                    </span>
                  </div>

                  {/* Quick Persona Switcher in dropdown */}
                  <div className="px-3 py-2 border-b border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5 tracking-wider">
                      {isAm ? 'ፈጣን የመለያ መቀየሪያ (Personas):' : 'Switch Active Persona:'}
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleFastSwitchPersona('passenger');
                        }}
                        className={`p-1.5 rounded-lg text-left transition cursor-pointer flex items-center gap-1.5 ${
                          currentUser.role === 'passenger' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{isAm ? 'ተሳፋሪ' : 'Passenger'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleFastSwitchPersona('driver');
                        }}
                        className={`p-1.5 rounded-lg text-left transition cursor-pointer flex items-center gap-1.5 ${
                          currentUser.role === 'driver' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <Bus className="w-3.5 h-3.5 text-amber-600" />
                        <span className="truncate">{isAm ? 'ሹፌር' : 'Driver'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleFastSwitchPersona('bus_owner');
                        }}
                        className={`p-1.5 rounded-lg text-left transition cursor-pointer flex items-center gap-1.5 ${
                          currentUser.role === 'bus_owner' ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate">{isAm ? 'ባለንብረት' : 'Bus Owner'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleFastSwitchPersona('admin');
                        }}
                        className={`p-1.5 rounded-lg text-left transition cursor-pointer flex items-center gap-1.5 ${
                          currentUser.role === 'admin' ? 'bg-rose-50 text-rose-900 font-bold' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                        <span className="truncate">{isAm ? 'አስተዳደር' : 'Admin'}</span>
                      </button>
                    </div>
                  </div>

                  {currentUser.role === 'driver' && onOpenDriverPortal && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenDriverPortal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Bus className="w-4 h-4 text-amber-600" />
                      <span>{isAm ? 'የአሽከርካሪ ኮንሶል ክፈት' : 'Open Driver Console'}</span>
                    </button>
                  )}

                  {currentUser.role === 'admin' && onOpenAdminPortal && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAdminPortal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-900 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>{isAm ? 'የመናኸሪያ አስተዳደር ማዕከል' : 'Open Admin Command Center'}</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-neutral-100"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>{isAm ? 'ውጣ (Sign Out)' : 'Sign Out'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onOpenLogin();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isAm ? 'መግቢያ' : 'Log In'}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(10);
                  if (onOpenSignUp) onOpenSignUp();
                  else onOpenLogin();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-neutral-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded-lg shadow-2xs transition cursor-pointer active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5 text-neutral-950" />
                <span>{isAm ? 'ይመዝገቡ' : 'Sign Up'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. MOBILE NAVIGATION CATEGORY STRIP */}
      <div className="lg:hidden flex items-center justify-around border-t border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs">
        <button
          onClick={() => {
            if (onSelectCategory) onSelectCategory('users');
            setActiveTab('booking');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            currentCategory === 'users' ? 'text-emerald-800 font-bold' : 'text-neutral-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'en' ? 'Users' : 'ተጠቃሚ'}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectCategory) onSelectCategory('driver');
            setActiveTab('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            currentCategory === 'driver' ? 'text-amber-800 font-bold' : 'text-neutral-600'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{lang === 'en' ? 'Driver' : 'ሹፌር'}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectCategory) onSelectCategory('administration');
            setActiveTab('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            currentCategory === 'administration' ? 'text-rose-800 font-bold' : 'text-neutral-600'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'en' ? 'Admin' : 'አስተዳደር'}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectCategory) onSelectCategory('business_owners');
            setActiveTab('dashboard');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            currentCategory === 'business_owners' ? 'text-blue-800 font-bold' : 'text-neutral-600'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{lang === 'en' ? 'Owners' : 'ባለንብረት'}</span>
        </button>

        <button
          onClick={onOpenMyTickets}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer text-emerald-800 font-bold relative"
        >
          <Ticket className="w-4 h-4" />
          <span>{lang === 'en' ? 'Tickets' : 'ትኬት'}</span>
          {ticketCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-neutral-950 font-black text-[9px] flex items-center justify-center">
              {ticketCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

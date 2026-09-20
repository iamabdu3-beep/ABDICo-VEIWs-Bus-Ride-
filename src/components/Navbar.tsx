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
} from 'lucide-react';
import { Language, UserProfile, UserRole } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';

interface NavbarProps {
  activeTab: 'booking' | 'map' | 'tracker' | 'directory' | 'carpool';
  setActiveTab: (tab: 'booking' | 'map' | 'tracker' | 'directory' | 'carpool') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  ticketCount: number;
  hasActiveAlert?: boolean;
  activeAlertMinutes?: number | null;
  transitClockTime?: string;
  currentUser?: UserProfile | null;
  onOpenLogin: (preferredRole?: UserRole) => void;
  onOpenDriverPortal?: () => void;
  onOpenAdminPortal?: () => void;
  onLogout?: () => void;
  onOpenMyTickets: () => void;
  onOpenPostRide: () => void;
  onTriggerDepartureAlert?: () => void;
  onOpenAlertToast?: () => void;
  onInstallApp?: () => void;
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
  onOpenLogin,
  onOpenDriverPortal,
  onOpenAdminPortal,
  onLogout,
  onOpenMyTickets,
  onOpenPostRide,
  onTriggerDepartureAlert,
  onOpenAlertToast,
  onInstallApp,
}) => {
  const t = translations[lang];
  const isAm = lang === 'am';
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-xs">
      {/* Top micro status bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {lang === 'en'
                ? 'Amhara Regional Transport Authority Dispatch • 15 Terminals'
                : 'የአማራ ክልል ትራንስፖርት ባለስልጣን • 15 መናኸሪያዎች'}
            </span>
          </span>
          <span className="hidden md:inline text-emerald-400">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === 'en' ? 'Transit Clock:' : 'የመርሐ-ግብር ሰዓት፡'} {transitClockTime}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Direct Role Login Shortcuts for Drivers & Administration */}
          <button
            onClick={() => {
              triggerHaptic(10);
              if (currentUser?.role === 'driver' && onOpenDriverPortal) {
                onOpenDriverPortal();
              } else {
                onOpenLogin('driver');
              }
            }}
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 text-[11px] font-semibold transition cursor-pointer"
            title={isAm ? 'የሹፌር ፖርታል መግቢያ' : 'Driver & Operator Console Portal'}
          >
            <Bus className="w-3 h-3 text-amber-300" />
            <span>{isAm ? 'የሹፌር ፖርታል' : 'Driver Portal'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(10);
              if (currentUser?.role === 'admin' && onOpenAdminPortal) {
                onOpenAdminPortal();
              } else {
                onOpenLogin('admin');
              }
            }}
            className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-2 py-0.5 rounded border border-rose-500/40 text-[11px] font-semibold transition cursor-pointer"
            title={isAm ? 'የመናኸሪያ አስተዳደር ማዕከል' : 'Administration Dispatch Command'}
          >
            <ShieldCheck className="w-3 h-3 text-rose-300" />
            <span>{isAm ? 'አስተዳደር' : 'Administration'}</span>
          </button>

          <span className="text-emerald-500 hidden sm:inline">|</span>

          {/* Quick 30-min alert tester button */}
          {onTriggerDepartureAlert && (
            <button
              onClick={onTriggerDepartureAlert}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                hasActiveAlert
                  ? 'bg-amber-400 text-neutral-950 animate-pulse'
                  : 'bg-emerald-800 hover:bg-emerald-700 text-amber-300 border border-emerald-700'
              }`}
              title={lang === 'en' ? 'Test 30-minute departure alert notification' : 'የ30 ደቂቃ መነሻ ማሳሰቢያ ሞክር'}
            >
              <BellRing className="w-3 h-3 text-amber-400" />
              <span>
                {hasActiveAlert
                  ? lang === 'en'
                    ? `Departing in ${activeAlertMinutes || 25}m`
                    : `በ ${activeAlertMinutes || 25} ደ ይነሳል`
                  : lang === 'en'
                  ? 'Test 30m Alert'
                  : 'ማሳሰቢያ ፈትሽ'}
              </span>
            </button>
          )}

          {onInstallApp && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 px-2 py-0.5 rounded text-[11px] font-bold shadow-xs transition cursor-pointer active:scale-95"
              title={lang === 'en' ? 'Install Android App (APK / PWA)' : 'የአንድሮይድ መተግበሪያ ጫን'}
            >
              <Smartphone className="w-3 h-3 text-neutral-950 stroke-[2.5]" />
              <span>{lang === 'en' ? 'Android' : 'አንድሮይድ'}</span>
            </button>
          )}

          <button
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1 bg-emerald-800/80 hover:bg-emerald-700 text-white px-2 py-0.5 rounded transition font-medium cursor-pointer text-[11px]"
            title="Toggle Language / ቋንቋ ቀይር"
          >
            <Globe className="w-3 h-3 text-amber-300" />
            <span>{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={() => setActiveTab('booking')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-900/15 border border-emerald-600/30 shrink-0 bg-emerald-800 flex items-center justify-center">
            <img
              src="/app-logo.png"
              alt="Bus Ride App Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if needed
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-neutral-900">
                Bus<span className="text-emerald-700">Ride</span> App
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                {lang === 'en' ? 'Bus Share' : 'የጋራ አውቶቡስ'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1">
              {lang === 'en' ? 'All Amhara Region Bus Stations' : 'የሁሉም የአማራ ክልል መናኸሪያዎች ትራንስፖርት'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Bus className="w-4 h-4 text-emerald-600" />
            <span>{t.navBooking}</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{t.navMap}</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>{t.navTracker}</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>{t.navStations}</span>
          </button>

          <button
            onClick={() => setActiveTab('carpool')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'carpool'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>{t.navCarpool}</span>
          </button>
        </nav>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {/* Departure Alert Notification Bell Button */}
          <button
            onClick={() => {
              if (hasActiveAlert && onOpenAlertToast) {
                onOpenAlertToast();
              } else if (onTriggerDepartureAlert) {
                onTriggerDepartureAlert();
              }
            }}
            className={`relative p-2 rounded-xl transition cursor-pointer flex items-center justify-center border ${
              hasActiveAlert
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/50'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300'
            }`}
            title={
              hasActiveAlert
                ? lang === 'en'
                  ? 'Active departure alert - click to view details'
                  : 'ንቁ የጉዞ ማሳሰቢያ'
                : lang === 'en'
                ? 'Schedule Alerts - Test 30-min departure notification'
                : 'የመነሻ ማሳሰቢያ'
            }
          >
            <BellRing className={`w-4 h-4 ${hasActiveAlert ? 'animate-bounce text-slate-950' : ''}`} />
            {hasActiveAlert && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </button>

          <button
            onClick={onOpenPostRide}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.postRide}</span>
          </button>

          <button
            onClick={onOpenMyTickets}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-amber-300" />
            <span>{t.myTickets}</span>
            {ticketCount > 0 && (
              <span className="w-5 h-5 -mr-1 rounded-full bg-amber-400 text-emerald-950 font-bold text-[11px] flex items-center justify-center">
                {ticketCount}
              </span>
            )}
          </button>

          {/* User / Driver / Admin Authentication Badge */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow-xs ${
                  currentUser.role === 'admin'
                    ? 'bg-rose-50 border-rose-300 text-rose-950 hover:bg-rose-100'
                    : currentUser.role === 'driver'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full text-white font-black text-[10px] flex items-center justify-center ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-700'
                      : currentUser.role === 'driver'
                      ? 'bg-amber-600'
                      : 'bg-emerald-700'
                  }`}
                >
                  {currentUser.avatarBadge || 'U'}
                </div>
                <div className="text-left hidden sm:block max-w-[120px] truncate">
                  <span className="block text-[11px] font-bold leading-tight truncate">
                    {isAm ? currentUser.fullNameAm : currentUser.fullName}
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-wider opacity-75 block">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900">{isAm ? currentUser.fullNameAm : currentUser.fullName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">{currentUser.phoneNumber}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        currentUser.role === 'admin'
                          ? 'bg-rose-100 text-rose-800'
                          : currentUser.role === 'driver'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.role === 'admin'
                        ? 'Administration Authority'
                        : currentUser.role === 'driver'
                        ? 'Licensed Bus Driver'
                        : 'Passenger Account'}
                    </span>
                  </div>

                  {currentUser.role === 'driver' && onOpenDriverPortal && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenDriverPortal();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
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
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-900 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      <span>{isAm ? 'የመናኸሪያ አስተዳደር ማዕከል' : 'Open Admin Command Center'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-neutral-500" />
                    <span>{isAm ? 'ሚና/አካውንት ቀይር' : 'Switch Role / Account'}</span>
                  </button>

                  <div className="border-t border-neutral-100 my-1" />

                  {onLogout && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>{isAm ? 'ውጣ (Sign Out)' : 'Sign Out'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                triggerHaptic(10);
                onOpenLogin();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 border border-amber-500 rounded-lg shadow-xs transition cursor-pointer active:scale-95"
              title={isAm ? 'ወደ መተግበሪያው ይግቡ (ተጓዥ፣ ሹፌር፣ አስተዳደር)' : 'Sign In as Passenger, Driver, or Administration'}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isAm ? 'መግቢያ' : 'Log In'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden flex items-center justify-around border-t border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'booking' ? 'text-emerald-700 font-semibold' : 'text-neutral-600'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>{lang === 'en' ? 'Book' : 'ቦታ ያዙ'}</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'map' ? 'text-emerald-700 font-semibold' : 'text-neutral-600'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{lang === 'en' ? 'Map' : 'ካርታ'}</span>
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'tracker' ? 'text-rose-700 font-semibold' : 'text-neutral-600'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{lang === 'en' ? 'Live Radar' : 'ቀጥታ'}</span>
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'directory' ? 'text-emerald-700 font-semibold' : 'text-neutral-600'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{lang === 'en' ? 'Stations' : 'መናኸሪያዎች'}</span>
        </button>
        <button
          onClick={() => setActiveTab('carpool')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            activeTab === 'carpool' ? 'text-amber-700 font-semibold' : 'text-neutral-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'en' ? 'Share' : 'የጋራ'}</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic(10);
            if (currentUser?.role === 'driver' && onOpenDriverPortal) {
              onOpenDriverPortal();
            } else if (currentUser?.role === 'admin' && onOpenAdminPortal) {
              onOpenAdminPortal();
            } else {
              onOpenLogin();
            }
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded cursor-pointer ${
            currentUser ? 'text-emerald-800 font-bold' : 'text-neutral-600'
          }`}
        >
          <User className="w-4 h-4" />
          <span>
            {currentUser
              ? currentUser.role === 'admin'
                ? isAm ? 'አስተዳደር' : 'Admin'
                : currentUser.role === 'driver'
                ? isAm ? 'ሹፌር' : 'Driver'
                : isAm ? 'መለያ' : 'Profile'
              : isAm ? 'መግቢያ' : 'Login'}
          </span>
        </button>
      </div>
    </header>
  );
};


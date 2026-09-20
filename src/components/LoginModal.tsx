import React, { useState } from 'react';
import {
  X,
  User,
  Bus,
  ShieldCheck,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Fingerprint,
  Building2,
  Key,
  BadgeCheck,
  Radio,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Language, UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { triggerHaptic } from '../utils/haptics';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: UserProfile) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLoginSuccess,
  initialRole = 'passenger',
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [phoneOrId, setPhoneOrId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const isAm = lang === 'am';

  // Quick autofill preset credentials for instant demo testing
  const handleSelectPreset = (user: UserProfile) => {
    triggerHaptic(12);
    setErrorMessage(null);
    setSelectedRole(user.role);

    if (user.role === 'passenger') {
      setPhoneOrId(user.phoneNumber);
      setPassword('1234');
    } else if (user.role === 'driver') {
      setPhoneOrId(user.driverLicenseNumber || user.phoneNumber);
      setPassword('driver99');
    } else if (user.role === 'admin') {
      setPhoneOrId(user.adminStaffId || user.email || '');
      setPassword('admin2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneOrId.trim()) {
      setErrorMessage(
        isAm
          ? 'እባክዎን ስልክ ቁጥር ወይም መለያ ያስገቡ'
          : 'Please enter your phone number, Staff ID, or Driver ID'
      );
      triggerHaptic(30);
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        isAm ? 'እባክዎን የይለፍ ቃል/PIN ያስገቡ' : 'Please enter your security PIN or password'
      );
      triggerHaptic(30);
      return;
    }

    setIsLoading(true);
    triggerHaptic(15);

    // Simulate authentication verification
    setTimeout(() => {
      // Find matching mock user or fallback to standard profile for the chosen role
      let matchedUser = MOCK_USERS.find(
        (u) =>
          u.role === selectedRole &&
          (u.phoneNumber.replace(/\s+/g, '').includes(phoneOrId.replace(/\s+/g, '')) ||
            (u.nationalId && u.nationalId.toLowerCase().includes(phoneOrId.toLowerCase())) ||
            (u.driverLicenseNumber &&
              u.driverLicenseNumber.toLowerCase().includes(phoneOrId.toLowerCase())) ||
            (u.adminStaffId &&
              u.adminStaffId.toLowerCase().includes(phoneOrId.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(phoneOrId.toLowerCase())))
      );

      // If no exact match found, create dynamic demo user session for the selected role
      if (!matchedUser) {
        if (selectedRole === 'passenger') {
          matchedUser = {
            id: `usr-${Date.now()}`,
            role: 'passenger',
            fullName: 'Abebe Bikila',
            fullNameAm: 'አበበ ቢቂላ',
            phoneNumber: phoneOrId.startsWith('+251') ? phoneOrId : `+251 ${phoneOrId}`,
            nationalId: 'FAYDA-882194',
            totalTripsCompleted: 4,
          };
        } else if (selectedRole === 'driver') {
          matchedUser = MOCK_USERS.find((u) => u.role === 'driver') || MOCK_USERS[2];
        } else {
          matchedUser = MOCK_USERS.find((u) => u.role === 'admin') || MOCK_USERS[4];
        }
      }

      setIsLoading(false);
      triggerHaptic(20);
      onLoginSuccess(matchedUser);
      onClose();
    }, 600);
  };

  const roleConfigs = {
    passenger: {
      titleEn: 'Passenger Login',
      titleAm: 'የተጓዥ መግቢያ',
      descEn: 'Access your digital tickets, luggage tracking, and travel history.',
      descAm: 'ዲጂታል ትኬቶችዎን፣ የሻንጣ መከታተያ እና የጉዞ ታሪክዎን ይመልከቱ።',
      idLabelEn: 'Mobile Phone Number or Fayda ID',
      idLabelAm: 'ስልክ ቁጥር ወይም ፋይዳ መታወቂያ',
      idPlaceholder: '+251 91 123 4567 / FAYDA-882194',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    driver: {
      titleEn: 'Driver & Bus Operator Portal',
      titleAm: 'የአሽከርካሪና ኦፕሬተር ፖርታል',
      descEn: 'View trip manifest, verify passenger tickets, and report transit status.',
      descAm: 'የጉዞ ተሳፋሪዎችን ዝርዝር ይመልከቱ፣ ትኬት ያረጋግጡ፣ የጉዞ ፍጥነት ያሳውቁ።',
      idLabelEn: 'Driver License Number or Phone',
      idLabelAm: 'የመንጃ ፍቃድ ቁጥር ወይም ስልክ',
      idPlaceholder: 'AMH-CDL-99214 / +251 91 872 3341',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    admin: {
      titleEn: 'Station Administration & Dispatch Command',
      titleAm: 'የመናኸሪያ አስተዳደርና የቁጥጥር ማዕከል',
      descEn: 'Terminal bay scheduling, fleet telemetry, revenue audits, and emergency alerts.',
      descAm: 'የመጫኛ በሮች ቁጥጥር፣ የክልሉ አውቶቡሶች ክትትል፣ የገቢ ኦዲትና የአደጋ ማሳሰቢያዎች።',
      idLabelEn: 'Official Staff ID or Bureau Email',
      idLabelAm: 'የሰራተኛ መታወቂያ ወይም ኦፊሴላዊ ኢሜይል',
      idPlaceholder: 'RTA-AMH-001 / yonas.g@amharatransport.gov.et',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Ethiopian Transport Authority Branding */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="absolute top-3.5 right-3.5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Bus className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">
                  Amhara<span className="text-amber-300">Ride</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 border border-emerald-500/40">
                  {isAm ? 'የመግቢያ ፖርታል' : 'Authentication Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isAm
                  ? 'የአማራ ክልል የሕዝብ ትራንስፖርትና መናኸሪያዎች መረብ'
                  : 'Amhara Regional Transport & Bus Terminal Network'}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Role Tab Navigation */}
        <div className="p-3 bg-neutral-100 border-b border-neutral-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-1 mb-2">
            {isAm ? 'የመግቢያ ሚና ይምረጡ' : 'Select Access Role'}
          </p>
          <div className="grid grid-cols-3 gap-1.5 bg-neutral-200/80 p-1 rounded-xl">
            {/* Passenger Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setSelectedRole('passenger');
                setErrorMessage(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'passenger'
                  ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-black/5'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'passenger' ? 'text-emerald-600' : 'text-neutral-500'}`} />
              <span className="truncate">{isAm ? 'ተጓዥ' : 'Passenger'}</span>
            </button>

            {/* Driver Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setSelectedRole('driver');
                setErrorMessage(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-white text-amber-900 shadow-sm ring-1 ring-black/5'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <Bus className={`w-4 h-4 ${selectedRole === 'driver' ? 'text-amber-600' : 'text-neutral-500'}`} />
              <span className="truncate">{isAm ? 'ሹፌር' : 'Driver'}</span>
            </button>

            {/* Admin Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setSelectedRole('admin');
                setErrorMessage(null);
              }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-rose-900 shadow-sm ring-1 ring-black/5'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-rose-600' : 'text-neutral-500'}`} />
              <span className="truncate">{isAm ? 'አስተዳደር' : 'Admin'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Role Header description */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                {selectedRole === 'passenger' && <User className="w-4 h-4 text-emerald-600" />}
                {selectedRole === 'driver' && <Bus className="w-4 h-4 text-amber-600" />}
                {selectedRole === 'admin' && <ShieldCheck className="w-4 h-4 text-rose-600" />}
                <span>{isAm ? roleConfigs[selectedRole].titleAm : roleConfigs[selectedRole].titleEn}</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfigs[selectedRole].badgeColor}`}>
                {selectedRole === 'passenger'
                  ? isAm ? 'ተሳፋሪ' : 'User'
                  : selectedRole === 'driver'
                  ? isAm ? 'የንግድ አሽከርካሪ' : 'Licensed Operator'
                  : isAm ? 'መናኸሪያ ቁጥጥር' : 'Authority Clearance'}
              </span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {isAm ? roleConfigs[selectedRole].descAm : roleConfigs[selectedRole].descEn}
            </p>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {isAm ? roleConfigs[selectedRole].idLabelAm : roleConfigs[selectedRole].idLabelEn}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  {selectedRole === 'passenger' ? (
                    <Phone className="w-4 h-4" />
                  ) : selectedRole === 'driver' ? (
                    <BadgeCheck className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  value={phoneOrId}
                  onChange={(e) => setPhoneOrId(e.target.value)}
                  placeholder={roleConfigs[selectedRole].idPlaceholder}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Password/PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  {selectedRole === 'passenger'
                    ? isAm ? 'የደህንነት ፒን / የይለፍ ቃል' : 'Security PIN / Password'
                    : selectedRole === 'driver'
                    ? isAm ? 'የአሽከርካሪ ፒን (Driver PIN)' : 'Driver PIN'
                    : isAm ? 'የአስተዳዳሪ ማረጋገጫ ቁልፍ' : 'Admin Security Key'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    alert(
                      isAm
                        ? 'ለፈጣን ሙከራ ከዚህ በታች ያሉትን "ቀጥታ መግቢያ (One-Click Demo)" ይጫኑ!'
                        : 'For instant testing, click one of the preset demo buttons below!'
                    );
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer font-medium"
                >
                  {isAm ? 'እርዳታ ይፈልጋሉ?' : 'Need Help?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    selectedRole === 'passenger'
                      ? '•••• (e.g. 1234)'
                      : selectedRole === 'driver'
                      ? '•••••••• (e.g. driver99)'
                      : '•••••••• (e.g. admin2026)'
                  }
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setShowPassword(!showPassword);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox & Fayda trust badge */}
            <div className="flex items-center justify-between text-xs text-neutral-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>{isAm ? 'በዚህ መሳሪያ ላይ አስታውሰኝ' : 'Remember me on this device'}</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isAm ? 'ፋይዳ (Fayda) የተረጋገጠ' : 'Fayda ID Verified'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75 ${
                selectedRole === 'passenger'
                  ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-800/20'
                  : selectedRole === 'driver'
                  ? 'bg-amber-700 hover:bg-amber-800 shadow-amber-800/20'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isAm ? 'እየተረጋገጠ ነው...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'passenger'
                      ? isAm ? 'እንደ ተጓዥ ይግቡ' : 'Sign In as Passenger'
                      : selectedRole === 'driver'
                      ? isAm ? 'እንደ አሽከርካሪ ወደ ኮንሶል ይግቡ' : 'Sign In to Driver Console'
                      : isAm ? 'እንደ አስተዳደር ወደ ማዕከል ይግቡ' : 'Sign In to Admin Command Center'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Section */}
          <div className="pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAm ? 'የሙከራ አካውንቶች (ፈጣን መግቢያ)' : 'Quick Demo Accounts (1-Click)'}</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">{isAm ? 'ይጫኑ' : 'Click to autofill'}</span>
            </div>

            <div className="space-y-1.5">
              {selectedRole === 'passenger' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[0])}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        AB
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-emerald-900">
                            Abebe Bikila (አበበ ቢቂላ)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            Passenger
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          +251 91 123 4567 • Bahir Dar commuter (Has active confirmed ticket)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[1])}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                        HT
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-emerald-900">
                            Hiwot Tadesse (ሕይወት ታደሰ)
                          </span>
                          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-semibold">
                            Merchant
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          +251 92 345 6789 • Gondar market traveler
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>
                </>
              )}

              {selectedRole === 'driver' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[2])}
                    className="w-full text-left p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 hover:border-amber-400 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                        KW
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-amber-950">
                            Capt. Kassahun Worku (ካፒቴን ካሳሁን)
                          </span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                            Selam Bus
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600">
                          Plate: ET 03-A88219 • Assigned Run: Bahir Dar ➔ Gondar (Bay #4)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-800 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[3])}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-amber-50 hover:border-amber-300 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                        GM
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-amber-950">
                            Getachew Molla (ጌታቸው ሞላ)
                          </span>
                          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-semibold">
                            Sky Bus
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Plate: ET 03-B55420 • Assigned Run: Dessie ➔ Kombolcha (Bay #2)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-800 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>
                </>
              )}

              {selectedRole === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[4])}
                    className="w-full text-left p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:border-rose-400 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-700 text-white font-bold text-xs flex items-center justify-center">
                        YG
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-rose-950">
                            Ato Yonas Getachew (አቶ ዮናስ ጌታቸው)
                          </span>
                          <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-semibold">
                            Regional Director
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600">
                          Staff ID: RTA-AMH-001 • Regional HQ Command (All 15 Terminals)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-rose-800 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(MOCK_USERS[5])}
                    className="w-full text-left p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-rose-50 hover:border-rose-300 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                        RA
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-rose-950">
                            W/ro Rahel Assefa (ወ/ሮ ራሔል አሰፋ)
                          </span>
                          <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-semibold">
                            Station Master
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          Staff ID: RTA-WOL-042 • Dessie Boru Central Terminal
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-rose-800 font-bold group-hover:translate-x-0.5 transition">
                      Fill ➔
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Intercity Transit Gateway</span>
          </span>
          <span className="font-mono">v3.4.0-amh</span>
        </div>
      </div>
    </div>
  );
};

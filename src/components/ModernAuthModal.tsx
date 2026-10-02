import React, { useState, useEffect, useRef } from 'react';
import { Language, UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { triggerHaptic, playLoginSuccessSound } from '../utils/haptics';
import {
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
  X,
  Globe,
  MapPin,
  IdCard,
  Building2,
  Check,
  ChevronRight,
  Smartphone,
  KeyRound,
  Shield,
  FileCheck2,
  Clock,
} from 'lucide-react';

export interface ModernAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (user: UserProfile) => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  onLanguageChange?: (lang: Language) => void;
}

type AuthMethod = 'phone_otp' | 'phone_pin' | 'fayda';

const AMHARA_CITIES = [
  { id: 'bd', nameEn: 'Bahir Dar', nameAm: 'ባሕር ዳር' },
  { id: 'gon', nameEn: 'Gondar', nameAm: 'ጎንደር' },
  { id: 'des', nameEn: 'Dessie', nameAm: 'ደሴ' },
  { id: 'db', nameEn: 'Debre Birhan', nameAm: 'ደብረ ብርሃን' },
  { id: 'dm', nameEn: 'Debre Markos', nameAm: 'ደብረ ማርቆስ' },
  { id: 'lali', nameEn: 'Lalibela', nameAm: 'ላሊበላ' },
  { id: 'wol', nameEn: 'Woldiya', nameAm: 'ወልዲያ' },
  { id: 'km', nameEn: 'Kombolcha', nameAm: 'ኮምቦልቻ' },
  { id: 'dt', nameEn: 'Debre Tabor', nameAm: 'ደብረ ታቦር' },
  { id: 'aa', nameEn: 'Addis Ababa Gateway', nameAm: 'አዲስ አበባ መግቢያ' },
];

export const ModernAuthModal: React.FC<ModernAuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLoginSuccess,
  initialRole = 'passenger',
  initialMode = 'login',
  onLanguageChange,
}) => {
  if (!isOpen) return null;

  const isAm = lang === 'am';

  // Screen Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone_otp');

  // Sign In inputs
  const [phone, setPhone] = useState('911234567');
  const [password, setPassword] = useState('1234');
  const [faydaId, setFaydaId] = useState('FAYDA-882194');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Step (for both Sign In and Sign Up)
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['9', '4', '8', '1', '2', '0']);
  const [resendSeconds, setResendSeconds] = useState(45);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sign Up inputs
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState('Bahir Dar');
  const [signupRole, setSignupRole] = useState<UserRole>('passenger');
  const [signupPin, setSignupPin] = useState('');
  const [signupConfirmPin, setSignupConfirmPin] = useState('');
  const [signupFayda, setSignupFayda] = useState('');
  const [signupAgree, setSignupAgree] = useState(true);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  // Sync mode and role on open
  useEffect(() => {
    setMode(initialMode);
    setSelectedRole(initialRole);
    setSignupRole(initialRole);
    setErrorMsg(null);
    setIsOtpStep(false);
  }, [initialMode, initialRole, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Resend OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && resendSeconds > 0) {
      timer = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, resendSeconds]);

  // Quick Demo Fast-Login Preset Selection
  const handleSelectDemoPreset = (user: UserProfile) => {
    triggerHaptic(12);
    setErrorMsg(null);
    setSelectedRole(user.role);
    const cleanPhone = user.phoneNumber.replace('+251', '').replace(/\s+/g, '');
    setPhone(cleanPhone);

    if (user.role === 'passenger') {
      setPassword('1234');
      setFaydaId(user.nationalId || 'FAYDA-882194');
    } else if (user.role === 'driver') {
      setPassword('driver99');
      setFaydaId(user.driverLicenseNumber || 'AMH-CDL-99214');
    } else if (user.role === 'bus_owner') {
      setPassword('owner2026');
      setFaydaId(user.operatorLicenseNumber || 'AMH-FLEET-2024-884');
    } else if (user.role === 'admin') {
      setPassword('admin2026');
      setFaydaId(user.adminStaffId || 'RTA-AMH-001');
    }
  };

  // 1-Click Fast Instant Login with Demo Account
  const handleFastDirectLogin = (user: UserProfile) => {
    triggerHaptic(20);
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      completeAuth(user);
    }, 600);
  };

  // OTP digit navigation
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[index] = val.slice(-1);
    setOtpDigits(next);
    triggerHaptic(8);
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Complete successful authentication
  const completeAuth = (user: UserProfile) => {
    setIsLoading(false);
    setSuccessUser(user);
    triggerHaptic(25);
    playLoginSuccessSound();

    setTimeout(() => {
      onLoginSuccess(user);
      onClose();
    }, 1000);
  };

  // Handle Sign In submission
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMethod === 'phone_otp' && !isOtpStep) {
      if (!phone.trim() || phone.trim().length < 8) {
        setErrorMsg(isAm ? 'እባክዎን ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid 9-digit Ethiopian mobile number');
        triggerHaptic(30);
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsOtpStep(true);
        setResendSeconds(45);
        triggerHaptic(15);
      }, 700);
      return;
    }

    if (authMethod === 'phone_otp' && isOtpStep) {
      const code = otpDigits.join('');
      if (code.length < 6) {
        setErrorMsg(isAm ? 'እባክዎን ሙሉ ባለ 6-አሃዝ ኮድ ያስገቡ' : 'Please enter the complete 6-digit verification code');
        triggerHaptic(30);
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        const found =
          MOCK_USERS.find(
            (u) =>
              u.role === selectedRole &&
              u.phoneNumber.replace(/\s+/g, '').includes(phone.slice(-6))
          ) ||
          MOCK_USERS.find((u) => u.role === selectedRole) ||
          MOCK_USERS[0];
        completeAuth(found);
      }, 800);
      return;
    }

    if (authMethod === 'phone_pin') {
      if (!phone.trim() || !password.trim()) {
        setErrorMsg(isAm ? 'ስልክ ቁጥር እና የይለፍ ቃል ያስገቡ' : 'Please provide both mobile number and security PIN');
        triggerHaptic(30);
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        const found =
          MOCK_USERS.find((u) => u.role === selectedRole) || MOCK_USERS[0];
        completeAuth(found);
      }, 800);
      return;
    }

    if (authMethod === 'fayda') {
      if (!faydaId.trim()) {
        setErrorMsg(isAm ? 'የፋይዳ ዲጂታል መታወቂያ ቁጥር ያስገቡ' : 'Please enter your Fayda Digital National ID');
        triggerHaptic(30);
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        const found =
          MOCK_USERS.find((u) => u.nationalId === faydaId) ||
          MOCK_USERS.find((u) => u.role === selectedRole) ||
          MOCK_USERS[0];
        completeAuth(found);
      }, 800);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupFullName.trim()) {
      setErrorMsg(isAm ? 'እባክዎን ሙሉ ስምዎን ያስገቡ' : 'Please enter your full legal name');
      triggerHaptic(30);
      return;
    }

    if (!signupPhone.trim() || signupPhone.trim().length < 8) {
      setErrorMsg(isAm ? 'ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid 9-digit Ethiopian phone number');
      triggerHaptic(30);
      return;
    }

    if (signupPin.length < 4) {
      setErrorMsg(isAm ? 'ባለ 4-አሃዝ የደህንነት ፒን ያስገቡ' : 'Please set a 4-digit security PIN');
      triggerHaptic(30);
      return;
    }

    if (signupPin !== signupConfirmPin) {
      setErrorMsg(isAm ? 'የተረጋገጠው ፒን ቁጥር አይመሳሰልም' : 'Security PIN confirmation does not match');
      triggerHaptic(30);
      return;
    }

    if (!signupAgree) {
      setErrorMsg(isAm ? 'የአገልግሎት ውሎችን ይቀበሉ' : 'Please accept the Regional Transport Authority terms');
      triggerHaptic(30);
      return;
    }

    if (!isOtpStep) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsOtpStep(true);
        setResendSeconds(45);
        triggerHaptic(15);
      }, 700);
      return;
    }

    // OTP verification for Sign Up
    setIsLoading(true);
    setTimeout(() => {
      const initials = signupFullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newUser: UserProfile = {
        id: `usr-reg-${Date.now()}`,
        role: signupRole,
        fullName: signupFullName,
        fullNameAm: signupFullName,
        phoneNumber: `+251 ${signupPhone.slice(0, 2)} ${signupPhone.slice(2, 5)} ${signupPhone.slice(5)}`,
        email: `${signupFullName.toLowerCase().replace(/\s+/g, '.')}@ethiotransit.et`,
        avatarBadge: initials || 'ET',
        nationalId: signupFayda.trim() || `FAYDA-${Math.floor(100000 + Math.random() * 900000)}`,
        totalTripsCompleted: 0,
        driverLicenseNumber: signupRole === 'driver' ? 'AMH-CDL-NEW' : undefined,
        companyName: signupRole === 'driver' ? 'Regional Registered Driver' : undefined,
        terminalBase: signupRole === 'driver' ? `${signupCity} Central Terminal` : undefined,
      };

      completeAuth(newUser);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col md:flex-row my-auto transition-all relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ============================================================ */}
        {/* LEFT COLUMN: Rich Brand Editorial Showcase (Desktop & Tablet) */}
        {/* ============================================================ */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white p-7 sm:p-8 flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle background image backdrop */}
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url('/transit-hero.jpg')` }}
          />

          {/* Glowing gradient ambient */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & Status */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border border-emerald-500/40 bg-emerald-800 flex items-center justify-center shrink-0">
                <img
                  src="/app-logo.png"
                  alt="Bus Ride"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-white block">
                  {isAm ? 'ባስ ራይድ ኢትዮጵያ' : 'BusRide Ethiopia'}
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">
                  {isAm ? 'የአማራ ክልል የትራንስፖርት ኔትወርክ' : 'Amhara Regional Transit Authority'}
                </span>
              </div>
            </div>

            {/* Live operational badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 bg-emerald-900/60 border border-emerald-700/50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {isAm ? '15 መናኸሪያዎች ኦንላይን ይገኛሉ' : '15 Terminals Live & Connected'}
                </span>
              </div>
            </div>
          </div>

          {/* Middle Value Proposition */}
          <div className="relative z-10 my-8 space-y-4">
            <h2 className="text-xl lg:text-2xl font-black leading-tight text-white">
              {isAm
                ? 'ፈጣን፣ አስተማማኝ እና ዘመናዊ የጉዞ ልምድ'
                : 'Modern, Safe & Cashless Intercity Travel'}
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {isAm
                ? 'በቴሌብር የዲጂታል ትኬት ይቁረጡ፣ የአውቶቡስዎን ቀጥታ መገኛ ይከታተሉ፣ እና በክልሉ 15 ከተሞች በሰላም ይጓዙ።'
                : 'Instant digital ticket booking with Telebirr, live GPS corridor dispatch, and certified licensed drivers across northern Ethiopia.'}
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2.5 pt-2 text-xs text-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{isAm ? 'ቴሌብርና CBE ብር ፈጣን ክፍያ' : 'Telebirr & CBE Birr Instant Checkout'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{isAm ? 'የፋይዳ ዲጂታል መታወቂያ የተረጋገጠ' : 'Fayda National ID Integration'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-800/80 border border-emerald-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{isAm ? 'የቀጥታ የአየር ሁኔታና መዘግየት ማንቂያ' : 'Corridor Severe Weather Warnings'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-300/80">
            <span>{isAm ? 'የኢትዮጵያ ዲጂታል ትራንስፖርት' : 'Ethiopian Digital Transit'}</span>
            <span className="font-mono">v2.4 Production</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: The Interactive Sign In / Sign Up Experience */}
        {/* ============================================================ */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-none">
          {/* Top Header: Mode Switcher & Language Switcher */}
          <div>
            <div className="flex items-center justify-between mb-4">
              {/* Segmented Mode Control (Sign In vs Sign Up) */}
              <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setMode('login');
                    setIsOtpStep(false);
                    setErrorMsg(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {isAm ? 'ግባ (Sign In)' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setMode('signup');
                    setIsOtpStep(false);
                    setErrorMsg(null);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {isAm ? 'ተመዝገብ (Sign Up)' : 'Create Account'}
                </button>
              </div>

              {/* Language Switch */}
              {onLanguageChange && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onLanguageChange(isAm ? 'en' : 'am');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAm ? 'English' : 'አማርኛ'}</span>
                </button>
              )}
            </div>

            <h1
              id="auth-modal-title"
              className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight"
            >
              {mode === 'login'
                ? isAm
                  ? 'ወደ መለያዎ ይግቡ'
                  : 'Welcome Back'
                : isAm
                ? 'አዲስ መለያ ይፍጠሩ'
                : 'Create Your Transit Account'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {mode === 'login'
                ? isAm
                  ? 'የተሳፋሪ፣ የአሽከርካሪ ወይም የመናኸሪያ አስተዳደር መለያዎን ይምረጡ'
                  : 'Access booking tickets, vehicle dispatch, and terminal authority services'
                : isAm
                ? 'በአማራ ክልል መናኸሪያዎች ፈጣን ጉዞ ለማድረግ አሁኑኑ ይመዝገቡ'
                : 'Join thousands of passengers and transport providers in Amhara'}
            </p>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Celebration */}
            {successUser && (
              <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">
                    {isAm ? 'እንኳን ደህና መጡ!' : 'Authentication Successful!'}
                  </p>
                  <p className="text-emerald-700 font-normal">
                    {isAm ? successUser.fullNameAm || successUser.fullName : successUser.fullName} (
                    {successUser.role})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 1. SIGN IN FLOW */}
          {/* ============================================================ */}
          {mode === 'login' && !successUser && (
            <div className="mt-4 space-y-4">
              {/* Role Selector Tabs (Passenger, Driver, Bus Owner, Administration) */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                  {isAm ? 'የመለያ አይነት (Role)' : 'Select User Role'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedRole('passenger');
                      const p = MOCK_USERS.find((u) => u.role === 'passenger');
                      if (p) handleSelectDemoPreset(p);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      selectedRole === 'passenger'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <User className={`w-4 h-4 ${selectedRole === 'passenger' ? 'text-emerald-700' : 'text-neutral-400'}`} />
                    <span>{isAm ? 'ተሳፋሪ' : 'Passenger'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedRole('driver');
                      const d = MOCK_USERS.find((u) => u.role === 'driver');
                      if (d) handleSelectDemoPreset(d);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      selectedRole === 'driver'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Bus className={`w-4 h-4 ${selectedRole === 'driver' ? 'text-amber-700' : 'text-neutral-400'}`} />
                    <span>{isAm ? 'ሹፌር' : 'Driver'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedRole('bus_owner');
                      const o = MOCK_USERS.find((u) => u.role === 'bus_owner');
                      if (o) handleSelectDemoPreset(o);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      selectedRole === 'bus_owner'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-1 ring-blue-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Building2 className={`w-4 h-4 ${selectedRole === 'bus_owner' ? 'text-blue-700' : 'text-neutral-400'}`} />
                    <span>{isAm ? 'ባለንብረት' : 'Bus Owner'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSelectedRole('admin');
                      const a = MOCK_USERS.find((u) => u.role === 'admin');
                      if (a) handleSelectDemoPreset(a);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-rose-50 border-rose-600 text-rose-950 ring-1 ring-rose-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-rose-700' : 'text-neutral-400'}`} />
                    <span>{isAm ? 'አስተዳዳሪ' : 'Station Master'}</span>
                  </button>
                </div>
              </div>

              {/* Fast 1-Click Demo Profiles Ribbon */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isAm ? 'የሙከራ አካውንቶች (1-Click Fast Login):' : 'Demo 1-Click Fast Logins:'}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400">Zero typing</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {MOCK_USERS.filter((u) => ['usr-abebe', 'drv-kassahun', 'owner-belay', 'adm-yonas'].includes(u.id)).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleFastDirectLogin(user)}
                      className="p-1.5 px-2 rounded-lg bg-white hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 text-left transition cursor-pointer flex items-center justify-between text-[11px] group"
                    >
                      <div className="truncate">
                        <span className="font-bold text-neutral-900 block truncate group-hover:text-emerald-900">
                          {isAm ? user.fullNameAm : user.fullName}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">
                          {user.role === 'bus_owner' ? (isAm ? 'ባለንብረት' : 'Bus Owner') : user.role}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-emerald-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Method Switcher (OTP vs PIN vs Fayda) */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone_otp');
                    setIsOtpStep(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone_otp'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>SMS OTP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone_pin');
                    setIsOtpStep(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone_pin'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>PIN Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('fayda');
                    setIsOtpStep(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === 'fayda'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Fayda ID</span>
                </button>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-3 pt-1">
                {/* 1. Mobile Phone Input (for OTP and PIN methods) */}
                {authMethod !== 'fayda' && !isOtpStep && (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      {isAm ? 'የሞባይል ስልክ ቁጥር' : 'Ethiopian Mobile Number'}
                    </label>
                    <div className="relative flex rounded-xl border border-neutral-300 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden bg-white">
                      <div className="px-3 bg-neutral-100 border-r border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1.5 select-none">
                        <span>🇪🇹</span>
                        <span>+251</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="911234567"
                        maxLength={9}
                        className="w-full px-3 py-2 text-xs font-mono font-medium outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* 2. PIN Input (for PIN method) */}
                {authMethod === 'phone_pin' && !isOtpStep && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-neutral-700 block">
                        {isAm ? 'የደህንነት ፒን (PIN) ወይም የይለፍ ቃል' : 'Security PIN / Password'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-emerald-700 font-semibold cursor-pointer"
                      >
                        {showPassword ? (isAm ? 'ደብቅ' : 'Hide') : (isAm ? 'አሳይ' : 'Show')}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Fayda Digital ID Input */}
                {authMethod === 'fayda' && !isOtpStep && (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      {isAm ? 'የፋይዳ ዲጂታል መታወቂያ ቁጥር' : 'Fayda National ID Number'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={faydaId}
                        onChange={(e) => setFaydaId(e.target.value.toUpperCase())}
                        placeholder="FAYDA-882194"
                        className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* 4. OTP Verification Step */}
                {isOtpStep && (
                  <div className="space-y-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">
                        {isAm ? 'ባለ 6-አሃዝ የማረጋገጫ ኮድ' : 'Enter 6-Digit SMS Code'}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 font-bold">
                        +251 {phone}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpInputRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-10 h-11 text-center font-mono font-black text-lg rounded-xl border-2 border-emerald-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        disabled={resendSeconds > 0}
                        onClick={() => {
                          setResendSeconds(45);
                          triggerHaptic(10);
                        }}
                        className={`font-semibold cursor-pointer ${
                          resendSeconds > 0
                            ? 'text-neutral-400'
                            : 'text-emerald-800 hover:text-emerald-950 underline'
                        }`}
                      >
                        {isAm ? 'ኮዱን ደግመህ ላክ' : 'Resend Code'}{' '}
                        {resendSeconds > 0 ? `(${resendSeconds}s)` : ''}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOtpStep(false)}
                        className="text-neutral-500 hover:text-neutral-800 underline font-medium cursor-pointer"
                      >
                        {isAm ? 'ስልክ ቁጥር ቀይር' : 'Change Phone'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {isOtpStep
                          ? isAm
                            ? 'ኮዱን አረጋግጥና ግባ'
                            : 'Verify & Sign In'
                          : isAm
                          ? 'ቀጥል'
                          : 'Continue to App'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. SIGN UP (CREATE ACCOUNT) FLOW */}
          {/* ============================================================ */}
          {mode === 'signup' && !successUser && (
            <form onSubmit={handleSignUpSubmit} className="mt-4 space-y-3">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {isAm ? 'የመለያ ሚና' : 'I am registering as'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSignupRole('passenger');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      signupRole === 'passenger'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isAm ? 'ተሳፋሪ (Passenger)' : 'Passenger'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSignupRole('driver');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      signupRole === 'driver'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-1 ring-amber-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isAm ? 'ሹፌር (Driver)' : 'Bus Driver'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setSignupRole('bus_owner');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      signupRole === 'bus_owner'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 ring-1 ring-blue-500'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>{isAm ? 'ባለንብረት (Fleet Owner)' : 'Bus Owner'}</span>
                  </button>
                </div>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {isAm ? 'ሙሉ ስም (Full Legal Name)' : 'Full Legal Name'}
                </label>
                <input
                  type="text"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  placeholder={isAm ? 'አልማዝ ከበደ' : 'Almaz Kebede'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Phone & City (2-col grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    {isAm ? 'ስልክ ቁጥር' : 'Phone (+251)'}
                  </label>
                  <div className="relative flex rounded-xl border border-neutral-300 focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden bg-white">
                    <span className="px-2.5 bg-neutral-100 border-r border-neutral-200 text-xs font-bold text-neutral-700 flex items-center select-none">
                      +251
                    </span>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="924567890"
                      maxLength={9}
                      className="w-full px-2.5 py-2 text-xs font-mono outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    {isAm ? 'ከተማ (City Base)' : 'City Base'}
                  </label>
                  <select
                    value={signupCity}
                    onChange={(e) => setSignupCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {AMHARA_CITIES.map((c) => (
                      <option key={c.id} value={c.nameEn}>
                        {isAm ? c.nameAm : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PIN and Confirm PIN */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    {isAm ? '4-አሃዝ ፒን (PIN)' : '4-Digit PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={signupPin}
                    onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    {isAm ? 'ፒኑን ያረጋግጡ' : 'Confirm PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={signupConfirmPin}
                    onChange={(e) => setSignupConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Optional Fayda National ID */}
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {isAm ? 'የፋይዳ መታወቂያ (አማራጭ)' : 'Fayda National ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={signupFayda}
                  onChange={(e) => setSignupFayda(e.target.value.toUpperCase())}
                  placeholder="FAYDA-920144"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={signupAgree}
                  onChange={(e) => setSignupAgree(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  {isAm
                    ? 'የአማራ ክልል የትራንስፖርት አገልግሎት መመሪያዎችንና ደንቦችን ተቀብያለሁ'
                    : 'I agree to the Ethiopian Regional Passenger Transport Guidelines & Safety Rules'}
                </span>
              </label>

              {/* Sign Up Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isAm ? 'መለያ ፍጠርና ጀምር' : 'Create Account & Begin'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Bottom Switcher */}
          <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>
                {isAm ? 'አዲስ ተጠቃሚ ኖት?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setIsOtpStep(false);
                    setErrorMsg(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {isAm ? 'እዚህ ይመዝገቡ' : 'Sign Up Free'}
                </button>
              </p>
            ) : (
              <p>
                {isAm ? 'መለያ አለዎት?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsOtpStep(false);
                    setErrorMsg(null);
                  }}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {isAm ? 'ወደ መለያ ይግቡ' : 'Sign In'}
                </button>
              </p>
            )}

            <span className="text-[11px] text-neutral-400">100% Cashless</span>
          </div>
        </div>
      </div>
    </div>
  );
};

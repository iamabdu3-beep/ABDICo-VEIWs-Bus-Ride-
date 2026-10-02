import React, { useState, useEffect, useRef } from 'react';
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
  Fingerprint,
  Building2,
  Key,
  Globe,
  Headphones,
  HelpCircle,
  Wifi,
  BatteryMedium,
  Check,
  ChevronRight,
  RefreshCw,
  QrCode,
  Shield,
  Smartphone,
  ArrowLeft,
  Info,
  UserPlus,
  LogIn,
  Mail,
  MapPin,
  IdCard,
} from 'lucide-react';
import { Language, UserProfile, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import {
  triggerHaptic,
  playBiometricScanSound,
  playLoginSuccessSound,
} from '../utils/haptics';

export interface MobileLoginScreenProps {
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  isEmbeddedInPhoneMockup?: boolean;
}

type AuthMethod = 'phone_otp' | 'phone_pin' | 'fayda' | 'biometric';
type ScreenMode = 'login' | 'signup';

const ETHIOPIAN_CITIES = [
  { id: 'bd', en: 'Bahir Dar', am: 'ባሕር ዳር' },
  { id: 'gon', en: 'Gondar', am: 'ጎንደር' },
  { id: 'des', en: 'Dessie', am: 'ደሴ' },
  { id: 'dm', en: 'Debre Markos', am: 'ደብረ ማርቆስ' },
  { id: 'db', en: 'Debre Birhan', am: 'ደብረ ብርሃን' },
  { id: 'wol', en: 'Woldia', am: 'ወልዲያ' },
  { id: 'aa', en: 'Addis Ababa', am: 'አዲስ አበባ' },
];

export const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({
  lang,
  onLanguageChange,
  onLoginSuccess,
  onClose,
  initialRole = 'passenger',
  initialMode = 'login',
  isEmbeddedInPhoneMockup = false,
}) => {
  const isAm = lang === 'am';

  // Screen Mode: Login vs Sign Up
  const [screenMode, setScreenMode] = useState<ScreenMode>(initialMode);

  // Login States
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone_otp');
  const [phoneNumber, setPhoneNumber] = useState('911234567');
  const [pinOrPassword, setPinOrPassword] = useState('1234');
  const [faydaId, setFaydaId] = useState('FAYDA-882194');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login OTP Verification Step
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['9', '4', '8', '1', '2', '0']);
  const [countdown, setCountdown] = useState(45);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sign Up States
  const [signupRole, setSignupRole] = useState<UserRole>('passenger');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupCity, setSignupCity] = useState('Bahir Dar');
  const [signupFayda, setSignupFayda] = useState('');
  const [signupPin, setSignupPin] = useState('');
  const [signupConfirmPin, setSignupConfirmPin] = useState('');
  const [signupShowPin, setSignupShowPin] = useState(false);
  const [signupAgreeTerms, setSignupAgreeTerms] = useState(true);

  // Sign Up OTP Step
  const [isSignupOtpStep, setIsSignupOtpStep] = useState(false);
  const [signupOtpDigits, setSignupOtpDigits] = useState(['9', '4', '8', '1', '2', '0']);
  const [signupCountdown, setSignupCountdown] = useState(60);
  const signupOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Processing & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  // Sync initialMode when prop changes
  useEffect(() => {
    setScreenMode(initialMode);
  }, [initialMode]);

  // Countdown timer for Login OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, countdown]);

  // Countdown timer for Sign Up OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSignupOtpStep && signupCountdown > 0) {
      timer = setInterval(() => setSignupCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isSignupOtpStep, signupCountdown]);

  // Demo user preset selector for Login
  const handleSelectPreset = (user: UserProfile) => {
    triggerHaptic(12);
    setErrorMessage(null);
    setSelectedRole(user.role);

    const cleanPhone = user.phoneNumber.replace('+251', '').replace(/\s+/g, '');
    setPhoneNumber(cleanPhone);

    if (user.role === 'passenger') {
      setPinOrPassword('1234');
      setFaydaId(user.nationalId || 'FAYDA-882194');
    } else if (user.role === 'driver') {
      setPinOrPassword('driver99');
      setFaydaId(user.driverLicenseNumber || 'AMH-CDL-99214');
    } else if (user.role === 'admin') {
      setPinOrPassword('admin2026');
      setFaydaId(user.adminStaffId || 'RTA-AMH-001');
    }
  };

  // Quick Demo Auto-Fill for Sign Up
  const handleAutoFillSignupDemo = () => {
    triggerHaptic(15);
    setErrorMessage(null);
    setSignupRole('passenger');
    setSignupFullName(isAm ? 'አልማዝ ከበደ' : 'Almaz Kebede');
    setSignupPhone('924567890');
    setSignupEmail('almaz.kebede@example.com');
    setSignupCity('Bahir Dar');
    setSignupFayda('FAYDA-920144');
    setSignupPin('4321');
    setSignupConfirmPin('4321');
    setSignupAgreeTerms(true);
  };

  // Switch role for Login
  const handleRoleChange = (role: UserRole) => {
    triggerHaptic(10);
    setSelectedRole(role);
    setErrorMessage(null);
    setIsOtpStep(false);

    const defaultUserForRole = MOCK_USERS.find((u) => u.role === role);
    if (defaultUserForRole) {
      handleSelectPreset(defaultUserForRole);
    }
  };

  // Handle Login OTP digit changes with auto-advance
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    triggerHaptic(8);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Sign Up OTP digit changes with auto-advance
  const handleSignupOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...signupOtpDigits];
    newDigits[index] = value.slice(-1);
    setSignupOtpDigits(newDigits);
    triggerHaptic(8);

    if (value && index < 5) {
      signupOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleSignupOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !signupOtpDigits[index] && index > 0) {
      signupOtpInputRefs.current[index - 1]?.focus();
    }
  };

  // Complete Login/Signup flow
  const completeAuth = (user: UserProfile) => {
    setIsLoading(false);
    setIsBiometricScanning(false);
    setSuccessUser(user);
    triggerHaptic(25);
    playLoginSuccessSound();

    setTimeout(() => {
      onLoginSuccess(user);
      if (onClose) onClose();
    }, 1100);
  };

  // Submit standard Login form
  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMethod === 'phone_otp' && !isOtpStep) {
      if (!phoneNumber.trim()) {
        setErrorMessage(isAm ? 'እባክዎን ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter your phone number');
        triggerHaptic(30);
        return;
      }
      setIsLoading(true);
      triggerHaptic(15);
      setTimeout(() => {
        setIsLoading(false);
        setIsOtpStep(true);
        setCountdown(60);
      }, 500);
      return;
    }

    if (authMethod === 'phone_pin' && !pinOrPassword.trim()) {
      setErrorMessage(isAm ? 'እባክዎን የደህንነት PIN/የይለፍ ቃል ያስገቡ' : 'Please enter your security PIN or password');
      triggerHaptic(30);
      return;
    }

    if (authMethod === 'fayda' && !faydaId.trim()) {
      setErrorMessage(isAm ? 'እባክዎን የፋይዳ መለያ ቁጥር ያስገቡ' : 'Please enter your Fayda National ID');
      triggerHaptic(30);
      return;
    }

    setIsLoading(true);
    triggerHaptic(15);

    setTimeout(() => {
      const fullPhone = `+251 ${phoneNumber.replace(/^0/, '')}`;
      let matched = MOCK_USERS.find(
        (u) =>
          u.role === selectedRole &&
          (u.phoneNumber.replace(/\s+/g, '').includes(phoneNumber.replace(/\s+/g, '')) ||
            (u.nationalId && u.nationalId.toLowerCase() === faydaId.toLowerCase()) ||
            (u.driverLicenseNumber && u.driverLicenseNumber.toLowerCase() === faydaId.toLowerCase()) ||
            (u.adminStaffId && u.adminStaffId.toLowerCase() === faydaId.toLowerCase()))
      );

      if (!matched) {
        if (selectedRole === 'passenger') {
          matched = {
            id: `usr-${Date.now()}`,
            role: 'passenger',
            fullName: 'Abebe Bikila',
            fullNameAm: 'አበበ ቢቂላ',
            phoneNumber: fullPhone,
            nationalId: faydaId || 'FAYDA-882194',
            totalTripsCompleted: 12,
          };
        } else if (selectedRole === 'driver') {
          matched = MOCK_USERS.find((u) => u.role === 'driver') || MOCK_USERS[2];
        } else {
          matched = MOCK_USERS.find((u) => u.role === 'admin') || MOCK_USERS[4];
        }
      }

      completeAuth(matched);
    }, 700);
  };

  // Submit Sign Up Form (Step 1 -> Send OTP)
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!signupFullName.trim()) {
      setErrorMessage(isAm ? 'እባክዎን ሙሉ ስምዎን ያስገቡ' : 'Please enter your full name');
      triggerHaptic(30);
      return;
    }

    const cleanPhone = signupPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage(
        isAm ? 'እባክዎን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 0912345678)' : 'Please enter a valid Ethiopian mobile number (e.g. 0912345678)'
      );
      triggerHaptic(30);
      return;
    }

    if (!signupPin.trim() || signupPin.length < 4) {
      setErrorMessage(
        isAm ? 'እባክዎን ቢያንስ ባለ 4-ድጂት PIN ወይም የይለፍ ቃል ያስገቡ' : 'Please choose a 4-digit PIN or password'
      );
      triggerHaptic(30);
      return;
    }

    if (signupPin !== signupConfirmPin) {
      setErrorMessage(isAm ? 'የይለፍ ቃሉ አይመሳሰልም፤ እባክዎን ደግመው ያረጋግጡ' : 'PINs do not match. Please verify your entry');
      triggerHaptic(30);
      return;
    }

    if (!signupAgreeTerms) {
      setErrorMessage(isAm ? 'እባክዎን የተሳፋሪዎች ደንብና ግዴታዎችን ይቀበሉ' : 'Please accept the passenger safety terms to continue');
      triggerHaptic(30);
      return;
    }

    // Advance to SMS verification
    setIsLoading(true);
    triggerHaptic(15);

    setTimeout(() => {
      setIsLoading(false);
      setIsSignupOtpStep(true);
      setSignupCountdown(60);
    }, 600);
  };

  // Verify Sign Up OTP (Step 2 -> Create Profile & Login)
  const handleVerifySignupOtp = () => {
    setErrorMessage(null);
    setIsLoading(true);
    triggerHaptic(15);

    setTimeout(() => {
      const initials = signupFullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ET';

      const cleanPhone = signupPhone.replace(/^0/, '');
      const formattedPhone = `+251 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5)}`;

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        role: signupRole,
        fullName: signupFullName,
        fullNameAm: signupFullName,
        phoneNumber: formattedPhone,
        email: signupEmail.trim() || undefined,
        avatarBadge: initials,
        nationalId: signupFayda.trim() ? signupFayda.trim().toUpperCase() : 'FAYDA-NEW-91024',
        totalTripsCompleted: 0,
        terminalBase: signupCity,
        terminalBaseAm: signupCity,
      };

      completeAuth(newUser);
    }, 800);
  };

  // Biometric authentication trigger
  const handleBiometricAuth = () => {
    if (isBiometricScanning) return;
    setIsBiometricScanning(true);
    setErrorMessage(null);
    triggerHaptic([20, 50, 20]);
    playBiometricScanSound();

    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.role === selectedRole) || MOCK_USERS[0];
      completeAuth(user);
    }, 1300);
  };

  // Role Theme Color helper
  const getRoleAccent = () => {
    if (selectedRole === 'driver') {
      return {
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        activeBtn: 'bg-amber-600 text-white',
        border: 'border-amber-500',
        glow: 'from-amber-500/20',
      };
    }
    if (selectedRole === 'admin') {
      return {
        badge: 'bg-rose-100 text-rose-900 border-rose-300',
        activeBtn: 'bg-rose-700 text-white',
        border: 'border-rose-500',
        glow: 'from-rose-500/20',
      };
    }
    return {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      activeBtn: 'bg-emerald-700 text-white',
      border: 'border-emerald-500',
      glow: 'from-emerald-500/20',
    };
  };

  const accent = getRoleAccent();

  return (
    <div
      id="mobile-auth-screen"
      className={`w-full flex flex-col justify-between text-neutral-900 select-none ${
        isEmbeddedInPhoneMockup
          ? 'h-full bg-neutral-950 text-white p-2.5 overflow-y-auto'
          : 'min-h-full sm:min-h-[640px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200'
      }`}
    >
      {/* Phone Status Bar (Rendered for authentic native mobile feel) */}
      <div
        className={`flex items-center justify-between px-4 pt-3 pb-1 text-[11px] font-semibold shrink-0 z-10 ${
          isEmbeddedInPhoneMockup ? 'text-neutral-400' : 'text-neutral-600 bg-neutral-50/80 border-b border-neutral-100'
        }`}
      >
        <span className="font-mono font-bold tracking-tight">10:45</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            5G ET
          </span>
          <Wifi className="w-3.5 h-3.5 text-neutral-500" />
          <div className="flex items-center gap-0.5">
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-mono">98%</span>
          </div>
        </div>
      </div>

      {/* Top Mobile Action Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 shrink-0 ${
          isEmbeddedInPhoneMockup ? 'border-b border-neutral-800' : 'border-b border-neutral-100'
        }`}
      >
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isEmbeddedInPhoneMockup
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                screenMode === 'signup'
                  ? 'bg-amber-500'
                  : selectedRole === 'passenger'
                  ? 'bg-emerald-500'
                  : selectedRole === 'driver'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
              }`}
            >
              {screenMode === 'signup'
                ? isAm ? 'አዲስ የተጠቃሚ ምዝገባ' : 'New User Sign Up'
                : isAm ? 'ደህንነቱ የተጠበቀ መግቢያ' : 'Secure Sign-In'}
            </span>
          </div>
        </div>

        {/* Top Right Utilities: Language toggle & Help */}
        <div className="flex items-center gap-1.5">
          {onLanguageChange && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onLanguageChange(isAm ? 'en' : 'am');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                isEmbeddedInPhoneMockup
                  ? 'border-neutral-700 text-amber-300 bg-neutral-900 hover:bg-neutral-800'
                  : 'border-amber-200 text-amber-900 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Globe className="w-3 h-3 text-amber-600" />
              <span>{isAm ? 'EN' : 'አማ'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setShowHelpDrawer(!showHelpDrawer);
            }}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isEmbeddedInPhoneMockup
                ? 'border-neutral-800 text-neutral-400 hover:text-white'
                : 'border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
            }`}
            title="Help / ድጋፍ"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Brand Logo & Header */}
        <div className="text-center pt-1 pb-1">
          <div className="relative inline-block mx-auto mb-2">
            <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${accent.glow} to-transparent blur-md opacity-70`} />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-400/80 bg-emerald-900 p-0.5 mx-auto">
              <img
                src="/app-logo.png"
                alt="ባስ ራይድ"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-neutral-950 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow border border-white">
              ✓ ET
            </span>
          </div>

          <h1
            className={`text-lg sm:text-xl font-black tracking-tight leading-tight ${
              isEmbeddedInPhoneMockup ? 'text-white' : 'text-neutral-900'
            }`}
          >
            {screenMode === 'signup'
              ? isAm ? 'አዲስ አካውንት ይፍጠሩ' : 'Create Passenger Account'
              : isAm ? 'እንኳን ደህና መጡ!' : 'Welcome Back'}
          </h1>
          <p
            className={`text-xs mt-0.5 max-w-xs mx-auto ${
              isEmbeddedInPhoneMockup ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            {screenMode === 'signup'
              ? isAm
                ? 'በቀላሉ የባስ ትኬት ይቁረጡ፤ የሻንጣዎን ጉዞ ይከታተሉ'
                : 'Book intercity bus rides & track luggage in real time'
              : isAm
              ? 'ወደ ባስ ራይድ የትራንስፖርት መተግበሪያ ይግቡ'
              : 'Sign in to access your virtual tickets and routes'}
          </p>
        </div>

        {/* Primary Screen Mode Switcher Pill (ይግቡ vs ይመዝገቡ) */}
        <div
          className={`p-1 rounded-2xl border flex items-center ${
            isEmbeddedInPhoneMockup
              ? 'bg-neutral-900 border-neutral-800'
              : 'bg-neutral-100 border-neutral-200 shadow-2xs'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setErrorMessage(null);
              setScreenMode('login');
              setIsOtpStep(false);
              setIsSignupOtpStep(false);
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              screenMode === 'login'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80 scale-[1.02]'
                : isEmbeddedInPhoneMockup
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAm ? 'ይግቡ (Log In)' : 'Log In'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setErrorMessage(null);
              setScreenMode('signup');
              setIsOtpStep(false);
              setIsSignupOtpStep(false);
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              screenMode === 'signup'
                ? 'bg-emerald-700 text-white shadow-sm scale-[1.02]'
                : isEmbeddedInPhoneMockup
                ? 'text-neutral-400 hover:text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>{isAm ? 'ይመዝገቡ (Sign Up)' : 'Sign Up'}</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Splash Card */}
        {successUser && (
          <div className="p-4 rounded-2xl bg-emerald-700 text-white text-center shadow-xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 border-2 border-amber-300">
              <CheckCircle2 className="w-7 h-7 text-amber-300" />
            </div>
            <h4 className="font-black text-sm">
              {screenMode === 'signup'
                ? isAm ? 'ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል!' : 'Account Created Successfully!'
                : isAm ? 'በተሳካ ሁኔታ ገብተዋል!' : 'Login Successful!'}
            </h4>
            <p className="text-xs text-emerald-100 mt-1">
              {isAm
                ? `${successUser.fullNameAm || successUser.fullName} እንኳን ወደ ባስ ራይድ በደህና መጡ`
                : `Welcome to Bus Ride, ${successUser.fullName}!`}
            </p>
            <div className="mt-3 bg-emerald-800/80 rounded-xl p-2 text-[10px] font-mono flex items-center justify-between border border-emerald-600">
              <span className="text-emerald-200">{isAm ? 'የተሳፋሪ መለያ:' : 'Passenger ID:'}</span>
              <span className="font-bold text-amber-300">{successUser.nationalId || 'ET-PASS-91024'}</span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* A. SIGN UP VIEW */}
        {/* ============================================================ */}
        {!successUser && screenMode === 'signup' && (
          <div className="space-y-3.5 animate-in fade-in">
            {!isSignupOtpStep ? (
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                {/* 1-Tap Demo Quick-Fill Pill Bar */}
                <div
                  className={`p-2 rounded-xl border flex items-center justify-between ${
                    isEmbeddedInPhoneMockup
                      ? 'bg-neutral-900 border-neutral-800'
                      : 'bg-amber-50/80 border-amber-200/80'
                  }`}
                >
                  <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>{isAm ? 'ፈጣን ምዝገባ መሞከሪያ' : 'Fast Demo Auto-Fill'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillSignupDemo}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    {isAm ? '⚡ ናሙና አስገባ (አልማዝ)' : '⚡ Fill Demo (Almaz)'}
                  </button>
                </div>

                {/* Account Type / Role Pill Selector */}
                <div>
                  <label
                    className={`block text-[11px] font-bold mb-1 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {isAm ? 'የአካውንት አይነት' : 'Account Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setSignupRole('passenger');
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        signupRole === 'passenger'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                          : isEmbeddedInPhoneMockup
                          ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          : 'bg-white border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAm ? 'ተጓዥ (Passenger)' : 'Passenger'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setSignupRole('driver');
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        signupRole === 'driver'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                          : isEmbeddedInPhoneMockup
                          ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                          : 'bg-white border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <Bus className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isAm ? 'ሹፌር (Driver)' : 'Driver Application'}</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {isAm ? 'ሙሉ ስም (የአባት ስም ጨምሮ)' : 'Full Name (First & Father Name)'}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                    <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder={isAm ? 'ለምሳሌ፡ አልማዝ ከበደ' : 'e.g. Almaz Kebede'}
                      className="flex-1 px-3 py-2 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Ethiopian Mobile Phone Number */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {isAm ? 'የስልክ ቁጥር (ቴሌብር / ኢትዮ ቴሌኮም)' : 'Ethiopian Mobile Number (Telebirr / Ethio)'}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 border-r border-neutral-200 text-neutral-800 font-bold text-xs shrink-0 select-none">
                      <span className="text-base leading-none">🇪🇹</span>
                      <span>+251</span>
                    </div>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="92 456 7890"
                      className="flex-1 px-3 py-2 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                {/* Primary Station / City Dropdown */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {isAm ? 'መነሻ / የመኖሪያ ከተማ' : 'Home City / Base Station'}
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                    <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <select
                      value={signupCity}
                      onChange={(e) => setSignupCity(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs font-bold text-neutral-900 bg-white focus:outline-none cursor-pointer"
                    >
                      {ETHIOPIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.en}>
                          {isAm ? `${c.am} (${c.en})` : `${c.en} (${c.am})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fayda National Digital ID (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className={`text-xs font-bold ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {isAm ? 'የፋይዳ ዲጂታል መታወቂያ (አማራጭ)' : 'Fayda National Digital ID (Optional)'}
                    </label>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">
                      {isAm ? 'ፈጣን ማረጋገጫ' : 'Verified'}
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                    <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="text"
                      value={signupFayda}
                      onChange={(e) => setSignupFayda(e.target.value.toUpperCase())}
                      placeholder="FAYDA-920144"
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold text-neutral-900 uppercase placeholder:text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email Address (Optional) */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    {isAm ? 'ኢሜይል አድራሻ (ለትኬት ደረሰኝ - አማራጭ)' : 'Email (For Ticket Receipts - Optional)'}
                  </label>
                  <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                    <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="flex-1 px-3 py-2 text-xs font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Create 4-Digit Security PIN or Password */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 truncate ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {isAm ? 'ባለ 4-ድጂት PIN' : '4-Digit PIN'}
                      <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                      <input
                        type={signupShowPin ? 'text' : 'password'}
                        value={signupPin}
                        onChange={(e) => setSignupPin(e.target.value)}
                        placeholder="••••"
                        maxLength={8}
                        className="w-full px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 truncate ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {isAm ? 'PIN ያረጋግጡ' : 'Confirm PIN'}
                      <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                      <input
                        type={signupShowPin ? 'text' : 'password'}
                        value={signupConfirmPin}
                        onChange={(e) => setSignupConfirmPin(e.target.value)}
                        placeholder="••••"
                        maxLength={8}
                        className="w-full px-3 py-2 text-xs font-mono font-bold text-neutral-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Show/Hide PIN toggle & Terms */}
                <div className="space-y-2 pt-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSignupShowPin(!signupShowPin)}
                      className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      {signupShowPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{signupShowPin ? (isAm ? 'PIN ደብቅ' : 'Hide PIN') : (isAm ? 'PIN አሳይ' : 'Show PIN')}</span>
                    </button>
                    <span className="text-[10px] text-neutral-400">
                      {signupPin.length >= 4 ? '✓ PIN Ready' : '4+ digits'}
                    </span>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={signupAgreeTerms}
                      onChange={(e) => setSignupAgreeTerms(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                    />
                    <span
                      className={`text-[11px] leading-snug ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-600'
                      }`}
                    >
                      {isAm
                        ? 'የባስ ራይድ የትራንስፖርት ደንቦችንና የተሳፋሪ ጥበቃ መመሪያን ተስማምቻለሁ።'
                        : 'I agree to the Bus Ride transit safety policy and terms of service.'}
                    </span>
                  </label>
                </div>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isAm ? 'ይመዝገቡና የSMS ኮድ ይቀበሉ' : 'Register & Send SMS OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Sign Up SMS OTP Verification Step */
              <div className="space-y-3.5 animate-in fade-in py-2">
                <div className="text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
                    {isAm ? 'የአካውንት ማረጋገጫ' : 'Account Activation'}
                  </span>
                  <h4
                    className={`text-sm font-extrabold ${
                      isEmbeddedInPhoneMockup ? 'text-white' : 'text-neutral-900'
                    }`}
                  >
                    {isAm ? 'የስልክ ቁጥርዎን ያረጋግጡ' : 'Verify Your Phone Number'}
                  </h4>
                  <p
                    className={`text-xs mt-0.5 ${
                      isEmbeddedInPhoneMockup ? 'text-neutral-400' : 'text-neutral-600'
                    }`}
                  >
                    {isAm
                      ? `የ6 ድጂት ማረጋገጫ ኮድ ወደ +251 ${signupPhone} ተልኳል`
                      : `A 6-digit verification code was sent to +251 ${signupPhone}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSignupOtpStep(false)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline mt-1 cursor-pointer"
                  >
                    {isAm ? 'ስልክ ቁጥር ወይም መረጃ ቀይር' : 'Edit Phone or Details'}
                  </button>
                </div>

                {/* 6-Digit OTP Boxes */}
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {signupOtpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (signupOtpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleSignupOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleSignupOtpKeyDown(index, e)}
                      className={`w-10 h-11 sm:w-11 sm:h-12 rounded-xl text-center font-mono font-black text-lg border-2 transition focus:outline-none focus:scale-105 ${
                        digit
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                          : isEmbeddedInPhoneMockup
                          ? 'border-neutral-700 bg-neutral-900 text-white'
                          : 'border-neutral-200 bg-white text-neutral-900'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend countdown */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-neutral-500">
                    {signupCountdown > 0 ? (
                      <span>
                        {isAm ? `እንደገና ለመላክ` : `Resend code in`}{' '}
                        <strong className="font-mono text-emerald-700">{signupCountdown}s</strong>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold">
                        {isAm ? 'ኮድ አልደረስዎትም?' : 'Didn’t get code?'}
                      </span>
                    )}
                  </span>

                  {signupCountdown === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setSignupCountdown(60);
                        setSignupOtpDigits(['9', '4', '8', '1', '2', '0']);
                      }}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{isAm ? 'እንደገና ላክ' : 'Resend OTP'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifySignupOtp}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isAm ? 'አረጋግጥና አካውንት ፍጠር' : 'Verify & Create Account'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Switch to Login link */}
            <div className="text-center pt-1 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                {isAm ? 'ቀድሞውኑ አካውንት አለዎት?' : 'Already registered?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setScreenMode('login');
                    setIsSignupOtpStep(false);
                  }}
                  className="font-black text-emerald-700 hover:underline cursor-pointer"
                >
                  {isAm ? 'ወደ መግቢያ ይሂዱ' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* B. LOG IN VIEW */}
        {/* ============================================================ */}
        {!successUser && screenMode === 'login' && (
          <div className="space-y-4 animate-in fade-in">
            {/* 3-Role Mobile Segmented Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5 px-0.5">
                <span className={isEmbeddedInPhoneMockup ? 'text-neutral-400' : 'text-neutral-600'}>
                  {isAm ? 'የመግቢያ ሚና' : 'Sign In As'}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${accent.badge}`}
                >
                  {selectedRole === 'passenger'
                    ? isAm ? 'ተሳፋሪ' : 'Passenger'
                    : selectedRole === 'driver'
                    ? isAm ? 'አሽከርካሪ' : 'Bus Driver'
                    : isAm ? 'የጣቢያ ኃላፊ' : 'Station Dispatch'}
                </span>
              </div>

              <div
                className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                  isEmbeddedInPhoneMockup
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-neutral-100 border-neutral-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleRoleChange('passenger')}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'passenger'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                      : isEmbeddedInPhoneMockup
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{isAm ? 'ተጓዥ' : 'Passenger'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('driver')}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'driver'
                      ? 'bg-white text-amber-900 shadow-sm border border-amber-300'
                      : isEmbeddedInPhoneMockup
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5 text-amber-600" />
                  <span className="truncate">{isAm ? 'ሹፌር' : 'Driver'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-white text-rose-900 shadow-sm border border-rose-300'
                      : isEmbeddedInPhoneMockup
                      ? 'text-neutral-400 hover:text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="truncate">{isAm ? 'መናኸሪያ' : 'Dispatch'}</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Autofill Pills (Instant Test Buttons) */}
            <div
              className={`p-2.5 rounded-xl border ${
                isEmbeddedInPhoneMockup
                  ? 'bg-neutral-900/90 border-neutral-800'
                  : 'bg-emerald-50/70 border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isEmbeddedInPhoneMockup ? 'text-amber-400' : 'text-emerald-900'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {isAm ? 'የሙከራ አካውንቶች (Demo Presets)' : 'One-Tap Test Accounts'}
                </span>
                <span className="text-[9px] text-neutral-500">
                  {isAm ? 'ለመሞከር አንዱን ይንኩ' : 'Tap to test instantly'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {MOCK_USERS.slice(0, 3).map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => handleSelectPreset(user)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer active:scale-95 ${
                      selectedRole === user.role
                        ? 'bg-white text-emerald-900 border-emerald-400 shadow-xs ring-1 ring-emerald-400/40'
                        : isEmbeddedInPhoneMockup
                        ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600'
                        : 'bg-white/80 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span>{user.avatarBadge}</span>
                    <span className="truncate max-w-[85px]">{isAm ? user.fullNameAm : user.fullName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Authentication Methods Selector Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200 pb-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setAuthMethod('phone_otp');
                  setIsOtpStep(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                  authMethod === 'phone_otp'
                    ? 'border-emerald-600 text-emerald-700'
                    : isEmbeddedInPhoneMockup
                    ? 'border-transparent text-neutral-400 hover:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isAm ? 'በስልክ (OTP)' : 'Phone OTP'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setAuthMethod('phone_pin');
                  setIsOtpStep(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                  authMethod === 'phone_pin'
                    ? 'border-emerald-600 text-emerald-700'
                    : isEmbeddedInPhoneMockup
                    ? 'border-transparent text-neutral-400 hover:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAm ? 'በPIN/ፓስወርድ' : 'PIN / Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setAuthMethod('fayda');
                  setIsOtpStep(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                  authMethod === 'fayda'
                    ? 'border-emerald-600 text-emerald-700'
                    : isEmbeddedInPhoneMockup
                    ? 'border-transparent text-neutral-400 hover:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAm ? 'ፋይዳ ID' : 'Fayda ID'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setAuthMethod('biometric');
                  setIsOtpStep(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
                  authMethod === 'biometric'
                    ? 'border-emerald-600 text-emerald-700'
                    : isEmbeddedInPhoneMockup
                    ? 'border-transparent text-neutral-400 hover:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{isAm ? 'አሻራ' : 'Biometric'}</span>
              </button>
            </div>

            {/* Login Forms by Method */}
            <div>
              {/* 1. Phone + SMS OTP Mode */}
              {authMethod === 'phone_otp' && (
                <div>
                  {!isOtpStep ? (
                    <form onSubmit={handleLoginFormSubmit} className="space-y-3.5">
                      <div>
                        <label
                          className={`block text-xs font-bold mb-1.5 ${
                            isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                          }`}
                        >
                          {isAm ? 'የስልክ ቁጥር (ቴሌብር / ኢትዮ ቴሌኮም)' : 'Ethiopian Mobile Number (Telebirr / Ethio)'}
                        </label>
                        <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 bg-white">
                          <div className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 border-r border-neutral-200 text-neutral-800 font-bold text-xs shrink-0 select-none">
                            <span className="text-base leading-none">🇪🇹</span>
                            <span>+251</span>
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="91 123 4567"
                            className="flex-1 px-3 py-2.5 text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                            maxLength={10}
                          />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          {isAm ? 'የ6 ድጂት ማረጋገጫ ኮድ በSMS ይላክልዎታል' : 'A 6-digit verification code will be sent via SMS'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer ${
                          selectedRole === 'driver'
                            ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                            : selectedRole === 'admin'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>{isAm ? 'የማረጋገጫ ኮድ ላክ' : 'Send Verification OTP'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Entry Sub-Step */
                    <div className="space-y-3.5 animate-in fade-in">
                      <div className="text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
                          SMS OTP
                        </span>
                        <p
                          className={`text-xs font-semibold ${
                            isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                          }`}
                        >
                          {isAm
                            ? `ኮዱ ወደ +251 ${phoneNumber} ተልኳል`
                            : `Code sent to +251 ${phoneNumber}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsOtpStep(false)}
                          className="text-[11px] font-bold text-emerald-600 hover:underline mt-0.5 cursor-pointer"
                        >
                          {isAm ? 'ስልክ ቁጥር ቀይር' : 'Change Phone Number'}
                        </button>
                      </div>

                      {/* 6-Digit OTP Inputs */}
                      <div className="flex justify-center gap-1.5 sm:gap-2">
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className={`w-10 h-11 sm:w-11 sm:h-12 rounded-xl text-center font-mono font-black text-lg border-2 transition focus:outline-none focus:scale-105 ${
                              digit
                                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950'
                                : isEmbeddedInPhoneMockup
                                ? 'border-neutral-700 bg-neutral-900 text-white'
                                : 'border-neutral-200 bg-white text-neutral-900'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Resend Countdown */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-neutral-500">
                          {countdown > 0 ? (
                            <span>
                              {isAm ? `እንደገና ለመላክ` : `Resend code in`}{' '}
                              <strong className="font-mono text-emerald-700">{countdown}s</strong>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold">
                              {isAm ? 'ኮድ አልደረስዎትም?' : 'Didn’t receive code?'}
                            </span>
                          )}
                        </span>

                        {countdown === 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic(10);
                              setCountdown(60);
                              setOtpDigits(['9', '4', '8', '1', '2', '0']);
                            }}
                            className="font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>{isAm ? 'እንደገና ላክ' : 'Resend OTP'}</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleLoginFormSubmit}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{isAm ? 'አረጋግጥና ግባ' : 'Verify & Log In'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Phone + PIN/Password Mode */}
              {authMethod === 'phone_pin' && (
                <form onSubmit={handleLoginFormSubmit} className="space-y-3">
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {selectedRole === 'passenger'
                        ? isAm ? 'ስልክ ቁጥር' : 'Phone Number'
                        : selectedRole === 'driver'
                        ? isAm ? 'የመንጃ ፍቃድ / ስልክ' : 'Driver License / Phone'
                        : isAm ? 'የሰራተኛ መታወቂያ' : 'Staff ID / Phone'}
                    </label>
                    <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                      <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+251 91 123 4567"
                        className="flex-1 px-3 py-2 text-sm font-bold text-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className={`text-xs font-bold ${
                          isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                        }`}
                      >
                        {isAm ? 'የይለፍ ቃል ወይም 4-ድጂት PIN' : 'Password or 4-Digit PIN'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setPinOrPassword('1234')}
                        className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        {isAm ? 'PIN ረሱ?' : 'Forgot PIN?'}
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-neutral-300 overflow-hidden shadow-2xs focus-within:border-emerald-600 bg-white">
                      <div className="p-2.5 bg-neutral-100 text-neutral-500 border-r border-neutral-200">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={pinOrPassword}
                        onChange={(e) => setPinOrPassword(e.target.value)}
                        placeholder="••••"
                        className="flex-1 px-3 py-2 text-sm font-mono font-bold text-neutral-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Biometric toggle */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className={isEmbeddedInPhoneMockup ? 'text-neutral-400' : 'text-neutral-600'}>
                        {isAm ? 'አስታውሰኝ (Remember me)' : 'Remember me'}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleBiometricAuth}
                      className="flex items-center gap-1 text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>{isAm ? 'ፈጣን አሻራ' : 'Quick Touch ID'}</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer mt-2 ${
                      selectedRole === 'driver'
                        ? 'bg-amber-500 hover:bg-amber-600 text-neutral-950'
                        : selectedRole === 'admin'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isAm ? 'ግባ' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 3. National Fayda Digital ID Mode */}
              {authMethod === 'fayda' && (
                <form onSubmit={handleLoginFormSubmit} className="space-y-3.5">
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                      isEmbeddedInPhoneMockup
                        ? 'bg-neutral-900 border-neutral-800'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5
                        className={`text-xs font-bold ${
                          isEmbeddedInPhoneMockup ? 'text-emerald-300' : 'text-emerald-950'
                        }`}
                      >
                        {isAm ? 'የኢትዮጵያ ዲጂታል ፋይዳ መታወቂያ' : 'Ethiopian National Fayda ID'}
                      </h5>
                      <p className="text-[10px] text-neutral-500">
                        {isAm
                          ? 'በፋይዳ ዲጂታል መለያዎ በ1-ጠቅታ ደህንነቱ በተጠበቀ ሁኔታ ይግቡ'
                          : 'Instant verified citizen login integrated with transit registry'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold mb-1.5 ${
                        isEmbeddedInPhoneMockup ? 'text-neutral-300' : 'text-neutral-700'
                      }`}
                    >
                      {isAm ? 'የፋይዳ ቁጥር (Fayda Number)' : 'Fayda ID Number'}
                    </label>
                    <input
                      type="text"
                      value={faydaId}
                      onChange={(e) => setFaydaId(e.target.value.toUpperCase())}
                      placeholder="FAYDA-882194"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono font-bold text-sm text-neutral-900 uppercase focus:border-emerald-600 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-2 transition shadow-md active:scale-98 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 text-amber-300" />
                        <span>{isAm ? 'በፋይዳ መታወቂያ ግባ' : 'Verify with Fayda'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 4. Interactive Biometric Fingerprint Mode */}
              {authMethod === 'biometric' && (
                <div className="py-4 text-center space-y-4">
                  <div className="relative inline-block mx-auto">
                    <div
                      className={`absolute -inset-4 rounded-full transition-all ${
                        isBiometricScanning
                          ? 'bg-emerald-500/30 animate-ping'
                          : 'bg-emerald-500/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleBiometricAuth}
                      disabled={isBiometricScanning}
                      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer border-4 ${
                        isBiometricScanning
                          ? 'bg-emerald-600 text-white border-amber-400 scale-105'
                          : isEmbeddedInPhoneMockup
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border-emerald-500/50'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-600'
                      }`}
                    >
                      <Fingerprint
                        className={`w-12 h-12 sm:w-14 sm:h-14 transition ${
                          isBiometricScanning ? 'animate-pulse text-white' : ''
                        }`}
                      />
                      {isBiometricScanning && (
                        <span className="absolute inset-x-2 top-1/2 h-0.5 bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-bounce" />
                      )}
                    </button>
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-extrabold ${
                        isEmbeddedInPhoneMockup ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      {isBiometricScanning
                        ? isAm ? 'የጣት አሻራ በመቃኘት ላይ...' : 'Scanning Biometrics...'
                        : isAm ? 'የጣት አሻራዎን ይንኩ' : 'Touch Fingerprint Sensor'}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-0.5 max-w-xs mx-auto">
                      {isAm
                        ? 'የተመዘገበውን የጣት አሻራ ወይም የፊት መለያ በመጠቀም ፈጣን መግቢያ'
                        : 'Authenticate with device hardware keystore or Face ID'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    disabled={isBiometricScanning}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition cursor-pointer"
                  >
                    {isAm ? 'አሻራውን አሁን ሞክር' : 'Simulate Fingerprint Scan'}
                  </button>
                </div>
              )}
            </div>

            {/* Switch to Sign Up link */}
            <div className="text-center pt-1 border-t border-neutral-200">
              <p className="text-xs text-neutral-500">
                {isAm ? 'አዲስ ተጠቃሚ ኖት?' : 'New to Bus Ride?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setScreenMode('signup');
                    setIsOtpStep(false);
                  }}
                  className="font-black text-emerald-700 hover:underline cursor-pointer"
                >
                  {isAm ? 'አካውንት ይፍጠሩ' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Emergency Help & Support Drawer */}
        {showHelpDrawer && (
          <div
            className={`p-3 rounded-xl border animate-in slide-in-from-bottom-2 ${
              isEmbeddedInPhoneMockup
                ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                : 'bg-amber-50/80 border-amber-200 text-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-amber-600" />
                {isAm ? 'የተጓዦች የእርዳታ መስመር (8811)' : 'Transit Support Hotline (8811)'}
              </span>
              <button
                type="button"
                onClick={() => setShowHelpDrawer(false)}
                className="text-[10px] text-neutral-500 hover:underline cursor-pointer"
              >
                {isAm ? 'ዝጋ' : 'Dismiss'}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              {isAm
                ? 'በመመዝገብ፣ በመግባት ወይም በSMS OTP ኮድ ችግር ካጋጠመዎት 8811 ነጻ መስመር ይደውሉ ወይም ወደ ቅርብ መናኸሪያ የትራንስፖርት ቢሮ ያመልክቱ።'
                : 'If you encounter any issues during sign-up or verification, call toll-free 8811 or visit the regional terminal dispatch office.'}
            </p>
          </div>
        )}
      </div>

      {/* Screen Bottom Dock / Security Badges */}
      <div
        className={`px-4 py-2.5 shrink-0 border-t ${
          isEmbeddedInPhoneMockup
            ? 'border-neutral-800 bg-neutral-950/90'
            : 'border-neutral-100 bg-neutral-50/80'
        }`}
      >
        <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Telebirr Certified</span>
          </span>
          <span>•</span>
          <span>ባስ ራይድ v3.4</span>
        </div>
      </div>
    </div>
  );
};

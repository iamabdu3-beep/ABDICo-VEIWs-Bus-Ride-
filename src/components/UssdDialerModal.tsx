import React, { useState, useEffect } from 'react';
import { BookingTicket, Language, RideTrip } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import {
  X,
  Phone,
  Delete,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  Sparkles,
  Luggage,
  ShieldCheck,
  Building2,
  Bus,
  RefreshCw,
  Hash,
  MessageSquare,
  MessageSquareText,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ArrowRightLeft,
  Calendar,
  Users,
} from 'lucide-react';
import { triggerHaptic, shareNative } from '../utils/haptics';

interface UssdDialerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  activeTicket?: BookingTicket | null;
  allTickets?: BookingTicket[];
  trips?: RideTrip[];
  initialCode?: string;
  initialTab?: 'dialer' | 'session' | 'sms_template';
}

export const UssdDialerModal: React.FC<UssdDialerModalProps> = ({
  isOpen,
  onClose,
  lang,
  activeTicket,
  allTickets = [],
  trips = [],
  initialCode,
  initialTab = 'dialer',
}) => {
  const isAm = lang === 'am';
  const defaultCode = initialCode || (activeTicket ? `*805*1*${activeTicket.ticketId.replace(/\D/g, '')}#` : '*805#');
  
  // Navigation mode: 'dialer' | 'session' | 'sms_template'
  const [activeTab, setActiveTab] = useState<'dialer' | 'session' | 'sms_template'>(initialTab);
  const [dialedCode, setDialedCode] = useState<string>(defaultCode);
  const [currentMenu, setCurrentMenu] = useState<
    | 'main'
    | 'check_ticket'
    | 'view_bay'
    | 'send_sms'
    | 'list_corridors'
    | 'track_luggage'
    | 'driver_info'
    | 'callcenter'
    | 'telebirr'
  >('main');
  const [sessionInput, setSessionInput] = useState<string>('');
  const [flashNotification, setFlashNotification] = useState<string | null>(null);

  // SMS Template Generator State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [smsOriginId, setSmsOriginId] = useState<string>(activeTicket?.fromStation.id || 'bahir-dar');
  const [smsDestId, setSmsDestId] = useState<string>(activeTicket?.toStation.id || 'gondar');
  const [smsDate, setSmsDate] = useState<string>(activeTicket?.departureDate || tomorrowStr);
  const [smsPassengerName, setSmsPassengerName] = useState<string>(activeTicket?.passengerName || 'Abebe Bikila');
  const [smsSeats, setSmsSeats] = useState<number>(activeTicket?.seatNumbers.length || 1);
  const [smsOperator, setSmsOperator] = useState<string>(activeTicket?.busCompany || 'SELAM');
  const [smsSyntaxLang, setSmsSyntaxLang] = useState<'en' | 'am'>('en');
  const [smsCopied, setSmsCopied] = useState<boolean>(false);

  // Sync initial code if modal opens or ticket changes
  useEffect(() => {
    if (isOpen) {
      if (initialCode) {
        setDialedCode(initialCode);
      } else if (activeTicket) {
        setDialedCode(`*805*1*${activeTicket.ticketId.replace(/\D/g, '')}#`);
      } else {
        setDialedCode('*805#');
      }
      setActiveTab(initialTab || 'dialer');
      setCurrentMenu('main');
      setSessionInput('');
      setFlashNotification(null);
      setSmsCopied(false);
    }
  }, [isOpen, initialCode, activeTicket, initialTab]);

  if (!isOpen) return null;

  const currentTicket = activeTicket || allTickets[0];

  const handleKeyPress = (char: string) => {
    triggerHaptic(10);
    setDialedCode((prev) => prev + char);
  };

  const handleBackspace = () => {
    triggerHaptic(8);
    setDialedCode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerHaptic(10);
    setDialedCode('');
  };

  const handleStartSession = (codeToDial?: string) => {
    triggerHaptic(15);
    const code = (codeToDial || dialedCode).trim();
    if (!code) return;

    setActiveTab('session');
    setFlashNotification(null);
    setSessionInput('');

    // Route directly to submenu if fast-code is dialed
    if (code.startsWith('*805*1') || code === '*805*1#') {
      setCurrentMenu('view_bay');
    } else if (code === '*805*2#') {
      setCurrentMenu('list_corridors');
    } else if (code === '*805*3#') {
      setCurrentMenu('track_luggage');
    } else if (code === '*127#' || code.startsWith('*127*')) {
      setCurrentMenu('telebirr');
    } else if (code === '*994#' || code === '994') {
      setCurrentMenu('callcenter');
    } else {
      setCurrentMenu('main');
    }
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = sessionInput.trim();
    if (!val) return;
    triggerHaptic(12);

    if (val === '0') {
      setCurrentMenu('main');
    } else if (currentMenu === 'main') {
      if (val === '1') setCurrentMenu('view_bay');
      else if (val === '2') {
        setCurrentMenu('send_sms');
        setFlashNotification(isAm ? 'ትኬት በነጻ SMS ተልኳል!' : 'Free SMS ticket dispatched!');
      } else if (val === '3') setCurrentMenu('list_corridors');
      else if (val === '4') setCurrentMenu('track_luggage');
      else if (val === '5') setCurrentMenu('driver_info');
      else if (val === '6') setCurrentMenu('callcenter');
      else if (val === '7') setCurrentMenu('telebirr');
      else if (val === '8') {
        // Direct option to open SMS booking template!
        setActiveTab('sms_template');
      } else if (val === '9' || val === '00') {
        setActiveTab('dialer');
      }
    } else {
      // Return to main on any sub-command or 0
      setCurrentMenu('main');
    }
    setSessionInput('');
  };

  // Helper to generate the exact SMS booking text payload
  const originStation = AMHARA_STATIONS.find((s) => s.id === smsOriginId) || AMHARA_STATIONS[0];
  const destStation = AMHARA_STATIONS.find((s) => s.id === smsDestId) || AMHARA_STATIONS[1];
  const cleanPassenger = smsPassengerName.trim().replace(/\s+/g, '_') || 'PASSENGER';
  const cleanOperator = smsOperator === 'ANY' ? '' : ` ${smsOperator.toUpperCase().replace(/\s+/g, '')}`;

  const generatedSmsText =
    smsSyntaxLang === 'am'
      ? `ቦታያዙ ${originStation.cityAm || originStation.city} ${destStation.cityAm || destStation.city} ${smsDate} ${cleanPassenger} ${smsSeats}${cleanOperator}`
      : `BOOK ${originStation.city.toUpperCase()} ${destStation.city.toUpperCase()} ${smsDate} ${cleanPassenger.toUpperCase()} ${smsSeats}${cleanOperator}`;

  const handleCopySms = () => {
    triggerHaptic(12);
    navigator.clipboard.writeText(generatedSmsText);
    setSmsCopied(true);
    setTimeout(() => setSmsCopied(false), 2200);
  };

  const handleShareSms = async () => {
    triggerHaptic(12);
    const shared = await shareNative({
      title: 'Bus Ride Amhara SMS Booking',
      text: generatedSmsText,
    });
    if (!shared) {
      handleCopySms();
    }
  };

  // Build universal SMS URL for Android/iOS
  const isIos = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const smsHref = `sms:8050${isIos ? '&' : '?'}body=${encodeURIComponent(generatedSmsText)}`;

  const handleSwapStations = () => {
    triggerHaptic(10);
    const temp = smsOriginId;
    setSmsOriginId(smsDestId);
    setSmsDestId(temp);
  };

  const keypadButtons = [
    { key: '1', sub: '.,' },
    { key: '2', sub: 'ABC' },
    { key: '3', sub: 'DEF' },
    { key: '4', sub: 'GHI' },
    { key: '5', sub: 'JKL' },
    { key: '6', sub: 'MNO' },
    { key: '7', sub: 'PQRS' },
    { key: '8', sub: 'TUV' },
    { key: '9', sub: 'WXYZ' },
    { key: '*', sub: '✻' },
    { key: '0', sub: '+' },
    { key: '#', sub: '⌗' },
  ];

  const presets = [
    { code: '*805#', labelEn: 'All Services', labelAm: 'ሁሉም አገልግሎቶች' },
    { code: '*805*1#', labelEn: 'Bay & Pass', labelAm: 'መጫኛ በርና ትኬት' },
    { code: '*805*2#', labelEn: 'Corridors', labelAm: 'የጉዞ መስመሮች' },
    { code: '*805*3#', labelEn: 'Luggage Tag', labelAm: 'ሻንጣ መከታተያ' },
    { code: '*127#', labelEn: 'Telebirr Pay', labelAm: 'ቴሌብር ክፍያ' },
    { code: '*994#', labelEn: 'Call Center', labelAm: 'ጥሪ ማዕከል' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ussd-dialer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic(8);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm sm:max-w-md bg-neutral-950 rounded-3xl shadow-2xl border border-neutral-700 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        {/* Phone Frame Header */}
        <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-amber-300 shadow-xs">
              {activeTab === 'sms_template' ? (
                <MessageSquareText className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 id="ussd-dialer-title" className="text-xs font-black tracking-wide text-white">
                {activeTab === 'sms_template'
                  ? (translations[lang].smsBookingTitle || (isAm ? 'የSMS ቦታ ማስያዣ መልዕክት' : 'Offline SMS Booking Template'))
                  : (translations[lang].modalUssdDialerTitle || (isAm ? 'የUSSD መደወያ ሰሌዳ' : 'Ethio Telecom • USSD Dialer'))}
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                {activeTab === 'session'
                  ? isAm
                    ? 'የUSSD ክፍለ-ጊዜ ነቅቷል'
                    : 'USSD Session Active'
                  : activeTab === 'sms_template'
                  ? (translations[lang].smsBookingGateway || (isAm ? 'የSMS መላኪያ፡ 8050' : 'Gateway: Shortcode 8050'))
                  : (translations[lang].modalUssdDialerSub || (isAm ? 'ከመስመር ውጭ ይሰራል' : 'Works Offline (2G/3G/4G)'))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Top Navigation Mode Pills */}
            <div className="flex items-center bg-neutral-800 p-0.5 rounded-xl border border-neutral-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveTab(activeTab === 'session' ? 'session' : 'dialer');
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  activeTab !== 'sms_template'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="USSD Keypad"
              >
                USSD
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveTab('sms_template');
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'sms_template'
                    ? 'bg-amber-400 text-neutral-950 font-black shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="SMS Booking Template"
              >
                <MessageSquare className="w-3 h-3" />
                <span>SMS</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onClose();
              }}
              aria-label="Close"
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. SMS BOOKING TEMPLATE GENERATOR VIEW */}
        {activeTab === 'sms_template' ? (
          <div className="p-4 flex flex-col justify-between space-y-3 bg-neutral-950 text-white animate-in fade-in duration-150">
            {/* Informational Intro Banner */}
            <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5">
              <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg shrink-0 mt-0.5">
                <MessageSquareText className="w-4 h-4" />
              </span>
              <div className="text-xs">
                <p className="font-bold text-amber-300 leading-tight">
                  {isAm ? 'ያለ ኢንተርኔት ወይም USSD በSMS ቦታ ይያዙ' : 'Offline SMS Text Booking Fallback'}
                </p>
                <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
                  {isAm
                    ? 'የUSSD ጥሪ በማይሰራበት ወይም ዳታ በሌለበት ጊዜ ይህን የተዘጋጀ መልዕክት ወደ 8050 በመላክ መቀመጫዎን ማረጋገጥ ይችላሉ።'
                    : 'Generate a pre-filled text message to reserve your seat via SMS gateway 8050 when USSD or mobile data is unavailable.'}
                </p>
              </div>
            </div>

            {/* Configurator Form */}
            <div className="space-y-2.5 bg-neutral-900/90 p-3 rounded-2xl border border-neutral-800 text-xs">
              {/* Origin & Destination Selectors */}
              <div className="grid grid-cols-2 gap-2 relative">
                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1">
                    {isAm ? 'መነሻ መናኸሪያ' : 'Origin Station'}
                  </label>
                  <select
                    value={smsOriginId}
                    onChange={(e) => setSmsOriginId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    {AMHARA_STATIONS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {isAm ? st.cityAm || st.city : st.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1">
                    {isAm ? 'መድረሻ መናኸሪያ' : 'Destination'}
                  </label>
                  <select
                    value={smsDestId}
                    onChange={(e) => setSmsDestId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    {AMHARA_STATIONS.map((st) => (
                      <option key={st.id} value={st.id}>
                        {isAm ? st.cityAm || st.city : st.city}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="absolute left-1/2 top-6 -translate-x-1/2 p-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-full border border-neutral-600 transition cursor-pointer shadow-xs"
                  title="Swap Stations"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </button>
              </div>

              {/* Travel Date & Seats */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{isAm ? 'የጉዞ ቀን' : 'Travel Date'}</span>
                  </label>
                  <input
                    type="date"
                    value={smsDate}
                    onChange={(e) => setSmsDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{isAm ? 'መቀመጫ ብዛት' : 'Seat(s)'}</span>
                  </label>
                  <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-xl border border-neutral-700">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          triggerHaptic(8);
                          setSmsSeats(num);
                        }}
                        className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                          smsSeats === num
                            ? 'bg-emerald-700 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Passenger Name & Operator Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1">
                    {isAm ? 'የተሳፋሪ ስም' : 'Passenger Name'}
                  </label>
                  <input
                    type="text"
                    value={smsPassengerName}
                    onChange={(e) => setSmsPassengerName(e.target.value)}
                    placeholder="Abebe Bikila"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase block mb-1">
                    {isAm ? 'አውቶቡስ ድርጅት' : 'Preferred Operator'}
                  </label>
                  <select
                    value={smsOperator}
                    onChange={(e) => setSmsOperator(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="ANY">{isAm ? 'ማንኛውም (Any)' : 'Any Available'}</option>
                    <option value="SELAM">Selam Bus</option>
                    <option value="ABAY">Abay Bus</option>
                    <option value="SKY">Sky Bus</option>
                    <option value="GOLDEN">Golden Bus</option>
                    <option value="WALYA">Walya Express</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generated SMS Text Preview Box */}
            <div className="bg-neutral-900 rounded-2xl p-3 border border-emerald-500/40 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                  <span>To: <strong>8050</strong></span>
                  <span className="text-neutral-500 font-normal">• {isAm ? 'የSMS መላኪያ አድራሻ' : 'Shortcode Gateway'}</span>
                </div>

                {/* Syntax Language Toggle */}
                <div className="flex items-center gap-1 bg-neutral-950 px-1 py-0.5 rounded-lg border border-neutral-800 text-[9px]">
                  <button
                    type="button"
                    onClick={() => setSmsSyntaxLang('en')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                      smsSyntaxLang === 'en' ? 'bg-emerald-700 text-white' : 'text-neutral-400'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsSyntaxLang('am')}
                    className={`px-1.5 py-0.5 rounded transition cursor-pointer font-bold ${
                      smsSyntaxLang === 'am' ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400'
                    }`}
                  >
                    አማ
                  </button>
                </div>
              </div>

              {/* Message Content Code Block */}
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-amber-300 font-mono text-xs font-bold break-all select-all flex items-center justify-between gap-2">
                <span>{generatedSmsText}</span>
              </div>
            </div>

            {/* Action Buttons: Open in Messages App & Copy */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySms}
                className="py-3 px-3 rounded-2xl bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 text-white font-bold text-xs border border-neutral-800 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
              >
                {smsCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">{isAm ? 'ተቀድቷል!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-neutral-400" />
                    <span>{isAm ? 'ጽሑፉን ቅዳ' : 'Copy SMS Text'}</span>
                  </>
                )}
              </button>

              <a
                href={smsHref}
                onClick={() => triggerHaptic(15)}
                className="py-3 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
              >
                <Send className="w-4 h-4 fill-neutral-950" />
                <span>{isAm ? 'በSMS መተግበሪያ ክፈት' : 'Open in Messages'}</span>
              </a>
            </div>

            {/* Quick Share and Switch to USSD */}
            <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
              <button
                type="button"
                onClick={handleShareSms}
                className="flex items-center gap-1 hover:text-white transition cursor-pointer text-[11px]"
              >
                <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>{isAm ? 'በስልክ መተግበሪያዎች አጋራ' : 'Share via Device'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveTab('dialer');
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] cursor-pointer"
              >
                {isAm ? 'ወደ USSD መደወያ ተመለስ ➔' : 'Back to USSD Keypad ➔'}
              </button>
            </div>
          </div>
        ) : activeTab === 'dialer' ? (
          /* 2. DIALER SCREEN */
          <div className="p-4 flex flex-col justify-between space-y-3 bg-neutral-950">
            {/* Quick Shortcode Presets */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center justify-between">
                <span>{isAm ? 'ፈጣን የUSSD ኮዶች፡' : 'Quick Shortcodes:'}</span>
                <span className="text-neutral-500 font-normal">Click to test</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setDialedCode(p.code);
                      handleStartSession(p.code);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-left transition cursor-pointer active:scale-95 group"
                  >
                    <span className="font-mono font-bold text-amber-300 text-xs block group-hover:text-amber-200">
                      {p.code}
                    </span>
                    <span className="text-[9px] text-neutral-400 block truncate">
                      {isAm ? p.labelAm : p.labelEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dialed Code Output Box */}
            <div className="bg-neutral-900/90 rounded-2xl p-3 border border-neutral-800 flex items-center justify-between gap-2 shadow-inner">
              <input
                type="text"
                value={dialedCode}
                onChange={(e) => setDialedCode(e.target.value)}
                placeholder="*805#"
                className="w-full bg-transparent font-mono font-black text-2xl text-emerald-400 text-center tracking-wider focus:outline-hidden"
              />
              {dialedCode && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Backspace"
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shrink-0"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Keypad Grid (1-9, *, 0, #) */}
            <div className="grid grid-cols-3 gap-2 px-1">
              {keypadButtons.map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => handleKeyPress(btn.key)}
                  className="py-3 px-2 rounded-2xl bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 text-white font-mono transition active:scale-95 cursor-pointer border border-neutral-800/80 shadow-xs flex flex-col items-center justify-center"
                >
                  <span className="text-xl font-bold leading-none">{btn.key}</span>
                  <span className="text-[9px] text-neutral-500 font-sans tracking-widest mt-0.5 uppercase">
                    {btn.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Offline SMS Booking Template Quick Launcher Banner */}
            <div className="bg-neutral-900/90 rounded-2xl p-2.5 border border-neutral-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg shrink-0">
                  <MessageSquareText className="w-3.5 h-3.5" />
                </span>
                <div className="text-left">
                  <span className="font-bold text-white text-xs block leading-tight">
                    {isAm ? 'በSMS ቦታ ማስያዣ (Fallback)' : 'SMS Text Booking Template'}
                  </span>
                  <span className="text-[10px] text-neutral-400 block leading-tight">
                    {isAm ? 'ያለ USSD ወይም ዳታ ወደ 8050 ላክ' : 'Book directly via SMS to 8050'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  setActiveTab('sms_template');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition cursor-pointer active:scale-95 shrink-0 shadow-xs"
              >
                {isAm ? 'አዘጋጅ' : 'Create'}
              </button>
            </div>

            {/* Bottom Actions: Clear & Call/Dial Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-semibold text-xs border border-neutral-800 transition cursor-pointer"
              >
                {isAm ? 'አጽዳ' : 'Clear'}
              </button>

              <button
                type="button"
                onClick={() => handleStartSession()}
                disabled={!dialedCode.trim()}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>{isAm ? 'USSD ይደውሉ (Dial)' : 'Dial USSD Code'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* 3. ACTIVE USSD INTERACTIVE SESSION SCREEN */
          <div className="p-4 bg-neutral-950 flex flex-col justify-between min-h-[380px] text-emerald-400 font-mono text-xs select-none space-y-3">
            <div>
              {/* Carrier Ribbon */}
              <div className="text-[10px] text-neutral-500 border-b border-neutral-800 pb-1.5 mb-2.5 flex items-center justify-between">
                <span className="font-bold text-neutral-400">Ethio Telecom • Bus Ride Amhara</span>
                <span className="text-amber-400">{dialedCode}</span>
              </div>

              {/* MENU 1: MAIN PORTAL */}
              {currentMenu === 'main' && (
                <div className="space-y-1.5 leading-relaxed">
                  <p className="text-white font-black text-sm">
                    {isAm ? 'የአማራ አውቶቡስ ትራንስፖርት USSD' : 'Amhara Regional Bus Transit'}
                  </p>
                  <p className="text-[11px] text-neutral-300">
                    {currentTicket
                      ? `${isAm ? 'ትኬት' : 'Pass'}: #${currentTicket.ticketId} (${currentTicket.fromStation.city} ➔ ${currentTicket.toStation.city})`
                      : isAm ? 'እንኳን ወደ ባስ ራይድ በደህና መጡ' : 'Welcome to Bus Ride Amhara'}
                  </p>

                  <div className="pt-2 border-t border-neutral-800 space-y-1 text-emerald-300 text-[11px]">
                    <p>1. {isAm ? 'የመጫኛ በር (Bay #) እና ሁኔታ' : 'Boarding Gate Bay # & Status'}</p>
                    <p>2. {isAm ? 'ትኬት በነጻ SMS ላክ' : 'Resend SMS Boarding Pass'}</p>
                    <p>3. {isAm ? 'የቀጠናው ታዋቂ የጉዞ መስመሮች' : 'Popular Corridors & Fares'}</p>
                    <p>4. {isAm ? 'የሻንጣ ጭነትና ኬላ መከታተያ' : 'Baggage Tag & Cargo Bay'}</p>
                    <p>5. {isAm ? 'የአውቶቡስ ሹፌር ስልክ መረጃ' : 'Bus Captain Phone & Plate'}</p>
                    <p>6. {isAm ? 'የ24/7 የትራንስፖርት ጥሪ ማዕከል (994)' : '24/7 Transit Helpline (994)'}</p>
                    <p>7. {isAm ? 'በቴሌብር ክፍያ አረጋግጥ (*127#)' : 'Telebirr Payment Check (*127#)'}</p>
                    <p className="text-amber-300 font-bold">8. {isAm ? 'የSMS ቦታ ማስያዣ ጽሑፍ (Offline SMS)' : 'Book via SMS Text Template'}</p>
                    <p className="text-neutral-500">9. {isAm ? 'ወደ መደወያ ሰሌዳ ተመለስ' : 'Exit to Keypad'}</p>
                  </div>
                </div>
              )}

              {/* MENU 2: VIEW BAY & TICKET STATUS */}
              {currentMenu === 'view_bay' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የመጫኛ በር እና ትኬት ዝርዝር፡' : '✓ Boarding Gate & Pass Details:'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px]">
                    <p className="text-amber-300 font-bold text-sm">
                      {isAm
                        ? `በር (BAY) #${currentTicket?.bayNumber || 4}`
                        : `PLATFORM BAY #${currentTicket?.bayNumber || 4}`}
                    </p>
                    <p className="text-neutral-200">
                      {isAm ? 'ተሳፋሪ' : 'Passenger'}: {currentTicket?.passengerName || 'Abebe Bikila'}
                    </p>
                    <p className="text-neutral-200">
                      {isAm ? 'መስመር' : 'Route'}: {currentTicket ? `${currentTicket.fromStation.city} ➔ ${currentTicket.toStation.city}` : 'Bahir Dar ➔ Gondar'}
                    </p>
                    <p className="text-neutral-200">
                      {isAm ? 'መነሻ ሰዓት' : 'Departure'}: {currentTicket?.departureTime || '06:30 AM'}
                    </p>
                    <p className="text-neutral-200">
                      {isAm ? 'መቀመጫ' : 'Seats'}: {currentTicket?.seatNumbers.join(', ') || '12, 13'}
                    </p>
                    <p className="text-emerald-400 font-semibold text-[10px] pt-1">
                      ✓ {isAm ? 'ሁኔታ፡ የተረጋገጠ (Confirmed)' : 'Status: Confirmed & Manifest Cleared'}
                    </p>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 3: SEND SMS */}
              {currentMenu === 'send_sms' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የSMS ትኬት ማረጋገጫ፡' : '✓ SMS Boarding Pass Dispatched:'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                    <p className="text-emerald-400 font-bold">
                      {isAm
                        ? `ወደ ስልክ ተልኳል፡ ${currentTicket?.passengerPhone || '+251 91 123 4567'}`
                        : `Sent to: ${currentTicket?.passengerPhone || '+251 91 123 4567'}`}
                    </p>
                    <p className="text-neutral-300">
                      {isAm
                        ? `ባስ ራይድ ትኬት #${currentTicket?.ticketId || 'ETH-AMH-784102'}። መነሻ፡ ${currentTicket?.departureTime || '06:30 AM'}፣ በር #${currentTicket?.bayNumber || 4}፣ መቀመጫ፡ ${currentTicket?.seatNumbers.join(', ') || '12, 13'}።`
                        : `Bus Ride Pass #${currentTicket?.ticketId || 'ETH-AMH-784102'}. Departs: ${currentTicket?.departureTime || '06:30 AM'}, Bay #${currentTicket?.bayNumber || 4}, Seats: ${currentTicket?.seatNumbers.join(', ') || '12, 13'}.`}
                    </p>
                    <p className="text-amber-300 text-[10px]">
                      {isAm ? 'የSMS ዋጋ፡ ነጻ (0.00 ETB)' : 'Service Cost: 0.00 ETB (Toll-Free)'}
                    </p>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 4: LIST CORRIDORS */}
              {currentMenu === 'list_corridors' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ ታዋቂ የክልል አውራ ጎዳናዎችና ዋጋዎች፡' : '✓ Popular Regional Corridors & Fares:'}
                  </p>
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                    <p className="text-amber-300 font-bold">1. Bahir Dar ⇄ Gondar: 320 ETB (06:30 AM)</p>
                    <p className="text-neutral-200">2. Dessie ⇄ Addis Ababa: 650 ETB (05:45 AM)</p>
                    <p className="text-neutral-200">3. Bahir Dar ⇄ Debre Markos: 410 ETB (07:00 AM)</p>
                    <p className="text-neutral-200">4. Woldiya ⇄ Lalibela: 290 ETB (08:00 AM)</p>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 5: TRACK LUGGAGE */}
              {currentMenu === 'track_luggage' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የተመዘገበ ሻንጣ መከታተያ፡' : '✓ Checked Baggage Status:'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px]">
                    <p className="text-emerald-300 font-bold">
                      {currentTicket?.luggagePieces || 2} {isAm ? 'የተመዘገቡ ሻንጣዎች' : 'Checked Bags Loaded'}
                    </p>
                    <p className="text-neutral-300">
                      {isAm ? 'የታግ ቁጥር' : 'Tag Ref'}: #{currentTicket?.ticketId || 'ETH-AMH-784102'}-BAG
                    </p>
                    <p className="text-neutral-300">
                      {isAm ? 'የጭነት ሳጥን' : 'Cargo Bay'}: Compartment B-02
                    </p>
                    <p className="text-emerald-400 text-[10px] pt-1">
                      ✓ {isAm ? 'የደህንነት ማህተም ተረጋግጧል' : 'Security Cleared & Loaded at Terminal'}
                    </p>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 6: DRIVER INFO */}
              {currentMenu === 'driver_info' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የአውቶቡስ ሹፌር መረጃ፡' : '✓ Bus Captain Contact:'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                    <p className="text-white font-bold text-xs">
                      {currentTicket?.driverName || 'Captain Fasil Demeke'}
                    </p>
                    <p className="text-amber-300 font-mono">
                      {currentTicket?.driverPhone || '+251 91 876 5432'}
                    </p>
                    <p className="text-neutral-400">
                      {currentTicket?.busCompany || 'Selam Bus'} • {currentTicket?.plateNumber || 'ET 03-A88219'}
                    </p>
                    <a
                      href={`tel:${currentTicket?.driverPhone || '+251918765432'}`}
                      className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1 rounded transition"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{isAm ? 'ወደ ሹፌሩ ይደውሉ' : 'Call Captain'}</span>
                    </a>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 7: CALL CENTER 994 */}
              {currentMenu === 'callcenter' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የ24/7 የትራንስፖርት ጥሪ ማዕከል፡' : '✓ 24/7 Transit Helpline:'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                    <p className="text-amber-300 font-bold text-sm">
                      {isAm ? 'ነጻ የስልክ መስመር፡ 994' : 'Toll-Free Hotline: 994'}
                    </p>
                    <p className="text-neutral-300">
                      {isAm ? 'ባሕር ዳር መቆጣጠሪያ፡ +251 58 220 0110' : 'Bahir Dar Dispatch: +251 58 220 0110'}
                    </p>
                    <p className="text-neutral-400 text-[10px]">
                      {isAm ? '24 ሰዓት ክፍት • አማርኛ፣ እንግሊዝኛ፣ አፋን ኦሮሞ' : '24/7 Service • Amharic, English, Afaan Oromoo'}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <a
                        href="tel:994"
                        className="text-[10px] font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{isAm ? '994 ይደውሉ' : 'Dial 994'}</span>
                      </a>
                    </div>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}

              {/* MENU 8: TELEBIRR PAY */}
              {currentMenu === 'telebirr' && (
                <div className="space-y-2">
                  <p className="text-white font-bold">
                    {isAm ? '✓ የቴሌብር ክፍያ ማረጋገጫ (*127#)፡' : '✓ Telebirr Quick Transit (*127#):'}
                  </p>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1 text-[11px]">
                    <p className="text-emerald-400 font-bold">Telebirr Merchant Code: 805942</p>
                    <p className="text-neutral-300">
                      {isAm
                        ? 'በቴሌብር መተግበሪያ ወይም በ *127# በቀጥታ መክፈል ይችላሉ።'
                        : 'Dial *127# to approve instant bus ticket debits.'}
                    </p>
                    <p className="text-amber-300 text-[10px]">Reference: TEL-94810234</p>
                  </div>
                  <p className="text-neutral-500 text-[10px]">0. {isAm ? 'ወደ ዋና ሜኑ' : 'Back to Main Menu'}</p>
                </div>
              )}
            </div>

            {/* Flash Notification Toast */}
            {flashNotification && (
              <div className="p-2 bg-emerald-950 text-emerald-300 rounded-lg border border-emerald-800 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{flashNotification}</span>
              </div>
            )}

            {/* Quick SMS Booking Launcher inside Session Screen */}
            <div className="bg-neutral-900/90 rounded-xl p-2 border border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-neutral-300">
                {isAm ? 'ያለ USSD በSMS ቦታ መያዝ ይፈልጋሉ?' : 'Need to book via text instead?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveTab('sms_template');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{isAm ? 'የSMS ጽሑፍ' : 'SMS Template'}</span>
              </button>
            </div>

            {/* USSD Reply / Response Form */}
            <form onSubmit={handleSessionSubmit} className="pt-2 border-t border-neutral-800 flex gap-2">
              <input
                type="text"
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value)}
                placeholder={isAm ? 'ምርጫ ያስገቡ (1-8, 0)...' : 'Reply (1-8, 0 back)...'}
                autoFocus
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <span>{isAm ? 'ላክ' : 'Send'}</span>
                <Send className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dialer')}
                className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl transition cursor-pointer"
                title="Back to Keypad"
              >
                <Hash className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Footer info strip */}
        <div className="bg-neutral-900 px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-500 flex items-center justify-between">
          <span>{isAm ? 'የአማራ ትራንስፖርት • ከመስመር ውጭ USSD & SMS' : 'Amhara Transit • Offline USSD & SMS'}</span>
          <span>{isAm ? 'ከክፍያ ነጻ (Free Gateway)' : 'Toll-Free Gateway'}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Bus,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  Phone,
  AlertTriangle,
  UserCheck,
  Send,
  Navigation,
  Gauge,
  Luggage,
  Sparkles,
  RefreshCw,
  MapPin,
  FileCheck2,
  Car,
  Award,
  Star,
  ThumbsUp,
  HeartHandshake,
  Trophy,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Share2,
  ChevronRight,
} from 'lucide-react';
import { Language, UserProfile, PassengerManifestItem, VehicleReadinessChecklist, RideTrip } from '../types';
import { INITIAL_DRIVER_MANIFEST, INITIAL_VEHICLE_CHECKLIST } from '../data/mockUsers';
import { triggerHaptic } from '../utils/haptics';

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  driver: UserProfile;
  activeTrip?: RideTrip | null;
  onLogout: () => void;
  initialSubTab?: 'manifest' | 'checklist' | 'telemetry' | 'badges';
}

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  lang,
  driver,
  activeTrip,
  onLogout,
  initialSubTab = 'manifest',
}) => {
  const [manifest, setManifest] = useState<PassengerManifestItem[]>(INITIAL_DRIVER_MANIFEST);
  const [checklist, setChecklist] = useState<VehicleReadinessChecklist>(INITIAL_VEHICLE_CHECKLIST);
  const [vehicleStatus, setVehicleStatus] = useState<'boarding' | 'departing' | 'en_route' | 'arrived'>('boarding');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [manualTicketInput, setManualTicketInput] = useState<string>('');
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [delayNotice, setDelayNotice] = useState<string>('');
  const [delaySubmitted, setDelaySubmitted] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'manifest' | 'checklist' | 'telemetry' | 'badges'>(
    initialSubTab || 'manifest'
  );

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab, isOpen]);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'top_rated' | 'safe_driver' | 'punctuality_pro'>('all');
  const [copiedCredentials, setCopiedCredentials] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAm = lang === 'am';

  const driverRating = driver.rating || 4.9;
  const driverSafety = driver.safetyScorePercent || 99.4;
  const driverTrips = driver.totalTripsCompleted || 420;
  const onTimeScore = 97.8;
  const reviewCount = 384;

  const handleCopyCredentials = () => {
    triggerHaptic(12);
    const credentials = `Amhara Regional Transport Authority - Verified Driver Credentials
Driver: ${driver.fullName} (${driver.fullNameAm || ''})
License: ${driver.driverLicenseNumber || 'CDL-DRIVER'}
Company: ${driver.companyName || 'Selam Bus Line SC'}
Vehicle Plate: ${driver.assignedPlateNumber || 'ET 03-A88219'}
Rating: ${driverRating} / 5.0 (${reviewCount} Passenger Reviews)
Safety Telemetry Score: ${driverSafety}% (0 Incidents)
On-Time Dispatch: ${onTimeScore}%
Verified Badges:
1. [Top Rated Driver] ${driverRating} ★ - Gold Tier Passenger Choice
2. [Safe Driver Master] ${driverSafety}% - Zero Highway Violations
3. [Punctuality Pro] ${onTimeScore}% - Prompt Gate Clearance
Authority Verification: Amhara Regional Transport & Road Safety Bureau`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(credentials);
    }
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const performanceBadges = [
    {
      id: 'top_rated' as const,
      titleEn: 'Top Rated Driver',
      titleAm: 'ምርጥ ደረጃ የተሰጠው አሽከርካሪ',
      badgeLevelEn: 'Gold Tier • Elite Passenger Choice',
      badgeLevelAm: 'ወርቅ ደረጃ • የተሳፋሪዎች ተመራጭ',
      icon: Trophy,
      colorGradient: 'from-amber-500 to-amber-600',
      badgeBg: 'bg-amber-50 border-amber-300 text-amber-900',
      badgeIconColor: 'text-amber-600',
      metricScore: `${driverRating} ★`,
      metricLabelEn: 'Overall Rating',
      metricLabelAm: 'አጠቃላይ ደረጃ',
      criteriaEn: 'Maintains rating above 4.8 / 5.0 with over 95% 5-star passenger reviews',
      criteriaAm: 'ከ 4.8 በላይ አማካይ ውጤት እና ከ 95% በላይ ባለ 5-ኮከብ የተሳፋሪዎች ደረጃ',
      status: 'active',
      passengersEndorsed: 372,
      tags: ['#1 in Tana Sector', 'Smooth Highway Curves', 'Polite & Respectful'],
      tagsAm: ['በጣና ቀጠና #1', 'ለስላሳ የተራራ አነዳድ', 'ትሁትና አክባሪ'],
    },
    {
      id: 'safe_driver' as const,
      titleEn: 'Safe Driver Master',
      titleAm: 'አስተማማኝና ጥንቃቄ ያለው አሽከርካሪ',
      badgeLevelEn: 'Authority Certified • 0 Incidents',
      badgeLevelAm: 'በባለስልጣኑ የተረጋገጠ • 0 አደጋ',
      icon: ShieldCheck,
      colorGradient: 'from-emerald-500 to-emerald-600',
      badgeBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      badgeIconColor: 'text-emerald-600',
      metricScore: `${driverSafety}%`,
      metricLabelEn: 'Safety & Compliance Score',
      metricLabelAm: 'የደህንነትና የፍጥነት ውጤት',
      criteriaEn: 'Strict speed limit compliance (<80 km/h) & zero road safety violations on mountain corridors',
      criteriaAm: 'የፍጥነት ገደብን ሙሉ በሙሉ ማክበርና በተራራማ መንገዶች ላይ ምንም የትራፊክ ጥሰት አለመመዝገብ',
      status: 'active',
      passengersEndorsed: 381,
      tags: ['Zero Sudden Braking', 'Simien Pass Certified', 'Pre-Trip Checklist Verified'],
      tagsAm: ['ድንገተኛ ፍሬን የሌለበት', 'በሰሜን ተራሮች የተመሰገነ', 'የቅድመ ጉዞ ፍተሻ ሙሉ'],
    },
    {
      id: 'punctuality_pro' as const,
      titleEn: 'Punctuality Pro',
      titleAm: 'ሰዓት አክባሪ ባለሙያ',
      badgeLevelEn: 'Diamond Standard • Schedule Master',
      badgeLevelAm: 'የሰዓት ቁጥጥር ባለሙያ • አንደኛ ደረጃ',
      icon: Clock,
      colorGradient: 'from-blue-500 to-blue-600',
      badgeBg: 'bg-blue-50 border-blue-300 text-blue-900',
      badgeIconColor: 'text-blue-600',
      metricScore: `${onTimeScore}%`,
      metricLabelEn: 'On-Time Terminal Dispatch',
      metricLabelAm: 'በሰዓቱ የመነሳት ምጣኔ',
      criteriaEn: 'Clears terminal bay within 5 minutes of scheduled departure time over 100+ trips',
      criteriaAm: 'ከመናኸሪያው መጫኛ በር ከተያዘለት ሰዓት በ5 ደቂቃ ውስጥ 100% መነሳት',
      status: 'active',
      passengersEndorsed: 366,
      tags: ['Prompt Gate Clearance', 'Accurate Corridor ETA', 'Fast Boarding Flow'],
      tagsAm: ['ፈጣን የበር ማጽደቅ', 'ትክክለኛ የመድረሻ ሰዓት', 'ቀልጣፋ መሳፈር'],
    },
  ];

  const passengerFeedbackList = [
    {
      id: 'fb-1',
      passengerName: 'Abebe Bikila',
      passengerNameAm: 'አበበ ቢቂላ',
      routeEn: 'Bahir Dar ➔ Gondar (Azezo)',
      routeAm: 'ባሕር ዳር ➔ ጎንደር (አዘዞ)',
      rating: 5,
      dateEn: 'Yesterday, 09:15 AM',
      dateAm: 'ትላንት፣ 09:15 AM',
      badgesEarned: ['top_rated', 'safe_driver'],
      commentEn:
        'Captain Kassahun is remarkably steady and calm. Even during rain near Lake Tana curves, the ride was silky smooth and relaxing.',
      commentAm:
        'ካፒቴን ካሳሁን በጣም የተረጋጋና አስተማማኝ አሽከርካሪ ነው። በጣና ሀይቅ አቅራቢያ ዝናብ በነበረበት ወቅት እንኳን ጉዞው እጅግ ምቹ ነበር።',
      highlightTag: 'Safe Driving in Rain',
      highlightTagAm: 'በዝናብ ወቅት ጥንቃቄ የተሞላበት',
    },
    {
      id: 'fb-2',
      passengerName: 'Hiwot Tadesse',
      passengerNameAm: 'ሕይወት ታደሰ',
      routeEn: 'Bahir Dar ➔ Dessie',
      routeAm: 'ባሕር ዳር ➔ ደሴ',
      rating: 5,
      dateEn: '3 days ago',
      dateAm: 'ከ 3 ቀናት በፊት',
      badgesEarned: ['punctuality_pro'],
      commentEn:
        'The bus departed the terminal bay at exactly 06:30 AM on the dot. Arrived in Dessie 10 minutes ahead of scheduled time!',
      commentAm:
        'አውቶቡሱ ከጣና መናኸሪያ በትክክል በ 06:30 AM ተነሳ። ደሴ ቦሩ መናኸሪያም ከተያዘለት ሰዓት ቀድሞ በሰላም ደርሷል!',
      highlightTag: 'Departed on the Dot',
      highlightTagAm: 'በትክክለኛው ሰዓት የተነሳ',
    },
    {
      id: 'fb-3',
      passengerName: 'Mulugeta Assefa',
      passengerNameAm: 'ሙሉጌታ አሰፋ',
      routeEn: 'Debre Markos ➔ Bahir Dar',
      routeAm: 'ደብረ ማርቆስ ➔ ባሕር ዳር',
      rating: 5,
      dateEn: 'May 18, 2026',
      dateAm: 'ግንቦት 10 ቀን',
      badgesEarned: ['safe_driver', 'top_rated'],
      commentEn:
        'Checked all passenger safety belts and luggage locks before embarking onto the mountain highway. Exemplary service.',
      commentAm:
        'ወደ ተራራማው አውራ ጎዳና ከመግባቱ በፊት የሁሉንም ተሳፋሪዎች የደህንነት ቀበቶና ሻንጣ መቆለፉን አረጋግጧል። ምሳሌ የሚሆን አገልግሎት።',
      highlightTag: 'Safety & Belt Inspection',
      highlightTagAm: 'የደህንነት ቀበቶ ቁጥጥር',
    },
    {
      id: 'fb-4',
      passengerName: 'Almaz Workineh',
      passengerNameAm: 'አልማዝ ወርቅነህ',
      routeEn: 'Gondar ➔ Bahir Dar',
      routeAm: 'ጎንደር ➔ ባሕር ዳር',
      rating: 5,
      dateEn: 'May 12, 2026',
      dateAm: 'ሚያዝያ 28 ቀን',
      badgesEarned: ['top_rated', 'punctuality_pro'],
      commentEn:
        'Professional greeting, helped elderly travelers board safely, clean air conditioning throughout the ride.',
      commentAm:
        'በጣም ጨዋ አቀባበል፣ አረጋውያን ተሳፋሪዎችን በክብር አሳፍሯል፣ የአውቶቡሱ ውስጠኛ ክፍል እጅግ ንጹህ ነበር።',
      highlightTag: 'Hospitality & Cleanliness',
      highlightTagAm: 'ትህትናና ንጽሕና',
    },
  ];

  // Calculate passenger counts
  const totalPassengers = manifest.reduce((acc, p) => acc + p.seatNumbers.length, 0);
  const boardedPassengers = manifest
    .filter((p) => p.boarded)
    .reduce((acc, p) => acc + p.seatNumbers.length, 0);
  const boardedPercent = Math.round((boardedPassengers / Math.max(1, totalPassengers)) * 100);

  // Toggle passenger boarding
  const handleToggleBoarding = (ticketId: string) => {
    triggerHaptic(12);
    setManifest((prev) =>
      prev.map((item) => {
        if (item.ticketId === ticketId) {
          const newStatus = !item.boarded;
          return {
            ...item,
            boarded: newStatus,
            boardedAt: newStatus ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return item;
      })
    );
  };

  // Quick QR Scan ticket validation
  const handleScanTicket = (ticketCode?: string) => {
    const codeToVerify = (ticketCode || manualTicketInput || 'ETH-AMH-784108').trim();
    triggerHaptic(15);

    const found = manifest.find((p) => p.ticketId.toLowerCase() === codeToVerify.toLowerCase());

    if (found) {
      if (found.boarded) {
        setScanSuccessMessage(
          isAm
            ? `⚠️ ተሳፋሪ ${found.passengerName} አስቀድመው ተሳፍረዋል!`
            : `⚠️ Passenger ${found.passengerName} is already checked in!`
        );
      } else {
        handleToggleBoarding(found.ticketId);
        setScanSuccessMessage(
          isAm
            ? `✅ ትኬት ${found.ticketId} ተረጋግጧል! ተሳፋሪ: ${found.passengerName} (ወንበር ${found.seatNumbers.join(', ')})`
            : `✅ Ticket ${found.ticketId} verified! Passenger: ${found.passengerName} (Seat ${found.seatNumbers.join(', ')})`
        );
      }
    } else {
      setScanSuccessMessage(
        isAm
          ? `❌ ትኬት "${codeToVerify}" በዚህ አውቶቡስ ዝርዝር ውስጥ አልተገኘም!`
          : `❌ Ticket "${codeToVerify}" not found on this trip manifest!`
      );
    }

    setManualTicketInput('');
    setTimeout(() => setScanSuccessMessage(null), 4000);
  };

  // Toggle vehicle checklist items
  const handleToggleChecklist = (key: keyof VehicleReadinessChecklist) => {
    triggerHaptic(10);
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  const handleReportDelay = () => {
    if (!delayNotice.trim()) return;
    triggerHaptic(15);
    setDelaySubmitted(true);
    setTimeout(() => {
      setDelayNotice('');
      setDelaySubmitted(false);
    }, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden my-auto transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Driver Console Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Bus className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  {isAm ? driver.fullNameAm : driver.fullName}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900 text-amber-200 border border-amber-600">
                  {driver.driverLicenseNumber || 'CDL-DRIVER'}
                </span>
              </div>
              <p className="text-xs text-amber-200">
                {driver.companyName} • {isAm ? driver.terminalBaseAm : driver.terminalBase} • Plate:{' '}
                <strong className="text-white font-mono">{driver.assignedPlateNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                onLogout();
                onClose();
              }}
              className="text-xs font-bold text-amber-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {isAm ? 'ውጣ' : 'Logout'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Trip Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-bold text-amber-950 block">
                {isAm ? 'የቀጥታ ጉዞ፡ ባሕር ዳር (ጣና መናኸሪያ) ➔ ጎንደር (አዘዞ)' : 'Active Run: Bahir Dar (Bay #4) ➔ Gondar (Azezo Terminal)'}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                {isAm ? 'የመነሻ ሰዓት፡ 06:30 AM • ርቀት፡ 175 ኪ.ሜ • መስመር 3 (A3)' : 'Scheduled Departure: 06:30 AM • Distance: 175 km • Route 3 (A3)'}
              </span>
            </div>
          </div>

          {/* Vehicle Departure State Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-300 text-xs">
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('boarding');
                setCurrentSpeed(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'boarding'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'መጫኛ በር (Boarding)' : 'At Bay (Boarding)'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('departing');
                setCurrentSpeed(15);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'departing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'መነሳት (Departed)' : 'Gate Clearance'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('en_route');
                setCurrentSpeed(78);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'en_route'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'በጉዞ ላይ (En Route)' : 'En Route (Highway)'}
            </button>
          </div>
        </div>

        {/* Driver Performance Badges Quick Bar */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border-b border-amber-200/80 px-4 sm:px-6 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAm ? 'የሹፌሩ ደረጃዎች፡' : 'Driver Badges:'}</span>
            </span>

            {/* Top Rated Pill */}
            <button
              onClick={() => {
                triggerHaptic(8);
                setActiveSubTab('badges');
                setBadgeFilter('top_rated');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer shadow-2xs"
            >
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>{isAm ? 'ምርጥ ደረጃ (Top Rated)' : 'Top Rated'}</span>
              <span className="bg-amber-200 text-amber-950 px-1 py-0.2 rounded font-mono text-[10px]">
                {driverRating} ★
              </span>
            </button>

            {/* Safe Driver Pill */}
            <button
              onClick={() => {
                triggerHaptic(8);
                setActiveSubTab('badges');
                setBadgeFilter('safe_driver');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>{isAm ? 'አስተማማኝ (Safe Driver)' : 'Safe Driver'}</span>
              <span className="bg-emerald-200 text-emerald-950 px-1 py-0.2 rounded font-mono text-[10px]">
                {driverSafety}%
              </span>
            </button>

            {/* Punctuality Pro Pill */}
            <button
              onClick={() => {
                triggerHaptic(8);
                setActiveSubTab('badges');
                setBadgeFilter('punctuality_pro');
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200 transition cursor-pointer shadow-2xs"
            >
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{isAm ? 'ሰዓት አክባሪ (Punctuality Pro)' : 'Punctuality Pro'}</span>
              <span className="bg-blue-200 text-blue-950 px-1 py-0.2 rounded font-mono text-[10px]">
                {onTimeScore}%
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('badges');
              setBadgeFilter('all');
            }}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{isAm ? 'ሁሉንም ሜዳሊያዎች ይመልከቱ' : 'View Verified Badges & Feedback'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-Tabs: Manifest | Inspection Checklist | En Route Telemetry | Performance Badges */}
        <div className="flex border-b border-neutral-200 bg-neutral-100 px-4 sm:px-6 shrink-0 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('manifest');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeSubTab === 'manifest'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>{isAm ? 'የተሳፋሪዎች ዝርዝር (Manifest)' : 'Passenger Manifest'}</span>
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {boardedPassengers}/{totalPassengers}
            </span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('checklist');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeSubTab === 'checklist'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>{isAm ? 'የተሸከርካሪ ደህንነት ፍተሻ' : 'Vehicle Safety Checklist'}</span>
            {allChecksPassed ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('telemetry');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeSubTab === 'telemetry'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>{isAm ? 'የፍጥነትና መንገድ ሁኔታ' : 'Route & Road Telemetry'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('badges');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer shrink-0 ${
              activeSubTab === 'badges'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>{isAm ? 'የአፈጻጸም ሜዳሊያዎች' : 'Performance Badges'}</span>
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              3 Active
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: PASSENGER MANIFEST & QR VERIFICATION */}
          {activeSubTab === 'manifest' && (
            <div className="space-y-4">
              {/* Boarding stats card & Quick QR Validator */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-700">
                      {isAm ? 'የተሳፋሪዎች መሳፈር ሁኔታ' : 'Boarding Readiness Progress'}
                    </span>
                    <span className="text-xs font-bold text-amber-900">{boardedPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${boardedPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {boardedPassengers} {isAm ? 'ተሳፍረዋል' : 'Boarded'} • {totalPassengers - boardedPassengers}{' '}
                    {isAm ? 'ይቀራሉ' : 'Pending at Bay'}
                  </p>
                </div>

                {/* Quick QR Ticket Scanner Input */}
                <div className="md:col-span-7 flex items-center gap-2">
                  <div className="relative flex-1">
                    <QrCode className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={manualTicketInput}
                      onChange={(e) => setManualTicketInput(e.target.value)}
                      placeholder={isAm ? 'ትኬት ቁጥር ወይም QR ይቃኙ (e.g. ETH-AMH-784108)' : 'Scan ticket or type ID (e.g. ETH-AMH-784108)'}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleScanTicket()}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ትኬት ፈትሽ' : 'Verify QR'}</span>
                  </button>
                  <button
                    onClick={() => handleScanTicket('ETH-AMH-784108')}
                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold px-2.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                    title={isAm ? 'የሙከራ ትኬት መቃኛ' : 'Demo Scan Next'}
                  >
                    {isAm ? 'ቀጣይ' : 'Demo'}
                  </button>
                </div>
              </div>

              {scanSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 animate-in fade-in flex items-center justify-between">
                  <span>{scanSuccessMessage}</span>
                  <button onClick={() => setScanSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Manifest Passenger Table */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>{isAm ? 'የተሳፋሪዎች ስም ዝርዝር' : 'Passenger Manifest (Bay #4 Coach)'}</span>
                  <span className="text-neutral-500">{manifest.length} Registered Bookings</span>
                </div>

                <div className="divide-y divide-neutral-200 text-xs">
                  {manifest.map((passenger) => (
                    <div
                      key={passenger.ticketId}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        passenger.boarded ? 'bg-emerald-50/40' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleBoarding(passenger.ticketId)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5 ${
                            passenger.boarded
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-neutral-400 text-transparent hover:border-emerald-600'
                          }`}
                          title={isAm ? 'የቦርዲንግ ሁኔታ ይቀይሩ' : 'Toggle boarded status'}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">{passenger.passengerName}</span>
                            <span className="font-mono text-[10px] text-neutral-500">#{passenger.ticketId}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                              Seat {passenger.seatNumbers.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{passenger.passengerPhone}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Luggage className="w-3 h-3 text-neutral-400" />
                              <span>{passenger.luggageCount} Bags</span>
                            </span>
                            <span className="font-mono text-neutral-400">ID: {passenger.nationalIdOrPassport}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {passenger.boarded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isAm ? 'ተሳፍረዋል' : 'Boarded'} ({passenger.boardedAt || '06:15 AM'})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleBoarding(passenger.ticketId)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                          >
                            {isAm ? 'አሳፍር (Check In)' : 'Check In'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-TRIP VEHICLE READINESS INSPECTION */}
          {activeSubTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-900 text-sm">
                    {isAm ? 'የአማራ ትራንስፖርት ባለስልጣን የቅድመ-ጉዞ ደህንነት ፍተሻ' : 'Regional Transport Authority Pre-Trip Inspection'}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      allChecksPassed
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {allChecksPassed
                      ? isAm ? 'ለመነሳት ዝግጁ ✅' : 'Road Ready ✅'
                      : isAm ? 'ያልተጠናቀቀ ፍተሻ ⚠️' : 'Incomplete ⚠️'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {isAm
                    ? 'አውቶቡሱ ከመናኸሪያው መጫኛ በር ከመውጣቱ በፊት በሹፌሩ እና በመናኸሪያው ተቆጣጣሪ መረጋገጥ አለበት።'
                    : 'Must be verified by operator and terminal gate supervisor before dispatching onto highway corridors.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'tiresInspection' as const,
                    titleEn: 'Tire Pressure & Tread Depth',
                    titleAm: 'የጎማ አየር ግፊትና የጥርስ ጥልቀት',
                    descEn: 'All 6 coach tires inspected for mountain highway safety.',
                  },
                  {
                    key: 'brakesAndFluid' as const,
                    titleEn: 'Air Brakes & Brake Fluid',
                    titleAm: 'የፍሬን አየርና ፈሳሽ ደረጃ',
                    descEn: 'Dual-circuit air pressure tested above 8.5 bar.',
                  },
                  {
                    key: 'engineAndCoolant' as const,
                    titleEn: 'Engine Oil & Radiator Coolant',
                    titleAm: 'የሞተር ዘይትና ራዲያተር ውሃ',
                    descEn: 'Checked for steep grades on Lake Tana / Simien passes.',
                  },
                  {
                    key: 'emergencyKitAndExtinguisher' as const,
                    titleEn: 'First Aid Kit & Fire Extinguisher',
                    titleAm: 'የመጀመሪያ እርዳታ ሳጥንና የእሳት ማጥፊያ',
                    descEn: 'Certified ABC powder canister and trauma medical pack.',
                  },
                  {
                    key: 'gpsTransponderOnline' as const,
                    titleEn: 'GPS Telemetry Transponder',
                    titleAm: 'የጂፒኤስ ራዳር ትራንስፖንደር',
                    descEn: 'Broadcasting live speed and coordinates to Regional Dispatch.',
                  },
                  {
                    key: 'terminalSecurityPermitSigned' as const,
                    titleEn: 'Terminal Gate Dispatch Permit',
                    titleAm: 'የመናኸሪያው የደህንነት መውጫ ፍቃድ',
                    descEn: 'Signed manifest stamped by Bahir Dar Station Master.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleToggleChecklist(item.key)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      checklist[item.key]
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                        checklist[item.key] ? 'bg-emerald-600 text-white' : 'border border-neutral-400 bg-white'
                      }`}
                    >
                      {checklist[item.key] && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{isAm ? item.titleAm : item.titleEn}</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE & ROAD TELEMETRY / DELAY REPORTING */}
          {activeSubTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Telemetry Gauge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'የአሁኑ ፍጥነት' : 'Current Speed'}
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                    {currentSpeed} <span className="text-xs font-normal text-slate-300">km/h</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Limit: 80 km/h (A3)</span>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'ቀጣይ ጣቢያ' : 'Next Milestone'}
                  </span>
                  <span className="text-sm font-bold text-white mt-1.5 block">Wereta Junction (ወረታ)</span>
                  <span className="text-[10px] text-emerald-400">ETA 07:15 AM (55 km)</span>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'የመንገድ ሁኔታ' : 'Corridor Condition'}
                  </span>
                  <span className="text-sm font-bold text-white mt-1.5 block">Smooth &amp; Dry</span>
                  <span className="text-[10px] text-slate-400">Elevation: 1,820m</span>
                </div>
              </div>

              {/* Report Delay to Station Dispatch */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{isAm ? 'ለመናኸሪያው የቁጥጥር ማዕከል ማሳወቂያ ይላኩ' : 'Report Delay or Road Advisory to Dispatch'}</span>
                </h3>
                <p className="text-xs text-neutral-600 mb-3">
                  {isAm
                    ? 'የመንገድ መዘጋት፣ ጭጋግ ወይም የተሸከርካሪ መዘግየት ሲያጋጥም ወዲያውኑ ለተሳፋሪዎችና ለጣቢያ አስተዳደር ይላካል።'
                    : 'Notifies terminal station masters and sends live push notifications to waiting passengers.'}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={delayNotice}
                    onChange={(e) => setDelayNotice(e.target.value)}
                    placeholder={
                      isAm
                        ? 'e.g. በወረታ አቅራቢያ የ15 ደቂቃ የመንገድ ጥገና መዘግየት አለ...'
                        : 'e.g. Expecting 15 min slowdown near Wereta due to roadworks...'
                    }
                    className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={handleReportDelay}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAm ? 'አሳውቅ' : 'Transmit'}</span>
                  </button>
                </div>

                {delaySubmitted && (
                  <p className="text-xs text-emerald-800 font-bold mt-2 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isAm ? 'ማሳሰቢያው ለጣቢያ አስተዳደር ተልኳል!' : 'Advisory successfully transmitted to Regional Dispatch!'}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PERFORMANCE BADGES & PASSENGER COMMENDATIONS */}
          {activeSubTab === 'badges' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Driver Performance Hero Card */}
              <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-200">
                        {driver.avatarBadge || 'KW'}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-slate-900"
                        title="Verified Authority Operator"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-white">
                          {isAm ? driver.fullNameAm : driver.fullName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-slate-950" />
                          <span>{isAm ? 'ወርቅ ደረጃ አሽከርካሪ' : 'Gold Tier Operator'}</span>
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/90 mt-0.5">
                        {driver.companyName} • {isAm ? driver.terminalBaseAm : driver.terminalBase}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-300 font-medium flex-wrap">
                        <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{driverRating} / 5.0</span>
                        </span>
                        <span>•</span>
                        <span>{reviewCount} {isAm ? 'የተሳፋሪዎች አስተያየቶች' : 'Passenger Reviews'}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">98.6% {isAm ? 'አዎንታዊ' : 'Positive'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Copy Credentials */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      {copiedCredentials ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>{isAm ? 'ተቀድቷል!' : 'Credentials Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isAm ? 'የአፈጻጸም ማስረጃ ቅዳ' : 'Copy Credentials'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4 Core Vital Performance Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      {isAm ? 'የደህንነት ነጥብ' : 'Safety Score'}
                    </span>
                    <span className="text-lg font-black text-emerald-400 font-mono block mt-0.5">
                      {driverSafety}%
                    </span>
                    <span className="text-[10px] text-emerald-300/80">
                      {isAm ? '0 አደጋዎች (420 ጉዞዎች)' : '0 Incidents (420 Trips)'}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      {isAm ? 'በሰዓቱ መነሳት' : 'On-Time Dispatch'}
                    </span>
                    <span className="text-lg font-black text-blue-400 font-mono block mt-0.5">
                      {onTimeScore}%
                    </span>
                    <span className="text-[10px] text-blue-300/80">
                      {isAm ? 'የመጫኛ በር ቁጥጥር' : 'Within 5m Window'}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      {isAm ? 'የተጠናቀቁ ጉዞዎች' : 'Completed Trips'}
                    </span>
                    <span className="text-lg font-black text-amber-400 font-mono block mt-0.5">
                      {driverTrips}
                    </span>
                    <span className="text-[10px] text-amber-300/80">
                      {isAm ? 'በአማራ ክልል አውራ ጎዳናዎች' : 'Amhara Corridors'}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      {isAm ? 'የባለስልጣኑ ማረጋገጫ' : 'Authority Status'}
                    </span>
                    <span className="text-lg font-black text-white font-mono block mt-0.5">
                      {isAm ? 'ንቁ ✅' : 'ACTIVE ✅'}
                    </span>
                    <span className="text-[10px] text-emerald-300/80">
                      {isAm ? 'ወርሃዊ ቦነስ ብቁ' : 'Bonus Eligible'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Performance Badges Showcase */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>
                        {isAm
                          ? 'ንቁ የአፈጻጸም ሜዳሊያዎች (3 የተረጋገጡ)'
                          : 'Active Performance Badges (3 Verified)'}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {isAm
                        ? 'በተሳፋሪዎች አስተያየትና በአማራ ትራንስፖርት ባለስልጣን የቴሌሜትሪ መረጃ ላይ የተመሰረተ'
                        : 'Calculated dynamically from passenger booking reviews and Regional GPS telemetry'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hidden sm:inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAm ? 'ሁሉም መስፈርቶች ተሟልተዋል' : 'All Criteria Achieved'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {performanceBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs relative overflow-hidden flex flex-col justify-between ${badge.badgeBg}`}
                      >
                        <div className="absolute top-0 right-0 translate-x-2 -translate-y-2 opacity-10 pointer-events-none">
                          <Icon className="w-24 h-24" />
                        </div>

                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${badge.badgeIconColor}`} />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-neutral-800 border border-black/10 shadow-2xs">
                              {isAm ? badge.badgeLevelAm : badge.badgeLevelEn}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-neutral-900">
                            {isAm ? badge.titleAm : badge.titleEn}
                          </h4>
                          <div className="flex items-baseline gap-1.5 my-1">
                            <span className="text-xl font-black font-mono text-neutral-900">
                              {badge.metricScore}
                            </span>
                            <span className="text-[11px] text-neutral-600 font-medium">
                              {isAm ? badge.metricLabelAm : badge.metricLabelEn}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                            {isAm ? badge.criteriaAm : badge.criteriaEn}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-black/10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-1">
                            {isAm ? 'የተሳፋሪዎች ምስጋናዎች' : 'Passenger Commendations'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(isAm ? badge.tagsAm : badge.tags).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-white/80 text-neutral-800 rounded-md border border-black/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-2 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-600" />
                            <span>
                              {badge.passengersEndorsed}{' '}
                              {isAm
                                ? 'ተሳፋሪዎች በዚህ መስፈርት መርቀውታል'
                                : 'passengers endorsed this badge'}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Passenger Ratings Breakdown by Category */}
              <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>
                    {isAm
                      ? 'የተሳፋሪዎች ደረጃ አሰጣጥ በምድብ (384 ግምገማዎች)'
                      : 'Passenger Feedback Ratings by Dimension (384 Reviews)'}
                  </span>
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      labelEn: 'Punctuality & Gate Departure',
                      labelAm: 'በሰዓቱ መነሳትና መድረስ',
                      score: '4.9',
                      percent: 98,
                      color: 'bg-blue-600',
                    },
                    {
                      labelEn: 'Smooth & Safe Mountain Corridor Driving',
                      labelAm: 'የተረጋጋና ጥንቃቄ የተሞላበት የተራራ አነዳድ',
                      score: '5.0',
                      percent: 100,
                      color: 'bg-emerald-600',
                    },
                    {
                      labelEn: 'Cabin Cleanliness & Air Ventilation',
                      labelAm: 'የአውቶቡስ ንጽሕናና ምቾት',
                      score: '4.8',
                      percent: 96,
                      color: 'bg-amber-600',
                    },
                    {
                      labelEn: 'Luggage Care & Careful Bay Stowage',
                      labelAm: 'የሻንጣ አያያዝ ጥንቃቄና ደህንነት',
                      score: '5.0',
                      percent: 100,
                      color: 'bg-purple-600',
                    },
                    {
                      labelEn: 'Courtesy, Respect & Elderly Assistance',
                      labelAm: 'ጨዋነት፣ አክብሮትና የተሳፋሪዎች እርዳታ',
                      score: '4.9',
                      percent: 98,
                      color: 'bg-teal-600',
                    },
                  ].map((dim, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-800">
                          {isAm ? dim.labelAm : dim.labelEn}
                        </span>
                        <span className="font-mono font-bold text-neutral-900">
                          {dim.score} / 5.0 ({dim.percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${dim.color}`}
                          style={{ width: `${dim.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Passenger Commendations Feed */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-rose-500" />
                      <span>
                        {isAm
                          ? 'የተሳፋሪዎች የቅርብ ጊዜ ምስጋናዎች'
                          : 'Recent Verified Passenger Commendations'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      {isAm
                        ? 'ከኦንላይን ትኬት ቦታ ማስያዣ በኋላ በተሳፋሪዎች የተሰጡ አስተያየቶች'
                        : 'Feedback submitted after ticket completion on Amhara Regional Corridors'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { id: 'all' as const, labelEn: 'All Reviews', labelAm: 'ሁሉም' },
                      { id: 'top_rated' as const, labelEn: 'Top Rated', labelAm: 'ምርጥ ደረጃ' },
                      { id: 'safe_driver' as const, labelEn: 'Safe Driver', labelAm: 'አስተማማኝ' },
                      { id: 'punctuality_pro' as const, labelEn: 'Punctuality', labelAm: 'ሰዓት አክባሪ' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic(8);
                          setBadgeFilter(f.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          badgeFilter === f.id
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        {isAm ? f.labelAm : f.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback List */}
                <div className="space-y-2.5">
                  {passengerFeedbackList
                    .filter((fb) => badgeFilter === 'all' || fb.badgesEarned.includes(badgeFilter))
                    .map((fb) => (
                      <div
                        key={fb.id}
                        className="p-3 bg-white rounded-xl border border-neutral-200 shadow-2xs hover:border-amber-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                              {fb.passengerName[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-neutral-900">
                                  {isAm ? fb.passengerNameAm : fb.passengerName}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  {isAm ? fb.dateAm : fb.dateEn}
                                </span>
                              </div>
                              <span className="text-[11px] text-neutral-500 block">
                                {isAm ? fb.routeAm : fb.routeEn}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(fb.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-700 italic my-1.5 leading-relaxed bg-neutral-50 p-2 rounded-lg border border-neutral-150">
                          "{isAm ? fb.commentAm : fb.commentEn}"
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>{isAm ? fb.highlightTagAm : fb.highlightTag}</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Verified Passenger
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Regional Transport Authority Incentive Info */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-950">
                <Trophy className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 mb-0.5">
                    {isAm
                      ? 'የአማራ ትራንስፖርት ባለስልጣን የሹፌሮች ማበረታቻ ቦነስ'
                      : 'Amhara Transport Authority Regional Driver Bonus Qualified'}
                  </h4>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    {isAm
                      ? 'ካፒቴን ካሳሁን "Top Rated"፣ "Safe Driver" እና "Punctuality Pro" ደረጃዎችን በማሳካቱ የዚህ ወር የ15% የደህንነትና የሰዓት አከባበር ተጨማሪ አበል ተፈቅዶለታል።'
                      : 'Holding active Top Rated, Safe Driver, and Punctuality Pro badges qualifies this operator for the 15% Authority Safety & Punctuality quarterly incentive dividend.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t border-neutral-200 px-5 py-3 shrink-0 flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAm ? 'የአማራ ትራንስፖርት ባለስልጣን የሹፌር ፖርታል' : 'Amhara Transport Authority Operator Console'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close Console'}
          </button>
        </div>
      </div>
    </div>
  );
};

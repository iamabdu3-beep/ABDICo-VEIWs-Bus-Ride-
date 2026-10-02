import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  User,
  Bus,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  QrCode,
  DollarSign,
  TrendingUp,
  Fuel,
  Sparkles,
  Phone,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  Compass,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Gauge,
  Activity,
  Luggage,
  Calendar,
  CreditCard,
  Printer,
  ChevronRight,
  Filter,
  Check,
  Send,
  X,
  Smartphone,
  Play,
  KeyRound,
  Code2,
  Terminal,
  Zap,
  Keyboard,
  Headphones,
} from 'lucide-react';
import { DashboardQuickActionsModal, QuickActionItem } from './DashboardQuickActionsModal';
import { UssdSimulatorModal } from './UssdSimulatorModal';
import { CallCenterModal } from './CallCenterModal';
import {
  Language,
  UserProfile,
  UserRole,
  BookingTicket,
  RideTrip,
  FleetVehicle,
  OperatorFinancialSummary,
  AdminAlertNotice,
  TerminalTrafficStatus,
  PassengerManifestItem,
  VehicleReadinessChecklist,
  VehicleCategory,
} from '../types';
import { translations } from '../translations';
import { MOCK_USERS, INITIAL_DRIVER_MANIFEST, INITIAL_VEHICLE_CHECKLIST, INITIAL_ADMIN_ALERTS } from '../data/mockUsers';
import { INITIAL_FLEET_VEHICLES, INITIAL_OPERATOR_FINANCIALS } from '../data/fleetData';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { BASE_TERMINAL_TRAFFIC } from '../data/terminalTraffic';
import { triggerHaptic } from '../utils/haptics';

interface DashboardViewProps {
  lang: Language;
  currentUser: UserProfile | null;
  onSwitchUser: (user: UserProfile) => void;
  onOpenLogin: (role?: UserRole) => void;
  trips: RideTrip[];
  onAddTrip?: (newTrip: RideTrip) => void;
  tickets: BookingTicket[];
  onSelectTripToBook: (trip: RideTrip) => void;
  onViewTicket: (ticket: BookingTicket) => void;
  onShowToast: (msg: string) => void;
  onOpenAndroidModal?: (tab?: 'preview' | 'studio' | 'playstore' | 'keystore') => void;
  activeRoleTab?: UserRole;
  onRoleTabChange?: (role: UserRole) => void;
  activeSubModule?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  currentUser,
  onSwitchUser,
  onOpenLogin,
  trips,
  onAddTrip,
  tickets,
  onSelectTripToBook,
  onViewTicket,
  onShowToast,
  onOpenAndroidModal,
  activeRoleTab: controlledRoleTab,
  onRoleTabChange,
  activeSubModule,
}) => {
  const isAm = lang === 'am';
  const t = translations[lang];

  // Active Role Dashboard Tab
  // Default to controlledRoleTab if provided, or currentUser's role, otherwise 'passenger'
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(() => {
    if (controlledRoleTab) return controlledRoleTab;
    if (currentUser?.role) return currentUser.role;
    return 'passenger';
  });

  useEffect(() => {
    if (controlledRoleTab && controlledRoleTab !== activeRoleTab) {
      setActiveRoleTab(controlledRoleTab);
    }
  }, [controlledRoleTab]);

  // Synchronize activeSubModule to scroll and highlight section
  useEffect(() => {
    if (!activeSubModule) return;
    if (activeSubModule === 'dispatch_trip') {
      setIsAddTripModalOpen(true);
      return;
    }
    const timer = setTimeout(() => {
      const targetEl = document.getElementById(`module-section-${activeSubModule}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2');
        setTimeout(() => {
          targetEl.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
        }, 2500);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [activeSubModule]);

  const handleRoleTabSelect = (role: UserRole) => {
    setActiveRoleTab(role);
    if (onRoleTabChange) {
      onRoleTabChange(role);
    }
  };

  // State for Driver Dashboard
  const [driverManifest, setDriverManifest] = useState<PassengerManifestItem[]>(INITIAL_DRIVER_MANIFEST);
  const [vehicleChecklist, setVehicleChecklist] = useState<VehicleReadinessChecklist>(INITIAL_VEHICLE_CHECKLIST);
  const [checklistSigned, setChecklistSigned] = useState<boolean>(false);
  const [driverSpeed, setDriverSpeed] = useState<number>(68);
  const [manifestFilter, setManifestFilter] = useState<'all' | 'boarded' | 'pending'>('all');
  const [roadIncidentText, setRoadIncidentText] = useState<string>('');
  const [incidentSubmitted, setIncidentSubmitted] = useState<boolean>(false);

  // State for Bus Owner Dashboard
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(INITIAL_FLEET_VEHICLES);
  const [operatorFinancials, setOperatorFinancials] = useState<OperatorFinancialSummary>(INITIAL_OPERATOR_FINANCIALS);
  const [fleetFilter, setFleetFilter] = useState<'all' | 'on_route' | 'boarding' | 'maintenance' | 'idle'>('all');
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState<boolean>(false);

  // New Trip form for Bus Owner
  const [newTripOrigin, setNewTripOrigin] = useState<string>('bahir-dar');
  const [newTripDest, setNewTripDest] = useState<string>('gondar');
  const [newTripTime, setNewTripTime] = useState<string>('08:30 AM');
  const [newTripVehicle, setNewTripVehicle] = useState<string>('ET 03-A88219');
  const [newTripCategory, setNewTripCategory] = useState<VehicleCategory>('Luxury Coach');
  const [newTripPrice, setNewTripPrice] = useState<number>(380);

  // State for Administration Dashboard
  const [adminAlerts, setAdminAlerts] = useState<AdminAlertNotice[]>(INITIAL_ADMIN_ALERTS);
  const [terminalTraffic, setTerminalTraffic] = useState<Record<string, TerminalTrafficStatus>>(BASE_TERMINAL_TRAFFIC);
  const [newAlertTitle, setNewAlertTitle] = useState<string>('');
  const [newAlertMessage, setNewAlertMessage] = useState<string>('');
  const [newAlertSeverity, setNewAlertSeverity] = useState<'advisory' | 'warning' | 'emergency'>('advisory');
  const [newAlertTargetStation, setNewAlertTargetStation] = useState<string>('all');
  const [alertBroadcastSuccess, setAlertBroadcastSuccess] = useState<boolean>(false);

  // ==========================================
  // DRIVER ACTIONS
  // ==========================================
  const handleToggleBoarding = (ticketId: string) => {
    triggerHaptic(12);
    setDriverManifest((prev) =>
      prev.map((item) => {
        if (item.ticketId === ticketId) {
          const nextState = !item.boarded;
          return {
            ...item,
            boarded: nextState,
            boardedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return item;
      })
    );
    onShowToast(isAm ? 'የተሳፋሪው የመሳፈር ሁኔታ ተቀይሯል' : 'Passenger boarding status updated');
  };

  const handleSimulateScanPassenger = () => {
    triggerHaptic(15);
    const unboarded = driverManifest.find((p) => !p.boarded);
    if (unboarded) {
      handleToggleBoarding(unboarded.ticketId);
      onShowToast(
        isAm
          ? `ትኬት ${unboarded.ticketId} ተረጋግጧል! ተሳፋሪ: ${unboarded.passengerName}`
          : `Ticket ${unboarded.ticketId} verified! Passenger: ${unboarded.passengerName}`
      );
    } else {
      onShowToast(isAm ? 'ሁሉም ተሳፋሪዎች ተሳፍረዋል!' : 'All scheduled passengers have boarded!');
    }
  };

  const handleToggleChecklistItem = (key: keyof VehicleReadinessChecklist) => {
    triggerHaptic(8);
    setVehicleChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSignInspection = () => {
    triggerHaptic(20);
    setChecklistSigned(true);
    setVehicleChecklist((prev) => ({
      ...prev,
      terminalSecurityPermitSigned: true,
    }));
    onShowToast(
      isAm
        ? 'የቅድመ-ጉዞ ቴክኒካልና ደህንነት ማረጋገጫ በዲጂታል ፊርማ ጸድቋል!'
        : 'Pre-trip vehicle readiness inspection digitally signed & certified!'
    );
  };

  const handleReportRoadIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadIncidentText.trim()) return;
    triggerHaptic(15);
    setIncidentSubmitted(true);
    onShowToast(
      isAm
        ? 'የመንገድ ጥንቃቄ መልዕክት ወደ መናኸሪያው መቆጣጠሪያ ማዕከል ተልኳል!'
        : 'Road condition report broadcasted to dispatch terminal authority!'
    );
    setRoadIncidentText('');
    setTimeout(() => setIncidentSubmitted(false), 4000);
  };

  // ==========================================
  // BUS OWNER ACTIONS
  // ==========================================
  const handleToggleVehicleStatus = (plate: string) => {
    triggerHaptic(10);
    setFleetVehicles((prev) =>
      prev.map((v) => {
        if (v.plateNumber === plate) {
          const nextStatusMap: Record<FleetVehicle['status'], FleetVehicle['status']> = {
            on_route: 'idle',
            idle: 'boarding',
            boarding: 'on_route',
            maintenance: 'idle',
          };
          const nextStatus = nextStatusMap[v.status];
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
    onShowToast(isAm ? 'የተሽከርካሪው ሁኔታ ተዘምኗል' : 'Vehicle fleet status updated');
  };

  const handleCreateNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(15);

    const fromSt = AMHARA_STATIONS.find((s) => s.id === newTripOrigin) || AMHARA_STATIONS[0];
    const toSt = AMHARA_STATIONS.find((s) => s.id === newTripDest) || AMHARA_STATIONS[1];

    const newTripObj: RideTrip = {
      id: `trip-owner-${Date.now().toString().slice(-5)}`,
      busCompany: 'Tana Express Coach SC',
      busCompanyAm: 'ጣና ኤክስፕረስ አውቶቡስ አ.ማ',
      vehicleType: newTripCategory,
      plateNumber: newTripVehicle,
      driverName: 'Captain Kassahun Worku',
      driverPhone: '+251 91 872 3341',
      driverRating: 4.9,
      fromStationId: fromSt.id,
      toStationId: toSt.id,
      departureTime: newTripTime,
      arrivalTime: '11:45 AM',
      durationFormatted: '3h 15m',
      priceETB: newTripPrice,
      totalSeats: 45,
      bookedSeats: [],
      amenities: ['AC / Climate', 'Comfort Reclining Seats', 'Luggage Bay', 'USB Charging'],
      status: 'scheduled',
      routeStops: [fromSt.city, toSt.city],
    };

    if (onAddTrip) {
      onAddTrip(newTripObj);
    }
    setIsAddTripModalOpen(false);
    onShowToast(
      isAm
        ? `አዲስ የ${fromSt.cityAm} ወደ ${toSt.cityAm} ጉዞ በመርሐ-ግብር ተመዝግቧል!`
        : `New departure from ${fromSt.city} to ${toSt.city} added to public schedule!`
    );
  };

  // ==========================================
  // ADMINISTRATION ACTIONS
  // ==========================================
  const handleToggleAdminAlert = (id: string) => {
    triggerHaptic(10);
    setAdminAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
    onShowToast(isAm ? 'የጥንቃቄ መልዕክት ሁኔታ ተቀይሯል' : 'Advisory broadcast status updated');
  };

  const handleBroadcastNewAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim() || !newAlertMessage.trim()) return;

    triggerHaptic(18);
    const newNotice: AdminAlertNotice = {
      id: `alt-adm-${Date.now().toString().slice(-4)}`,
      severity: newAlertSeverity,
      titleEn: newAlertTitle,
      titleAm: newAlertTitle,
      messageEn: newAlertMessage,
      messageAm: newAlertMessage,
      issuedByStaffId: currentUser?.adminStaffId || 'RTA-AMH-001',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetStations: newAlertTargetStation === 'all' ? ['all'] : [newAlertTargetStation],
      isActive: true,
    };

    setAdminAlerts((prev) => [newNotice, ...prev]);
    setNewAlertTitle('');
    setNewAlertMessage('');
    setAlertBroadcastSuccess(true);
    onShowToast(
      isAm
        ? 'የአስተዳደር የጥንቃቄ መልዕክት ወደ ሁሉም መናኸሪያዎችና ሹፌሮች ተሰራጭቷል!'
        : 'Official transit advisory broadcasted across all regional corridors!'
    );
    setTimeout(() => setAlertBroadcastSuccess(false), 3500);
  };

  const handleUpdateTerminalCongestion = (
    stationId: string,
    level: 'low' | 'moderate' | 'heavy' | 'severe'
  ) => {
    triggerHaptic(10);
    setTerminalTraffic((prev) => {
      const current = prev[stationId];
      if (!current) return prev;
      return {
        ...prev,
        [stationId]: {
          ...current,
          congestionLevel: level,
          lastUpdated: 'Just now',
        },
      };
    });
    onShowToast(
      isAm
        ? `የመናኸሪያው የመጨናነቅ ደረጃ ወደ ${level} ተቀይሯል`
        : `Terminal congestion level updated to ${level}`
    );
  };

  // Passenger active ticket
  const primaryTicket = tickets[0];

  // Screen-Reader Optimized Quick Actions State & Logic
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');
  const quickActionsTriggerRef = useRef<HTMLButtonElement>(null);

  // USSD & Call Center Modals State
  const [isUssdModalOpen, setIsUssdModalOpen] = useState<boolean>(false);
  const [selectedTicketForUssd, setSelectedTicketForUssd] = useState<BookingTicket | null>(null);
  const [isCallCenterModalOpen, setIsCallCenterModalOpen] = useState<boolean>(false);
  const [selectedTicketForCallCenter, setSelectedTicketForCallCenter] = useState<BookingTicket | null>(null);

  const announceToScreenReader = useCallback((msg: string) => {
    setScreenReaderAnnouncement(msg);
  }, []);

  const nextAvailableTrip = trips.find((t) => t.totalSeats - t.bookedSeats.length > 0) || trips[0];
  const activeTicket = tickets[0];
  const bdGondarTrip = trips.find(
    (t) =>
      (t.fromStationId === 'bahir-dar' && t.toStationId === 'gondar') ||
      (t.fromStationId === 'gondar' && t.toStationId === 'bahir-dar')
  );

  const handleQuickDialUssd = useCallback(() => {
    triggerHaptic(12);
    const target = primaryTicket || tickets[0];
    if (target) setSelectedTicketForUssd(target);
    setIsUssdModalOpen(true);
    const msg = isAm ? 'የUSSD ትኬት ማረጋገጫ ተከፍቷል (*805#)' : 'USSD Ticket verification menu opened (*805#)';
    onShowToast(msg);
    announceToScreenReader(msg);
  }, [primaryTicket, tickets, isAm, onShowToast, announceToScreenReader]);

  const handleQuickCallCenter = useCallback(() => {
    triggerHaptic(12);
    const target = primaryTicket || tickets[0];
    if (target) setSelectedTicketForCallCenter(target);
    setIsCallCenterModalOpen(true);
    const msg = isAm ? 'የ24/7 የትራንስፖርት ጥሪ ማዕከል መረጃ ተከፍቷል (994)' : '24/7 Transit Call Center helpline opened (994)';
    onShowToast(msg);
    announceToScreenReader(msg);
  }, [primaryTicket, tickets, isAm, onShowToast, announceToScreenReader]);

  const handleQuickBookNext = useCallback(() => {
    if (!nextAvailableTrip) {
      onShowToast(isAm ? 'ምንም የሚገኝ ክፍት ጉዞ የለም' : 'No available trips currently scheduled');
      announceToScreenReader(isAm ? 'ምንም የሚገኝ ክፍት ጉዞ የለም' : 'No trips available for booking right now.');
      return;
    }
    triggerHaptic(15);
    onSelectTripToBook(nextAvailableTrip);
    const msg = isAm
      ? `የቦታ ማስያዣ ተከፍቷል፡ ${nextAvailableTrip.busCompany} (${nextAvailableTrip.departureTime})`
      : `Opened seat reservation for ${nextAvailableTrip.busCompany} (${nextAvailableTrip.departureTime})`;
    onShowToast(msg);
    announceToScreenReader(msg);
  }, [nextAvailableTrip, isAm, onShowToast, onSelectTripToBook, announceToScreenReader]);

  const handleQuickViewTicket = useCallback(() => {
    if (!activeTicket) {
      onShowToast(
        isAm
          ? 'ምንም የተገዛ ትኬት አልተገኘም፤ ቀጣዩን ጉዞ በAlt+B ይያዙ'
          : 'No active tickets found. Press Alt+B to book your first trip.'
      );
      announceToScreenReader(
        isAm
          ? 'ምንም የተገዛ ትኬት አልተገኘም። ቀጣዩን ጉዞ ለማስያዝ Alt+B ይጫኑ።'
          : 'No active boarding passes in wallet. Press Alt+B to book a trip.'
      );
      return;
    }
    triggerHaptic(15);
    onViewTicket(activeTicket);
    const msg = isAm
      ? `ዲጂታል ትኬት #${activeTicket.ticketId} ተከፍቷል (${activeTicket.passengerName})`
      : `Opened digital boarding pass #${activeTicket.ticketId} for ${activeTicket.passengerName}`;
    onShowToast(msg);
    announceToScreenReader(msg);
  }, [activeTicket, isAm, onShowToast, onViewTicket, announceToScreenReader]);

  const handleQuickSwitchRole = useCallback(
    (role: UserRole) => {
      triggerHaptic(10);
      setActiveRoleTab(role);
      const roleNames: Record<UserRole, { en: string; am: string }> = {
        passenger: { en: 'Passenger Portal', am: 'የተሳፋሪ ፖርታል' },
        driver: { en: 'Driver Cockpit', am: 'የሹፌር ኮክፒት' },
        bus_owner: { en: 'Bus Owner Fleet Portal', am: 'የአውቶቡስ ባለቤት ፖርታል' },
        admin: { en: 'Transit Authority Portal', am: 'የትራንስፖርት ባለስልጣን ፖርታል' },
      };
      const roleInfo = roleNames[role];
      const msg = isAm ? `ወደ ${roleInfo.am} ተቀይሯል` : `Switched to ${roleInfo.en}`;
      onShowToast(msg);
      announceToScreenReader(msg);
    },
    [isAm, onShowToast, announceToScreenReader]
  );

  const quickActionsList: QuickActionItem[] = [
    {
      id: 'quick-book-next',
      category: 'booking',
      categoryLabelEn: 'Booking',
      categoryLabelAm: 'ቦታ ማስያዣ',
      titleEn: nextAvailableTrip
        ? `Book Next Trip (${nextAvailableTrip.busCompany})`
        : 'Book Next Available Trip',
      titleAm: nextAvailableTrip
        ? `ቀጣዩን ጉዞ ያዙ (${nextAvailableTrip.busCompany})`
        : 'ቀጣዩን ክፍት ጉዞ ያዙ',
      descriptionEn: nextAvailableTrip
        ? `${nextAvailableTrip.departureTime} • ${nextAvailableTrip.priceETB} ETB • ${
            nextAvailableTrip.totalSeats - nextAvailableTrip.bookedSeats.length
          } seats left`
        : 'Select seats on earliest departure',
      descriptionAm: nextAvailableTrip
        ? `${nextAvailableTrip.departureTime} • ${nextAvailableTrip.priceETB} ብር • ${
            nextAvailableTrip.totalSeats - nextAvailableTrip.bookedSeats.length
          } ቀሪ መቀመጫዎች`
        : 'በቀደምት መነሻ ሰዓት መቀመጫ ይምረጡ',
      shortcutDisplay: 'Alt+B',
      keyChar: 'b',
      altKeyRequired: true,
      icon: Bus,
      onExecute: handleQuickBookNext,
      badge: nextAvailableTrip ? `${nextAvailableTrip.priceETB} ETB` : undefined,
    },
    {
      id: 'quick-view-ticket',
      category: 'ticketing',
      categoryLabelEn: 'Ticketing',
      categoryLabelAm: 'ትኬቶች',
      titleEn: activeTicket
        ? `View Boarding Pass #${activeTicket.ticketId}`
        : 'View Latest Digital Boarding Pass',
      titleAm: activeTicket
        ? `ዲጂታል የመሳፈሪያ ትኬት #${activeTicket.ticketId} ይመልከቱ`
        : 'የቅርብ ጊዜ ዲጂታል የመሳፈሪያ ትኬት ይመልከቱ',
      descriptionEn: activeTicket
        ? `${activeTicket.fromStation.city} ➔ ${activeTicket.toStation.city} • Seat ${activeTicket.seatNumbers.join(
            ', '
          )} • Gate ${activeTicket.platformBay || 'Bay 2'}`
        : 'Inspect QR code, barcode, and passenger receipt',
      descriptionAm: activeTicket
        ? `${activeTicket.fromStation.cityAm || activeTicket.fromStation.city} ➔ ${
            activeTicket.toStation.cityAm || activeTicket.toStation.city
          } • መቀመጫ ${activeTicket.seatNumbers.join(', ')}`
        : 'QR ኮድ፣ ባርኮድ እና የመሳፈሪያ ደረሰኝ ይመልከቱ',
      shortcutDisplay: 'Alt+T',
      keyChar: 't',
      altKeyRequired: true,
      icon: QrCode,
      onExecute: handleQuickViewTicket,
      badge: activeTicket ? (isAm ? 'ንቁ ትኬት' : 'Active Pass') : undefined,
    },
    {
      id: 'quick-track-luggage',
      category: 'ticketing',
      categoryLabelEn: 'Ticketing',
      categoryLabelAm: 'ትኬቶች',
      titleEn: 'Track Baggage Claim Tag',
      titleAm: 'የሻንጣ መከታተያ ታግ ይመልከቱ',
      descriptionEn: activeTicket
        ? `Claim tag #${activeTicket.ticketId}-BAG • 2 checked bags with security checkpoint verification`
        : 'Inspect luggage claim tags on active trips',
      descriptionAm: activeTicket
        ? `የይገባኛል ታግ #${activeTicket.ticketId}-BAG • 2 የተመዘገቡ ሻንጣዎች`
        : 'የሻንጣ ይገባኛል ታጎችን ይመልከቱ',
      shortcutDisplay: 'Alt+L',
      keyChar: 'l',
      altKeyRequired: true,
      icon: Luggage,
      onExecute: () => {
        if (activeTicket) {
          handleQuickViewTicket();
          announceToScreenReader(isAm ? 'የሻንጣ መረጃ ተከፍቷል' : 'Luggage tracking details opened');
        } else {
          handleQuickViewTicket();
        }
      },
    },
    {
      id: 'quick-dial-ussd',
      category: 'ticketing',
      categoryLabelEn: 'Ticketing',
      categoryLabelAm: 'ትኬቶች',
      titleEn: 'Dial USSD Ticket Verification (*805#)',
      titleAm: 'የUSSD ትኬት ማረጋገጫ ይደውሉ (*805#)',
      descriptionEn: activeTicket
        ? `USSD shortcode: ${activeTicket.ussdCode || '*805*1*784102#'} • Works offline without data`
        : 'Access self-service mobile USSD session for offline ticketing',
      descriptionAm: activeTicket
        ? `የUSSD ኮድ፡ ${activeTicket.ussdCode || '*805*1*784102#'} • ያለ ዳታ ይሰራል`
        : 'ከመስመር ውጭ የUSSD ትኬት ማረጋገጫ አገልግሎት',
      shortcutDisplay: 'Alt+U',
      keyChar: 'u',
      altKeyRequired: true,
      icon: Smartphone,
      onExecute: handleQuickDialUssd,
      badge: isAm ? 'ከመስመር ውጭ' : 'Offline USSD',
    },
    {
      id: 'quick-call-center',
      category: 'ticketing',
      categoryLabelEn: 'Ticketing',
      categoryLabelAm: 'ትኬቶች',
      titleEn: 'Call 24/7 Transit Helpline (994)',
      titleAm: 'ወደ 24/7 የትራንስፖርት ጥሪ ማዕከል ይደውሉ (994)',
      descriptionEn: 'Toll-free customer care, terminal dispatches, and emergency assistance',
      descriptionAm: 'ከክፍያ ነጻ የስልክ እርዳታ፣ የመናኸሪያ መቆጣጠሪያና የጠፋ ሻንጣ ክትትል',
      shortcutDisplay: 'Alt+C',
      keyChar: 'c',
      altKeyRequired: true,
      icon: Headphones,
      onExecute: handleQuickCallCenter,
      badge: '994 Toll-Free',
    },
    ...(bdGondarTrip
      ? [
          {
            id: 'quick-book-bd-gondar',
            category: 'booking' as const,
            categoryLabelEn: 'Corridors',
            categoryLabelAm: 'መስመሮች',
            titleEn: `Fast-Book Bahir Dar ⇄ Gondar`,
            titleAm: `ባሕር ዳር ⇄ ጎንደር ፈጣን ቦታ ማስያዣ`,
            descriptionEn: `${bdGondarTrip.busCompany} • ${bdGondarTrip.departureTime} • ${bdGondarTrip.priceETB} ETB`,
            descriptionAm: `${bdGondarTrip.busCompany} • ${bdGondarTrip.departureTime} • ${bdGondarTrip.priceETB} ብር`,
            shortcutDisplay: 'Alt+G',
            keyChar: 'g',
            altKeyRequired: true,
            icon: Compass,
            onExecute: () => {
              triggerHaptic(15);
              onSelectTripToBook(bdGondarTrip);
              const msg = isAm
                ? 'ባሕር ዳር ⇄ ጎንደር ጉዞ ተመርጧል'
                : 'Selected Bahir Dar to Gondar trip for booking';
              onShowToast(msg);
              announceToScreenReader(msg);
            },
            badge: 'Popular Corridor',
          },
        ]
      : []),
    {
      id: 'quick-role-passenger',
      category: 'portal',
      categoryLabelEn: 'Portals',
      categoryLabelAm: 'ፖርታሎች',
      titleEn: 'Switch to Passenger Portal',
      titleAm: 'ወደ ተሳፋሪ ፖርታል ቀይር',
      descriptionEn: 'View confirmed boarding passes, trip history, and Abay commuter reward miles',
      descriptionAm: 'የተረጋገጡ ትኬቶች፣ የጉዞ ታሪክና የዓባይ ተጓዥ ነጥቦችን ይመልከቱ',
      shortcutDisplay: 'Alt+1',
      keyChar: '1',
      altKeyRequired: true,
      icon: User,
      onExecute: () => handleQuickSwitchRole('passenger'),
      badge: activeRoleTab === 'passenger' ? (isAm ? 'ንቁ' : 'Current') : undefined,
    },
    {
      id: 'quick-role-driver',
      category: 'portal',
      categoryLabelEn: 'Portals',
      categoryLabelAm: 'ፖርታሎች',
      titleEn: 'Switch to Driver Cockpit',
      titleAm: 'ወደ ሹፌር ኮክፒት ቀይር',
      descriptionEn: 'Passenger boarding manifest, QR ticket validator, and pre-trip inspection',
      descriptionAm: 'የተሳፋሪዎች ዝርዝር፣ የQR ትኬት ማረጋገጫና የቅድመ-ጉዞ ቴክኒካል ፍተሻ',
      shortcutDisplay: 'Alt+2',
      keyChar: '2',
      altKeyRequired: true,
      icon: Bus,
      onExecute: () => handleQuickSwitchRole('driver'),
      badge: activeRoleTab === 'driver' ? (isAm ? 'ንቁ' : 'Current') : undefined,
    },
    {
      id: 'quick-role-owner',
      category: 'portal',
      categoryLabelEn: 'Portals',
      categoryLabelAm: 'ፖርታሎች',
      titleEn: 'Switch to Bus Owner Portal',
      titleAm: 'ወደ አውቶቡስ ባለቤት ፖርታል ቀይር',
      descriptionEn: 'Fleet telemetry, maintenance bays, dispatch scheduler, and revenue totals',
      descriptionAm: 'የፍሊት ቁጥጥር፣ የጥገና ሁኔታ፣ አዳዲስ ጉዞዎችን ማከልና አጠቃላይ ገቢ',
      shortcutDisplay: 'Alt+3',
      keyChar: '3',
      altKeyRequired: true,
      icon: Building2,
      onExecute: () => handleQuickSwitchRole('bus_owner'),
      badge: activeRoleTab === 'bus_owner' ? (isAm ? 'ንቁ' : 'Current') : undefined,
    },
    {
      id: 'quick-role-admin',
      category: 'portal',
      categoryLabelEn: 'Portals',
      categoryLabelAm: 'ፖርታሎች',
      titleEn: 'Switch to Transit Authority Portal',
      titleAm: 'ወደ ትራንስፖርት ባለስልጣን ፖርታል ቀይር',
      descriptionEn: 'Regional terminal congestion index, travel advisories, and daily dispatches',
      descriptionAm: 'የክልሉ መናኸሪያዎች መጨናነቅ፣ የጥንቃቄ መልዕክቶች ስርጭትና የዛሬ ጉዞዎች',
      shortcutDisplay: 'Alt+4',
      keyChar: '4',
      altKeyRequired: true,
      icon: ShieldCheck,
      onExecute: () => handleQuickSwitchRole('admin'),
      badge: activeRoleTab === 'admin' ? (isAm ? 'ንቁ' : 'Current') : undefined,
    },
    ...(onOpenAndroidModal
      ? [
          {
            id: 'quick-android-hub',
            category: 'system' as const,
            categoryLabelEn: 'System',
            categoryLabelAm: 'ስርዓት',
            titleEn: 'Open Android Studio & Play Store Hub',
            titleAm: 'የአንድሮይድ ስቱዲዮ እና Play Store ማዕከል ክፈት',
            descriptionEn:
              'Inspect native project structure, keystore credentials, and Play Store console readiness',
            descriptionAm: 'የአንድሮይድ ፕሮጀክት፣ ኪይስቶርና የPlay Store መመሪያዎችን ይመልከቱ',
            shortcutDisplay: 'Alt+A',
            keyChar: 'a',
            altKeyRequired: true,
            icon: Smartphone,
            onExecute: () => {
              triggerHaptic(12);
              onOpenAndroidModal('studio');
              announceToScreenReader(
                isAm ? 'የአንድሮይድ ስቱዲዮ ማዕከል ተከፍቷል' : 'Android Studio deployment center opened'
              );
            },
          },
        ]
      : []),
  ];

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Quick Actions menu with Alt+K, Ctrl+K, or Cmd+K
      if ((e.altKey || e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickActionsOpen((prev) => !prev);
        return;
      }

      // Check Alt-modified shortcuts
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          handleQuickBookNext();
        } else if (key === 't') {
          e.preventDefault();
          handleQuickViewTicket();
        } else if (key === '1') {
          e.preventDefault();
          handleQuickSwitchRole('passenger');
        } else if (key === '2') {
          e.preventDefault();
          handleQuickSwitchRole('driver');
        } else if (key === '3') {
          e.preventDefault();
          handleQuickSwitchRole('bus_owner');
        } else if (key === '4') {
          e.preventDefault();
          handleQuickSwitchRole('admin');
        } else if (key === 'l') {
          e.preventDefault();
          if (activeTicket) handleQuickViewTicket();
        } else if (key === 'u') {
          e.preventDefault();
          handleQuickDialUssd();
        } else if (key === 'c') {
          e.preventDefault();
          handleQuickCallCenter();
        } else if (key === 'a' && onOpenAndroidModal) {
          e.preventDefault();
          onOpenAndroidModal('studio');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    handleQuickBookNext,
    handleQuickViewTicket,
    handleQuickSwitchRole,
    handleQuickDialUssd,
    handleQuickCallCenter,
    activeTicket,
    onOpenAndroidModal,
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* Screen-Reader Optimized Skip Link for Quick Actions */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(10);
          setIsQuickActionsOpen(true);
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-emerald-900 focus:text-white focus:rounded-xl focus:ring-4 focus:ring-emerald-400 focus:shadow-2xl font-bold text-xs flex items-center gap-2"
        aria-keyshortcuts="Alt+K"
      >
        <Keyboard className="w-4 h-4 text-amber-300" aria-hidden="true" />
        <span>{isAm ? 'ወደ ፈጣን ትዕዛዞች ዝርዝር ይዝለሉ (Alt+K)' : 'Skip to Quick Actions Menu (Alt+K)'}</span>
      </button>

      {/* Screen Reader Live Region for Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="dashboard-a11y-announcements"
      >
        {screenReaderAnnouncement}
      </div>
      {/* ============================================================ */}
      {/* 1. TOP HEADER & PERSONA / ROLE SWITCHER */}
      {/* ============================================================ */}
      <section className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>{isAm ? 'የአማራ ክልል የትራንስፖርት ባለስልጣን' : 'Amhara Regional Transport Authority'}</span>
              <span aria-hidden="true">·</span>
              <span>{isAm ? 'የኦፕሬሽንና የተጠቃሚዎች ዳሽቦርድ' : 'Operations & User Dashboards'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {t.dashboardTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              {t.dashboardSubtitle}
            </p>
          </div>

          {/* Current Profile & Fast Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {currentUser.avatarBadge || 'ET'}
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block leading-tight">
                    {isAm ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-semibold block leading-tight">
                    {currentUser.role === 'bus_owner'
                      ? isAm ? 'ባለንብረት' : 'Bus Owner'
                      : currentUser.role}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Quick Persona Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              {MOCK_USERS.filter((u) => ['usr-abebe', 'drv-kassahun', 'owner-belay', 'adm-yonas'].includes(u.id)).map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      triggerHaptic(12);
                      onSwitchUser(u);
                      setActiveRoleTab(u.role);
                      onShowToast(
                        isAm
                          ? `ወደ ${u.fullNameAm || u.fullName} መለያ ተቀይሯል`
                          : `Switched active view to ${u.fullName} (${u.role})`
                      );
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      isSelected
                        ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-emerald-600'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                    title={`Switch persona to ${u.fullName} (${u.role})`}
                  >
                    <span>{u.avatarBadge}</span>
                  </button>
                );
              })}
            </div>

            {/* Screen-Reader Optimized Quick Actions Button */}
            <button
              ref={quickActionsTriggerRef}
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setIsQuickActionsOpen((prev) => !prev);
              }}
              aria-haspopup="dialog"
              aria-expanded={isQuickActionsOpen}
              aria-controls="screen-reader-quick-actions-dialog"
              aria-keyshortcuts="Alt+K"
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 hover:border-emerald-400 transition cursor-pointer flex items-center gap-1.5 shadow-2xs group focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
              title={isAm ? 'የፈጣን ትዕዛዞች ዝርዝር (Alt+K)' : 'Quick Actions Menu (Alt+K)'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span>{isAm ? 'ፈጣን ትዕዛዞች' : 'Quick Actions'}</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 shadow-2xs">
                Alt+K
              </kbd>
            </button>

            <button
              onClick={() => onOpenLogin(activeRoleTab)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.switchRoleAccount}</span>
            </button>

            {onOpenAndroidModal && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onOpenAndroidModal('studio');
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Android Studio & Google Play Store Hub"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isAm ? 'አንድሮይድ ስቱዲዮ & Play Store' : 'Android Studio & Play Store'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 PRIMARY ROLE TABS (Segmented Control conforming to anti-slop rules) */}
        <div className="mt-5 pt-4 border-t border-neutral-200/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. User / Passenger Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleRoleTabSelect('passenger');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                activeRoleTab === 'passenger'
                  ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600 shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRoleTab === 'passenger'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    {t.dashboardRoleUser}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    {isAm ? 'ትኬቶችና የጉዞ ታሪክ' : 'Tickets & Rewards'}
                  </span>
                </div>
              </div>
              {activeRoleTab === 'passenger' && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              )}
            </button>

            {/* 2. Driver Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleRoleTabSelect('driver');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                activeRoleTab === 'driver'
                  ? 'bg-amber-50/90 border-amber-600 text-amber-950 ring-1 ring-amber-600 shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRoleTab === 'driver'
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    {t.dashboardRoleDriver}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    {isAm ? 'ማኒፌስትና ደህንነት' : 'Manifest & Telemetry'}
                  </span>
                </div>
              </div>
              {activeRoleTab === 'driver' && (
                <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
              )}
            </button>

            {/* 3. Bus Owner Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleRoleTabSelect('bus_owner');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                activeRoleTab === 'bus_owner'
                  ? 'bg-blue-50/90 border-blue-600 text-blue-950 ring-1 ring-blue-600 shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRoleTab === 'bus_owner'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    {t.dashboardRoleBusOwner}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    {isAm ? 'የአውቶቡስ ፍሊትና ገቢ' : 'Fleet & Revenue'}
                  </span>
                </div>
              </div>
              {activeRoleTab === 'bus_owner' && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              )}
            </button>

            {/* 4. Administration Tab */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                handleRoleTabSelect('admin');
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                activeRoleTab === 'admin'
                  ? 'bg-rose-50/90 border-rose-600 text-rose-950 ring-1 ring-rose-600 shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeRoleTab === 'admin'
                      ? 'bg-rose-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    {t.dashboardRoleAdmin}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">
                    {isAm ? 'የመናኸሪያዎች ቁጥጥር' : 'Regional Dispatch'}
                  </span>
                </div>
              </div>
              {activeRoleTab === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PERSONA DASHBOARDS RENDERING */}
      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* ROLE 1: PASSENGER / USER DASHBOARD */}
      {/* ============================================================ */}
      {activeRoleTab === 'passenger' && (
        <div className="space-y-6">
          {/* Top KPI Cards for Commuter */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.activeTicketsCount}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-neutral-900">{tickets.length}</span>
                <span className="text-xs text-emerald-700 font-medium">
                  {isAm ? 'የተረጋገጠ' : 'Confirmed'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {primaryTicket ? `${primaryTicket.fromStation.city} ➔ ${primaryTicket.toStation.city}` : 'No upcoming trip'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.completedTripsCount}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-neutral-900">
                  {currentUser?.totalTripsCompleted || 18}
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  {isAm ? 'ጉዞዎች' : 'Journeys'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'በአማራ ክልል መናኸሪያዎች' : 'Across Amhara Corridors'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.abayLoyaltyMiles}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">1,280</span>
                <span className="text-xs text-amber-700 font-medium">Pts</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'ደረጃ፡ ብር ተጓዥ (Silver)' : 'Tier: Silver Commuter (20% off)'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.carbonSavedKg}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">142</span>
                <span className="text-xs text-emerald-800 font-medium">kg CO₂</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'ከግል መኪና ይልቅ አውቶቡስ በመጠቀም' : 'Compared to solo driving'}
              </span>
            </div>
          </div>

          {/* Active Digital Boarding Pass Hero Card */}
          {primaryTicket && (
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800/40 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAm ? 'ንቁ ዲጂታል የመሳፈሪያ ፈቃድ' : 'Active Digital Boarding Pass'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{primaryTicket.ticketId}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                      <span>{isAm ? primaryTicket.fromStation.cityAm : primaryTicket.fromStation.city}</span>
                      <ArrowRight className="w-5 h-5 text-amber-400" />
                      <span>{isAm ? primaryTicket.toStation.cityAm : primaryTicket.toStation.city}</span>
                    </h2>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      {primaryTicket.busCompany} · {primaryTicket.vehicleType} · {isAm ? 'የሰሌዳ ቁጥር፡' : 'Plate:'} {primaryTicket.plateNumber}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-emerald-100">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAm ? 'የመነሻ ሰዓት፡' : 'Departure:'} <strong className="text-white">{primaryTicket.departureTime}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-100">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAm ? 'የመጫኛ በር (Bay):' : 'Platform Bay:'} <strong className="text-white">#{primaryTicket.bayNumber}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-100">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAm ? 'የወንበር ቁጥሮች፡' : 'Seats:'} <strong className="text-white">{primaryTicket.seatNumbers.join(', ')}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-100">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{primaryTicket.totalFareETB} ETB ({primaryTicket.paymentMethod})</span>
                    </div>
                  </div>

                  {/* Offline USSD & Call Center Action Strip */}
                  <div className="pt-2.5 border-t border-emerald-800/60 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-950/70 p-1.5 rounded-xl border border-emerald-800/80">
                      <span className="text-[10px] text-emerald-300 font-semibold uppercase px-1">
                        {isAm ? 'USSD፡' : 'USSD:'}
                      </span>
                      <span className="font-mono text-amber-300 font-bold text-xs">
                        {primaryTicket.ussdCode || `*805*1*${primaryTicket.ticketId.replace(/\D/g, '') || '784102'}#`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(12);
                          setSelectedTicketForUssd(primaryTicket);
                          setIsUssdModalOpen(true);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-md transition cursor-pointer shadow-2xs active:scale-95 ml-1"
                      >
                        {isAm ? 'ሞክር' : 'Test'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-950/70 p-1.5 rounded-xl border border-emerald-800/80">
                      <span className="text-[10px] text-emerald-300 font-semibold uppercase px-1">
                        {isAm ? 'ጥሪ ማዕከል፡' : 'Call Center:'}
                      </span>
                      <a
                        href="tel:994"
                        onClick={() => triggerHaptic(12)}
                        className="px-2 py-0.5 text-[10px] font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>994</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setSelectedTicketForCallCenter(primaryTicket);
                          setIsCallCenterModalOpen(true);
                        }}
                        className="px-2 py-0.5 text-[10px] font-semibold text-emerald-200 hover:text-white bg-emerald-900 hover:bg-emerald-800 rounded-md transition cursor-pointer"
                      >
                        {isAm ? 'ዝርዝር' : 'Directory'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* QR Code and Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                  <div className="w-24 h-24 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg">
                    <QrCode className="w-full h-full text-neutral-900" />
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic(10);
                      onViewTicket(primaryTicket);
                    }}
                    className="w-full py-2 px-3 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl transition cursor-pointer text-center shadow-xs"
                  >
                    {isAm ? 'ሙሉ ትኬት ክፈት' : 'View Full Boarding Pass'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Two-Column: Saved Corridors & Checked Luggage Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Popular Saved Corridors for 1-Click Booking */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'ተወዳጅና የተቀመጡ የጉዞ መስመሮች' : 'Frequent Corridors & Quick Book'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'በአንድ ጠቅታ ወዲያውኑ መቀመጫ ይያዙ' : '1-click reservations on regular routes'}
                  </span>
                </div>
                <Compass className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="space-y-2.5">
                {[
                  { fromId: 'bahir-dar', toId: 'gondar', name: 'Bahir Dar ➔ Gondar (A3 Highway)', fare: '320 ETB', time: '06:30 AM' },
                  { fromId: 'dessie', toId: 'addis-ababa', name: 'Dessie ➔ Addis Ababa Gateway', fare: '650 ETB', time: '05:45 AM' },
                  { fromId: 'debre-markos', toId: 'bahir-dar', name: 'Debre Markos ➔ Bahir Dar', fare: '420 ETB', time: '07:00 AM' },
                ].map((corridor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 hover:bg-emerald-50/60 border border-neutral-200/80 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-neutral-900 block">{corridor.name}</span>
                      <span className="text-[11px] text-neutral-500">
                        {corridor.time} · {corridor.fare}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const trip = trips.find((t) => t.fromStationId === corridor.fromId && t.toStationId === corridor.toId) || trips[0];
                        onSelectTripToBook(trip);
                      }}
                      className="px-3 py-1.5 font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition cursor-pointer"
                    >
                      {isAm ? 'ያዝ' : 'Book'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Checked Luggage Tracking Overview */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'የተረጋገጠ ሻንጣና እቃ ክትትል' : 'Checked Baggage & Security Seal'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'የካርጎ ክፍል እና የደህንነት ማህተም መረጃ' : 'Cargo bay compartment security status'}
                  </span>
                </div>
                <Luggage className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAm ? 'የሻንጣ መለያ (Tag):' : 'Baggage Tag:'}</span>
                  <span className="font-mono font-bold text-neutral-900">TAG-AMH-882194</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAm ? 'የተመዘገቡ ሻንጣዎች፡' : 'Pieces & Weight:'}</span>
                  <span className="font-bold text-neutral-900">2 Pieces (28 kg total)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAm ? 'የካርጎ ክፍል፡' : 'Cargo Bay Section:'}</span>
                  <span className="font-bold text-neutral-900">Compartment B (Underbody)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">{isAm ? 'የደህንነት ሁኔታ፡' : 'Security Status:'}</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAm ? 'የደህንነት ማህተም ተረጋግጧል' : 'Tamper Seal Intact (AMH-SEC-94)'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ROLE 2: COMMERCIAL DRIVER DASHBOARD */}
      {/* ============================================================ */}
      {activeRoleTab === 'driver' && (
        <div className="space-y-6">
          {/* Active Shift Card */}
          <div id="module-section-cockpit" className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{isAm ? 'ንቁ የስራ ፈረቃ' : 'Active Duty Shift'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isAm ? 'ሰላም ባስ አ.ማ' : 'Selam Bus Line SC'}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 mt-1">
                  Captain Kassahun Worku · {isAm ? 'ባሕር ዳር ወደ ጎንደር' : 'Bahir Dar ➔ Gondar'}
                </h2>
                <p className="text-xs text-neutral-500">
                  {isAm ? 'አውቶቡስ፡' : 'Vehicle:'} Scania Touring HD (ET 03-A88219) · {isAm ? 'የመጫኛ በር፡' : 'Bay:'} #4 · {isAm ? 'መነሻ፡' : 'Departure:'} 06:30 AM
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateScanPassenger}
                  className="px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isAm ? 'ትኬት ስካን አድርግ' : 'Scan Passenger QR'}</span>
                </button>
              </div>
            </div>

            {/* Shift Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div>
                <span className="text-neutral-500 block">{isAm ? 'የተሳፈሩ መንገደኞች' : 'Boarding Progress'}</span>
                <span className="text-base font-black text-neutral-900">
                  {driverManifest.filter((p) => p.boarded).length} / {driverManifest.length}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 block">{isAm ? 'የአሽከርካሪ ደረጃ' : 'Driver Rating'}</span>
                <span className="text-base font-black text-amber-600">4.9 ★</span>
              </div>

              <div>
                <span className="text-neutral-500 block">{isAm ? 'የደህንነት ምጣኔ' : 'Safety Score'}</span>
                <span className="text-base font-black text-emerald-700">99.4%</span>
              </div>

              <div>
                <span className="text-neutral-500 block">{isAm ? 'የፍጥነት መቆጣጠሪያ' : 'Speed Governor'}</span>
                <span className="text-base font-black text-neutral-900">{driverSpeed} km/h (Limit: 80)</span>
              </div>
            </div>
          </div>

          {/* Passenger Manifest with One-Tap Boarding Check */}
          <div id="module-section-manifest" className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  {isAm ? 'የጉዞው ተሳፋሪዎች ማኒፌስት (Passenger Manifest)' : 'Live Passenger Boarding Manifest'}
                </h3>
                <span className="text-xs text-neutral-500">
                  {isAm ? 'ትኬት ያረጋገጡ እና የመሳፈሪያ በር ላይ ያሉ ተሳፋሪዎች' : 'Real-time check-in and luggage count'}
                </span>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
                <button
                  onClick={() => setManifestFilter('all')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition cursor-pointer ${
                    manifestFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  {isAm ? 'ሁሉም' : 'All'} ({driverManifest.length})
                </button>
                <button
                  onClick={() => setManifestFilter('boarded')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition cursor-pointer ${
                    manifestFilter === 'boarded' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  {isAm ? 'የተሳፈሩ' : 'Boarded'} ({driverManifest.filter((p) => p.boarded).length})
                </button>
                <button
                  onClick={() => setManifestFilter('pending')}
                  className={`px-2.5 py-1 font-semibold rounded-md transition cursor-pointer ${
                    manifestFilter === 'pending' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  {isAm ? 'ቀሪዎች' : 'Pending'} ({driverManifest.filter((p) => !p.boarded).length})
                </button>
              </div>
            </div>

            {/* Manifest Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                    <th className="pb-2">{isAm ? 'ትኬት ቁጥር' : 'Ticket ID'}</th>
                    <th className="pb-2">{isAm ? 'የተሳፋሪ ስም' : 'Passenger Name'}</th>
                    <th className="pb-2">{isAm ? 'ስልክ ቁጥር' : 'Phone'}</th>
                    <th className="pb-2">{isAm ? 'ወንበር' : 'Seat(s)'}</th>
                    <th className="pb-2">{isAm ? 'ሻንጣ' : 'Bags'}</th>
                    <th className="pb-2">{isAm ? 'ሁኔታ' : 'Status'}</th>
                    <th className="pb-2 text-right">{isAm ? 'እርምጃ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {driverManifest
                    .filter((p) => {
                      if (manifestFilter === 'boarded') return p.boarded;
                      if (manifestFilter === 'pending') return !p.boarded;
                      return true;
                    })
                    .map((item) => (
                      <tr key={item.ticketId} className="hover:bg-neutral-50/80 transition">
                        <td className="py-2.5 font-mono font-medium text-neutral-700">{item.ticketId}</td>
                        <td className="py-2.5 font-bold text-neutral-900">
                          {item.passengerName}
                          <span className="block text-[10px] text-neutral-400 font-mono">{item.nationalIdOrPassport}</span>
                        </td>
                        <td className="py-2.5 text-neutral-600">{item.passengerPhone}</td>
                        <td className="py-2.5 font-semibold text-neutral-900">#{item.seatNumbers.join(', #')}</td>
                        <td className="py-2.5 text-neutral-600">{item.luggageCount} pcs</td>
                        <td className="py-2.5">
                          {item.boarded ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isAm ? 'ተሳፍረዋል' : 'Boarded'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{isAm ? 'ይጠበቃሉ' : 'Waiting'}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleToggleBoarding(item.ticketId)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                              item.boarded
                                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            }`}
                          >
                            {item.boarded ? (isAm ? 'ሰርዝ' : 'Undo') : isAm ? 'አሳፍር' : 'Check In'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-Column: Pre-Trip Inspection & Incident Broadcast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Readiness Checklist */}
            <div id="module-section-safety_check" className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'የቅድመ-ጉዞ ቴክኒካልና ደህንነት ፍተሻ' : 'Pre-Trip Vehicle Safety Checklist'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'የአማራ ትራንስፖርት ደንብ መሰረት የተረጋገጠ' : 'Amhara Transport Authority safety protocol'}
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'tiresInspection', label: 'ጎማዎችና የአየር ግፊት ፍተሻ (Tires & Pressure)' },
                  { key: 'brakesAndFluid', label: 'ፍሬንና የዘይት መጠን (Brakes & Fluid Levels)' },
                  { key: 'engineAndCoolant', label: 'ሞተርና ራዲያተር ኩላንት (Engine & Coolant)' },
                  { key: 'emergencyKitAndExtinguisher', label: 'የመጀመሪያ እርዳታና እሳት ማጥፊያ (First Aid & Extinguisher)' },
                  { key: 'gpsTransponderOnline', label: 'የGPS መከታተያና የፍጥነት ገደብ (GPS & Speed Governor)' },
                  { key: 'terminalSecurityPermitSigned', label: 'የመናኸሪያው የደህንነት ፈቃድ ፊርማ (Terminal Security Permit)' },
                ].map(({ key, label }) => {
                  const isChecked = vehicleChecklist[key as keyof VehicleReadinessChecklist];
                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleChecklistItem(key as keyof VehicleReadinessChecklist)}
                      className="p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 transition flex items-center justify-between cursor-pointer select-none"
                    >
                      <span className="text-neutral-800 font-medium">{label}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isChecked
                            ? 'bg-emerald-700 border-emerald-700 text-white'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSignInspection}
                disabled={checklistSigned}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                  checklistSigned
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {checklistSigned
                    ? isAm ? '✅ ፍተሻው በዲጂታል ፊርማ ጸድቋል' : '✅ Digitally Signed & Certified'
                    : isAm ? 'ፍተሻውን ፈርመህ አጽድቅ' : 'Sign & Submit Inspection'}
                </span>
              </button>
            </div>

            {/* Road Incident Reporting */}
            <div id="module-section-incident" className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'የመንገድ ሁኔታና መዘግየት ማንቂያ ላክ' : 'Report Road Hazard & Delay'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'ወደ መናኸሪያው መቆጣጠሪያ ማዕከል ወዲያውኑ ይላኩ' : 'Broadcasts live notice to regional dispatch'}
                  </span>
                </div>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>

              <form onSubmit={handleReportRoadIncident} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  value={roadIncidentText}
                  onChange={(e) => setRoadIncidentText(e.target.value)}
                  placeholder={
                    isAm
                      ? 'ምሳሌ፡ በተርማበር ዋሻ አካባቢ ከባድ ጭጋግ አለ፤ ፍጥነት ቀንሰናል...'
                      : 'E.g., Dense fog near Termaber Pass Tunnel; transit speed reduced to 35 km/h...'
                  }
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-xs"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {incidentSubmitted ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>{isAm ? 'መልዕክቱ ተልኳል!' : 'Report Dispatched!'}</span>
                      </span>
                    ) : (
                      isAm ? 'ማንቂያው ለሁሉም ተሳፋሪዎች ይታያል' : 'Alert will alert passengers & terminals'
                    )}
                  </span>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ላክ' : 'Send Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ROLE 3: BUS OWNER / FLEET OPERATOR DASHBOARD */}
      {/* ============================================================ */}
      {activeRoleTab === 'bus_owner' && (
        <div className="space-y-6">
          {/* Top Fleet KPI Cards */}
          <div id="module-section-financials" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.fleetActiveVehicles}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-neutral-900">
                  {fleetVehicles.filter((v) => v.status === 'on_route' || v.status === 'boarding').length}
                </span>
                <span className="text-xs text-neutral-400 font-medium">/ {fleetVehicles.length}</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                {isAm ? 'በአገልግሎት ላይ ያሉ አውቶቡሶች' : 'Active on regional corridors'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.fleetTotalRevenue}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-700">
                  {operatorFinancials.todayGrossETB.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400 font-medium">ETB</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'የተጣራ ትርፍ፡' : 'Net Margin:'} <strong>{operatorFinancials.netProfitETB.toLocaleString()} ETB</strong>
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.fleetOccupancyRate}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">91.4%</span>
                <span className="text-xs text-emerald-800 font-medium">Avg</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {operatorFinancials.ticketsSoldToday} {isAm ? 'ትኬቶች ዛሬ ተሽጠዋል' : 'tickets sold today'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.fleetMaintenanceCount}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">
                  {fleetVehicles.filter((v) => v.status === 'maintenance').length}
                </span>
                <span className="text-xs text-neutral-400 font-medium">{isAm ? 'አውቶቡስ' : 'Coach'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'የቴክኒክ ምርመራ በቅርብ ቀን' : 'Next service: 2 days'}
              </span>
            </div>
          </div>

          {/* Fleet Vehicles Inventory Table */}
          <div id="module-section-fleet" className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  {isAm ? 'የተሽከርካሪዎች ፍሊት አስተዳደር' : 'Enterprise Bus Fleet Roster'}
                </h3>
                <span className="text-xs text-neutral-500">
                  Tana Express Coach Services SC · {isAm ? 'ፈቃድ ቁጥር፡' : 'License:'} AMH-FLEET-2024-884
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddTripModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAm ? 'አዲስ ጉዞ ጨምር' : 'Schedule Departure'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                    <th className="pb-2">{isAm ? 'የሰሌዳ ቁጥር' : 'Plate No.'}</th>
                    <th className="pb-2">{isAm ? 'የተሽከርካሪ ሞዴል' : 'Model & Category'}</th>
                    <th className="pb-2">{isAm ? 'የአሁን መስመር' : 'Current Corridor'}</th>
                    <th className="pb-2">{isAm ? 'ሹፌር' : 'Assigned Driver'}</th>
                    <th className="pb-2">{isAm ? 'የመቀመጫ ምጣኔ' : 'Occupancy'}</th>
                    <th className="pb-2">{isAm ? 'ነዳጅ' : 'Fuel'}</th>
                    <th className="pb-2">{isAm ? 'ሁኔታ' : 'Status'}</th>
                    <th className="pb-2 text-right">{isAm ? 'እርምጃ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {fleetVehicles.map((vehicle) => (
                    <tr key={vehicle.plateNumber} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 font-mono font-bold text-neutral-900">{vehicle.plateNumber}</td>
                      <td className="py-3">
                        <span className="font-bold text-neutral-900 block">{vehicle.model}</span>
                        <span className="text-[10px] text-neutral-400">{vehicle.category} · {vehicle.totalSeats} seats</span>
                      </td>
                      <td className="py-3 text-neutral-700 font-medium">{vehicle.currentRoute}</td>
                      <td className="py-3 text-neutral-700">
                        {vehicle.activeDriverName}
                        <span className="block text-[10px] text-neutral-400">{vehicle.activeDriverPhone}</span>
                      </td>
                      <td className="py-3">
                        <div className="w-24 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vehicle.occupancyPercent > 80 ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${vehicle.occupancyPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-0.5 block">{vehicle.occupancyPercent}% full</span>
                      </td>
                      <td className="py-3 text-neutral-700 font-mono">{vehicle.fuelLevelPercent}%</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            vehicle.status === 'on_route'
                              ? 'text-emerald-800'
                              : vehicle.status === 'boarding'
                              ? 'text-blue-800'
                              : vehicle.status === 'maintenance'
                              ? 'text-rose-800'
                              : 'text-neutral-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              vehicle.status === 'on_route'
                                ? 'bg-emerald-600'
                                : vehicle.status === 'boarding'
                                ? 'bg-blue-600'
                                : vehicle.status === 'maintenance'
                                ? 'bg-rose-600'
                                : 'bg-neutral-400'
                            }`}
                          />
                          <span className="capitalize">{vehicle.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleVehicleStatus(vehicle.plateNumber)}
                          className="px-2.5 py-1 rounded-lg font-bold text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition cursor-pointer"
                        >
                          {isAm ? 'ቀይር' : 'Toggle Status'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Breakdown & Scheduled Trips Modal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Payout Channels */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'የገቢና ወጪ ሂሳብ ማጠቃለያ' : 'Financial Statement & Disbursements'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'ቴሌብርና CBE ክፍያዎች በቀጥታ' : 'Direct merchant payouts'}
                  </span>
                </div>
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 block">{isAm ? 'የዛሬ አጠቃላይ ሽያጭ' : "Today's Gross Sales"}</span>
                    <span className="text-[11px] text-neutral-500">Telebirr Merchant (58%) · CBE Birr (32%) · Cash (10%)</span>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{operatorFinancials.todayGrossETB.toLocaleString()} ETB</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 block">{isAm ? 'የናፍጣ ነዳጅ ወጪ' : 'Estimated Diesel Fuel Cost'}</span>
                    <span className="text-[11px] text-neutral-500">420 Liters total consumption</span>
                  </div>
                  <span className="text-sm font-black text-rose-700">-{operatorFinancials.fuelExpenseETB.toLocaleString()} ETB</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-neutral-900 block">{isAm ? 'የአሽከርካሪዎች አበልና ክፍያ' : 'Driver Shift Allowances'}</span>
                    <span className="text-[11px] text-neutral-500">8 certified commercial drivers</span>
                  </div>
                  <span className="text-sm font-black text-rose-700">-{operatorFinancials.driverAllowancesETB.toLocaleString()} ETB</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-950 block">{isAm ? 'የተጣራ የኦፕሬተር ትርፍ' : 'Net Operator Margin'}</span>
                    <span className="text-[11px] text-emerald-700">After all terminal bay tariffs</span>
                  </div>
                  <span className="text-base font-black text-emerald-900">+{operatorFinancials.netProfitETB.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Payout Bank Info & Compliance */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'የባንክ አካውንትና ህጋዊ ፈቃድ' : 'Settlement Account & Compliance'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'የንግድ ምዝገባና ኢንሹራንስ' : 'Commercial registration & insurance'}
                  </span>
                </div>
                <Building2 className="w-4 h-4 text-blue-700" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                  <span className="text-neutral-500 block">{isAm ? 'የባንክ ክፍያ መቀበያ አካውንት፡' : 'Settlement Payout Account:'}</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">Commercial Bank of Ethiopia (CBE) 1000192837465</span>
                  <span className="text-[11px] text-neutral-400 block">Account Name: Tana Express Coach Services SC</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                  <span className="text-neutral-500 block">{isAm ? 'ቴሌብር ነጋዴ ኮድ (Merchant Till):' : 'Telebirr Merchant Till:'}</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">TILL-994102</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">Instant Settlement Enabled</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <span className="text-neutral-600">{isAm ? 'የኢንሹራንስ ሁኔታ፡' : 'Fleet Third-Party Insurance:'}</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isAm ? 'ሙሉ ዋስትና ያለው (Valid)' : 'Active (EIC #99214)'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Trip Modal */}
          {isAddTripModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-neutral-900">
                    {isAm ? 'አዲስ የጉዞ መርሐ-ግብር ጨምር' : 'Schedule New Corridor Departure'}
                  </h3>
                  <button
                    onClick={() => setIsAddTripModalOpen(false)}
                    className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewTrip} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'መነሻ መናኸሪያ' : 'Origin Terminal'}</label>
                      <select
                        value={newTripOrigin}
                        onChange={(e) => setNewTripOrigin(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      >
                        {AMHARA_STATIONS.map((st) => (
                          <option key={st.id} value={st.id}>{isAm ? st.nameAm : st.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'መድረሻ መናኸሪያ' : 'Destination'}</label>
                      <select
                        value={newTripDest}
                        onChange={(e) => setNewTripDest(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      >
                        {AMHARA_STATIONS.map((st) => (
                          <option key={st.id} value={st.id}>{isAm ? st.nameAm : st.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የመነሻ ሰዓት' : 'Departure Time'}</label>
                      <input
                        type="text"
                        value={newTripTime}
                        onChange={(e) => setNewTripTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የቲኬት ዋጋ (ብር)' : 'Fare Price (ETB)'}</label>
                      <input
                        type="number"
                        value={newTripPrice}
                        onChange={(e) => setNewTripPrice(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የሚመደበው አውቶቡስ' : 'Assign Coach'}</label>
                      <select
                        value={newTripVehicle}
                        onChange={(e) => setNewTripVehicle(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      >
                        {fleetVehicles.map((v) => (
                          <option key={v.plateNumber} value={v.plateNumber}>{v.plateNumber} ({v.model.slice(0, 20)}...)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የአውቶቡስ ምድብ' : 'Vehicle Category'}</label>
                      <select
                        value={newTripCategory}
                        onChange={(e) => setNewTripCategory(e.target.value as VehicleCategory)}
                        className="w-full p-2.5 rounded-xl border border-neutral-300 font-medium"
                      >
                        <option value="Luxury Coach">Luxury Coach</option>
                        <option value="Standard Express">Standard Express</option>
                        <option value="Coaster Bus">Coaster Bus</option>
                        <option value="Minibus Dolphin">Minibus Dolphin</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddTripModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl cursor-pointer shadow-xs"
                    >
                      {isAm ? 'መርሐ-ግብሩን አጽድቅ' : 'Publish Departure'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* ROLE 4: ADMINISTRATION & DISPATCH DASHBOARD */}
      {/* ============================================================ */}
      {activeRoleTab === 'admin' && (
        <div className="space-y-6">
          {/* Top Admin KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.adminTerminalsActive}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-700">15</span>
                <span className="text-xs text-emerald-800 font-medium">{isAm ? 'ኦንላይን' : 'Online'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'በሁሉም 11 ዞኖች' : 'Across all 11 zones'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.adminCongestionIndex}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-neutral-900">Normal</span>
                <span className="text-xs text-emerald-800 font-medium">L2 Flow</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'አማካይ መዘግየት፡ 8 ደቂቃ' : 'Average delay: 8 min'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.adminActiveAdvisories}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600">
                  {adminAlerts.filter((a) => a.isActive).length}
                </span>
                <span className="text-xs text-amber-700 font-medium">{isAm ? 'ንቁ' : 'Active'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? 'ጭጋግና የመንገድ ጥገና' : 'Fog & Roadworks'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-xs">
              <span className="text-xs text-neutral-500 font-medium block">
                {t.adminDailyDispatches}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-700">142</span>
                <span className="text-xs text-emerald-800 font-medium">{isAm ? 'አውቶቡሶች' : 'Buses'}</span>
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block">
                {isAm ? '4,820 ተሳፋሪዎች ተጉዘዋል' : '4,820 passengers transported'}
              </span>
            </div>
          </div>

          {/* Regional Terminals Grid with Direct Congestion Control */}
          <div id="module-section-traffic_radar" className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  {isAm ? 'የክልሉ 15 መናኸሪያዎች ቀጥታ ኦፕሬሽን' : 'Live Operations: 15 Amhara Terminals'}
                </h3>
                <span className="text-xs text-neutral-500">
                  {isAm ? 'የትራፊክ መጨናነቅ እና የመጫኛ በሮች ምጣኔ ቁጥጥር' : 'Monitor platform queues, bay occupancy, and gate access'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AMHARA_STATIONS.slice(0, 6).map((station) => {
                const traffic = terminalTraffic[station.id];
                const congestion = traffic?.congestionLevel || 'low';
                return (
                  <div
                    key={station.id}
                    className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">
                        {isAm ? station.nameAm : station.name}
                      </span>
                      <span
                        className={`font-semibold capitalize px-2 py-0.5 rounded-md text-[10px] ${
                          congestion === 'low'
                            ? 'bg-emerald-100 text-emerald-800'
                            : congestion === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {congestion} Flow
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>{isAm ? 'የመጫኛ በሮች፡' : 'Bays:'} {station.baysCount}</span>
                      <span>{isAm ? 'መዘግየት፡' : 'Delay:'} {traffic?.averageDelayMin || 5}m</span>
                      <span>{isAm ? 'ዞን፡' : 'Zone:'} {station.zone}</span>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400">{isAm ? 'መጨናነቅ ቀይር፡' : 'Adjust Level:'}</span>
                      <div className="flex items-center gap-1">
                        {(['low', 'moderate', 'heavy'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => handleUpdateTerminalCongestion(station.id, lvl)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                              congestion === lvl
                                ? 'bg-neutral-900 text-white'
                                : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                            }`}
                          >
                            {lvl[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Advisory Broadcast System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Issue New Advisory Form */}
            <div id="module-section-alerts_broadcast" className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'አዲስ የጥንቃቄ ወይም የአስቸኳይ ጊዜ መልዕክት ላክ' : 'Issue Official Road & Transit Advisory'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {isAm ? 'ለአሽከርካሪዎችና ለተሳፋሪዎች ወዲያውኑ ይደርሳል' : 'Pushes instantly to passenger app & drivers'}
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-rose-700" />
              </div>

              <form onSubmit={handleBroadcastNewAlert} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    {isAm ? 'የመልዕክቱ ርዕስ' : 'Advisory Headline'}
                  </label>
                  <input
                    type="text"
                    value={newAlertTitle}
                    onChange={(e) => setNewAlertTitle(e.target.value)}
                    placeholder={
                      isAm
                        ? 'በወረታ ድልድይ አቅራቢያ የመንገድ ጥገና...'
                        : 'Single-lane convoy in effect near Wereta junction...'
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    {isAm ? 'ዝርዝር መልዕክት' : 'Detailed Instructions & Speed Limits'}
                  </label>
                  <textarea
                    rows={3}
                    value={newAlertMessage}
                    onChange={(e) => setNewAlertMessage(e.target.value)}
                    placeholder={
                      isAm
                        ? 'በአካባቢው ያለውን የትራፊክ ፍጥነት ወደ 30 ኪ.ሜ/ሰ ይቀንሱ...'
                        : 'Speed limit reduced to 30 km/h for all intercity buses on A2 corridor...'
                    }
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የአደጋ ደረጃ' : 'Severity'}</label>
                    <select
                      value={newAlertSeverity}
                      onChange={(e) => setNewAlertSeverity(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-neutral-300 font-medium"
                    >
                      <option value="advisory">Advisory</option>
                      <option value="warning">Warning</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">{isAm ? 'የሚመለከተው መናኸሪያ' : 'Target Station'}</label>
                    <select
                      value={newAlertTargetStation}
                      onChange={(e) => setNewAlertTargetStation(e.target.value)}
                      className="w-full p-2 rounded-xl border border-neutral-300 font-medium"
                    >
                      <option value="all">{isAm ? 'ሁሉም 15 መናኸሪያዎች' : 'All 15 Stations'}</option>
                      {AMHARA_STATIONS.map((st) => (
                        <option key={st.id} value={st.id}>{st.city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {alertBroadcastSuccess ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAm ? 'መልዕክቱ ተሰራጭቷል!' : 'Advisory Active & Broadcasted!'}</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAm ? 'መልዕክቱን አሰራጭ' : 'Broadcast Advisory'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Active Advisories List */}
            <div className="p-5 bg-white rounded-2xl border border-neutral-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {isAm ? 'በስራ ላይ ያሉ የጥንቃቄ መልዕክቶች' : 'Active Broadcasted Advisories'}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {adminAlerts.filter((a) => a.isActive).length} {isAm ? 'መልዕክቶች ክፍት ናቸው' : 'currently active'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {adminAlerts.map((notice) => (
                  <div
                    key={notice.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
                      notice.isActive
                        ? notice.severity === 'emergency'
                          ? 'bg-rose-50/80 border-rose-300'
                          : notice.severity === 'warning'
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-blue-50/80 border-blue-300'
                        : 'bg-neutral-50 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle
                          className={`w-3.5 h-3.5 ${
                            notice.severity === 'emergency'
                              ? 'text-rose-600'
                              : notice.severity === 'warning'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        />
                        <span className="text-neutral-900">
                          {isAm ? notice.titleAm : notice.titleEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">{notice.issuedAt}</span>
                    </div>

                    <p className="text-neutral-700 leading-relaxed">
                      {isAm ? notice.messageAm : notice.messageEn}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-neutral-500">
                        {isAm ? 'ያወጣው፡' : 'Staff:'} {notice.issuedByStaffId}
                      </span>
                      <button
                        onClick={() => handleToggleAdminAlert(notice.id)}
                        className="px-2 py-0.5 rounded font-bold text-[10px] bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 transition cursor-pointer"
                      >
                        {notice.isActive ? (isAm ? 'አጥፋ' : 'Deactivate') : isAm ? 'መልስ' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. ANDROID STUDIO & GOOGLE PLAY STORE DEPLOYMENT CONSOLE */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base text-white">
                      {isAm ? 'የአንድሮይድ ስቱዲዮ እና Google Play Store ማሰራጫ ማዕከል' : 'Android Studio & Google Play Store Deployment Center'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Target SDK 34
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isAm
                      ? 'የተሟላ የKotlin ፕሮጀክት በ /android ፎልደር ውስጥ ይገኛል። በAndroid Studio ከፍተው APK ወይም Google Play App Bundle (.aab) ማዘጋጀት ይችላሉ።'
                      : 'Complete native Kotlin project ready in /android directory. Open in Android Studio to build APK or signed Google Play App Bundle (.aab).'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shrink-0">
                <span className="text-emerald-400 font-bold">● et.busride.amhara</span>
                <span>v1.0.0</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-medium">{isAm ? 'የፕሮጀክት አድራሻ' : 'Project Directory'}</span>
                <span className="font-mono text-emerald-300 font-bold mt-1 block">/android</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-medium">{isAm ? 'ዒላማ ስርዓት' : 'Target SDK'}</span>
                <span className="font-bold text-white mt-1 block">34 (Android 14/15)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-medium">{isAm ? 'ዝቅተኛ ስርዓት' : 'Min SDK'}</span>
                <span className="font-bold text-white mt-1 block">24 (Android 7.0+)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block font-medium">{isAm ? 'ዲጂታል ማረጋገጫ' : 'AssetLinks'}</span>
                <span className="font-bold text-emerald-400 mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>

            {/* Deployment Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {onOpenAndroidModal && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onOpenAndroidModal('studio');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-xs"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{isAm ? 'የአንድሮይድ ስቱዲዮ መመሪያ' : 'Open in Android Studio Guide'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onOpenAndroidModal('playstore');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isAm ? 'የGoogle Play Store ማሰራጫ መንገድ' : 'Google Play Console Roadmap'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onOpenAndroidModal('keystore');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ኪይስቶር እና AssetLinks' : 'Keystore & AssetLinks'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onOpenAndroidModal('preview');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer border border-slate-700"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAm ? 'የሞባይል ቅድመ እይታ' : 'Mobile App Simulator'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen-Reader Optimized Quick Actions Modal */}
      <DashboardQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        lang={lang}
        actions={quickActionsList}
        announcement={screenReaderAnnouncement}
        onAnnounce={announceToScreenReader}
        triggerRef={quickActionsTriggerRef}
      />

      {/* Interactive USSD Simulator Modal */}
      {selectedTicketForUssd && (
        <UssdSimulatorModal
          isOpen={isUssdModalOpen}
          onClose={() => setIsUssdModalOpen(false)}
          ticket={selectedTicketForUssd}
          lang={lang}
        />
      )}

      {/* 24/7 Call Center Information & Dispatch Directory Modal */}
      <CallCenterModal
        isOpen={isCallCenterModalOpen}
        onClose={() => setIsCallCenterModalOpen(false)}
        ticket={selectedTicketForCallCenter || primaryTicket || undefined}
        lang={lang}
      />
    </div>
  );
};

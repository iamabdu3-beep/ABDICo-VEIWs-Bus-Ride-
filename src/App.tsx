/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  RideTrip,
  RideShareOffer,
  BookingTicket,
  TripFeedback,
  BusStation,
  DriverContactContext,
  UserProfile,
  UserRole,
  TerminalDisruptionAlert,
  PreferredTerminalSettings,
  AppCategory,
  AppModule,
} from './types';
import {
  AMHARA_STATIONS,
  INITIAL_RIDE_TRIPS,
  INITIAL_RIDESHARE_OFFERS,
} from './data/amharaStations';
import { MOCK_USERS } from './data/mockUsers';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
import { CategoryNavigation } from './components/CategoryNavigation';
import { StationMap } from './components/StationMap';
import { RideBooking } from './components/RideBooking';
import { LiveBusTracker } from './components/LiveBusTracker';
import { StationDirectory } from './components/StationDirectory';
import { RideSharePool } from './components/RideSharePool';
import { SeatPickerModal } from './components/SeatPickerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { PostRideModal } from './components/PostRideModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { DriverChatModal } from './components/DriverChatModal';
import { DepartureNotificationToast } from './components/DepartureNotificationToast';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { TripPlannerView } from './components/TripPlannerView';
import { EthiopiaInterconnectExplorer } from './components/EthiopiaInterconnectExplorer';
import { DashboardView } from './components/DashboardView';
import { AndroidAppModal } from './components/AndroidAppModal';
import { OfflineBanner } from './components/OfflineBanner';
import { LoginModal } from './components/LoginModal';
import { FrontHeroBanner } from './components/FrontHeroBanner';
import { DriverPortalModal } from './components/DriverPortalModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';
import { TerminalDisruptionToast } from './components/TerminalDisruptionToast';
import { TerminalDisruptionModal } from './components/TerminalDisruptionModal';
import { UssdDialerModal } from './components/UssdDialerModal';
import { CallCenterModal } from './components/CallCenterModal';
import { terminalMonitorService } from './services/terminalMonitorService';
import { triggerHaptic, playHighContrastToggleSound } from './utils/haptics';
import {
  DepartureAlertInfo,
  calculateMinutesRemaining,
  formatMinutesToTimeString,
  parseTimeToMinutes,
  playTransitChime,
  triggerNativeNotification,
} from './utils/departureScheduler';
import {
  Bus,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Globe,
  Sparkles,
  Phone,
  Smartphone,
  MessageSquare,
  ChevronUp,
} from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useLanguage } from './context/LanguageContext';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const { lang, setLang, toggleLang, isAm, t } = useLanguage();
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<
    'booking' | 'planner' | 'map' | 'tracker' | 'directory' | 'carpool' | 'dashboard'
  >('booking');

  // Category-based Modular Architecture State
  const [currentCategory, setCurrentCategory] = useState<AppCategory>('users');
  const [activeModule, setActiveModule] = useState<AppModule>('booking');

  // Search station state
  const [originStationId, setOriginStationId] = useState<string>('bahir-dar');
  const [destStationId, setDestStationId] = useState<string>('gondar');

  // Network state
  const [trips, setTrips] = useState<RideTrip[]>(INITIAL_RIDE_TRIPS);
  const [offers, setOffers] = useState<RideShareOffer[]>(
    INITIAL_RIDESHARE_OFFERS
  );

  // Initial demo confirmed ticket so users can immediately test the digital boarding pass
  const initialTicket: BookingTicket = {
    ticketId: 'ETH-AMH-784102',
    tripId: 'trip-bd-gon-1',
    passengerName: 'Abebe Bikila',
    passengerPhone: '+251 91 123 4567',
    nationalIdOrPassport: 'FAYDA-882194',
    fromStation: AMHARA_STATIONS[0], // Bahir Dar
    toStation: AMHARA_STATIONS[1], // Gondar
    departureTime: '06:30 AM',
    departureDate: '2026-09-15',
    seatNumbers: [12, 13],
    totalFareETB: 640,
    vehicleType: 'Luxury Coach',
    busCompany: 'Selam Bus',
    plateNumber: 'ET 03-A88219',
    bayNumber: 4,
    paymentMethod: 'Telebirr',
    paymentRef: 'TEL-94810234',
    bookingTimestamp: '08:45 AM',
    luggagePieces: 2,
    driverName: 'Captain Fasil Demeke',
    driverPhone: '+251 91 876 5432',
    qrPayload:
      'PASS:ETH-AMH-784102|NAME:Abebe Bikila|ROUTE:bahir-dar->gondar|SEATS:12,13|FARE:640ETB',
    status: 'confirmed',
    ussdCode: '*805*1*784102#',
    callCenterNumber: '994',
    callCenterDispatch: '+251 58 220 0110',
    callCenterHours: '24/7 Toll-Free Support',
  };

  const [tickets, setTickets] = useState<BookingTicket[]>([initialTicket]);

  // Departure Alert & Transit Schedule Clock State
  // Initial transit clock set to 06:05 AM (365 mins from midnight)
  // which is 25 minutes prior to initialTicket's 06:30 AM departure time!
  const [transitClockMinutes, setTransitClockMinutes] = useState<number>(365);
  const [activeDepartureAlert, setActiveDepartureAlert] =
    useState<DepartureAlertInfo | null>(null);
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1500); // 25 mins in seconds
  const [snoozeUntilTime, setSnoozeUntilTime] = useState<number | null>(null);

  // Modals state
  const [seatPickerTrip, setSeatPickerTrip] = useState<RideTrip | null>(null);
  const [checkoutTripData, setCheckoutTripData] = useState<{
    trip: RideTrip;
    seats: number[];
  } | null>(null);
  const [activeTicketView, setActiveTicketView] =
    useState<BookingTicket | null>(null);
  const [luggageTrackingTicket, setLuggageTrackingTicket] =
    useState<BookingTicket | null>(null);
  const [activeDriverContact, setActiveDriverContact] =
    useState<DriverContactContext | null>(null);
  const [myTicketsOpen, setMyTicketsOpen] = useState(false);
  const [postRideOpen, setPostRideOpen] = useState(false);

  // User Authentication & Role Console Modals
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USERS[0]);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [preferredLoginRole, setPreferredLoginRole] = useState<UserRole>('passenger');
  const [driverPortalOpen, setDriverPortalOpen] = useState<boolean>(false);
  const [driverPortalInitialSubTab, setDriverPortalInitialSubTab] = useState<'manifest' | 'checklist' | 'telemetry' | 'badges'>('manifest');
  const [adminPortalOpen, setAdminPortalOpen] = useState<boolean>(false);
  const [supportHubOpen, setSupportHubOpen] = useState<boolean>(false);

  // Accessibility & High Contrast Mode (Consistent with Android Accessibility Standards)
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bus_ride_high_contrast') === 'true';
    }
    return false;
  });
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState<boolean>(false);
  const [largeTextMode, setLargeTextMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bus_ride_large_text') === 'true';
    }
    return false;
  });
  const [audioFeedback, setAudioFeedback] = useState<boolean>(true);

  // Proactive Terminal Disruption Monitor State
  const [activeTerminalDisruptionAlert, setActiveTerminalDisruptionAlert] =
    useState<TerminalDisruptionAlert | null>(null);
  const [terminalMonitorModalOpen, setTerminalMonitorModalOpen] = useState<boolean>(false);
  const [terminalAlertsMap, setTerminalAlertsMap] = useState<Record<string, TerminalDisruptionAlert>>(
    terminalMonitorService.getAlerts()
  );
  const [preferredTerminalSettings, setPreferredTerminalSettings] = useState<PreferredTerminalSettings>(
    terminalMonitorService.getSettings()
  );

  // USSD Dialer & 24/7 Call Center Global Modal State
  const [ussdDialerOpen, setUssdDialerOpen] = useState<boolean>(false);
  const [callCenterOpen, setCallCenterOpen] = useState<boolean>(false);
  const [ussdInitialCode, setUssdInitialCode] = useState<string | undefined>(undefined);
  const [ussdInitialTab, setUssdInitialTab] = useState<'dialer' | 'session' | 'sms_template'>('dialer');

  const handleOpenUssdDialer = (code?: string, tab: 'dialer' | 'session' | 'sms_template' = 'dialer') => {
    triggerHaptic(12);
    setUssdInitialCode(code);
    setUssdInitialTab(tab);
    setUssdDialerOpen(true);
  };

  const handleOpenCallCenter = () => {
    triggerHaptic(12);
    setCallCenterOpen(true);
  };

  // Category and Module Selection Handlers
  const handleSelectCategory = (category: AppCategory) => {
    triggerHaptic(12);
    setCurrentCategory(category);
    if (category === 'users') {
      setActiveModule('booking');
      setActiveTab('booking');
    } else if (category === 'driver') {
      setActiveModule('cockpit');
      setActiveTab('dashboard');
    } else if (category === 'administration') {
      setActiveModule('traffic_radar');
      setActiveTab('dashboard');
    } else if (category === 'business_owners') {
      setActiveModule('fleet');
      setActiveTab('dashboard');
    }
  };

  const handleSelectModule = (mod: AppModule) => {
    triggerHaptic(10);
    setActiveModule(mod);
    if (['booking', 'planner', 'map', 'tracker', 'directory', 'carpool', 'tickets'].includes(mod)) {
      setCurrentCategory('users');
      if (mod === 'tickets') {
        setMyTicketsOpen(true);
      } else {
        setActiveTab(mod as any);
      }
    } else if (['cockpit', 'manifest', 'safety_check', 'incident', 'comm', 'badges'].includes(mod)) {
      setCurrentCategory('driver');
      setActiveTab('dashboard');
      if (mod === 'badges') {
        const driverUser = MOCK_USERS.find((u) => u.role === 'driver') || MOCK_USERS[1];
        if (currentUser?.role !== 'driver') {
          setCurrentUser(driverUser);
        }
        setDriverPortalInitialSubTab('badges');
        setDriverPortalOpen(true);
      } else if (mod === 'comm') {
        setActiveDriverContact({
          driverName: 'Captain Kassahun Worku',
          driverPhone: '+251 91 876 5432',
          driverRating: 4.9,
          vehiclePlate: 'ET 03-A88219',
          companyOrModel: 'Selam Bus Line SC',
          routeTitle: 'Bahir Dar ➔ Gondar',
          departureTime: '06:30 AM',
          bayNumber: 4,
          passengerName: 'Abebe Bikila',
        });
      }
    } else if (['traffic_radar', 'alerts_broadcast', 'bays_control', 'corridors_audit', 'weather_monitor'].includes(mod)) {
      setCurrentCategory('administration');
      setActiveTab('dashboard');
      if (mod === 'weather_monitor') {
        setTerminalMonitorModalOpen(true);
      }
    } else if (['fleet', 'financials', 'dispatch_trip', 'roster', 'company_profile'].includes(mod)) {
      setCurrentCategory('business_owners');
      setActiveTab('dashboard');
    }
  };

  const handleSwitchToCategoryPersona = (category: AppCategory) => {
    triggerHaptic(15);
    let targetUser: UserProfile | undefined;
    if (category === 'users') {
      targetUser = MOCK_USERS.find((u) => u.id === 'usr-abebe');
    } else if (category === 'driver') {
      targetUser = MOCK_USERS.find((u) => u.id === 'drv-kassahun');
    } else if (category === 'administration') {
      targetUser = MOCK_USERS.find((u) => u.id === 'adm-yonas');
    } else if (category === 'business_owners') {
      targetUser = MOCK_USERS.find((u) => u.id === 'owner-belay');
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(
        lang === 'am'
          ? `የተመረጠ መለያ፡ ${targetUser.fullNameAm || targetUser.fullName} (${targetUser.role})`
          : `Active persona switched to ${targetUser.fullName} (${targetUser.role.toUpperCase()})`
      );
    }
  };

  // Proactive Terminal Disruption Monitor Subscriptions
  useEffect(() => {
    const unsubAlerts = terminalMonitorService.subscribeToAlerts((alerts) => {
      setTerminalAlertsMap(alerts);
      setPreferredTerminalSettings(terminalMonitorService.getSettings());
    });

    const unsubProactive = terminalMonitorService.subscribeToProactiveNotifications((alert) => {
      setActiveTerminalDisruptionAlert(alert);
    });

    // Check preferred terminal immediately on mount
    terminalMonitorService.checkPreferredTerminalStatus();

    return () => {
      unsubAlerts();
      unsubProactive();
    };
  }, []);

  // Synchronize high contrast styling on document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrastMode) {
        document.documentElement.classList.add('high-contrast');
        document.body.classList.add('high-contrast');
        document.documentElement.setAttribute('data-high-contrast', 'true');
        localStorage.setItem('bus_ride_high_contrast', 'true');
      } else {
        document.documentElement.classList.remove('high-contrast');
        document.body.classList.remove('high-contrast');
        document.documentElement.removeAttribute('data-high-contrast');
        localStorage.setItem('bus_ride_high_contrast', 'false');
      }
    }
  }, [highContrastMode]);

  // Synchronize font scaling for large text mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (largeTextMode) {
        document.documentElement.style.fontSize = '18px';
        localStorage.setItem('bus_ride_large_text', 'true');
      } else {
        document.documentElement.style.fontSize = '';
        localStorage.setItem('bus_ride_large_text', 'false');
      }
    }
  }, [largeTextMode]);

  const handleToggleHighContrast = (enabled: boolean) => {
    setHighContrastMode(enabled);
    triggerHaptic([20, 40, 20]);
    if (audioFeedback) {
      playHighContrastToggleSound(enabled);
    }
    showToast(
      lang === 'am'
        ? enabled
          ? 'ከፍተኛ የንፅፅር ሁነታ በርቷል (WCAG AAA 7:1)'
          : 'ከፍተኛ የንፅፅር ሁነታ ጠፍቷል'
        : enabled
        ? 'High Contrast Mode Enabled (WCAG AAA 7:1)'
        : 'High Contrast Mode Disabled'
    );
  };

  const handleOpenLogin = (role?: UserRole, mode: 'login' | 'signup' = 'login') => {
    if (role) setPreferredLoginRole(role);
    setAuthModalMode(mode);
    setLoginModalOpen(true);
  };

  const handleOpenSignUp = () => {
    setPreferredLoginRole('passenger');
    setAuthModalMode('signup');
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
    showToast(
      lang === 'en'
        ? `Logged in as ${user.fullName} (${user.role.toUpperCase()})`
        : `እንኳን ደህና መጡ፣ ${user.fullNameAm || user.fullName} (${user.role})`
    );
    if (user.role === 'driver') {
      setDriverPortalOpen(true);
    } else if (user.role === 'admin') {
      setAdminPortalOpen(true);
    } else if (user.role === 'bus_owner') {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setDriverPortalOpen(false);
    setAdminPortalOpen(false);
    showToast(lang === 'en' ? 'Signed out successfully' : 'በተሳካ ሁኔታ ወጥተዋል');
  };

  // Helper to open driver conversation modal from a ticket
  const handleContactDriverFromTicket = (ticket: BookingTicket) => {
    const context: DriverContactContext = {
      driverName: ticket.driverName || 'Captain Fasil Demeke',
      driverPhone: ticket.driverPhone || '+251 91 876 5432',
      driverRating: 4.9,
      vehiclePlate: ticket.plateNumber,
      vehicleType: ticket.vehicleType,
      companyOrModel: ticket.busCompany,
      routeTitle: `${ticket.fromStation.city} ➔ ${ticket.toStation.city}`,
      departureTime: ticket.departureTime,
      bayNumber: ticket.bayNumber,
      ticketId: ticket.ticketId,
      passengerName: ticket.passengerName,
    };
    setActiveDriverContact(context);
  };

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to construct DepartureAlertInfo from ticket
  const createAlertFromTicket = useCallback(
    (ticket: BookingTicket, diffMinutes: number): DepartureAlertInfo => {
      return {
        ticketId: ticket.ticketId,
        tripId: ticket.tripId,
        passengerName: ticket.passengerName,
        fromCity: ticket.fromStation.city,
        fromCityAm: ticket.fromStation.cityAm,
        fromStationName:
          lang === 'en' ? ticket.fromStation.name : ticket.fromStation.nameAm,
        toCity: ticket.toStation.city,
        toCityAm: ticket.toStation.cityAm,
        busCompany: ticket.busCompany,
        plateNumber: ticket.plateNumber,
        departureTime: ticket.departureTime,
        bayNumber: ticket.bayNumber,
        seatNumbers: ticket.seatNumbers,
        minutesRemaining: diffMinutes,
        secondsRemaining: Math.max(0, diffMinutes * 60),
        isUrgent: diffMinutes <= 15,
        triggeredAt: Date.now(),
      };
    },
    [lang]
  );

  // Check tickets against schedule clock for departure within 30 minutes
  const checkTicketsForDepartureAlert = useCallback(
    (clockMinutes: number, forceDisplay = false) => {
      if (snoozeUntilTime && Date.now() < snoozeUntilTime && !forceDisplay) {
        return;
      }

      for (const ticket of tickets) {
        const diff = calculateMinutesRemaining(ticket.departureTime, clockMinutes);
        if (diff !== null && diff > 0 && diff <= 30) {
          const alert = createAlertFromTicket(ticket, diff);
          setActiveDepartureAlert(alert);
          setSecondsRemaining(Math.max(0, diff * 60));
          setIsAlertDismissed(false);

          triggerNativeNotification(
            lang === 'en'
              ? `Amhara Transit: Bus departs in ${diff}m!`
              : `የአማራ ትራንስፖርት፡ አውቶቡሱ በ${diff} ደቂቃ ይነሳል!`,
            {
              body: `${ticket.busCompany} (${ticket.fromStation.city} ➔ ${ticket.toStation.city}) departs in ${diff} minutes from Bay #${ticket.bayNumber}.`,
              tag: `dep-${ticket.ticketId}`,
            }
          );
          return;
        }
      }
    },
    [tickets, snoozeUntilTime, createAlertFromTicket, lang]
  );

  // Manual Trigger / Simulation for 30-min departure alert
  const handleTriggerSimulatedAlert = (targetTicket?: BookingTicket) => {
    const ticketToAlert = targetTicket || tickets[0];
    if (!ticketToAlert) {
      showToast(
        lang === 'en'
          ? 'Please book a ticket first to simulate departure alerts!'
          : 'ማሳሰቢያ ለመሞከር እባክዎ አስቀድመው ትኬት ይያዙ!'
      );
      return;
    }

    // Set transit clock to 25 minutes prior to departure
    const depMins = parseTimeToMinutes(ticketToAlert.departureTime) || 390;
    const simulatedClock = (depMins - 25 + 1440) % 1440;
    setTransitClockMinutes(simulatedClock);

    const alertInfo = createAlertFromTicket(ticketToAlert, 25);
    setActiveDepartureAlert(alertInfo);
    setSecondsRemaining(25 * 60);
    setIsAlertDismissed(false);
    setSnoozeUntilTime(null);
    playTransitChime();

    triggerNativeNotification(
      lang === 'en'
        ? 'Bus Boarding Alert: Departure in 25 Minutes!'
        : 'የመሳፈሪያ ጥሪ፡ በ25 ደቂቃ ውስጥ ይነሳል!',
      {
        body: `${ticketToAlert.busCompany} (${ticketToAlert.fromStation.city} ➔ ${ticketToAlert.toStation.city}) departs in 25 minutes from Platform Bay #${ticketToAlert.bayNumber}.`,
        tag: `dep-${ticketToAlert.ticketId}`,
      }
    );

    showToast(
      lang === 'en'
        ? `🔔 Departure Alert Triggered: Bus leaves in 25 minutes (Bay #${ticketToAlert.bayNumber})`
        : `🔔 የመነሻ ማሳሰቢያ ተጀምሯል፡ አውቶቡሱ በ25 ደቂቃ ውስጥ ይነሳል (መጫኛ በር #${ticketToAlert.bayNumber})`
    );
  };

  const handleDismissAlert = () => {
    setIsAlertDismissed(true);
    showToast(translations[lang].alertDismissed);
  };

  const handleSnoozeAlert = (minutes: number) => {
    setIsAlertDismissed(true);
    setSnoozeUntilTime(Date.now() + minutes * 60 * 1000);
    showToast(translations[lang].alertSnoozed);
  };

  const handleOpenAlertToast = () => {
    if (activeDepartureAlert) {
      setIsAlertDismissed(false);
    } else {
      handleTriggerSimulatedAlert();
    }
  };

  const handleViewBoardingPassFromAlert = (ticketId: string) => {
    const foundTicket = tickets.find((t) => t.ticketId === ticketId);
    if (foundTicket) {
      setActiveTicketView(foundTicket);
    }
  };

  // Terminal Disruption Handlers & Preferred Terminal Computations
  const handleDismissTerminalDisruption = () => {
    setActiveTerminalDisruptionAlert(null);
  };

  const handleSnoozeTerminalDisruption = (minutes: number) => {
    setActiveTerminalDisruptionAlert(null);
    showToast(
      lang === 'en'
        ? `Terminal alert snoozed for ${minutes} minutes`
        : `የመናኸሪያው ማንቂያ ለ${minutes} ደቂቃ አሸልቧል`
    );
  };

  const handleRerouteFromDisruption = (terminalId: string) => {
    setActiveTerminalDisruptionAlert(null);
    setOriginStationId(terminalId);
    setActiveTab('booking');
    showToast(
      lang === 'en'
        ? 'Filtered available departures for affected terminal'
        : 'ለተጎዳው መናኸሪያ ያሉ አማራጭ ጉዞዎች ተዘርዝረዋል'
    );
  };

  const preferredStationObj =
    AMHARA_STATIONS.find((s) => s.id === preferredTerminalSettings.preferredTerminalId) ||
    AMHARA_STATIONS[0];
  const preferredTerminalDisruption = terminalAlertsMap[preferredTerminalSettings.preferredTerminalId];
  const preferredTerminalStatus: 'normal' | 'delayed' | 'cancelled' =
    preferredTerminalDisruption
      ? preferredTerminalDisruption.status === 'cancelled'
        ? 'cancelled'
        : 'delayed'
      : 'normal';
  const preferredTerminalDelayMin = preferredTerminalDisruption?.expectedDelayMinutes;

  // PWA Android Install Prompt handling
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [androidModalTab, setAndroidModalTab] = useState<'preview' | 'studio' | 'playstore' | 'keystore'>('preview');

  const handleOpenAndroidModal = (tab: 'preview' | 'studio' | 'playstore' | 'keystore' = 'preview') => {
    setAndroidModalTab(tab);
    setIsAndroidModalOpen(true);
  };

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    triggerHaptic(15);
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast(
            lang === 'en'
              ? 'Installing Bus Ride App on your Android device...'
              : 'የአውቶቡስ ጉዞ መተግበሪያ (Bus Ride App) በአንድሮይድ ስልክዎ ላይ በመጫን ላይ ነው...'
          );
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
      setDeferredInstallPrompt(null);
    } else {
      setIsAndroidModalOpen(true);
    }
  };

  // Schedule effect: check alerts on mount and tick countdown
  useEffect(() => {
    checkTicketsForDepartureAlert(transitClockMinutes);

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Helper
  const getStationById = (id: string) =>
    AMHARA_STATIONS.find((s) => s.id === id);

  // Handling Seat selection progression
  const handleProceedToCheckout = (selectedSeats: number[]) => {
    if (!seatPickerTrip) return;
    setCheckoutTripData({
      trip: seatPickerTrip,
      seats: selectedSeats,
    });
    setSeatPickerTrip(null);
  };

  // Handling Confirmation of a Booking
  const handleBookingConfirmed = (newTicket: BookingTicket) => {
    setTickets([newTicket, ...tickets]);

    // Update booked seats on the trip
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id === newTicket.tripId) {
          return {
            ...t,
            bookedSeats: [...t.bookedSeats, ...newTicket.seatNumbers],
          };
        }
        return t;
      })
    );

    setCheckoutTripData(null);
    setActiveTicketView(newTicket);
    showToast(
      lang === 'en'
        ? `Ticket confirmed for ${newTicket.fromStation.city} ➔ ${newTicket.toStation.city}!`
        : `የጉዞ ትኬትዎ ተረጋግጧል (${newTicket.fromStation.cityAm} ➔ ${newTicket.toStation.cityAm})!`
    );
  };

  // Handling Multi-Leg Journey Coordinated Booking (2 Tickets Confirmed in 1 Unified Transaction)
  const handleMultiLegBookingConfirmed = (newTickets: BookingTicket[]) => {
    setTickets((prev) => [...newTickets, ...prev]);

    // Update booked seats on matching trips if present
    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        const matchingTicket = newTickets.find((tk) => tk.tripId === t.id);
        if (matchingTicket) {
          return {
            ...t,
            bookedSeats: [...t.bookedSeats, ...matchingTicket.seatNumbers],
          };
        }
        return t;
      })
    );

    if (newTickets.length > 0) {
      showToast(
        lang === 'en'
          ? `2 tickets confirmed in 1 transaction (${newTickets[0].fromStation.city} ➔ ${newTickets[newTickets.length - 1].toStation.city})!`
          : `በ1 ግብይት 2 የጉዞ ትኬቶች ተረጋግጠዋል (${newTickets[0].fromStation.cityAm} ➔ ${newTickets[newTickets.length - 1].toStation.cityAm})!`
      );
    }
  };

  // Handling Quick Booking from Carpool Offer
  const handleBookCarpoolOffer = (offer: RideShareOffer) => {
    const fromSt = getStationById(offer.fromStationId) || AMHARA_STATIONS[0];
    const toSt = getStationById(offer.toStationId) || AMHARA_STATIONS[1];

    // Convert offer to temporary trip for booking
    const virtualTrip: RideTrip = {
      id: `trip-virtual-${offer.id}`,
      busCompany: `${offer.driverName}'s Ride-Share`,
      busCompanyAm: `${offer.driverName} - የጋራ ጉዞ`,
      vehicleType: 'Carpool Shared',
      plateNumber: offer.plateNumber,
      driverName: offer.driverName,
      driverPhone: offer.driverPhone,
      driverRating: 4.9,
      fromStationId: offer.fromStationId,
      toStationId: offer.toStationId,
      departureTime: offer.departureTime,
      arrivalTime: 'Direct Express',
      durationFormatted: 'Direct',
      priceETB: offer.pricePerSeatETB,
      totalSeats: offer.availableSeats + 2,
      bookedSeats: [1, 2],
      amenities: ['Shared Minibus/Carpool', 'Door-to-door Terminal pickup'],
      status: 'scheduled',
      isRideshareCommunity: true,
      routeStops: [fromSt.name, toSt.name],
    };

    setSeatPickerTrip(virtualTrip);
  };

  // Handling New Shared Ride Post
  const handleAddRideShare = (offer: RideShareOffer) => {
    setOffers([offer, ...offers]);

    // Also add to searchable trips so users searching this route can find it
    const fromSt = getStationById(offer.fromStationId);
    const toSt = getStationById(offer.toStationId);

    const newTrip: RideTrip = {
      id: `trip-share-${offer.id}`,
      busCompany: `${offer.driverName} (Carpool)`,
      busCompanyAm: `${offer.driverName} (የጋራ)`,
      vehicleType: 'Carpool Shared',
      plateNumber: offer.plateNumber,
      driverName: offer.driverName,
      driverPhone: offer.driverPhone,
      driverRating: 5.0,
      fromStationId: offer.fromStationId,
      toStationId: offer.toStationId,
      departureTime: offer.departureTime,
      arrivalTime: 'Fast Direct',
      durationFormatted: 'Express',
      priceETB: offer.pricePerSeatETB,
      totalSeats: offer.availableSeats + 1,
      bookedSeats: [1],
      amenities: ['Instant Ride Share', 'Telebirr Friendly'],
      status: 'scheduled',
      isRideshareCommunity: true,
      routeStops: [fromSt?.name || '', toSt?.name || ''],
    };

    setTrips([newTrip, ...trips]);
    showToast(translations[lang].ridePublishedSuccess);
  };

  // Handling Post-Trip Rating and Feedback Submission
  const handleUpdateTicketFeedback = (ticketId: string, feedback: TripFeedback) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId ? { ...t, feedback, status: 'completed' } : t
      )
    );
    showToast(
      lang === 'en'
        ? 'Thank you! Your journey feedback and rating have been recorded.'
        : 'አመሰግናለን! የጉዞ ግብረ-መልስዎ እና ደረጃዎ ተመዝግቧል።'
    );
  };

  // Actions from map or directory
  const handleBookFromStation = (originId: string, destId?: string) => {
    setOriginStationId(originId);
    if (destId) setDestStationId(destId);
    setActiveTab('booking');
  };

  const handleViewRouteOnMap = (fromId: string, toId: string) => {
    setOriginStationId(fromId);
    setDestStationId(toId);
    setActiveTab('map');
  };

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div
        className={`min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans selection:bg-emerald-200 transition-colors duration-200 ${
          highContrastMode ? 'high-contrast' : ''
        }`}
      >
        {/* Tier 1 Quota Defense Banner */}
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        ticketCount={tickets.length}
        hasActiveAlert={!!activeDepartureAlert && !isAlertDismissed}
        activeAlertMinutes={
          activeDepartureAlert
            ? Math.max(1, Math.ceil(secondsRemaining / 60))
            : null
        }
        transitClockTime={formatMinutesToTimeString(transitClockMinutes)}
        currentUser={currentUser}
        highContrastMode={highContrastMode}
        onToggleHighContrast={handleToggleHighContrast}
        onOpenAccessibilitySettings={() => setAccessibilityModalOpen(true)}
        onOpenLogin={handleOpenLogin}
        onOpenSignUp={handleOpenSignUp}
        onOpenDriverPortal={() => setDriverPortalOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onLogout={handleLogout}
        onOpenMyTickets={() => setMyTicketsOpen(true)}
        onOpenPostRide={() => setPostRideOpen(true)}
        onTriggerDepartureAlert={() => handleTriggerSimulatedAlert()}
        onOpenAlertToast={handleOpenAlertToast}
        onInstallApp={handleInstallApp}
        onOpenTerminalMonitor={() => setTerminalMonitorModalOpen(true)}
        onOpenUssdDialer={() => handleOpenUssdDialer()}
        onOpenCallCenter={handleOpenCallCenter}
        onOpenSmsBooking={() => handleOpenUssdDialer(undefined, 'sms_template')}
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        preferredTerminalName={lang === 'am' ? preferredStationObj.nameAm : preferredStationObj.name}
        preferredTerminalStatus={preferredTerminalStatus}
      />

      {/* Proactive Preferred Terminal Disruption Push Alert Toast */}
      {activeTerminalDisruptionAlert && (
        <TerminalDisruptionToast
          alert={activeTerminalDisruptionAlert}
          lang={lang}
          onDismiss={handleDismissTerminalDisruption}
          onOpenMonitor={() => {
            setActiveTerminalDisruptionAlert(null);
            setTerminalMonitorModalOpen(true);
          }}
          onFindAlternatives={handleRerouteFromDisruption}
          onSnooze={handleSnoozeTerminalDisruption}
        />
      )}

      {/* 30-Minute Departure Alert Simulated Push Notification Toast */}
      {activeDepartureAlert && !isAlertDismissed && (
        <DepartureNotificationToast
          alert={activeDepartureAlert}
          secondsRemaining={secondsRemaining}
          lang={lang}
          onDismiss={handleDismissAlert}
          onSnooze={handleSnoozeAlert}
          onViewBoardingPass={handleViewBoardingPassFromAlert}
          onTrackLiveBus={() => setActiveTab('tracker')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        <FrontHeroBanner
          lang={lang}
          currentUser={currentUser}
          currentCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
          onSelectModule={handleSelectModule}
          onOpenLogin={handleOpenLogin}
          onOpenSignUp={handleOpenSignUp}
          onSelectCorridor={(from, to) => {
            setOriginStationId(from);
            setDestStationId(to);
            setActiveTab('booking');
          }}
          onOpenMyTickets={() => setMyTicketsOpen(true)}
          onOpenTripPlanner={() => {
            setActiveModule('planner');
            setActiveTab('planner');
          }}
          onOpenDashboards={() => setActiveTab('dashboard')}
          onOpenDriverPortal={() => {
            setDriverPortalInitialSubTab('manifest');
            setDriverPortalOpen(true);
          }}
          onOpenAdminPortal={() => setAdminPortalOpen(true)}
          onLogout={handleLogout}
          ticketCount={tickets.length}
          onOpenTerminalMonitor={() => setTerminalMonitorModalOpen(true)}
          preferredTerminalName={lang === 'am' ? preferredStationObj.nameAm : preferredStationObj.name}
          preferredTerminalStatus={preferredTerminalStatus}
          preferredTerminalDelayMin={preferredTerminalDelayMin}
        />

        {/* 4 PRIMARY CATEGORIES NAVIGATION (Users, Driver, Administration, Business Owners) */}
        <CategoryNavigation
          lang={lang}
          currentCategory={currentCategory}
          onSelectCategory={handleSelectCategory}
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          currentUser={currentUser}
          onSwitchToCategoryPersona={handleSwitchToCategoryPersona}
          ticketCount={tickets.length}
          activeDisruptionCount={
            Object.values(terminalAlertsMap).filter((a: TerminalDisruptionAlert) => a.isActive).length
          }
        />

        {/* ======================================================== */}
        {/* CATEGORY 1: USERS (PASSENGERS & COMMUNITY COMMUTERS) */}
        {/* ======================================================== */}
        {currentCategory === 'users' && (
          <div className="space-y-6">
            {activeModule === 'booking' && (
              <RideBooking
                lang={lang}
                trips={trips}
                originStationId={originStationId}
                setOriginStationId={setOriginStationId}
                destStationId={destStationId}
                setDestStationId={setDestStationId}
                onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
                onViewOnMap={handleViewRouteOnMap}
                onContactDriver={(context) => setActiveDriverContact(context)}
                onOpenTripPlanner={(from, to) => {
                  if (from) setOriginStationId(from);
                  if (to) setDestStationId(to);
                  setActiveModule('planner');
                  setActiveTab('planner');
                }}
              />
            )}

            {activeModule === 'planner' && (
              <TripPlannerView
                lang={lang}
                trips={trips}
                offers={offers}
                initialOriginId={originStationId}
                initialDestId={destStationId}
                onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
                onViewOnMap={handleViewRouteOnMap}
                onShowToast={showToast}
                currentUser={currentUser}
                onOpenLogin={() => handleOpenLogin('passenger')}
                onMultiLegBookingConfirmed={handleMultiLegBookingConfirmed}
                onViewTicket={(ticket) => setActiveTicketView(ticket)}
              />
            )}

            {activeModule === 'interconnect' && (
              <EthiopiaInterconnectExplorer
                lang={lang}
                onBookStations={(fromId, toId) => {
                  setOriginStationId(fromId);
                  setDestStationId(toId);
                  setActiveModule('booking');
                  setActiveTab('booking');
                }}
                onPlanTrip={(fromId, toId) => {
                  setOriginStationId(fromId);
                  setDestStationId(toId);
                  setActiveModule('planner');
                  setActiveTab('planner');
                }}
                onViewOnMap={(stId) => {
                  setOriginStationId(stId);
                  setActiveModule('map');
                  setActiveTab('map');
                }}
              />
            )}

            {activeModule === 'map' && (
              <StationMap
                lang={lang}
                selectedStationId={originStationId}
                onSelectStation={(st) => setOriginStationId(st.id)}
                onBookFromStation={handleBookFromStation}
                activeTrips={trips}
                highlightFromId={originStationId}
                highlightToId={destStationId}
              />
            )}

            {activeModule === 'tracker' && (
              <LiveBusTracker
                lang={lang}
                trips={trips}
                onBookTrip={(trip) => setSeatPickerTrip(trip)}
                onViewTripOnMap={handleViewRouteOnMap}
              />
            )}

            {activeModule === 'directory' && (
              <StationDirectory
                lang={lang}
                trips={trips}
                onSelectStationForMap={(st) => {
                  setOriginStationId(st.id);
                  setActiveModule('map');
                  setActiveTab('map');
                }}
                onBookFromStation={(stId, destId) => {
                  if (destId) {
                    setOriginStationId(stId);
                    setDestStationId(destId);
                  } else {
                    handleBookFromStation(stId);
                  }
                  setActiveModule('booking');
                  setActiveTab('booking');
                }}
                onSelectTrip={(trip) => setSeatPickerTrip(trip)}
                preferredTerminalId={preferredTerminalSettings.preferredTerminalId}
                onSetPreferredTerminal={(terminalId) => {
                  terminalMonitorService.updateSettings({ preferredTerminalId: terminalId });
                  setPreferredTerminalSettings(terminalMonitorService.getSettings());
                  showToast(
                    lang === 'en'
                      ? 'Updated preferred terminal for disruption alerts'
                      : 'የተመረጠ መናኸሪያ ተቀይሯል፤ ማንቂያዎች ይደርሳሉ'
                  );
                }}
                terminalAlerts={terminalAlertsMap}
                onOpenTerminalMonitor={() => setTerminalMonitorModalOpen(true)}
              />
            )}

            {activeModule === 'carpool' && (
              <RideSharePool
                lang={lang}
                offers={offers}
                onOpenPostRide={() => setPostRideOpen(true)}
                onBookOffer={handleBookCarpoolOffer}
                onContactDriver={(context) => setActiveDriverContact(context)}
              />
            )}

            {activeModule === 'tickets' && (
              <DashboardView
                lang={lang}
                currentUser={currentUser}
                onSwitchUser={(user) => {
                  setCurrentUser(user);
                  showToast(
                    lang === 'en'
                      ? `Active persona switched to ${user.fullName} (${user.role.toUpperCase()})`
                      : `መለያ ወደ ${user.fullNameAm || user.fullName} ተቀይሯል`
                  );
                }}
                onOpenLogin={handleOpenLogin}
                trips={trips}
                onAddTrip={(newTrip) => {
                  setTrips((prev) => [newTrip, ...prev]);
                }}
                tickets={tickets}
                onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
                onViewTicket={(ticket) => setActiveTicketView(ticket)}
                onShowToast={showToast}
                onOpenAndroidModal={handleOpenAndroidModal}
                activeRoleTab="passenger"
                onRoleTabChange={(role) => {
                  if (role === 'driver') handleSelectCategory('driver');
                  else if (role === 'admin') handleSelectCategory('administration');
                  else if (role === 'bus_owner') handleSelectCategory('business_owners');
                }}
              />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CATEGORY 2: DRIVER (COMMERCIAL BUS CAPTAINS & CREW) */}
        {/* ======================================================== */}
        {currentCategory === 'driver' && (
          <DashboardView
            lang={lang}
            currentUser={currentUser}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              showToast(
                lang === 'en'
                  ? `Active persona switched to ${user.fullName} (${user.role.toUpperCase()})`
                  : `መለያ ወደ ${user.fullNameAm || user.fullName} ተቀይሯል`
              );
            }}
            onOpenLogin={handleOpenLogin}
            trips={trips}
            onAddTrip={(newTrip) => {
              setTrips((prev) => [newTrip, ...prev]);
            }}
            tickets={tickets}
            onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
            onViewTicket={(ticket) => setActiveTicketView(ticket)}
            onShowToast={showToast}
            onOpenAndroidModal={handleOpenAndroidModal}
            activeRoleTab="driver"
            activeSubModule={activeModule}
            onRoleTabChange={(role) => {
              if (role === 'passenger') handleSelectCategory('users');
              else if (role === 'admin') handleSelectCategory('administration');
              else if (role === 'bus_owner') handleSelectCategory('business_owners');
            }}
          />
        )}

        {/* ======================================================== */}
        {/* CATEGORY 3: ADMINISTRATION (TRANSIT BUREAU & TERMINAL MASTERS) */}
        {/* ======================================================== */}
        {currentCategory === 'administration' && (
          <DashboardView
            lang={lang}
            currentUser={currentUser}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              showToast(
                lang === 'en'
                  ? `Active persona switched to ${user.fullName} (${user.role.toUpperCase()})`
                  : `መለያ ወደ ${user.fullNameAm || user.fullName} ተቀይሯል`
              );
            }}
            onOpenLogin={handleOpenLogin}
            trips={trips}
            onAddTrip={(newTrip) => {
              setTrips((prev) => [newTrip, ...prev]);
            }}
            tickets={tickets}
            onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
            onViewTicket={(ticket) => setActiveTicketView(ticket)}
            onShowToast={showToast}
            onOpenAndroidModal={handleOpenAndroidModal}
            activeRoleTab="admin"
            activeSubModule={activeModule}
            onRoleTabChange={(role) => {
              if (role === 'passenger') handleSelectCategory('users');
              else if (role === 'driver') handleSelectCategory('driver');
              else if (role === 'bus_owner') handleSelectCategory('business_owners');
            }}
          />
        )}

        {/* ======================================================== */}
        {/* CATEGORY 4: BUSINESS OWNERS (FLEET & BUS COOPERATIVES) */}
        {/* ======================================================== */}
        {currentCategory === 'business_owners' && (
          <DashboardView
            lang={lang}
            currentUser={currentUser}
            onSwitchUser={(user) => {
              setCurrentUser(user);
              showToast(
                lang === 'en'
                  ? `Active persona switched to ${user.fullName} (${user.role.toUpperCase()})`
                  : `መለያ ወደ ${user.fullNameAm || user.fullName} ተቀይሯል`
              );
            }}
            onOpenLogin={handleOpenLogin}
            trips={trips}
            onAddTrip={(newTrip) => {
              setTrips((prev) => [newTrip, ...prev]);
            }}
            tickets={tickets}
            onSelectTripToBook={(trip) => setSeatPickerTrip(trip)}
            onViewTicket={(ticket) => setActiveTicketView(ticket)}
            onShowToast={showToast}
            onOpenAndroidModal={handleOpenAndroidModal}
            activeRoleTab="bus_owner"
            activeSubModule={activeModule}
            onRoleTabChange={(role) => {
              if (role === 'passenger') handleSelectCategory('users');
              else if (role === 'driver') handleSelectCategory('driver');
              else if (role === 'admin') handleSelectCategory('administration');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Seat Picker Modal */}
      {seatPickerTrip && (
        <SeatPickerModal
          trip={seatPickerTrip}
          fromStation={getStationById(seatPickerTrip.fromStationId)}
          toStation={getStationById(seatPickerTrip.toStationId)}
          lang={lang}
          onClose={() => setSeatPickerTrip(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {/* 2. Passenger Checkout Modal */}
      {checkoutTripData && (
        <CheckoutModal
          trip={checkoutTripData.trip}
          fromStation={
            getStationById(checkoutTripData.trip.fromStationId) ||
            AMHARA_STATIONS[0]
          }
          toStation={
            getStationById(checkoutTripData.trip.toStationId) ||
            AMHARA_STATIONS[1]
          }
          selectedSeats={checkoutTripData.seats}
          travelDate="2026-09-15"
          lang={lang}
          onClose={() => setCheckoutTripData(null)}
          onBookingConfirmed={handleBookingConfirmed}
          currentUser={currentUser}
          onOpenLogin={() => handleOpenLogin()}
        />
      )}

      {/* 3. Digital Boarding Pass Ticket View Modal */}
      {activeTicketView && (
        <DigitalTicketModal
          ticket={activeTicketView}
          lang={lang}
          onClose={() => setActiveTicketView(null)}
          onOpenLuggageTracking={(ticket) => {
            setActiveTicketView(null);
            setLuggageTrackingTicket(ticket);
            setMyTicketsOpen(true);
          }}
          onContactDriver={handleContactDriverFromTicket}
        />
      )}

      {/* 4. My Tickets Modal (with Luggage Tracking) */}
      {myTicketsOpen && (
        <MyTicketsModal
          tickets={tickets}
          lang={lang}
          initialTrackingTicket={luggageTrackingTicket}
          onClose={() => {
            setMyTicketsOpen(false);
            setLuggageTrackingTicket(null);
          }}
          onSelectTicket={(ticket) => {
            setMyTicketsOpen(false);
            setLuggageTrackingTicket(null);
            setActiveTicketView(ticket);
          }}
          onSearchRides={() => setActiveTab('booking')}
          onSimulateAlertForTicket={handleTriggerSimulatedAlert}
          onContactDriver={handleContactDriverFromTicket}
          onUpdateFeedback={handleUpdateTicketFeedback}
          onExploreFullMap={(fromId, toId) => {
            setMyTicketsOpen(false);
            setOriginStationId(fromId);
            setDestStationId(toId);
            setActiveTab('map');
          }}
          onTrackLiveBus={() => {
            setMyTicketsOpen(false);
            setActiveTab('tracker');
          }}
        />
      )}

      {/* 5. Post Shared Ride Modal */}
      {postRideOpen && (
        <PostRideModal
          lang={lang}
          onClose={() => setPostRideOpen(false)}
          onAddRide={handleAddRideShare}
        />
      )}

      {/* 6. Driver Chat & SMS Modal */}
      {activeDriverContact && (
        <DriverChatModal
          context={activeDriverContact}
          lang={lang}
          onClose={() => setActiveDriverContact(null)}
        />
      )}

      {/* 7. Role Authentication & Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        lang={lang}
        onLanguageChange={setLang}
        initialRole={preferredLoginRole}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 8. Driver Operations Console & Passenger Manifest Modal */}
      {driverPortalOpen && (
        <DriverPortalModal
          isOpen={driverPortalOpen}
          onClose={() => setDriverPortalOpen(false)}
          lang={lang}
          driver={currentUser?.role === 'driver' ? currentUser : MOCK_USERS.find((u) => u.role === 'driver') || MOCK_USERS[1]}
          onLogout={handleLogout}
          initialSubTab={driverPortalInitialSubTab}
        />
      )}

      {/* 9. Regional Transport Administration & Dispatch Command Modal */}
      {adminPortalOpen && currentUser?.role === 'admin' && (
        <AdminPortalModal
          isOpen={adminPortalOpen}
          onClose={() => setAdminPortalOpen(false)}
          lang={lang}
          admin={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* 10. Android Accessibility & High Contrast Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
        lang={lang}
        highContrastMode={highContrastMode}
        onToggleHighContrast={handleToggleHighContrast}
        largeTextMode={largeTextMode}
        onToggleLargeText={setLargeTextMode}
        audioFeedback={audioFeedback}
        onToggleAudioFeedback={setAudioFeedback}
      />

      {/* 11. Regional Terminal Disruption Radar & Preferred Station Monitor Modal */}
      <TerminalDisruptionModal
        isOpen={terminalMonitorModalOpen}
        onClose={() => setTerminalMonitorModalOpen(false)}
        lang={lang}
        onSelectTerminalForBooking={(stId) => {
          setOriginStationId(stId);
          setActiveTab('booking');
        }}
      />

      {/* 12. Ethio Telecom USSD Offline Dialer & Interactive Session Modal */}
      <UssdDialerModal
        isOpen={ussdDialerOpen}
        onClose={() => setUssdDialerOpen(false)}
        lang={lang}
        activeTicket={tickets[0]}
        allTickets={tickets}
        trips={trips}
        initialCode={ussdInitialCode}
        initialTab={ussdInitialTab}
      />

      {/* 13. 24/7 Regional Transit Helpline & Dispatch Directory Modal */}
      <CallCenterModal
        isOpen={callCenterOpen}
        onClose={() => setCallCenterOpen(false)}
        ticket={tickets[0]}
        lang={lang}
      />

      {/* Smart Unified Offline & Transit Support Hub */}
      <aside
        aria-label="Offline USSD, SMS and Helpline Hub"
        className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none"
      >
        {supportHubOpen && (
          <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3 duration-200">
            <button
              type="button"
              onClick={() => {
                setSupportHubOpen(false);
                handleOpenUssdDialer(undefined, 'sms_template');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-950/95 hover:bg-teal-900 text-teal-200 border border-teal-700 shadow-xl transition-all active:scale-95 cursor-pointer font-bold text-xs"
              title={lang === 'am' ? 'የSMS ቦታ ማስያዣ መልዕክት (8050)' : 'Offline SMS Booking Template (8050)'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>8050 · <span className="font-sans font-medium text-white">{lang === 'am' ? 'በSMS ቦታ ይያዙ' : 'Free SMS Booking'}</span></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportHubOpen(false);
                handleOpenUssdDialer();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/95 hover:bg-neutral-850 text-amber-300 border border-neutral-700 shadow-xl transition-all active:scale-95 cursor-pointer font-mono font-bold text-xs"
              title={lang === 'am' ? 'የUSSD መደወያ ሰሌዳ (*805#)' : 'Open Offline USSD Keypad (*805#)'}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>*805# · <span className="font-sans font-semibold text-white">{lang === 'am' ? 'ከመስመር ውጭ USSD' : 'Offline USSD Keypad'}</span></span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSupportHubOpen(false);
                handleOpenCallCenter();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-xl transition-all active:scale-95 cursor-pointer font-bold text-xs"
              title={lang === 'am' ? 'ወደ 24/7 የትራንስፖርት ጥሪ ማዕከል ይደውሉ (994)' : 'Call 24/7 Regional Transit Helpline (994)'}
            >
              <Phone className="w-4 h-4 text-neutral-950" />
              <span>994 · <span className="font-medium text-neutral-900">{lang === 'am' ? '24/7 የትራንስፖርት ጥሪ ማዕከል' : '24/7 Transit Helpline'}</span></span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            setSupportHubOpen(!supportHubOpen);
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-xl border transition-all active:scale-95 cursor-pointer font-bold text-xs ${
            supportHubOpen
              ? 'bg-neutral-950 text-white border-neutral-700 ring-2 ring-emerald-500/50'
              : 'bg-neutral-900/95 hover:bg-neutral-850 text-white border-neutral-700/80 hover:border-neutral-600'
          }`}
          title={lang === 'am' ? 'ከመስመር ውጭ እና የአደጋ ጊዜ ድጋፍ ማዕከል (*805#, 8050, 994)' : 'Offline & 24/7 Support Hub (*805#, 8050, 994)'}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-amber-300">*805#</span>
          <span className="text-neutral-400">·</span>
          <span className="text-white font-medium">{lang === 'am' ? '994 ድጋፍ' : '994 Support'}</span>
          <ChevronUp className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${supportHubOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Bus className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">
                {isAm ? 'የአማራ ክልል አውቶቡስ ትራንስፖርት እና የጋራ ጉዞ ኔትወርክ' : 'Amhara Regional Virtual Bus Transport & Ride Sharing Network'}
              </p>
              <p className="text-[11px] text-neutral-500">
                {lang === 'en'
                  ? 'Official Intercity Transit across Bahir Dar, Gondar, Dessie, Debre Markos, Debre Birhan & 10 more terminals.'
                  : 'የአማራ ክልል አውቶቡስ እና ሚኒባስ የጋራ ትራንስፖርት መረብ።'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-neutral-600">
            <button
              onClick={() => setActiveTab('planner')}
              className="hover:text-emerald-700 font-semibold transition cursor-pointer"
            >
              {lang === 'am' ? 'የጉዞ እቅድ' : 'Trip Planner'}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('directory')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              {isAm ? '15 የመናኸሪያ ጣቢያዎች' : '15 Bus Terminals'}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('tracker')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              {isAm ? 'የቀጥታ አውራ ጎዳና ቴሌሜትሪ' : 'Live Highway Telemetry'}
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('carpool')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              {isAm ? 'ሚኒባስ እና የጋራ ጉዞ' : 'Carpool & Minibus'}
            </button>
            <span>•</span>
            <span className="font-mono text-emerald-800 font-semibold">
              {isAm ? 'በቴሌብርና CBE ብር የተረጋገጠ' : 'Telebirr & CBE Birr Validated'}
            </span>
          </div>
        </div>
      </footer>

      {/* Android Mobile Material Design 3 Bottom Navigation Bar */}
      <AndroidBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        ticketCount={tickets.length}
        onOpenTickets={() => setMyTicketsOpen(true)}
        lang={lang}
        onToggleLang={toggleLang}
        currentUser={currentUser}
        onOpenLogin={() => {
          if (currentUser?.role === 'driver') {
            setDriverPortalOpen(true);
          } else if (currentUser?.role === 'admin') {
            setAdminPortalOpen(true);
          } else {
            handleOpenLogin();
          }
        }}
        onOpenUssdDialer={() => handleOpenUssdDialer()}
        onOpenCallCenter={handleOpenCallCenter}
        onOpenSmsBooking={() => handleOpenUssdDialer(undefined, 'sms_template')}
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Android App Installation & Feature Hub Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredInstallPrompt}
        onInstallPrompt={handleInstallApp}
        lang={lang}
        initialTab={androidModalTab}
      />

      {/* Android Offline Status Banner */}
      <OfflineBanner lang={lang} />
    </div>
    </APIProvider>
  );
}

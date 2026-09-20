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
} from './types';
import {
  AMHARA_STATIONS,
  INITIAL_RIDE_TRIPS,
  INITIAL_RIDESHARE_OFFERS,
} from './data/amharaStations';
import { MOCK_USERS } from './data/mockUsers';
import { translations } from './translations';
import { Navbar } from './components/Navbar';
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
import { AndroidAppModal } from './components/AndroidAppModal';
import { OfflineBanner } from './components/OfflineBanner';
import { LoginModal } from './components/LoginModal';
import { DriverPortalModal } from './components/DriverPortalModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { triggerHaptic } from './utils/haptics';
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
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<
    'booking' | 'map' | 'tracker' | 'directory' | 'carpool'
  >('booking');

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
  const [preferredLoginRole, setPreferredLoginRole] = useState<UserRole>('passenger');
  const [driverPortalOpen, setDriverPortalOpen] = useState<boolean>(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState<boolean>(false);

  const handleOpenLogin = (role?: UserRole) => {
    if (role) setPreferredLoginRole(role);
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

  // PWA Android Install Prompt handling
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans selection:bg-emerald-200">
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
        onOpenLogin={handleOpenLogin}
        onOpenDriverPortal={() => setDriverPortalOpen(true)}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onLogout={handleLogout}
        onOpenMyTickets={() => setMyTicketsOpen(true)}
        onOpenPostRide={() => setPostRideOpen(true)}
        onTriggerDepartureAlert={() => handleTriggerSimulatedAlert()}
        onOpenAlertToast={handleOpenAlertToast}
        onInstallApp={handleInstallApp}
      />

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
        {activeTab === 'booking' && (
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
          />
        )}

        {activeTab === 'map' && (
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

        {activeTab === 'tracker' && (
          <LiveBusTracker
            lang={lang}
            trips={trips}
            onBookTrip={(trip) => setSeatPickerTrip(trip)}
            onViewTripOnMap={handleViewRouteOnMap}
          />
        )}

        {activeTab === 'directory' && (
          <StationDirectory
            lang={lang}
            onSelectStationForMap={(st) => {
              setOriginStationId(st.id);
              setActiveTab('map');
            }}
            onBookFromStation={(stId) => handleBookFromStation(stId)}
          />
        )}

        {activeTab === 'carpool' && (
          <RideSharePool
            lang={lang}
            offers={offers}
            onOpenPostRide={() => setPostRideOpen(true)}
            onBookOffer={handleBookCarpoolOffer}
            onContactDriver={(context) => setActiveDriverContact(context)}
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
        initialRole={preferredLoginRole}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 8. Driver Operations Console & Passenger Manifest Modal */}
      {driverPortalOpen && currentUser?.role === 'driver' && (
        <DriverPortalModal
          isOpen={driverPortalOpen}
          onClose={() => setDriverPortalOpen(false)}
          lang={lang}
          driver={currentUser}
          onLogout={handleLogout}
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

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Bus className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">
                Amhara Regional Virtual Bus Transport &amp; Ride Sharing Network
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
              onClick={() => setActiveTab('directory')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              15 Bus Terminals
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('tracker')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Live Highway Telemetry
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('carpool')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Carpool &amp; Minibus
            </button>
            <span>•</span>
            <span className="font-mono text-emerald-800 font-semibold">
              Telebirr &amp; CBE Birr Validated
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
      />

      {/* Android App Installation & Feature Hub Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredInstallPrompt}
        onInstallPrompt={handleInstallApp}
        lang={lang}
      />

      {/* Android Offline Status Banner */}
      <OfflineBanner lang={lang} />
    </div>
  );
}

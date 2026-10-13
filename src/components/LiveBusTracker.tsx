import React, { useState, useEffect, useMemo } from 'react';
import {
  RideTrip,
  BusStation,
  Language,
  UserProfile,
  LiveMovingBus,
  LiveTrackedCommuter,
  BookingTicket,
} from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { ETHIOPIA_BUS_STATIONS, getEthiopiaStationById } from '../data/ethiopiaStations';
import {
  INITIAL_LIVE_BUSES,
  INITIAL_COMMUTERS,
  advanceBusTelemetry,
  getDistanceKm,
} from '../data/liveTrackingData';
import { translations } from '../translations';
import { calculateDynamicArrivalEstimate, DynamicArrivalEstimate } from '../utils/arrivalEstimator';
import { LiveTrackingMap } from './LiveTrackingMap';
import { triggerHaptic } from '../utils/haptics';
import {
  Radio,
  Bus,
  Gauge,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
  Users,
  Compass,
  Phone,
  Crosshair,
  Send,
  Eye,
  CheckCircle2,
  Share2,
  Ticket,
} from 'lucide-react';

interface LiveBusTrackerProps {
  lang: Language;
  trips: RideTrip[];
  onBookTrip: (trip: RideTrip) => void;
  onViewTripOnMap: (fromId: string, toId: string) => void;
  currentUser?: UserProfile | null;
  onBookStations?: (originStationId: string, destStationId?: string) => void;
  userTickets?: BookingTicket[];
}

export const LiveBusTracker: React.FC<LiveBusTrackerProps> = ({
  lang,
  trips,
  onBookTrip,
  onViewTripOnMap,
  currentUser,
  onBookStations,
  userTickets = [],
}) => {
  const isAm = lang === 'am';
  const t = translations[lang];

  // Active moving buses state
  const [buses, setBuses] = useState<LiveMovingBus[]>(INITIAL_LIVE_BUSES);

  // Active tracked commuters state
  const [commuters, setCommuters] = useState<LiveTrackedCommuter[]>(INITIAL_COMMUTERS);

  // Corridor filter state for fleet
  const [corridorFilter, setCorridorFilter] = useState<'all' | 'addis' | 'amhara' | 'south' | 'feeders'>('all');

  // Commuter status filter
  const [commuterFilter, setCommuterFilter] = useState<'all' | 'roadside' | 'terminal'>('all');

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(1.0);

  // Selection states for camera focus & inspection
  const [selectedBusId, setSelectedBusId] = useState<string | null>('bus-selam-101');
  const [selectedCommuterId, setSelectedCommuterId] = useState<string | null>(null);

  // Active Tab View: 'map' | 'fleet' | 'commuters'
  const [activeTab, setActiveTab] = useState<'map' | 'fleet' | 'commuters'>('map');

  // User GPS Location (defaults to Bahir Dar Lake Shore or Addis Ababa)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 11.5936,
    lng: 37.3908,
  });
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Real-time interval timer to advance telemetry
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setBuses((prevBuses) => advanceBusTelemetry(prevBuses, simulationSpeedMultiplier));
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeedMultiplier]);

  // Request device GPS
  const handleDetectUserLocation = () => {
    triggerHaptic(12);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationToast(isAm ? 'የጂፒኤስ አገልግሎት አልተገኘም' : 'Geolocation is not supported');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocatingUser(false);
        triggerHaptic(15);
        setLocationToast(isAm ? 'ትክክለኛው መገኛዎ ተገኝቷል' : 'Current GPS location acquired');
        setTimeout(() => setLocationToast(null), 3000);

        // Update current user commuter marker
        setCommuters((prev) =>
          prev.map((c) =>
            c.isCurrentUser
              ? {
                  ...c,
                  lat: coords.lat,
                  lng: coords.lng,
                  currentStationName: 'Live GPS Point',
                  currentStationNameAm: 'የቀጥታ ጂፒኤስ ነጥብ',
                }
              : c
          )
        );
      },
      () => {
        setIsLocatingUser(false);
        // Fallback preset Addis Ababa
        setUserLocation({ lat: 9.0348, lng: 38.7469 });
        setLocationToast(isAm ? 'መደበኛ መገኛ፡ አዲስ አበባ' : 'Defaulted to Addis Ababa Hub');
        setTimeout(() => setLocationToast(null), 3000);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  // Broadcast user location onto the live map
  const handleBroadcastUserLocation = (note: string, destId: string) => {
    triggerHaptic(15);
    const destSt = getEthiopiaStationById(destId);
    const lat = userLocation ? userLocation.lat : 9.0348;
    const lng = userLocation ? userLocation.lng : 38.7469;

    const newCommuter: LiveTrackedCommuter = {
      id: `commuter-${Date.now()}`,
      name: currentUser?.name || 'You (Active Commuter)',
      nameAm: currentUser?.name || 'እርስዎ (ተሳፋሪ)',
      phone: currentUser?.phone || '+251 91 100 2233',
      lat,
      lng,
      currentStationName: 'Broadcasted Highway Beacon',
      currentStationNameAm: 'የተሰራጨ የመንገድ ዳር ምልክት',
      destinationStationId: destId,
      destinationName: destSt ? destSt.name : 'Capital Gateway',
      destinationNameAm: destSt ? destSt.nameAm : 'አዲስ አበባ',
      status: 'roadside_beacon',
      luggageCount: 1,
      waitTimeMinutes: 5,
      pickupNote: note || 'Awaiting approaching coach on corridor',
      isCurrentUser: true,
      partySize: 1,
      sharedBeaconBroadcastAt: 'Just now',
    };

    setCommuters((prev) => [newCommuter, ...prev.filter((c) => !c.isCurrentUser)]);
    setSelectedCommuterId(newCommuter.id);
    setSelectedBusId(null);
    setLocationToast(isAm ? 'የመነሻ መገኛ ምልክትዎ ተሰራጭቷል!' : 'Pickup beacon broadcasted to fleet!');
    setTimeout(() => setLocationToast(null), 3500);
  };

  // Book a trip corresponding to a live moving bus
  const handleBookTripForBus = (tripId: string) => {
    triggerHaptic(12);
    const matchedTrip = trips.find((t) => t.id === tripId);
    if (matchedTrip) {
      onBookTrip(matchedTrip);
    } else if (onBookStations) {
      const bus = buses.find((b) => b.tripId === tripId);
      if (bus) {
        onBookStations(bus.fromStationId, bus.toStationId);
      }
    }
  };

  // Computed summary metrics
  const fleetAvgSpeed = useMemo(() => {
    if (buses.length === 0) return '65.0';
    const sum = buses.reduce((acc, curr) => acc + curr.currentSpeedKmH, 0);
    return (sum / buses.length).toFixed(1);
  }, [buses]);

  const aheadCount = buses.filter((b) => b.status === 'ahead').length;
  const onTimeCount = buses.filter((b) => b.status === 'on_time').length;
  const delayedCount = buses.filter((b) => b.status === 'delayed').length;

  const totalSeatsOccupied = buses.reduce((acc, b) => acc + b.occupiedSeats, 0);
  const totalFleetCapacity = buses.reduce((acc, b) => acc + b.totalSeats, 0);

  // User's active booked ticket tracking
  const activeBookedTicket = useMemo(() => {
    return userTickets.length > 0 ? userTickets[0] : null;
  }, [userTickets]);

  const bookedTicketBus = useMemo(() => {
    if (!activeBookedTicket) return null;
    return (
      buses.find(
        (b) =>
          b.plateNumber === activeBookedTicket.plateNumber ||
          (b.fromStationId === activeBookedTicket.fromStation.id &&
            b.toStationId === activeBookedTicket.toStation.id) ||
          (b.fromStationId === activeBookedTicket.toStation.id &&
            b.toStationId === activeBookedTicket.fromStation.id)
      ) || buses[0]
    );
  }, [activeBookedTicket, buses]);

  // Filtered buses list by corridor
  const displayedBuses = useMemo(() => {
    if (corridorFilter === 'all') return buses;
    if (corridorFilter === 'addis') {
      return buses.filter((b) => b.fromStationId.includes('addis') || b.toStationId.includes('addis'));
    }
    if (corridorFilter === 'amhara') {
      return buses.filter(
        (b) =>
          b.fromStationId.includes('bahir') ||
          b.toStationId.includes('bahir') ||
          b.fromStationId.includes('gondar') ||
          b.toStationId.includes('gondar') ||
          b.fromStationId.includes('dessie') ||
          b.toStationId.includes('dessie')
      );
    }
    if (corridorFilter === 'south') {
      return buses.filter(
        (b) =>
          b.fromStationId.includes('hawassa') ||
          b.toStationId.includes('hawassa') ||
          b.fromStationId.includes('dilla') ||
          b.toStationId.includes('yirgacheffe')
      );
    }
    if (corridorFilter === 'feeders') {
      return buses.filter((b) => b.vehicleType === 'Minibus Dolphin' || b.vehicleType === 'Coaster Bus');
    }
    return buses;
  }, [buses, corridorFilter]);

  // Filtered commuters list by status
  const displayedCommuters = useMemo(() => {
    if (commuterFilter === 'all') return commuters;
    if (commuterFilter === 'roadside') return commuters.filter((c) => c.status === 'roadside_beacon');
    if (commuterFilter === 'terminal') return commuters.filter((c) => c.status !== 'roadside_beacon');
    return commuters;
  }, [commuters, commuterFilter]);

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-300">
      {/* 1. Global Radar Telemetry Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {isAm
                  ? 'የቀጥታ የአውቶቡሶችና የተሳፋሪዎች ራዳር ትስስር'
                  : 'Nationwide Live Bus & Commuter Telemetry Grid'}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {isAm
                ? 'የአውቶቡሶችና ተሳፋሪዎች የቀጥታ መከታተያ ካርታ'
                : 'Busses & Users Live Tracking Mapping'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {isAm
                ? 'በኢትዮጵያ አውራ ጎዳናዎች ላይ የሚጓዙ አውቶቡሶች እና በየጣቢያው የሚጠባበቁ ተሳፋሪዎች የቀጥታ ጂፒኤስ እንቅስቃሴ፣ ፍጥነት፣ ከፍታና የመድረሻ ሰዓት።'
                : 'Real-time GPS tracking of moving coaches, minibuses, and commuters across Ethiopian federal trunks, regional corridors, zonal hubs, and woreda feeders.'}
            </p>
          </div>

          {/* Simulation & Location Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setIsSimulating(!isSimulating);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer shadow-xs"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAm ? 'አፍታ አቁም' : 'Pause Radar'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAm ? 'ቀጥል' : 'Resume Radar'}</span>
                </>
              )}
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {[1.0, 2.0, 5.0].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setSimulationSpeedMultiplier(m);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    simulationSpeedMultiplier === m
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>

            {/* Detect GPS */}
            <button
              type="button"
              onClick={handleDetectUserLocation}
              disabled={isLocatingUser}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title={isAm ? 'የእኔን ጂፒኤስ ፈልግ' : 'Acquire My GPS Location'}
            >
              <Navigation className={`w-4 h-4 text-cyan-400 ${isLocatingUser ? 'animate-spin' : ''}`} />
            </button>

            {/* Reset Simulation */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setBuses(INITIAL_LIVE_BUSES);
                setCommuters(INITIAL_COMMUTERS);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title={isAm ? 'ራዳሩን ዳግም አስጀምር' : 'Reset Fleet Telemetry'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global summary stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {isAm ? 'በመንገድ ላይ ያሉ አውቶቡሶች' : 'Active En-Route Buses'}
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {buses.length} {isAm ? 'ተሽከርካሪዎች' : 'Vehicles'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {totalSeatsOccupied}/{totalFleetCapacity} {isAm ? 'ተሳፋሪዎች' : 'seats occupied'}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {isAm ? 'ተሳፋሪዎች በራዳር ላይ' : 'Commuters on Radar'}
            </span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {commuters.length} {isAm ? 'ተሳፋሪዎች' : 'Commuters'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {commuters.filter((c) => c.status === 'roadside_beacon').length} {isAm ? 'የመንገድ ዳር ምልክት' : 'roadside beacons'}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {isAm ? 'አማካኝ የፍጥነት መጠን' : 'Fleet Average Speed'}
            </span>
            <span className="text-lg font-bold text-cyan-300 font-mono">
              {fleetAvgSpeed} km/h
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {aheadCount} {isAm ? 'ቀድሞ' : 'ahead'} · {onTimeCount} {isAm ? 'በሰዓቱ' : 'on time'}
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {isAm ? 'ከፍተኛው የተራራ ዋሻ' : 'High Altitude Passes'}
            </span>
            <span className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Termaber (3,120m)</span>
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Abay Gorge (1,080m)
            </span>
          </div>
        </div>

        {/* Location toast feedback */}
        {locationToast && (
          <div className="absolute bottom-3 right-6 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in-50">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{locationToast}</span>
          </div>
        )}
      </div>

      {/* 1.5 Active User Booked Ticket Tracking Banner */}
      {activeBookedTicket && bookedTicketBus && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                  {isAm ? 'የእርስዎ የተያዘ ጉዞ' : 'Your Booked Journey'}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {activeBookedTicket.ticketId}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isAm ? bookedTicketBus.busCompanyAm : bookedTicketBus.busCompany} ({bookedTicketBus.plateNumber})
              </h3>
              <p className="text-xs text-slate-300">
                {isAm ? activeBookedTicket.fromStation.cityAm : activeBookedTicket.fromStation.city} ➔{' '}
                {isAm ? activeBookedTicket.toStation.cityAm : activeBookedTicket.toStation.city} ·{' '}
                <span className="text-amber-300 font-semibold">{isAm ? 'ወንበር' : 'Seat'}: {activeBookedTicket.seatNumbers.join(', ')}</span> ·{' '}
                <span className="text-cyan-300 font-mono font-bold">ETA ~{bookedTicketBus.estimatedArrivalMin} min</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                setSelectedBusId(bookedTicketBus.id);
                setSelectedCommuterId(null);
                setActiveTab('map');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>{isAm ? 'በካርታው ላይ በቀጥታ ተከታተል' : 'Track Coach on Live Map'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Navigation View Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('map');
            }}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{isAm ? 'የቀጥታ ካርታና ራዳር' : 'Interactive Live Map & Radar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('fleet');
            }}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fleet'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>{isAm ? 'የአውቶቡሶች ዝርዝር' : 'Bus Fleet Telemetry'} ({buses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('commuters');
            }}
            className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'commuters'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isAm ? 'የተሳፋሪዎች ራዳር' : 'Commuters & Beacons'} ({commuters.length})</span>
          </button>
        </div>

        <div className="text-xs text-neutral-500 font-medium">
          {isAm ? 'በየ1.5 ሰከንድ የቀጥታ ቴሌሜትሪ ዝመና' : 'Real-time telemetry pings every 1.5s'}
        </div>
      </div>

      {/* 3. Primary Interactive Live Tracking Map */}
      {(activeTab === 'map' || activeTab === 'fleet') && (
        <LiveTrackingMap
          lang={lang}
          buses={buses}
          commuters={commuters}
          selectedBusId={selectedBusId}
          selectedCommuterId={selectedCommuterId}
          onSelectBus={setSelectedBusId}
          onSelectCommuter={setSelectedCommuterId}
          userLocation={userLocation}
          onBroadcastUserLocation={handleBroadcastUserLocation}
          onBookTripForBus={handleBookTripForBus}
        />
      )}

      {/* 4. Active Buses Telemetry Grid */}
      {(activeTab === 'fleet' || activeTab === 'map') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-700" />
                <span>{isAm ? 'የቀጥታ አውቶቡሶች ቴሌሜትሪ' : 'Live Fleet Telemetry Stream'}</span>
              </h3>
              <span className="text-xs text-neutral-500">
                {displayedBuses.length} {isAm ? 'አውቶቡሶች በመንገድ ላይ' : 'buses currently monitored'}
              </span>
            </div>

            {/* Corridor Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-bold mr-1">{isAm ? 'መስመር፡' : 'Corridor:'}</span>
              {[
                { id: 'all', labelEn: 'All Corridors', labelAm: 'ሁሉም መስመሮች' },
                { id: 'addis', labelEn: 'To Addis Ababa', labelAm: 'ወደ አዲስ አበባ' },
                { id: 'amhara', labelEn: 'Amhara Routes', labelAm: 'የአማራ መስመሮች' },
                { id: 'south', labelEn: 'Rift Valley / South', labelAm: 'ስምጥ ሸለቆ / ደቡብ' },
                { id: 'feeders', labelEn: 'Woreda Feeders', labelAm: 'የወረዳ መጋቢዎች' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setCorridorFilter(f.id as any);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                    corridorFilter === f.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {isAm ? f.labelAm : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedBuses.map((bus) => {
              const fromSt = getEthiopiaStationById(bus.fromStationId);
              const toSt = getEthiopiaStationById(bus.toStationId);
              const isSelected = bus.id === selectedBusId;

              return (
                <div
                  key={bus.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs transition duration-200 space-y-4 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:border-emerald-300'
                  }`}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedBusId(bus.id);
                    setSelectedCommuterId(null);
                  }}
                >
                  {/* Card Header: Bus info & current speed */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="font-extrabold text-base text-neutral-900">
                          {isAm ? bus.busCompanyAm : bus.busCompany}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                        <span className="font-mono font-bold text-neutral-700">{bus.plateNumber}</span>
                        <span>•</span>
                        <span>{bus.vehicleType}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{bus.highwayCode}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 text-xs font-bold font-mono">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{bus.currentSpeedKmH} km/h</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 block font-mono mt-0.5">
                        Alt: {bus.currentAltitudeM}m
                      </span>
                    </div>
                  </div>

                  {/* Route corridor origin -> destination */}
                  <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                        {isAm ? 'መነሻ' : 'Origin'}
                      </span>
                      <strong className="text-neutral-900">
                        {fromSt ? (isAm ? fromSt.cityAm : fromSt.city) : bus.fromStationId}
                      </strong>
                    </div>

                    <div className="text-center px-2">
                      <ArrowRight className="w-4 h-4 text-emerald-700 mx-auto" />
                      <span className="text-[10px] font-mono text-neutral-500">
                        ~{bus.estimatedArrivalMin} min
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                        {isAm ? 'መድረሻ' : 'Destination'}
                      </span>
                      <strong className="text-neutral-900">
                        {toSt ? (isAm ? toSt.cityAm : toSt.city) : bus.toStationId}
                      </strong>
                    </div>
                  </div>

                  {/* Real-time progress bar & passed waypoint */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isAm ? 'ያለፈበት፡' : 'Passing:'} </span>
                        <strong className="text-neutral-900">
                          {isAm ? bus.lastCheckpointAm : bus.lastCheckpoint}
                        </strong>
                      </span>
                      <span className="font-mono font-bold text-emerald-800">
                        {Math.round(bus.progressPercent)}% {isAm ? 'ተጠናቋል' : 'completed'}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-700"
                        style={{ width: `${bus.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Occupancy and Live Status Container */}
                  <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span className="text-xs text-slate-300">
                          {isAm ? 'ተሳፋሪዎች፡' : 'Passenger Load:'}{' '}
                          <strong className="text-white font-mono">{bus.occupiedSeats} / {bus.totalSeats}</strong>
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          bus.status === 'ahead'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : bus.status === 'delayed'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-teal-950 text-teal-300 border-teal-500/40'
                        }`}
                      >
                        <span>{isAm ? bus.statusLabelAm : bus.statusLabelEn}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>
                        {isAm ? 'ቀጣይ ማቆሚያ፡' : 'Approaching:'}{' '}
                        <strong className="text-slate-200">
                          {isAm ? bus.nextCheckpointAm : bus.nextCheckpoint}
                        </strong>
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">
                        ETA ~{bus.estimatedArrivalMin}m
                      </span>
                    </div>
                  </div>

                  {/* Driver contact and book button */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-xs">
                    <div className="text-neutral-500">
                      <span>{isAm ? 'አሽከርካሪ፡ ' : 'Captain: '}</span>
                      <span className="font-bold text-neutral-800">{bus.driverName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${bus.driverPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold transition text-xs flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <span>{isAm ? 'ደውል' : 'Call'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookTripForBus(bus.tripId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition text-xs shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Bus className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isAm ? 'ቦታ ያዝ' : 'Book Seat'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Commuters & Waiting Passengers Radar Section */}
      {(activeTab === 'commuters' || activeTab === 'map') && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>{isAm ? 'በየጣቢያውና በመንገድ ላይ ያሉ ተሳፋሪዎች ራዳር' : 'Live Commuter Radar & Roadside Pickups'}</span>
              </h3>
              <span className="text-xs text-neutral-500">
                {displayedCommuters.length} {isAm ? 'ተሳፋሪዎች በራዳር ላይ' : 'commuters waiting'}
              </span>
            </div>

            {/* Commuter Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-bold mr-1">{isAm ? 'ሁኔታ፡' : 'Status:'}</span>
              {[
                { id: 'all', labelEn: 'All Commuters', labelAm: 'ሁሉም ተሳፋሪዎች' },
                { id: 'roadside', labelEn: 'Roadside Pickups', labelAm: 'የመንገድ ዳር ምልክቶች' },
                { id: 'terminal', labelEn: 'Waiting at Terminals', labelAm: 'በመናኸሪያ የሚጠብቁ' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setCommuterFilter(f.id as any);
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer text-[11px] ${
                    commuterFilter === f.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {isAm ? f.labelAm : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayedCommuters.map((commuter) => {
              const isSelected = commuter.id === selectedCommuterId;
              const isCurrentUser = commuter.isCurrentUser;

              return (
                <div
                  key={commuter.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedCommuterId(commuter.id);
                    setSelectedBusId(null);
                  }}
                  className={`bg-white rounded-2xl border p-4 shadow-xs transition duration-150 space-y-3 cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-neutral-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCurrentUser
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {commuter.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-neutral-900 truncate">
                          {isAm ? commuter.nameAm : commuter.name}
                        </h4>
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {commuter.phone}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        commuter.status === 'roadside_beacon'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {commuter.status === 'roadside_beacon'
                        ? isAm ? 'የመንገድ ምልክት' : 'Roadside'
                        : isAm ? 'በመናኸሪያው' : 'At Station'}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-xs space-y-1">
                    <div className="text-[11px]">
                      <span className="text-neutral-500">{isAm ? 'መነሻ፡ ' : 'From: '}</span>
                      <strong className="text-neutral-900 truncate block">
                        {isAm ? commuter.currentStationNameAm : commuter.currentStationName}
                      </strong>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-neutral-500">{isAm ? 'መድረሻ፡ ' : 'To: '}</span>
                      <strong className="text-emerald-800 truncate block">
                        {isAm ? commuter.destinationNameAm : commuter.destinationName}
                      </strong>
                    </div>
                    {commuter.pickupNote && (
                      <p className="text-[10px] text-neutral-600 italic pt-1 border-t border-neutral-200 line-clamp-1">
                        "{commuter.pickupNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {isAm ? 'የሚጠብቀው፡ ' : 'Wait: '}~{commuter.waitTimeMinutes} min
                    </span>

                    <a
                      href={`tel:${commuter.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                    >
                      <Phone className="w-3 h-3 text-amber-700" />
                      <span>{isAm ? 'ደውል' : 'Call'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

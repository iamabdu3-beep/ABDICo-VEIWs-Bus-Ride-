import React, { useState, useMemo, useEffect } from 'react';
import {
  BusStation,
  RideTrip,
  RideShareOffer,
  VehicleCategory,
  Language,
  PlannedTripItinerary,
  PlannedTripLeg,
  SavedTripPlan,
  TripPlanSortOption,
  WeatherAlert,
  BookingTicket,
  UserProfile,
} from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import {
  generatePlannedTrips,
  POPULAR_PLANNED_JOURNEYS,
  getSavedTripPlans,
  saveTripPlan,
  deleteSavedTripPlan,
} from '../utils/tripPlannerEngine';
import { MultiLegBookingModal } from './MultiLegBookingModal';
import {
  Compass,
  ArrowRightLeft,
  Calendar,
  Clock,
  Filter,
  ArrowRight,
  Bus,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  Printer,
  Share2,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingDown,
  Leaf,
  Plus,
  Trash2,
  Route,
  Coffee,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface TripPlannerViewProps {
  lang: Language;
  trips: RideTrip[];
  offers: RideShareOffer[];
  initialOriginId?: string;
  initialDestId?: string;
  onSelectTripToBook: (trip: RideTrip) => void;
  onViewOnMap: (originId: string, destId: string) => void;
  weatherAlerts?: Record<string, WeatherAlert>;
  onShowToast?: (msg: string) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onMultiLegBookingConfirmed?: (tickets: BookingTicket[]) => void;
  onViewTicket?: (ticket: BookingTicket) => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  lang,
  trips,
  offers,
  initialOriginId = 'bahir-dar',
  initialDestId = 'lalibela',
  onSelectTripToBook,
  onViewOnMap,
  weatherAlerts = {},
  onShowToast,
  currentUser,
  onOpenLogin,
  onMultiLegBookingConfirmed,
  onViewTicket,
}) => {
  const t = translations[lang];
  const isAm = lang === 'am';

  // Planner Form State
  const [originId, setOriginId] = useState<string>(initialOriginId);
  const [destId, setDestId] = useState<string>(initialDestId);
  const [viaId, setViaId] = useState<string>('');
  const [showViaInput, setShowViaInput] = useState<boolean>(false);
  const [travelDate, setTravelDate] = useState<string>('2026-09-16');
  const [departureWindow, setDepartureWindow] = useState<'any' | 'early' | 'morning' | 'afternoon'>('any');
  const [maxTransfers, setMaxTransfers] = useState<number>(2);
  const [vehiclePreference, setVehiclePreference] = useState<'all' | VehicleCategory>('all');
  const [sortBy, setSortBy] = useState<TripPlanSortOption>('fastest');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [routeTypeFilter, setRouteTypeFilter] = useState<'all' | 'direct' | 'multileg'>('all');

  // Multi-Leg Booking Modal State (two separate ticket workflows in one transaction)
  const [multiLegModalItinerary, setMultiLegModalItinerary] = useState<PlannedTripItinerary | null>(null);

  // Active view tab: 'plans' vs 'saved'
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'saved'>('plans');

  // UI Expanded cards state
  const [expandedItineraryId, setExpandedItineraryId] = useState<string | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedTripPlan[]>([]);
  const [saveModalItinerary, setSaveModalItinerary] = useState<PlannedTripItinerary | null>(null);
  const [planNotesInput, setPlanNotesInput] = useState<string>('');
  const [printModalPlan, setPrintModalPlan] = useState<PlannedTripItinerary | null>(null);

  // Load saved plans on mount
  useEffect(() => {
    setSavedPlans(getSavedTripPlans());
  }, []);

  // Update initial stations if changed from parent
  useEffect(() => {
    if (initialOriginId) setOriginId(initialOriginId);
    if (initialDestId && initialDestId !== initialOriginId) setDestId(initialDestId);
  }, [initialOriginId, initialDestId]);

  // Compute generated itineraries
  const generatedItineraries = useMemo(() => {
    if (!originId || !destId || originId === destId) return [];

    return generatePlannedTrips(
      {
        originId,
        destId,
        viaId: showViaInput && viaId ? viaId : undefined,
        travelDate,
        departureWindow,
        maxTransfers,
        vehiclePreference,
        sortBy,
        passengerCount,
      },
      trips,
      offers
    );
  }, [
    originId,
    destId,
    viaId,
    showViaInput,
    travelDate,
    departureWindow,
    maxTransfers,
    vehiclePreference,
    sortBy,
    passengerCount,
    trips,
    offers,
  ]);

  // Check if direct scheduled trips exist in trips array
  const directTripsAvailable = useMemo(() => {
    return trips.some((t) => t.fromStationId === originId && t.toStationId === destId);
  }, [trips, originId, destId]);

  const directItinerariesCount = useMemo(() => {
    return generatedItineraries.filter((it) => it.transferCount === 0).length;
  }, [generatedItineraries]);

  const isNoDirectRoute = useMemo(() => {
    return !directTripsAvailable && directItinerariesCount === 0;
  }, [directTripsAvailable, directItinerariesCount]);

  // Discover available transfer hubs connecting origin and destination
  const availableTransferHubs = useMemo(() => {
    const hubMap = new Map<string, BusStation>();
    generatedItineraries.forEach((it) => {
      if (it.transferCount > 0 && it.legs.length >= 2) {
        const transferSt = it.legs[0].toStation;
        if (transferSt && transferSt.id !== originId && transferSt.id !== destId) {
          hubMap.set(transferSt.id, transferSt);
        }
      }
    });
    return Array.from(hubMap.values());
  }, [generatedItineraries, originId, destId]);

  // Filter itineraries by routeTypeFilter
  const displayedItineraries = useMemo(() => {
    if (routeTypeFilter === 'direct') {
      return generatedItineraries.filter((it) => it.transferCount === 0);
    }
    if (routeTypeFilter === 'multileg') {
      return generatedItineraries.filter((it) => it.transferCount > 0);
    }
    return generatedItineraries;
  }, [generatedItineraries, routeTypeFilter]);

  // Automatically expand the first itinerary on new search results
  useEffect(() => {
    if (displayedItineraries.length > 0 && !expandedItineraryId) {
      setExpandedItineraryId(displayedItineraries[0].id);
    }
  }, [displayedItineraries]);

  // Swap origin and destination
  const handleSwapStations = () => {
    triggerHaptic(15);
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  // Quick preset click
  const handleSelectPopularJourney = (p: (typeof POPULAR_PLANNED_JOURNEYS)[0]) => {
    triggerHaptic(15);
    setOriginId(p.originId);
    setDestId(p.destId);
    setViaId('');
    setShowViaInput(false);
    setActiveSubTab('plans');
    if (onShowToast) {
      onShowToast(
        isAm
          ? `የታቀደ መስመር ተመርጧል፡ ${p.titleAm}`
          : `Selected popular corridor: ${p.titleEn}`
      );
    }
  };

  // Save itinerary handler
  const handleOpenSaveModal = (itinerary: PlannedTripItinerary) => {
    triggerHaptic(10);
    setSaveModalItinerary(itinerary);
    setPlanNotesInput('');
  };

  const handleConfirmSavePlan = () => {
    if (!saveModalItinerary) return;
    triggerHaptic(20);
    const saved = saveTripPlan(
      saveModalItinerary,
      travelDate,
      passengerCount,
      planNotesInput.trim() || undefined
    );
    setSavedPlans(getSavedTripPlans());
    setSaveModalItinerary(null);
    if (onShowToast) {
      onShowToast(t.planSaved);
    }
  };

  const handleDeleteSaved = (id: string) => {
    triggerHaptic(15);
    deleteSavedTripPlan(id);
    setSavedPlans(getSavedTripPlans());
    if (onShowToast) {
      onShowToast(isAm ? 'እቅዱ ተሰርዟል' : 'Trip plan removed');
    }
  };

  // Book action - launches 2-in-1 Multi-Leg booking workflow if transferCount > 0
  const handleBookItinerary = (itinerary: PlannedTripItinerary) => {
    triggerHaptic(20);

    // If multi-leg (has transfers or 2+ legs), open the 2-in-1 multi-leg booking modal!
    if (itinerary.transferCount > 0 || itinerary.legs.length >= 2) {
      setMultiLegModalItinerary(itinerary);
      return;
    }

    // If direct and has matching trip ID in trips, book directly
    if (itinerary.transferCount === 0 && itinerary.legs[0]?.matchedTripId) {
      const match = trips.find((t) => t.id === itinerary.legs[0].matchedTripId);
      if (match) {
        onSelectTripToBook(match);
        return;
      }
    }

    // Otherwise create virtual combined trip for checkout
    const firstLeg = itinerary.legs[0];
    const lastLeg = itinerary.legs[itinerary.legs.length - 1];

    const virtualTrip: RideTrip = {
      id: `trip-plan-${itinerary.id}`,
      busCompany:
        itinerary.transferCount === 0
          ? firstLeg.operatorName
          : `${firstLeg.operatorName} + ${lastLeg.operatorName}`,
      busCompanyAm:
        itinerary.transferCount === 0
          ? firstLeg.operatorNameAm
          : `${firstLeg.operatorNameAm} + ${lastLeg.operatorNameAm}`,
      vehicleType: firstLeg.vehicleType,
      plateNumber: `ET 03-P${Math.floor(10000 + Math.random() * 90000)}`,
      driverName: 'Regional Network Verified Captain',
      driverPhone: '+251 91 100 8822',
      driverRating: 4.9,
      fromStationId: itinerary.originStation.id,
      toStationId: itinerary.destStation.id,
      departureTime: itinerary.departureTime,
      arrivalTime: itinerary.arrivalTime,
      durationFormatted: itinerary.totalDurationFormatted,
      priceETB: itinerary.totalFareETB,
      totalSeats: 49,
      bookedSeats: [1, 2, 5, 6, 12, 18, 24, 25],
      amenities: [
        'Multi-Leg Coordinated Transfer',
        'Luggage Protection',
        'Telebirr Cashless QR',
        ...itinerary.scenicHighlights.slice(0, 2),
      ],
      status: 'scheduled',
      isRideshareCommunity: false,
      routeStops: [
        itinerary.originStation.name,
        ...itinerary.legs.map((l) => l.toStation.name),
      ],
    };

    onSelectTripToBook(virtualTrip);
  };

  // Helper for weather warnings on route
  const getRouteWeatherWarnings = (itinerary: PlannedTripItinerary) => {
    const stations = [itinerary.originStation, ...itinerary.legs.map((l) => l.toStation)];
    const activeWarnings: WeatherAlert[] = [];
    stations.forEach((st) => {
      const alert = weatherAlerts[st.id];
      if (alert && alert.isActive) {
        activeWarnings.push(alert);
      }
    });
    return activeWarnings;
  };

  const originStationObj = AMHARA_STATIONS.find((s) => s.id === originId) || AMHARA_STATIONS[0];
  const destStationObj = AMHARA_STATIONS.find((s) => s.id === destId) || AMHARA_STATIONS[1];

  return (
    <div className="space-y-6">
      {/* Top Banner / Planner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-800/80 text-amber-300 border border-emerald-600/50 shadow-xs">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {isAm ? 'የአማራ ትራንዚት አቅጣጫዎችና እቅድ' : 'Amhara Transit Network Pathfinder'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {t.tripPlannerTitle}
                </h1>
              </div>
            </div>

            {/* Sub-tab pills: Plan Routes vs Saved Plans */}
            <div className="flex items-center bg-black/30 p-1 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveSubTab('plans');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeSubTab === 'plans'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>{t.allPlansTab}</span>
                {generatedItineraries.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 rounded-full text-[10px]">
                    {generatedItineraries.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setActiveSubTab('saved');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeSubTab === 'saved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{t.savedPlansTab}</span>
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 rounded-full text-[10px]">
                  {savedPlans.length}
                </span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
            {t.tripPlannerSubtitle}
          </p>

          {/* Key highlights banner metrics */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-emerald-800/50 text-xs text-emerald-200/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>15 Regional Hubs</span>
            </span>
            <span>·</span>
            <span>48 Synchronized Corridors</span>
            <span>·</span>
            <span>Dijkstra Shortest & Scenic Graph</span>
            <span>·</span>
            <span className="text-amber-300 font-semibold">Elevation & Pass Warnings</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'plans' ? (
        <div className="space-y-6">
          {/* Trip Builder Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-emerald-600" />
                <span>{t.planYourTrip}</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setShowViaInput(!showViaInput);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showViaInput ? t.removeViaStop : t.addViaStop}</span>
                </button>
              </div>
            </div>

            {/* Station Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Origin Terminal */}
              <div className={showViaInput ? 'md:col-span-3' : 'md:col-span-5'}>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{t.originTerminal}</span>
                </label>
                <div className="relative">
                  <select
                    value={originId}
                    onChange={(e) => {
                      triggerHaptic(10);
                      setOriginId(e.target.value);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-300 hover:border-emerald-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-neutral-900 text-sm font-semibold rounded-2xl py-2.5 px-3.5 appearance-none cursor-pointer pr-9 shadow-2xs"
                  >
                    <optgroup label="⭐ Federal Terminals (ብሔራዊ / ፌደራል)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'federal').map((s) => (
                        <option key={`origin-${s.id}`} value={s.id} disabled={s.id === destId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏛️ Regional Capitals (የክልል ማዕከላት)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'regional').map((s) => (
                        <option key={`origin-${s.id}`} value={s.id} disabled={s.id === destId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏢 Zonal Hubs (የዞን መናኸሪያዎች)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'zonal').map((s) => (
                        <option key={`origin-${s.id}`} value={s.id} disabled={s.id === destId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏘️ Woreda Stations (የወረዳ ጣቢያዎች)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'woreda' || !s.hierarchyTier).map((s) => (
                        <option key={`origin-${s.id}`} value={s.id} disabled={s.id === destId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Station Swap Button */}
              <div className="flex justify-center md:col-span-1">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="w-10 h-10 rounded-2xl bg-neutral-100 hover:bg-emerald-100 text-neutral-700 hover:text-emerald-800 border border-neutral-200 flex items-center justify-center transition cursor-pointer shadow-2xs active:scale-95"
                  title={t.swapStations}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Optional Stopover Terminal */}
              {showViaInput && (
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>{t.viaTerminalOptional}</span>
                  </label>
                  <div className="relative">
                    <select
                      value={viaId}
                      onChange={(e) => {
                        triggerHaptic(10);
                        setViaId(e.target.value);
                      }}
                      className="w-full bg-amber-50/50 border border-amber-300 hover:border-amber-600 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-neutral-900 text-sm font-semibold rounded-2xl py-2.5 px-3.5 appearance-none cursor-pointer pr-9 shadow-2xs"
                    >
                      <option value="">{isAm ? '-- ማለፊያ ምረጥ --' : '-- Select Stopover Hub --'}</option>
                      {AMHARA_STATIONS.map((s) => (
                        <option
                          key={`via-${s.id}`}
                          value={s.id}
                          disabled={s.id === originId || s.id === destId}
                        >
                          {isAm ? `${s.cityAm}` : `${s.city}`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Destination Terminal */}
              <div className={showViaInput ? 'md:col-span-3' : 'md:col-span-5'}>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>{t.destinationTerminal}</span>
                </label>
                <div className="relative">
                  <select
                    value={destId}
                    onChange={(e) => {
                      triggerHaptic(10);
                      setDestId(e.target.value);
                    }}
                    className="w-full bg-neutral-50 border border-neutral-300 hover:border-emerald-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-neutral-900 text-sm font-semibold rounded-2xl py-2.5 px-3.5 appearance-none cursor-pointer pr-9 shadow-2xs"
                  >
                    <optgroup label="⭐ Federal Terminals (ብሔራዊ / ፌደራል)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'federal').map((s) => (
                        <option key={`dest-${s.id}`} value={s.id} disabled={s.id === originId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏛️ Regional Capitals (የክልል ማዕከላት)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'regional').map((s) => (
                        <option key={`dest-${s.id}`} value={s.id} disabled={s.id === originId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏢 Zonal Hubs (የዞን መናኸሪያዎች)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'zonal').map((s) => (
                        <option key={`dest-${s.id}`} value={s.id} disabled={s.id === originId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏘️ Woreda Stations (የወረዳ ጣቢያዎች)">
                      {AMHARA_STATIONS.filter((s) => s.hierarchyTier === 'woreda' || !s.hierarchyTier).map((s) => (
                        <option key={`dest-${s.id}`} value={s.id} disabled={s.id === originId}>
                          {isAm ? `${s.cityAm} (${s.nameAm})` : `${s.city} - ${s.name}`}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Passenger Count */}
              <div className={showViaInput ? 'md:col-span-2' : 'md:col-span-1'}>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  {t.passengerCount}
                </label>
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(parseInt(e.target.value, 10))}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-2xl py-2.5 px-3 text-sm font-bold text-neutral-900 cursor-pointer shadow-2xs"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5+</option>
                </select>
              </div>
            </div>

            {/* Filters & Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-neutral-100">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t.date}</span>
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 cursor-pointer"
                />
              </div>

              {/* Departure Window */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t.departureWindow}</span>
                </label>
                <select
                  value={departureWindow}
                  onChange={(e) => setDepartureWindow(e.target.value as any)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 cursor-pointer"
                >
                  <option value="any">{t.anyTime}</option>
                  <option value="early">{t.earlyDawn}</option>
                  <option value="morning">{t.morningWindow}</option>
                  <option value="afternoon">{t.afternoonWindow}</option>
                </select>
              </div>

              {/* Max Transfers */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t.maxTransfers}</span>
                </label>
                <select
                  value={maxTransfers}
                  onChange={(e) => setMaxTransfers(parseInt(e.target.value, 10))}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 cursor-pointer"
                >
                  <option value={2}>{t.anyTransfers}</option>
                  <option value={0}>{t.directOnly}</option>
                  <option value={1}>{t.oneTransferMax}</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isAm ? 'ቅደም-ተከተል' : 'Sort Criteria'}</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as TripPlanSortOption)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 cursor-pointer"
                >
                  <option value="fastest">{t.sortByFastest}</option>
                  <option value="cheapest">{t.sortByCheapest}</option>
                  <option value="fewest_transfers">{t.sortByFewestTransfers}</option>
                  <option value="scenic">{t.sortByScenic}</option>
                </select>
              </div>
            </div>

            {/* Quick Inspiration Ribbon */}
            <div className="pt-3 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-500 block mb-2">
                {t.popularPlannedRoutes}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {POPULAR_PLANNED_JOURNEYS.map((p) => {
                  const isSelected = originId === p.originId && destId === p.destId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPopularJourney(p)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold truncate">
                          {isAm ? p.titleAm : p.titleEn}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold shrink-0 ml-1">
                          {p.typicalDuration}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 block truncate">
                        {isAm ? p.descriptionAm : p.descriptionEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* No Direct Route Notification & Multi-Leg Connected Finder Banner */}
          {isNoDirectRoute && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-emerald-500/10 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shrink-0 font-bold shadow-xs">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400 font-mono">
                        {t.noDirectRouteAlertTitle}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {availableTransferHubs.length} {isAm ? 'የመሸጋገሪያ መናኸሪያዎች ተገኝተዋል' : 'Connecting Hubs Found'}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-neutral-900 mt-1">
                      {isAm
                        ? `ከ${originStationObj.cityAm} ወደ ${destStationObj.cityAm} ቀጥታ አውቶቡስ የለም`
                        : `No direct bus route currently operates between ${originStationObj.city} and ${destStationObj.city}`}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed max-w-2xl">
                      {t.noDirectRouteAlertDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setRouteTypeFilter('multileg');
                    if (maxTransfers === 0) setMaxTransfers(2);
                    if (onShowToast) {
                      onShowToast(
                        isAm
                          ? 'የተገናኙ ባለ2-ደረጃ ጉዞዎች ተዘርዝረዋል (2 ትኬቶች በ1 ክፍያ)'
                          : 'Activated multi-leg journey finder with coordinated transfers'
                      );
                    }
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950" />
                  <span>{t.searchMultiLegJourneysBtn}</span>
                </button>
              </div>

              {/* Transfer Hub quick selector pills */}
              {availableTransferHubs.length > 0 && (
                <div className="pt-3 border-t border-amber-300/50 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-neutral-700 text-[11px]">
                    {isAm ? 'በኩል ማለፊያ መናኸሪያ ይምረጡ፡' : 'Connect via Transfer Hub:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setViaId('');
                      setShowViaInput(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                      !viaId
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300'
                    }`}
                  >
                    {isAm ? 'ሁሉም የተገኙ መናኸሪያዎች' : 'All Recommended Hubs'}
                  </button>
                  {availableTransferHubs.map((hub) => {
                    const isSelected = viaId === hub.id;
                    return (
                      <button
                        key={hub.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setViaId(hub.id);
                          setShowViaInput(true);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300'
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{isAm ? `በ${hub.cityAm} በኩል` : `Via ${hub.city}`}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="text-base font-extrabold text-neutral-900">
                  {t.itinerariesFound} ({displayedItineraries.length})
                </h3>
                <span className="text-xs text-neutral-500">
                  {isAm
                    ? `ከ${originStationObj.cityAm} ወደ ${destStationObj.cityAm}`
                    : `${originStationObj.city} ➔ ${destStationObj.city}`}
                </span>
              </div>

              {/* Route Type Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-neutral-100 p-1 rounded-2xl border border-neutral-200 text-xs font-bold flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setRouteTypeFilter('all');
                    }}
                    className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                      routeTypeFilter === 'all'
                        ? 'bg-white text-neutral-900 shadow-2xs font-black'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {isAm ? 'ሁሉም' : 'All'} ({generatedItineraries.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setRouteTypeFilter('direct');
                    }}
                    className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                      routeTypeFilter === 'direct'
                        ? 'bg-white text-neutral-900 shadow-2xs font-black'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {isAm ? 'ቀጥታ' : 'Direct'} ({directItinerariesCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setRouteTypeFilter('multileg');
                    }}
                    className={`px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                      routeTypeFilter === 'multileg'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs font-black'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    <ArrowRightLeft className="w-3 h-3 text-emerald-800" />
                    <span>{isAm ? 'ባለ2-ደረጃ (2 በ1)' : 'Multi-Leg (2-in-1)'}</span>
                    <span className="text-[10px] bg-black/10 px-1.5 py-0.2 rounded-full">
                      {generatedItineraries.filter((it) => it.transferCount > 0).length}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onViewOnMap(originId, destId)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.viewOnMap}</span>
                </button>
              </div>
            </div>

            {displayedItineraries.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 space-y-3">
                <Compass className="w-12 h-12 text-neutral-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-neutral-800">
                  {routeTypeFilter === 'direct' && isNoDirectRoute
                    ? (isAm ? 'በእነዚህ ከተሞች መካከል ምንም አይነት ቀጥታ አውቶቡስ የለም' : 'No direct bus route connects these stations')
                    : t.noItinerariesMatch}
                </h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  {routeTypeFilter === 'direct' && isNoDirectRoute
                    ? (isAm
                        ? 'ባለ2-ደረጃ የተቀናጀ የጉዞ አማራጮችን በመጠቀም ሁለቱንም ትኬቶች በአንድ ግብይት መቁረጥ ይችላሉ።'
                        : 'Search for multi-leg connecting journeys to book both coordinated tickets in 1 single transaction.')
                    : (isAm
                        ? 'የተመረጡትን ከተሞች የሚያገናኝ መስመር ለማግኘት የዝውውር ገደብዎን ወደ «ሁሉም» ይቀይሩ ወይም መነሻ/መድረሻ ይለውጡ።'
                        : 'Try selecting "Any (Direct or Connecting)" under transfers or select a different destination.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setRouteTypeFilter('multileg');
                    setMaxTransfers(2);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-extrabold rounded-2xl text-xs hover:bg-emerald-500 transition cursor-pointer shadow-md"
                >
                  {isAm ? 'የተገናኙ ባለ2-ደረጃ ጉዞዎችን አሳይ' : 'Show Multi-Leg Connecting Journeys'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedItineraries.map((itinerary, itIdx) => {
                  const isExpanded = expandedItineraryId === itinerary.id;
                  const warnings = getRouteWeatherWarnings(itinerary);
                  const isDirect = itinerary.transferCount === 0;

                  return (
                    <div
                      key={itinerary.id}
                      className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden ${
                        isExpanded
                          ? 'border-emerald-500/80 ring-2 ring-emerald-500/10'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Itinerary Header Bar */}
                      <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-neutral-50/50">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Titles & Tag */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Direct vs Transfer pill */}
                              {isDirect ? (
                                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  {t.directTrip}
                                </span>
                              ) : (
                                <>
                                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 font-mono">
                                    <ArrowRightLeft className="w-3 h-3 text-amber-700" />
                                    <span>
                                      {isAm
                                        ? `ባለ2-ደረጃ ጉዞ (${itinerary.legs[0]?.toStation.cityAm} በኩል)`
                                        : `Coordinated Multi-Leg (via ${itinerary.legs[0]?.toStation.city})`}
                                    </span>
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-700" />
                                    <span>{isAm ? '2 ትኬት በ1 ክፍያ' : '2 Tickets · 1 Txn'}</span>
                                  </span>
                                </>
                              )}

                              {/* Category tag */}
                              {itinerary.categoryTag === 'fastest' && (
                                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  <span>{isAm ? 'በጣም ፈጣን' : 'Fastest Option'}</span>
                                </span>
                              )}
                              {itinerary.categoryTag === 'cheapest' && (
                                <span className="text-[11px] font-bold bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3 text-green-600" />
                                  <span>{isAm ? 'ምርጥ ዋጋ' : 'Best Value'}</span>
                                </span>
                              )}
                              {itinerary.categoryTag === 'scenic' && (
                                <span className="text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Mountain className="w-3 h-3 text-amber-700" />
                                  <span>{isAm ? 'ማራኪ የተፈጥሮ መስመር' : 'Scenic Highland'}</span>
                                </span>
                              )}

                              {warnings.length > 0 && (
                                <span className="text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>
                                    {isAm ? 'የአየር ሁኔታ ማሳሰቢያ' : `${warnings.length} Corridor Advisory`}
                                  </span>
                                </span>
                              )}
                            </div>

                            <h4 className="text-base sm:text-lg font-black text-neutral-900 tracking-tight">
                              {isAm ? itinerary.titleAm : itinerary.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-600 font-medium">
                              <span>
                                {isAm ? 'የመነሻ ሰዓት፡' : 'Dep:'}{' '}
                                <strong className="text-neutral-900 font-extrabold">
                                  {itinerary.departureTime}
                                </strong>
                              </span>
                              <span>➔</span>
                              <span>
                                {isAm ? 'የመድረሻ ሰዓት፡' : 'Arr:'}{' '}
                                <strong className="text-neutral-900 font-extrabold">
                                  {itinerary.arrivalTime}
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                {isAm ? 'ዋና ኦፕሬተሮች፡' : 'Operators:'}{' '}
                                {itinerary.legs.map((l) => (isAm ? l.operatorNameAm : l.operatorName)).join(' + ')}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Metrics Summary */}
                          <div className="grid grid-cols-3 gap-3 bg-neutral-100/70 p-3 rounded-2xl border border-neutral-200/80 text-center shrink-0">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                                {t.totalDuration}
                              </span>
                              <span className="text-sm font-black text-neutral-900 block font-mono">
                                {itinerary.totalDurationFormatted}
                              </span>
                            </div>

                            <div className="border-x border-neutral-200 px-2">
                              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                                {t.totalDistance}
                              </span>
                              <span className="text-sm font-black text-neutral-900 block font-mono">
                                {itinerary.totalDistanceKm} km
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase font-bold text-neutral-500 block">
                                {t.totalEstimatedFare}
                              </span>
                              <span className="text-sm font-black text-emerald-800 block font-mono">
                                {itinerary.totalFareETB * passengerCount} ETB
                              </span>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isDirect ? (
                              <button
                                type="button"
                                onClick={() => handleBookItinerary(itinerary)}
                                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t.bookThisPlan}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  triggerHaptic(20);
                                  setMultiLegModalItinerary(itinerary);
                                }}
                                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 ring-2 ring-emerald-500/20"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{isAm ? 'ባለ2-ደረጃ ያዝ (2 ትኬት · 1 ክፍያ)' : 'Book Multi-Leg (2 Tickets · 1 Txn)'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenSaveModal(itinerary)}
                              className="p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition cursor-pointer"
                              title={t.savePlan}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(10);
                                setExpandedItineraryId(isExpanded ? null : itinerary.id);
                              }}
                              className="p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 transition cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand Details'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Route schematic timeline strip */}
                        <div className="mt-4 pt-3 border-t border-neutral-200/60">
                          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 overflow-x-auto pb-1 gap-2">
                            {/* Origin Node */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 shrink-0" />
                              <div>
                                <span className="block font-black text-neutral-900 leading-tight">
                                  {isAm ? itinerary.originStation.cityAm : itinerary.originStation.city}
                                </span>
                                <span className="block text-[10px] text-neutral-500 font-mono">
                                  {itinerary.departureTime}
                                </span>
                              </div>
                            </div>

                            {/* Connecting Legs */}
                            {itinerary.legs.map((leg, legIdx) => (
                              <React.Fragment key={leg.id}>
                                <div className="flex-1 flex flex-col items-center px-2 min-w-[120px]">
                                  <div className="w-full flex items-center">
                                    <div className="h-0.5 w-full bg-emerald-400" />
                                    <Bus className="w-3.5 h-3.5 text-emerald-700 mx-1 shrink-0" />
                                    <div className="h-0.5 w-full bg-emerald-400" />
                                  </div>
                                  <div className="text-[10px] text-neutral-500 mt-1 text-center font-mono">
                                    <span>{leg.distanceKm} km · {leg.durationFormatted}</span>
                                  </div>
                                </div>

                                {/* Destination of this leg */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span
                                    className={`w-3 h-3 rounded-full ring-4 shrink-0 ${
                                      legIdx === itinerary.legs.length - 1
                                        ? 'bg-rose-600 ring-rose-100'
                                        : 'bg-amber-500 ring-amber-100'
                                    }`}
                                  />
                                  <div>
                                    <span className="block font-black text-neutral-900 leading-tight">
                                      {isAm ? leg.toStation.cityAm : leg.toStation.city}
                                    </span>
                                    <span className="block text-[10px] text-neutral-500 font-mono">
                                      {leg.arrivalTime}
                                    </span>
                                  </div>
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Turn-By-Turn Details */}
                      {isExpanded && (
                        <div className="p-5 sm:p-6 bg-neutral-50 border-t border-neutral-200 space-y-6">
                          {/* Weather warnings on this itinerary */}
                          {warnings.length > 0 && (
                            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-950 space-y-1.5 text-xs">
                              <div className="flex items-center gap-2 font-bold text-amber-900">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>
                                  {isAm
                                    ? 'በዚህ ጉዞ መስመር ላይ ገቢር የአየር ሁኔታ ማሳሰቢያ አለ'
                                    : 'Corridor Weather Advisory Active'}
                                </span>
                              </div>
                              {warnings.map((w) => (
                                <p key={w.id} className="text-[11px] leading-relaxed pl-6">
                                  <strong>{isAm ? w.stationNameAm : w.stationName}:</strong>{' '}
                                  {isAm ? w.descriptionAm : w.description} (
                                  {isAm ? `የሚጠበቅ መዘግየት፡ +${w.expectedDelayMin} ደቂቃ` : `+${w.expectedDelayMin}m expected delay`}
                                  )
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Turn by turn legs */}
                          <div className="space-y-4">
                            <h5 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                              {isAm ? 'ደረጃ በደረጃ የጉዞ ዝርዝር (Step-by-Step Itinerary):' : 'Step-by-Step Itinerary Segments:'}
                            </h5>

                            {itinerary.legs.map((leg, legIdx) => (
                              <div
                                key={leg.id}
                                className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-2xs space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center">
                                      {legIdx + 1}
                                    </span>
                                    <div>
                                      <span className="text-xs font-black text-neutral-900 block">
                                        {isAm
                                          ? `ክፍል ${legIdx + 1}፡ ከ${leg.fromStation.cityAm} ወደ ${leg.toStation.cityAm}`
                                          : `Segment ${legIdx + 1}: ${leg.fromStation.city} ➔ ${leg.toStation.city}`}
                                      </span>
                                      <span className="text-[11px] text-neutral-500 font-medium">
                                        {isAm ? leg.operatorNameAm : leg.operatorName} ·{' '}
                                        <span className="font-semibold text-emerald-800">
                                          {leg.vehicleType}
                                        </span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-xs font-extrabold text-neutral-900 block">
                                      {leg.priceETB} ETB / seat
                                    </span>
                                    <span className="text-[10px] text-neutral-500">
                                      {isAm ? `የመጫኛ በር (Bay): ${leg.bayNumber || 4}` : `Platform Bay ${leg.bayNumber || 4}`}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-neutral-700">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                      {isAm ? 'የመንገድ ኮድና መልክአ-ምድር' : 'Highway & Terrain'}
                                    </span>
                                    <span className="font-bold text-neutral-900 block">
                                      {leg.highwayCode}
                                    </span>
                                    <span className="text-[11px] text-neutral-600">
                                      {isAm ? leg.terrainAm : leg.terrain}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                      {isAm ? 'የመነሻና መድረሻ ሰዓት' : 'Departure & Arrival'}
                                    </span>
                                    <span className="font-mono text-neutral-900 font-bold block">
                                      {leg.departureTime} ➔ {leg.arrivalTime}
                                    </span>
                                    <span className="text-[11px] text-neutral-600">
                                      {leg.distanceKm} km ({leg.durationFormatted})
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                      {isAm ? 'ማራኪ የመንገድ ገጽታዎች' : 'Scenic Highlights'}
                                    </span>
                                    <span className="text-[11px] text-neutral-800 font-medium block">
                                      {leg.scenicPoints.slice(0, 2).join(', ') || 'Highland Corridor'}
                                    </span>
                                  </div>
                                </div>

                                {/* Layover Box between legs */}
                                {leg.layoverAfterMinutes && leg.layoverStation && (
                                  <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-amber-950 font-bold">
                                      <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                                      <span>
                                        {isAm
                                          ? `በ${leg.layoverStation.cityAm} (${leg.layoverStation.nameAm}) የ${leg.layoverAfterMinutes} ደቂቃ ማረፊያና ዝውውር`
                                          : `${leg.layoverAfterMinutes} min Transfer Layover at ${leg.layoverStation.city} (${leg.layoverStation.name})`}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-amber-900/80 flex items-center gap-2">
                                      <span>
                                        {isAm
                                          ? 'የመናኸሪያ አገልግሎቶች፡ ካፌ፣ ጸሎት ቤት፣ መጸዳጃ፣ ቴሌብር'
                                          : 'Amenities: Cafeteria, Restroom, Prayer Area, Telebirr'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {/* Coordinated Multi-Leg Dual Ticket Booking Callout */}
                            {itinerary.transferCount > 0 && (
                              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                <div>
                                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                                    <Sparkles className="w-4 h-4 text-emerald-700" />
                                    <span>
                                      {isAm
                                        ? 'የተቀናጀ ባለሁለት-ደረጃ ትኬት ምዝገባ (2 ትኬቶች በ1 ክፍያ)'
                                        : 'Coordinated Multi-Leg Booking (2 Tickets in 1 Unified Transaction)'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-emerald-800 mt-0.5">
                                    {isAm
                                      ? 'ለእያንዳንዱ አውቶቡስ ወንበርዎን ለየብቻ ይምረጡ፤ ሻንጣዎን በአንድ መለያ ያስተላልፉ፤ ክፍያውን በአንድ ላይ ይፈፅሙ።'
                                      : 'Select independent seats on both coaches, tag luggage for automated bay transfer, and pay both fares in 1 unified transaction.'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic(20);
                                    setMultiLegModalItinerary(itinerary);
                                  }}
                                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                  <span>{isAm ? 'ባለ2-ደረጃ ምዝገባ ጀምር' : 'Book Both Tickets (1 Txn)'}</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Environmental & Terrain Stats */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-200 text-xs">
                            <div className="bg-white p-3 rounded-2xl border border-neutral-200 flex items-center gap-3">
                              <Mountain className="w-5 h-5 text-emerald-700 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                  {t.elevationProfile}
                                </span>
                                <span className="font-extrabold text-neutral-900">
                                  {itinerary.elevationMinM}m - {itinerary.elevationMaxM}m
                                </span>
                                <span className="text-[10px] text-neutral-500 block">
                                  {isAm ? 'ከፍተኛ የተራራ አምባ' : 'Highland Pass Grade'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-2xl border border-neutral-200 flex items-center gap-3">
                              <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                  {t.carbonFootprint}
                                </span>
                                <span className="font-extrabold text-neutral-900">
                                  ~{itinerary.co2EstimateKg} kg CO₂ / pax
                                </span>
                                <span className="text-[10px] text-emerald-700 font-semibold block">
                                  {isAm ? 'ከመኪና በ75% ያነሰ ልቀት' : '75% cleaner than private car'}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-2xl border border-neutral-200 flex items-center gap-3">
                              <Printer className="w-5 h-5 text-neutral-600 shrink-0" />
                              <div>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                  {isAm ? 'ማጠቃለያ ሰነድ' : 'Printable Itinerary'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPrintModalPlan(itinerary)}
                                  className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <span>{t.printItinerary}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Plans Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-700" />
              <span>{t.savedPlansTab} ({savedPlans.length})</span>
            </h3>
            <span className="text-xs text-neutral-500">
              {isAm ? 'በስልክዎ የተያዙ የጉዞ እቅዶች' : 'Locally bookmarked transit itineraries'}
            </span>
          </div>

          {savedPlans.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 space-y-3">
              <Bookmark className="w-12 h-12 text-neutral-300 mx-auto" />
              <h4 className="text-base font-bold text-neutral-800">
                {isAm ? 'እስካሁን የተመዘገበ የጉዞ እቅድ የለም' : 'No Saved Trip Plans Yet'}
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {isAm
                  ? 'ጉዞ በሚያቅዱበት ወቅት «እቅዱን አስቀምጥ» የሚለውን በመጫን ለቀጣይ ጉዞዎ ማስታወሻዎችን ማስቀመጥ ይችላሉ።'
                  : 'Generate an itinerary and click "Save Plan" to bookmark it for future bookings or offline reference.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('plans')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-500 transition cursor-pointer"
              >
                {t.planYourTrip}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map((sp) => {
                const it = sp.itinerary;
                return (
                  <div
                    key={sp.id}
                    className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                          {it.transferCount === 0
                            ? t.directTrip
                            : `${it.transferCount} ${isAm ? 'ዝውውር' : 'Transfer'}`}
                        </span>

                        <span className="text-xs text-neutral-400 font-mono">
                          {new Date(sp.savedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-neutral-900 tracking-tight">
                        {isAm ? it.titleAm : it.title}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                        <span>
                          {isAm ? 'ቀን፡' : 'Date:'}{' '}
                          <strong className="text-neutral-900">{sp.travelDate}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          {isAm ? 'ተሳፋሪ፡' : 'Pax:'}{' '}
                          <strong className="text-neutral-900">{sp.passengerCount}</strong>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-emerald-800 font-bold">
                          {it.totalFareETB * sp.passengerCount} ETB
                        </span>
                      </div>

                      {sp.customNotes && (
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-xs text-amber-900">
                          <span className="font-bold block text-[10px] uppercase text-amber-700">
                            {t.travelNotes}:
                          </span>
                          <span>{sp.customNotes}</span>
                        </div>
                      )}

                      <div className="pt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 font-mono">
                        <span>{it.totalDistanceKm} km</span>
                        <span>{it.totalDurationFormatted}</span>
                        <span>{it.departureTime} ➔ {it.arrivalTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => handleBookItinerary(it)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer text-center"
                      >
                        {t.bookThisPlan}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrintModalPlan(it)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
                        title={t.printItinerary}
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSaved(sp.id)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                        title={t.deleteSavedPlan}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {saveModalItinerary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-neutral-900">
                  {t.savePlan}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaveModalItinerary(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-neutral-500 block mb-1">
                  {isAm ? 'የጉዞ መስመር' : 'Selected Itinerary'}
                </span>
                <span className="text-sm font-extrabold text-neutral-900 block">
                  {isAm ? saveModalItinerary.titleAm : saveModalItinerary.title}
                </span>
                <span className="text-xs text-emerald-800 font-mono font-semibold">
                  {saveModalItinerary.departureTime} · {saveModalItinerary.totalDurationFormatted} · {saveModalItinerary.totalFareETB} ETB
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  {t.travelNotes}
                </label>
                <textarea
                  value={planNotesInput}
                  onChange={(e) => setPlanNotesInput(e.target.value)}
                  placeholder={
                    isAm
                      ? 'ምሳሌ፡ ለቤተሰብ ጉብኝት፣ ጃኬት ይዞ መሄድ፣ ሆቴል በደሴ መያዝ...'
                      : 'e.g., Bring warm jacket for Termaber tunnel, change bags at Boru Terminal...'
                  }
                  rows={3}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-xs text-neutral-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSaveModalItinerary(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmSavePlan}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                {t.savePlan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Sheet Modal */}
      {printModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Amhara Regional Public Transit Authority
                </span>
                <h3 className="text-lg font-black text-neutral-900">
                  {t.printItinerary}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalPlan(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                <span className="font-extrabold text-sm text-neutral-900">
                  {isAm ? printModalPlan.titleAm : printModalPlan.title}
                </span>
                <span className="font-black text-emerald-800 font-mono text-sm">
                  {printModalPlan.totalFareETB} ETB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-neutral-700">
                <div>
                  <span className="text-neutral-400 block text-[10px]">{t.date}:</span>
                  <strong>{travelDate}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">{t.passengerCount}:</span>
                  <strong>{passengerCount}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">{t.totalDuration}:</span>
                  <strong>{printModalPlan.totalDurationFormatted}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">{t.totalDistance}:</span>
                  <strong>{printModalPlan.totalDistanceKm} km</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 block text-[11px]">
                  {isAm ? 'የጉዞ ቅደም ተከተል፡' : 'Journey Segments:'}
                </span>
                {printModalPlan.legs.map((leg, idx) => (
                  <div key={leg.id} className="bg-white p-2.5 rounded-xl border border-neutral-200 space-y-1">
                    <div className="flex justify-between font-bold text-neutral-900">
                      <span>
                        {idx + 1}. {leg.fromStation.city} ➔ {leg.toStation.city}
                      </span>
                      <span className="font-mono text-emerald-800">{leg.priceETB} ETB</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex justify-between">
                      <span>{leg.operatorName} ({leg.vehicleType})</span>
                      <span>Bay {leg.bayNumber || 4} · Dep: {leg.departureTime}</span>
                    </div>
                    {leg.layoverAfterMinutes && leg.layoverStation && (
                      <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold mt-1">
                        ⏱ {leg.layoverAfterMinutes}m transfer layover at {leg.layoverStation.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <span className="text-[11px] text-neutral-500">
                Official Dispatch Itinerary
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAm ? 'አትም' : 'Print Window'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalPlan(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Multi-Leg Booking Modal (2 Separate Ticket Workflows in 1 Transaction) */}
      {multiLegModalItinerary && (
        <MultiLegBookingModal
          itinerary={multiLegModalItinerary}
          travelDate={travelDate}
          lang={lang}
          onClose={() => setMultiLegModalItinerary(null)}
          onBookingConfirmed={(newTickets) => {
            if (onMultiLegBookingConfirmed) {
              onMultiLegBookingConfirmed(newTickets);
            }
            if (onShowToast) {
              onShowToast(
                isAm
                  ? 'በአንድ ግብይት 2 የጉዞ ትኬቶች በተሳካ ሁኔታ ተቆርጠዋል!'
                  : '2 boarding tickets confirmed in 1 unified transaction!'
              );
            }
          }}
          currentUser={currentUser}
          onOpenLogin={onOpenLogin}
          onViewTicket={onViewTicket}
        />
      )}
    </div>
  );
};

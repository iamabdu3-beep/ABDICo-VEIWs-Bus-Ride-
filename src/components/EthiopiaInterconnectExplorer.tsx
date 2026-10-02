import React, { useState, useMemo } from 'react';
import { BusStation, Language, StationHierarchyTier } from '../types';
import {
  ETHIOPIA_BUS_STATIONS,
  HIERARCHY_TIERS,
  traceInterconnectRoute,
  InterconnectTraceResult,
} from '../data/ethiopiaStations';
import { triggerHaptic } from '../utils/haptics';
import {
  GitMerge,
  Crown,
  Landmark,
  Building2,
  Home,
  ArrowRight,
  Navigation,
  MapPin,
  Clock,
  Phone,
  Bus,
  Search,
  Filter,
  CheckCircle2,
  Compass,
  ArrowRightLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Sparkles,
  DollarSign,
  Maximize2,
} from 'lucide-react';

interface EthiopiaInterconnectExplorerProps {
  lang: Language;
  onBookStations: (originStationId: string, destStationId: string) => void;
  onPlanTrip: (originStationId: string, destStationId: string) => void;
  onViewOnMap?: (stationId: string) => void;
}

export const EthiopiaInterconnectExplorer: React.FC<EthiopiaInterconnectExplorerProps> = ({
  lang,
  onBookStations,
  onPlanTrip,
  onViewOnMap,
}) => {
  const isAm = lang === 'am';

  // Tier Filter
  const [selectedTier, setSelectedTier] = useState<StationHierarchyTier | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interconnect Route Planner State
  const [plannerOriginId, setPlannerOriginId] = useState<string>('sekela-woreda');
  const [plannerDestId, setPlannerDestId] = useState<string>('addis-autobis-tera');

  // Selected Station for detailed drill-down
  const [selectedStationId, setSelectedStationId] = useState<string>('finote-selam');

  const selectedStation = useMemo(() => {
    return (
      ETHIOPIA_BUS_STATIONS.find((s) => s.id === selectedStationId) ||
      ETHIOPIA_BUS_STATIONS[0]
    );
  }, [selectedStationId]);

  // Unique regions
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    ETHIOPIA_BUS_STATIONS.forEach((s) => {
      if (s.regionName) set.add(s.regionName);
    });
    return Array.from(set);
  }, []);

  // Filtered station list
  const filteredStations = useMemo(() => {
    return ETHIOPIA_BUS_STATIONS.filter((s) => {
      if (selectedTier !== 'all' && s.hierarchyTier !== selectedTier) return false;
      if (selectedRegion !== 'all' && s.regionName !== selectedRegion) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(query);
        const matchNameAm = s.nameAm.includes(query);
        const matchCity = s.city.toLowerCase().includes(query);
        const matchZone = s.zone.toLowerCase().includes(query);
        const matchWoreda = s.woredaName?.toLowerCase().includes(query);
        if (!matchName && !matchNameAm && !matchCity && !matchZone && !matchWoreda) {
          return false;
        }
      }
      return true;
    });
  }, [selectedTier, selectedRegion, searchQuery]);

  // Route calculation between chosen origin & destination
  const routeTrace: InterconnectTraceResult | null = useMemo(() => {
    if (!plannerOriginId || !plannerDestId) return null;
    return traceInterconnectRoute(plannerOriginId, plannerDestId);
  }, [plannerOriginId, plannerDestId]);

  const handleSwapPlannerStations = () => {
    triggerHaptic(10);
    const temp = plannerOriginId;
    setPlannerOriginId(plannerDestId);
    setPlannerDestId(temp);
  };

  const getTierBadge = (tier?: StationHierarchyTier) => {
    switch (tier) {
      case 'federal':
        return {
          label: isAm ? 'ፌደራል (ብሔራዊ)' : 'Federal National Hub',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Crown,
          dotColor: 'bg-purple-600',
        };
      case 'regional':
        return {
          label: isAm ? 'የክልል ዋና መናኸሪያ' : 'Regional Capital Hub',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: Landmark,
          dotColor: 'bg-emerald-600',
        };
      case 'zonal':
        return {
          label: isAm ? 'የዞን መናኸሪያ' : 'Zonal Hub Terminal',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Building2,
          dotColor: 'bg-blue-600',
        };
      case 'woreda':
      default:
        return {
          label: isAm ? 'የወረዳ / አካባቢ መናኸሪያ' : 'Woreda District Station',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Home,
          dotColor: 'bg-amber-600',
        };
    }
  };

  // Stations connected to the currently selected station
  const directConnectedStations = useMemo(() => {
    if (!selectedStation.connectedStationIds) return [];
    return ETHIOPIA_BUS_STATIONS.filter((s) =>
      selectedStation.connectedStationIds?.includes(s.id)
    );
  }, [selectedStation]);

  // Woredas feeding into this station (if this station is Zonal or Regional)
  const childWoredas = useMemo(() => {
    return ETHIOPIA_BUS_STATIONS.filter(
      (s) => s.hierarchyTier === 'woreda' && s.parentHubId === selectedStation.id
    );
  }, [selectedStation]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/40">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
            <GitMerge className="w-3.5 h-3.5" />
            <span>
              {isAm
                ? 'የኢትዮጵያ አጠቃላይ የትራንስፖርት ትስስር ኔትወርክ'
                : 'National Multi-Tier Transit Interconnection Architecture'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isAm
              ? 'የፌደራል፣ የክልል፣ የዞን እና የወረዳ አውቶቡስ መናኸሪያዎች ትስስር'
              : 'Interconnecting Federal, Regional, Zonal & Woreda Bus Stations Across Ethiopia'}
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {isAm
              ? 'ከገጠር ወረዳዎች እስከ ፌደራል ዋና ከተማ ድረስ የተዘረጋው የተሟላ የሕዝብ ትራንስፖርት መስመር፤ የጉዞ ቅብብሎሽ፣ የተሸከርካሪ አይነቶችና የትኬት ማስያዣ ስርዓት።'
              : 'A seamlessly linked hierarchical transport grid connecting grassroots Woreda district stations to Zonal administrative hubs, Regional capital terminals, and Federal long-haul interstate express gateways.'}
          </p>
        </div>

        {/* 4-Tier Stat Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/30">
          {HIERARCHY_TIERS.map((tier) => (
            <button
              key={tier.tier}
              onClick={() => {
                triggerHaptic(8);
                setSelectedTier(selectedTier === tier.tier ? 'all' : tier.tier);
              }}
              className={`p-3 rounded-2xl text-left transition-all border ${
                selectedTier === tier.tier
                  ? 'bg-white text-neutral-900 border-white shadow-lg ring-2 ring-emerald-400'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-80">
                  {tier.tier}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    selectedTier === tier.tier
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {tier.count} {isAm ? 'ጣቢያዎች' : 'hubs'}
                </span>
              </div>
              <p className="font-extrabold text-sm sm:text-base mt-1 line-clamp-1">
                {isAm ? tier.titleAm : tier.titleEn}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Route Calculator Across Tiers */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-neutral-200/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900">
                {isAm
                  ? 'የደረጃ በደረጃ የትስስር ጉዞ ማስያዣና መፈለጊያ'
                  : 'Multi-Tier Interconnect Journey Planner'}
              </h2>
              <p className="text-xs text-neutral-500">
                {isAm
                  ? 'ከማንኛውም ወረዳ ወይም ዞን ተነስተው ወደ ፌደራል ወይም ሌላ ክልል መድረሻዎን ይምረጡ'
                  : 'Calculate transfers, feeder vehicles, fares, and travel time from any Woreda up to Federal gateways'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isAm ? 'ቀጥታ ትኬት አገናኝ' : 'Unified Cross-Tier Booking'}
            </span>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAm ? 'መነሻ መናኸሪያ (ወረዳ፣ ዞን፣ ክልል)' : 'Departure Station (Woreda, Zonal, Regional, Federal)'}</span>
            </label>
            <select
              value={plannerOriginId}
              onChange={(e) => {
                triggerHaptic(10);
                setPlannerOriginId(e.target.value);
              }}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <optgroup label="⭐ Federal Terminals (ብሔራዊ / ፌደራል)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'federal').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.city})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Regional Capitals (የክልል ማዕከላት)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'regional').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.regionName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Zonal Hubs (የዞን መናኸሪያዎች)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'zonal').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.zone})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏘️ Woreda Stations (የወረዳ ጣቢያዎች)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'woreda').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.city})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={handleSwapPlannerStations}
              title={isAm ? 'ጣቢያዎችን ቀይር' : 'Swap stations'}
              className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors border border-neutral-300 shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>{isAm ? 'መድረሻ መናኸሪያ (ወረዳ፣ ዞን፣ ፌደራል)' : 'Destination Station (Woreda, Zonal, Regional, Federal)'}</span>
            </label>
            <select
              value={plannerDestId}
              onChange={(e) => {
                triggerHaptic(10);
                setPlannerDestId(e.target.value);
              }}
              className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <optgroup label="⭐ Federal Terminals (ብሔራዊ / ፌደራል)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'federal').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.city})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Regional Capitals (የክልል ማዕከላት)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'regional').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.regionName})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Zonal Hubs (የዞን መናኸሪያዎች)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'zonal').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.zone})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏘️ Woreda Stations (የወረዳ ጣቢያዎች)">
                {ETHIOPIA_BUS_STATIONS.filter((s) => s.hierarchyTier === 'woreda').map((s) => (
                  <option key={s.id} value={s.id}>
                    {isAm ? s.nameAm : s.name} ({s.city})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Calculated Interconnect Chain */}
        {routeTrace && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                  {isAm ? 'የተሰላ የትስስር መንገድ' : 'Hierarchical Interconnect Route Found'}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 mt-0.5">
                  {isAm ? routeTrace.origin.nameAm : routeTrace.origin.name} ➔{' '}
                  {isAm ? routeTrace.destination.nameAm : routeTrace.destination.name}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">
                    {isAm ? 'ግምታዊ ዋጋ' : 'Est. Total Fare'}
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {routeTrace.totalEstimatedFareETB} ETB
                  </span>
                </div>
                <div className="text-right border-l pl-3 border-neutral-300">
                  <span className="text-xs text-neutral-500 block">
                    {isAm ? 'ግምታዊ ሰዓት' : 'Est. Travel Time'}
                  </span>
                  <span className="text-lg font-black text-neutral-800">
                    {routeTrace.totalEstimatedHours}h
                  </span>
                </div>
              </div>
            </div>

            {/* Step-by-step leg breakdown */}
            <div className="space-y-3">
              {routeTrace.transferLegs.map((leg, idx) => {
                const fromBadge = getTierBadge(leg.from.hierarchyTier);
                const toBadge = getTierBadge(leg.to.hierarchyTier);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {leg.tierHop}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {leg.highwayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900">
                        <span>{isAm ? leg.from.cityAm : leg.from.city}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{isAm ? leg.to.cityAm : leg.to.city}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Bus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>
                          {isAm ? 'የሚመከር ተሽከርካሪ፡' : 'Transit Mode:'}{' '}
                          <strong className="text-neutral-800">
                            {leg.vehicleRecommendation}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right text-xs">
                        <span className="text-neutral-500 block">
                          ~{leg.estDurationHours}h
                        </span>
                        <span className="font-extrabold text-emerald-800 text-sm">
                          {leg.estFareETB} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action Button to Book or Plan */}
            <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  triggerHaptic(12);
                  onPlanTrip(plannerOriginId, plannerDestId);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isAm ? 'በጉዞ አቀናባሪ እይ' : 'Open in Multi-Leg Trip Planner'}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  onBookStations(plannerOriginId, plannerDestId);
                }}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-800 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>
                  {isAm
                    ? 'ይህን የተሳሰረ ጉዞ አስይዝ (Book Interconnected Ride)'
                    : 'Book This Interconnected Journey'}
                </span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Station Directory & Hierarchy Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filtered Station List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder={
                    isAm
                      ? 'መናኸሪያ በስም፣ በወረዳ፣ በዞን ወይም በከተማ ፈልግ...'
                      : 'Search station by name, woreda, zone, or city...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Region Filter */}
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-neutral-800"
              >
                <option value="all">{isAm ? 'ሁሉም ክልሎች (All Regions)' : 'All Regions'}</option>
                {availableRegions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Active count badge */}
            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
              <span>
                {isAm ? 'የተገኙ ጣቢያዎች ብዛት፡' : 'Stations matching filter:'}{' '}
                <strong className="text-neutral-900">{filteredStations.length}</strong>
              </span>
              {selectedTier !== 'all' && (
                <button
                  onClick={() => setSelectedTier('all')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  {isAm ? 'ማጣሪያውን አጽዳ' : 'Clear tier filter'}
                </button>
              )}
            </div>
          </div>

          {/* List of Station Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredStations.map((station) => {
              const badge = getTierBadge(station.hierarchyTier);
              const IconComp = badge.icon;
              const isSelected = station.id === selectedStation.id;

              return (
                <div
                  key={station.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedStationId(station.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white hover:bg-neutral-50/80 border-neutral-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          <IconComp className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                          {station.regionName || station.zone}
                        </span>

                        {station.woredaName && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium border border-amber-200">
                            {station.woredaName}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 pt-0.5">
                        {isAm ? station.nameAm : station.name}
                      </h4>

                      <p className="text-xs text-neutral-600 line-clamp-1">
                        {isAm ? station.descriptionAm : station.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-neutral-100 text-neutral-700 block">
                        {station.baysCount} {isAm ? 'ቤይ' : 'Bays'}
                      </span>
                      <span className="text-xs text-neutral-500 mt-1 block">
                        {station.elevationM}m alt
                      </span>
                    </div>
                  </div>

                  {/* Connected links teaser */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-neutral-500 flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {station.connectedStationIds?.length || station.connectionsCount}{' '}
                        {isAm ? 'የቀጥታ ትስስር መስመሮች' : 'interconnect corridors'}
                      </span>
                    </div>

                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span>{isAm ? 'ዝርዝር እይ' : 'Explore Node'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Station Hierarchy Drill-down & Node Map (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 shadow-sm sticky top-20 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                {(() => {
                  const badge = getTierBadge(selectedStation.hierarchyTier);
                  const IconComp = badge.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badge.bg}`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}

                <h3 className="text-lg sm:text-xl font-black text-neutral-900 mt-2">
                  {isAm ? selectedStation.nameAm : selectedStation.name}
                </h3>
                <p className="text-xs text-neutral-500">
                  {selectedStation.city} · {selectedStation.zone} · {selectedStation.regionName}
                </p>
              </div>

              {onViewOnMap && (
                <button
                  onClick={() => onViewOnMap(selectedStation.id)}
                  title={isAm ? 'በካርታ ላይ እይ' : 'Locate on map'}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </button>
              )}
            </div>

            {/* Parent Hub Connection (Going up the hierarchy) */}
            {selectedStation.parentHubId && (
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1">
                <span className="text-xs font-bold uppercase text-purple-900 tracking-wider flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 rotate-[-90deg]" />
                  <span>{isAm ? 'የበላይ አስተዳደር ማዕከል (Parent Hub)' : 'Direct Parent Transit Hub'}</span>
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-neutral-900">
                  {isAm ? selectedStation.parentHubNameAm : selectedStation.parentHubName}
                </p>
                <p className="text-xs text-purple-800">
                  {isAm
                    ? 'ሁሉም የወረዳ አውቶቡሶችና ሚኒባሶች ወደዚህ ዞን/ክልል ማዕከል ተሳፋሪዎችን ያደርሳሉ'
                    : 'Feeder minibuses and passenger shuttles regularly connect passengers to this higher tier hub.'}
                </p>
              </div>
            )}

            {/* Child Woredas Feeding In (Going down the hierarchy) */}
            {childWoredas.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  {isAm
                    ? `ወደዚህ ጣቢያ የሚገቡ የወረዳ መናኸሪያዎች (${childWoredas.length})`
                    : `Feeding Woreda Stations (${childWoredas.length})`}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {childWoredas.map((cw) => (
                    <button
                      key={cw.id}
                      onClick={() => {
                        triggerHaptic(8);
                        setSelectedStationId(cw.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
                    >
                      {isAm ? cw.cityAm : cw.city} ({cw.woredaName || 'ወረዳ'})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Interconnected Corridors */}
            {directConnectedStations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                  {isAm ? 'ቀጥታ የተሳሰሩ የኮሪደር ጣቢያዎች' : 'Direct Interconnected Corridors'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {directConnectedStations.slice(0, 8).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        triggerHaptic(8);
                        setSelectedStationId(st.id);
                      }}
                      className="p-2 rounded-xl text-left bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 transition-all text-xs"
                    >
                      <span className="font-bold text-neutral-800 block line-clamp-1">
                        {isAm ? st.cityAm : st.city}
                      </span>
                      <span className="text-neutral-500 text-xs">
                        {st.hierarchyTier?.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Station Operational Specs */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isAm ? 'የሥራ ሰዓት፡' : 'Operating Hours:'}</span>
                </span>
                <span className="font-bold text-neutral-900">
                  {isAm ? selectedStation.operatingHoursAm : selectedStation.operatingHours}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isAm ? 'የጣቢያ ስልክ፡' : 'Station Phone:'}</span>
                </span>
                <a
                  href={`tel:${selectedStation.phone}`}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  {selectedStation.phone}
                </a>
              </div>
            </div>

            {/* Quick Button to Use in Planner */}
            <div className="pt-2">
              <button
                onClick={() => {
                  triggerHaptic(12);
                  setPlannerOriginId(selectedStation.id);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isAm
                    ? 'ይህን ጣቢያ በመነሻነት ምረጥ (Set as Origin)'
                    : 'Set as Journey Origin in Planner'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

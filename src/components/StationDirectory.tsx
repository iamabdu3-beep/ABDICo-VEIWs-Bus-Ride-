import React, { useState, useEffect, useMemo } from 'react';
import { BusStation, Language, RideTrip } from '../types';
import { AMHARA_STATIONS, INITIAL_RIDE_TRIPS } from '../data/amharaStations';
import { translations } from '../translations';
import {
  calculateStationCrowd,
  getCrowdLevelConfig,
  CrowdLevel,
  StationCrowdMetrics,
} from '../utils/crowdIndicator';
import { formatMinutesToTimeString, parseTimeToMinutes } from '../utils/departureScheduler';
import { triggerHaptic } from '../utils/haptics';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  ArrowRight,
  Bus,
  CheckCircle2,
  Activity,
  Flame,
  Users,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  Gauge,
  Info,
  Calendar,
  Zap,
  Sliders,
  AlertCircle,
  Star,
  XOctagon,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { TerminalDisruptionAlert } from '../types';

export interface StationDirectoryProps {
  lang: Language;
  onSelectStationForMap: (station: BusStation) => void;
  onBookFromStation: (stationId: string, destStationId?: string) => void;
  onSelectTrip?: (trip: RideTrip) => void;
  trips?: RideTrip[];
  preferredTerminalId?: string;
  onSetPreferredTerminal?: (terminalId: string) => void;
  terminalAlerts?: Record<string, TerminalDisruptionAlert>;
  onOpenTerminalMonitor?: () => void;
}

export const StationDirectory: React.FC<StationDirectoryProps> = ({
  lang,
  onSelectStationForMap,
  onBookFromStation,
  onSelectTrip,
  trips = INITIAL_RIDE_TRIPS,
  preferredTerminalId,
  onSetPreferredTerminal,
  terminalAlerts = {},
  onOpenTerminalMonitor,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCrowdFilter, setSelectedCrowdFilter] = useState<'all' | CrowdLevel>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Time simulation / real-time clock state
  // Default to 06:45 AM (405 mins) as default high-activity regional transit window
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    // If current real time is between 05:30 AM and 08:30 PM, use it, else default to 06:45 AM
    return currentMins >= 330 && currentMins <= 1260 ? currentMins : 405;
  });

  const [isRealTimeSync, setIsRealTimeSync] = useState<boolean>(false);
  const [expandedStationDepartures, setExpandedStationDepartures] = useState<Record<string, boolean>>({});
  const [showCrowdInfoModal, setShowCrowdInfoModal] = useState<boolean>(false);

  // Sync with real system clock when isRealTimeSync is true
  useEffect(() => {
    if (!isRealTimeSync) return;

    const syncTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    };

    syncTime();
    const interval = setInterval(syncTime, 15000); // check every 15s
    return () => clearInterval(interval);
  }, [isRealTimeSync]);

  const zones = [
    { id: 'all', nameEn: 'All Zones', nameAm: 'ሁሉም ዞኖች' },
    { id: 'West Gojjam', nameEn: 'West Gojjam', nameAm: 'ምዕራብ ጎጃም' },
    { id: 'East Gojjam', nameEn: 'East Gojjam', nameAm: 'ምሥራቅ ጎጃም' },
    { id: 'Central Gondar', nameEn: 'Central Gondar', nameAm: 'ማዕከላዊ ጎንደር' },
    { id: 'South Gondar', nameEn: 'South Gondar', nameAm: 'ደቡብ ጎንደር' },
    { id: 'South Wollo', nameEn: 'South Wollo', nameAm: 'ደቡብ ወሎ' },
    { id: 'North Wollo', nameEn: 'North Wollo', nameAm: 'ሰሜን ወሎ' },
    { id: 'North Shewa', nameEn: 'North Shewa', nameAm: 'ሰሜን ሸዋ' },
    { id: 'Awi', nameEn: 'Awi Zone', nameAm: 'አዊ ዞን' },
    { id: 'Wag Hemra', nameEn: 'Wag Hemra', nameAm: 'ዋግ ኽምራ' },
  ];

  // Pre-calculate live crowd metrics for all 15 stations
  const stationMetricsMap = useMemo(() => {
    const map = new Map<string, StationCrowdMetrics>();
    for (const station of AMHARA_STATIONS) {
      const metrics = calculateStationCrowd(station, trips, currentTimeMinutes);
      map.set(station.id, metrics);
    }
    return map;
  }, [trips, currentTimeMinutes]);

  // Aggregate regional crowd statistics for the top banner
  const regionalSummary = useMemo(() => {
    let totalDepartures = 0;
    let totalPassengers = 0;
    let busiestStation: BusStation | null = null;
    let highestScore = -1;
    let calmCount = 0;
    let peakCount = 0;
    let busyCount = 0;
    let moderateCount = 0;

    for (const station of AMHARA_STATIONS) {
      const m = stationMetricsMap.get(station.id);
      if (!m) continue;

      totalDepartures += m.departuresCount;
      totalPassengers += m.bookedPassengersCount;

      if (m.crowdScore > highestScore) {
        highestScore = m.crowdScore;
        busiestStation = station;
      }

      if (m.crowdLevel === 'peak') peakCount++;
      else if (m.crowdLevel === 'busy') busyCount++;
      else if (m.crowdLevel === 'moderate') moderateCount++;
      else calmCount++;
    }

    const windowEndMinutes = (currentTimeMinutes + 120) % 1440;
    const windowStartStr = formatMinutesToTimeString(currentTimeMinutes);
    const windowEndStr = formatMinutesToTimeString(windowEndMinutes);

    return {
      totalDepartures,
      totalPassengers,
      busiestStation,
      highestScore,
      calmCount,
      peakCount,
      busyCount,
      moderateCount,
      windowLabel: `${windowStartStr} – ${windowEndStr}`,
    };
  }, [stationMetricsMap, currentTimeMinutes]);

  // Filter stations based on search, zone, and crowd level
  const filteredStations = useMemo(() => {
    return AMHARA_STATIONS.filter((station) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        station.name.toLowerCase().includes(term) ||
        station.nameAm.includes(term) ||
        station.city.toLowerCase().includes(term) ||
        station.cityAm.includes(term) ||
        station.zone.toLowerCase().includes(term);

      const matchesZone = selectedZone === 'all' || station.zone === selectedZone;
      const matchesTier = selectedTier === 'all' || station.hierarchyTier === selectedTier;

      const metrics = stationMetricsMap.get(station.id);
      const matchesCrowd =
        selectedCrowdFilter === 'all' || (metrics && metrics.crowdLevel === selectedCrowdFilter);

      return matchesSearch && matchesZone && matchesCrowd && matchesTier;
    });
  }, [searchTerm, selectedZone, selectedCrowdFilter, selectedTier, stationMetricsMap]);

  const toggleDeparturesDrawer = (stationId: string) => {
    triggerHaptic();
    setExpandedStationDepartures((prev) => ({
      ...prev,
      [stationId]: !prev[stationId],
    }));
  };

  const handleTimePreset = (minutes: number) => {
    triggerHaptic();
    setIsRealTimeSync(false);
    setCurrentTimeMinutes(minutes);
  };

  const handleToggleRealTime = () => {
    triggerHaptic();
    if (!isRealTimeSync) {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
      setIsRealTimeSync(true);
    } else {
      setIsRealTimeSync(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Live Crowd Radar Control Dashboard */}
      <div className="bg-linear-to-r from-emerald-950 via-neutral-900 to-emerald-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Dashboard Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span>{t.liveCrowdRadar || 'Live Crowd Indicator'}</span>
                <span className="text-emerald-400/60">•</span>
                <span className="font-mono text-emerald-200">
                  {lang === 'en' ? 'Next 2 Hours' : 'ቀጣይ 2 ሰዓታት'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{lang === 'en' ? 'Regional Terminal Busyness Radar' : 'የአማራ መናኸሪያዎች የቀጥታ መጨናነቅ መቆጣጠሪያ'}</span>
              </h2>
              <p className="text-xs text-emerald-100/70 max-w-2xl leading-relaxed">
                {lang === 'en'
                  ? 'Dynamic busyness levels calculated in real-time from scheduled bus and minibus departures, vehicle passenger capacities, and gate bay allocation across the upcoming 120-minute window.'
                  : 'በቀጣዮቹ 120 ደቂቃዎች በሚነሱ አውቶቡሶች፣ በተሳፋሪዎች ቁጥርና በመጫኛ በሮች አጠቃቀም ላይ የተመሰረተ የቀጥታ የመናኸሪያዎች መጨናነቅ መረጃ።'}
              </p>
            </div>

            {/* Time Window Badge & Info button */}
            <div className="flex items-center gap-2">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    {lang === 'en' ? 'Active 2h Window' : 'የተመረጠው 2 ሰዓት'}
                  </div>
                  <div className="text-sm font-extrabold font-mono text-emerald-300">
                    {regionalSummary.windowLabel}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCrowdInfoModal(!showCrowdInfoModal)}
                title={lang === 'en' ? 'How is busyness calculated?' : 'መጨናነቅ እንዴት ይሰላል?'}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition cursor-pointer"
              >
                <Info className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar across all Amhara stations */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-black font-mono text-white leading-tight">
                  {regionalSummary.totalDepartures}
                </div>
                <div className="text-[11px] text-neutral-300 font-medium">
                  {lang === 'en' ? 'Departures (Next 2h)' : 'መነሻዎች (በ2 ሰዓት)'}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-lg font-black font-mono text-white leading-tight">
                  {regionalSummary.totalPassengers}
                </div>
                <div className="text-[11px] text-neutral-300 font-medium">
                  {lang === 'en' ? 'Boarding Passengers' : 'ተሳፋሪዎች በጉዞ ላይ'}
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                <Flame className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-rose-300 truncate">
                  {regionalSummary.busiestStation
                    ? lang === 'en'
                      ? regionalSummary.busiestStation.name.split(' ')[0] + ' Grand'
                      : regionalSummary.busiestStation.nameAm.split(' ')[0]
                    : 'N/A'}
                </div>
                <div className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
                  <span>{lang === 'en' ? 'Busiest Terminal' : 'በጣም የተጨናነቀ'}</span>
                  <span className="font-mono text-rose-400 font-bold">({regionalSummary.highestScore}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-300 leading-tight">
                  {regionalSummary.peakCount} Peak • {regionalSummary.busyCount} Busy
                </div>
                <div className="text-[11px] text-neutral-300 font-medium">
                  {regionalSummary.moderateCount} Mod • {regionalSummary.calmCount} Calm
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Transit Time Clock & Simulation Controller */}
          <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-neutral-200">
                  {lang === 'en' ? 'Transit Departure Clock Simulator:' : 'የመጓጓዣ ሰዓት ማስመሰያ:'}
                </span>
                <span className="font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-300/30">
                  {formatMinutesToTimeString(currentTimeMinutes)}
                </span>
                {isRealTimeSync && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {lang === 'en' ? 'Synced with Device Clock' : 'ከኮምፒውተር ሰዓት ጋር የተመሳሰለ'}
                  </span>
                )}
              </div>

              {/* Time Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleTimePreset(390)} // 06:30 AM
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    currentTimeMinutes === 390 && !isRealTimeSync
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                  }`}
                >
                  🌅 {lang === 'en' ? '06:30 AM Rush' : '12:30 ጠዋት'}
                </button>
                <button
                  onClick={() => handleTimePreset(660)} // 11:00 AM
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    currentTimeMinutes === 660 && !isRealTimeSync
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                  }`}
                >
                  ☀️ {lang === 'en' ? '11:00 AM Midday' : '5:00 ቀትር'}
                </button>
                <button
                  onClick={() => handleTimePreset(840)} // 02:00 PM
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    currentTimeMinutes === 840 && !isRealTimeSync
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                  }`}
                >
                  🚌 {lang === 'en' ? '02:00 PM Peak' : '8:00 ከሰዓት'}
                </button>
                <button
                  onClick={() => handleTimePreset(1080)} // 06:00 PM
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                    currentTimeMinutes === 1080 && !isRealTimeSync
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                  }`}
                >
                  🌆 {lang === 'en' ? '06:00 PM Evening' : '12:00 ምሽት'}
                </button>
                <button
                  onClick={handleToggleRealTime}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    isRealTimeSync
                      ? 'bg-emerald-400 text-neutral-950 shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Live Device Time' : 'ትክክለኛ ሰዓት'}</span>
                </button>
              </div>
            </div>

            {/* Slider to smoothly scrub across the 24-hour cycle */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] font-mono text-neutral-400">05:00 AM</span>
              <input
                type="range"
                min={300}
                max={1260}
                step={15}
                value={currentTimeMinutes}
                onChange={(e) => {
                  setIsRealTimeSync(false);
                  setCurrentTimeMinutes(parseInt(e.target.value, 10));
                }}
                className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[10px] font-mono text-neutral-400">09:00 PM</span>
            </div>
          </div>

          {/* Busyness Level Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1 mr-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'Filter by Crowd:' : 'በመጨናነቅ ደረጃ:'}</span>
            </span>

            <button
              onClick={() => setSelectedCrowdFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedCrowdFilter === 'all'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {lang === 'en' ? 'All Terminals (15)' : 'ሁሉም መናኸሪያዎች (15)'}
            </button>

            <button
              onClick={() => setSelectedCrowdFilter('peak')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCrowdFilter === 'peak'
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400'
                  : 'bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{lang === 'en' ? `Peak Rush (${regionalSummary.peakCount})` : `የበዛ (${regionalSummary.peakCount})`}</span>
            </button>

            <button
              onClick={() => setSelectedCrowdFilter('busy')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCrowdFilter === 'busy'
                  ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-400'
                  : 'bg-orange-900/40 hover:bg-orange-900/60 text-orange-200 border border-orange-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>{lang === 'en' ? `High Busyness (${regionalSummary.busyCount})` : `ከፍተኛ (${regionalSummary.busyCount})`}</span>
            </button>

            <button
              onClick={() => setSelectedCrowdFilter('moderate')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCrowdFilter === 'moderate'
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                  : 'bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{lang === 'en' ? `Moderate (${regionalSummary.moderateCount})` : `መካከለኛ (${regionalSummary.moderateCount})`}</span>
            </button>

            <button
              onClick={() => setSelectedCrowdFilter('calm')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedCrowdFilter === 'calm'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                  : 'bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{lang === 'en' ? `Calm Flow (${regionalSummary.calmCount})` : `ረጋ ያለ (${regionalSummary.calmCount})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Modal / Drawer explaining the Live Crowd Algorithm */}
      {showCrowdInfoModal && (
        <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 text-xs text-emerald-950 space-y-2 relative">
          <button
            onClick={() => setShowCrowdInfoModal(false)}
            className="absolute right-3 top-3 text-emerald-800 hover:text-emerald-950 font-bold text-sm cursor-pointer p-1"
          >
            ✕
          </button>
          <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>
              {lang === 'en'
                ? 'How the Live Crowd Indicator Works'
                : 'የቀጥታ የመናኸሪያዎች መጨናነቅ መቆጣጠሪያ አሰራር'}
            </span>
          </div>
          <p className="leading-relaxed text-emerald-800">
            {lang === 'en'
              ? 'Our dynamic crowd indicator constantly evaluates trips scheduled to depart within a rolling 2-hour window. It factors in: (1) departure frequency of luxury coaches and shuttles, (2) total departing passenger volume versus station boarding gate capacity, and (3) gate queue clearing speeds. When multiple express buses board simultaneously, terminal crowd pressure spikes to Peak, signaling travelers to arrive earlier.'
              : 'ይህ የቀጥታ መቆጣጠሪያ በቀጣዮቹ 2 ሰዓታት ውስጥ የሚነሱ አውቶቡሶችን በመመርመር የመናኸሪያውን መጨናነቅ ያሰላል። የመነሻዎች ብዛት፣ የሚሳፈሩ መንገደኞች እና የመጫኛ በሮች አቅም ተደምረው የመጨናነቁን ደረጃ (ረጋ ያለ፣ መካከለኛ፣ ከፍተኛ፣ ወይም የበዛ) ያመለክታሉ።'}
          </p>
        </div>
      )}

      {/* Search & Administrative Zone Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-extrabold text-neutral-900">
              {t.stationDirectoryTitle}
            </h3>
            <p className="text-xs text-neutral-500">
              {filteredStations.length}{' '}
              {lang === 'en' ? 'terminals matching active filters' : 'መናኸሪያዎች ታይተዋል'}
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchStationPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Hierarchy Tier Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100">
          <span className="text-xs font-bold text-neutral-500 mr-1">
            {lang === 'en' ? 'Administrative Tier:' : 'የአስተዳደር ደረጃ:'}
          </span>
          {[
            { id: 'all', en: 'All Tiers', am: 'ሁሉም ደረጃዎች' },
            { id: 'federal', en: '⭐ Federal (National)', am: '⭐ ፌደራል (ብሔራዊ)' },
            { id: 'regional', en: '🏛️ Regional Capital', am: '🏛️ የክልል ዋና መናኸሪያ' },
            { id: 'zonal', en: '🏢 Zonal Hub', am: '🏢 የዞን መናኸሪያ' },
            { id: 'woreda', en: '🏘️ Woreda District', am: '🏘️ የወረዳ መናኸሪያ' },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                triggerHaptic(8);
                setSelectedTier(tier.id);
              }}
              className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer font-medium ${
                selectedTier === tier.id
                  ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-xs'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {lang === 'en' ? tier.en : tier.am}
            </button>
          ))}
        </div>

        {/* Zone Selector Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${
                selectedZone === z.id
                  ? 'bg-emerald-700 text-white border-emerald-700 font-semibold shadow-xs'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {lang === 'en' ? z.nameEn : z.nameAm}
            </button>
          ))}
        </div>
      </div>

      {/* Station Cards Grid with Dynamic Live Crowd Indicators */}
      {filteredStations.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto" />
          <h4 className="text-base font-bold text-neutral-800">
            {lang === 'en' ? 'No terminals match your criteria' : 'ምንም መናኸሪያ አልተገኘም'}
          </h4>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {lang === 'en'
              ? 'Try clearing the search text or changing the crowd busyness and zone filter.'
              : 'እባክዎ የፍለጋ ቃሉን ወይም የተመረጠውን ዞንና የመጨናነቅ ማጣሪያ ይቀይሩ።'}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedZone('all');
              setSelectedCrowdFilter('all');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
          >
            {lang === 'en' ? 'Reset Filters' : 'ማጣሪያዎችን አጽዳ'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStations.map((station) => {
            const metrics = stationMetricsMap.get(station.id) || calculateStationCrowd(station, trips, currentTimeMinutes);
            const levelConfig = getCrowdLevelConfig(metrics.crowdLevel, lang);
            const isDrawerOpen = !!expandedStationDepartures[station.id];
            const isPreferred = preferredTerminalId === station.id;
            const stationAlert = terminalAlerts[station.id];

            return (
              <div
                key={station.id}
                className={`bg-white rounded-3xl border ${levelConfig.cardBorderClass} p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Station Card Content */}
                <div className="space-y-3.5">
                  {/* Card Header: Zone Tag & Bay Count */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {station.hierarchyTier && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            station.hierarchyTier === 'federal'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : station.hierarchyTier === 'regional'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : station.hierarchyTier === 'zonal'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {station.hierarchyTier === 'federal'
                            ? '⭐ Federal'
                            : station.hierarchyTier === 'regional'
                            ? '🏛️ Regional'
                            : station.hierarchyTier === 'zonal'
                            ? '🏢 Zonal'
                            : '🏘️ Woreda'}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{lang === 'en' ? station.zone : station.zoneAm}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onSetPreferredTerminal && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic(15);
                            onSetPreferredTerminal(station.id);
                          }}
                          className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                            isPreferred
                              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-amber-600 border-neutral-200'
                          }`}
                          title={
                            isPreferred
                              ? lang === 'en'
                                ? 'Monitored Preferred Terminal'
                                : 'የተመረጠ መናኸሪያ (ማንቂያ ይደርሳል)'
                              : lang === 'en'
                                ? 'Set as Preferred Terminal for Proactive Alerts'
                                : 'የተመረጠ መናኸሪያ አድርግ'
                          }
                        >
                          <Star className={`w-3.5 h-3.5 ${isPreferred ? 'fill-current text-amber-900' : ''}`} />
                          {isPreferred && (
                            <span className="text-[10px] hidden sm:inline">
                              {lang === 'en' ? 'Alerts ON' : 'ማንቂያ'}
                            </span>
                          )}
                        </button>
                      )}

                      <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg">
                        {station.baysCount} {lang === 'en' ? 'Bays' : 'በሮች'}
                      </span>
                    </div>
                  </div>

                  {/* Station Name & City */}
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-tight">
                      {lang === 'en' ? station.name : station.nameAm}
                    </h3>
                    <p className="text-xs font-medium text-emerald-800 mt-0.5">
                      {lang === 'en' ? station.city : station.cityAm} • {station.elevationM}m elevation
                    </p>
                    {station.parentHubName && (
                      <div className="mt-1 text-[11px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-purple-200">
                        <span>{lang === 'en' ? `🔗 Hub: ${station.parentHubName}` : `🔗 ማዕከል፡ ${station.parentHubNameAm || station.parentHubName}`}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Terminal Disruption Notice */}
                  {stationAlert && (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
                        stationAlert.status === 'cancelled'
                          ? 'bg-rose-50 text-rose-900 border-rose-200'
                          : 'bg-amber-50 text-amber-950 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {stationAlert.status === 'cancelled' ? (
                          <XOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className="truncate">
                          {stationAlert.status === 'cancelled'
                            ? lang === 'en' ? 'Departures Suspended' : 'ጉዞዎች ለጊዜው ቆመዋል'
                            : lang === 'en' ? `+${stationAlert.expectedDelayMinutes}m Average Delay` : `+${stationAlert.expectedDelayMinutes} ደቂቃ መዘግየት`}
                        </span>
                      </div>
                      {onOpenTerminalMonitor && (
                        <button
                          type="button"
                          onClick={() => onOpenTerminalMonitor()}
                          className="text-[11px] underline font-bold shrink-0 cursor-pointer"
                        >
                          {lang === 'en' ? 'Radar' : 'ራዳር'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC LIVE CROWD INDICATOR COMPONENT */}
                  <div className={`rounded-2xl p-3.5 border ${levelConfig.badgeClass} ring-1 space-y-2.5 transition-all duration-300`}>
                    {/* Level Label with pulsating radar dot */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${levelConfig.pulseRing}`}
                          ></span>
                          <span
                            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${levelConfig.dotColor}`}
                          ></span>
                        </span>
                        <span className="font-extrabold text-xs tracking-tight">
                          {levelConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono font-black text-xs">
                        <span>{metrics.crowdScore}%</span>
                        <span className="text-[10px] font-normal text-neutral-500">
                          {lang === 'en' ? 'busyness' : 'ሙላት'}
                        </span>
                      </div>
                    </div>

                    {/* Visual Meter Progress Bar */}
                    <div className="w-full bg-neutral-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${levelConfig.meterFill} transition-all duration-500`}
                        style={{ width: `${metrics.crowdScore}%` }}
                      />
                    </div>

                    {/* Next 2 Hours Key Operational Telemetry */}
                    <div className="grid grid-cols-3 gap-1 pt-1 border-t border-neutral-200/60 text-center">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-neutral-600">
                          {lang === 'en' ? 'Departures' : 'መነሻዎች'}
                        </div>
                        <div className="font-mono font-extrabold text-xs text-neutral-900 flex items-center justify-center gap-1">
                          <Bus className="w-3 h-3 text-emerald-600" />
                          <span>{metrics.departuresCount}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5 border-x border-neutral-200/60">
                        <div className="text-[10px] font-medium text-neutral-600">
                          {lang === 'en' ? 'Commuters' : 'ተሳፋሪዎች'}
                        </div>
                        <div className="font-mono font-extrabold text-xs text-neutral-900 flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-amber-600" />
                          <span>{metrics.bookedPassengersCount}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium text-neutral-600">
                          {lang === 'en' ? 'Gate Wait' : 'የበር ወረፋ'}
                        </div>
                        <div className="font-mono font-extrabold text-xs text-neutral-900 flex items-center justify-center gap-1">
                          <Hourglass className="w-3 h-3 text-rose-500" />
                          <span>~{metrics.estimatedGateWaitMin}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Next Departure Quick Tag or Advice */}
                    <div className="text-[11px] font-medium flex items-center justify-between text-neutral-700 pt-0.5">
                      <span className="truncate">{levelConfig.advice}</span>
                      {metrics.nextDepartureMinutes !== null && (
                        <span className="shrink-0 font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px]">
                          {lang === 'en'
                            ? `Next: ${metrics.nextDepartureMinutes}m`
                            : `ቀጣይ፡ ${metrics.nextDepartureMinutes}ደ`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scheduled Departures in Next 2h Accordion Button */}
                  <div>
                    <button
                      onClick={() => toggleDeparturesDrawer(station.id)}
                      className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border border-neutral-200/60"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {lang === 'en'
                            ? `Scheduled in Next 2h (${metrics.departuresCount})`
                            : `የቀጣይ 2 ሰዓት መነሻዎች (${metrics.departuresCount})`}
                        </span>
                      </div>
                      {isDrawerOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </button>

                    {/* Expandable Departures List */}
                    {isDrawerOpen && (
                      <div className="mt-2.5 space-y-2 bg-neutral-50 rounded-2xl p-3 border border-neutral-200 max-h-60 overflow-y-auto">
                        {metrics.upcomingTrips.length === 0 ? (
                          <div className="text-center py-3 text-neutral-500 space-y-1">
                            <Clock className="w-5 h-5 text-neutral-400 mx-auto" />
                            <p className="text-xs font-semibold text-neutral-700">
                              {lang === 'en'
                                ? 'No departures in the next 2 hours'
                                : 'በቀጣዮቹ 2 ሰዓታት ምንም መነሻ አልተያዘም'}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {lang === 'en'
                                ? 'Terminal is calm with minimal queue delay.'
                                : 'መናኸሪያው ነጻና የተረጋጋ ነው።'}
                            </p>
                          </div>
                        ) : (
                          metrics.upcomingTrips.map((trip) => {
                            const destStation = AMHARA_STATIONS.find((s) => s.id === trip.toStationId);
                            const remainingSeats = (trip.totalSeats || 40) - (trip.bookedSeats?.length || 0);

                            return (
                              <div
                                key={trip.id}
                                className="bg-white rounded-xl p-2.5 border border-neutral-200/80 shadow-2xs hover:border-emerald-300 transition space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-neutral-900">
                                    <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[11px]">
                                      {trip.departureTime}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                                    <span className="text-emerald-800 truncate max-w-[120px]">
                                      {destStation
                                        ? lang === 'en'
                                          ? destStation.city
                                          : destStation.cityAm
                                        : trip.toStationId}
                                    </span>
                                  </div>

                                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                                    {trip.priceETB} ETB
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                                  <span className="truncate text-neutral-700 font-medium">
                                    {lang === 'en' ? trip.busCompany : trip.busCompanyAm || trip.busCompany}
                                  </span>
                                  <span className="font-mono text-[10px] text-neutral-500">
                                    {remainingSeats} {lang === 'en' ? 'seats left' : 'ወንበር'}
                                  </span>
                                </div>

                                <div className="pt-1 flex items-center justify-between gap-2 border-t border-neutral-100">
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    {lang === 'en' ? 'Platform Bay' : 'መጫኛ በር'} #{Math.floor(Math.random() * 8) + 1}
                                  </span>

                                  <button
                                    onClick={() => {
                                      triggerHaptic();
                                      if (onSelectTrip) {
                                        onSelectTrip(trip);
                                      } else {
                                        onBookFromStation(station.id, trip.toStationId);
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition cursor-pointer"
                                  >
                                    {lang === 'en' ? 'Book Seat' : 'ቦታ ያዝ'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Station Description */}
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {lang === 'en' ? station.description : station.descriptionAm}
                  </p>

                  {/* Operational Metadata */}
                  <div className="space-y-1.5 py-2.5 border-y border-neutral-100 text-xs text-neutral-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'en' ? 'Operating Hours:' : 'የስራ ሰዓት:'}</span>
                      </span>
                      <span className="font-semibold text-neutral-900 font-mono text-[11px]">
                        {lang === 'en' ? station.operatingHours : station.operatingHoursAm}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{lang === 'en' ? 'Office Phone:' : 'የመናኸሪያው ስልክ:'}</span>
                      </span>
                      <a
                        href={`tel:${station.phone}`}
                        className="font-mono font-bold text-emerald-700 hover:underline text-[11px]"
                      >
                        {station.phone}
                      </a>
                    </div>
                  </div>

                  {/* Amenities tags */}
                  <div className="flex flex-wrap gap-1">
                    {station.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-600 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                    {station.amenities.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-neutral-500 font-mono">
                        +{station.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onSelectStationForMap(station);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.viewOnMap}</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      onBookFromStation(station.id);
                    }}
                    className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Bus className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'en' ? 'Find Buses' : 'ጉዞ ፈልግ'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

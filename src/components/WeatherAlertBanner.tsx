import React, { useState, useEffect } from 'react';
import { WeatherAlert, Language, BusStation } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { fetchLiveWeather, CurrentWeatherConditions } from '../services/weatherService';
import { triggerHaptic } from '../utils/haptics';
import {
  AlertTriangle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Flame,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Clock,
  Compass,
  CheckCircle2,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';

interface WeatherAlertBannerProps {
  lang: Language;
  originStationId?: string;
  destStationId?: string;
  originAlert: WeatherAlert | null;
  destAlert: WeatherAlert | null;
  affectedRole: 'origin' | 'destination' | 'both' | 'none';
  onToggleStationAlert?: (stationId: string) => void;
  allAlertsState?: Record<string, WeatherAlert>;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  lang,
  originStationId,
  destStationId,
  originAlert,
  destAlert,
  affectedRole,
  onToggleStationAlert,
  allAlertsState,
}) => {
  // If neither origin nor destination has severe weather reported, do not render!
  if (!originAlert && !destAlert) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [liveOriginWeather, setLiveOriginWeather] = useState<CurrentWeatherConditions | null>(null);
  const [liveDestWeather, setLiveDestWeather] = useState<CurrentWeatherConditions | null>(null);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  // Active primary alert for display
  const primaryAlert = originAlert || destAlert!;
  const isBoth = Boolean(originAlert && destAlert);

  // Stations
  const originStation = AMHARA_STATIONS.find((s) => s.id === originStationId);
  const destStation = AMHARA_STATIONS.find((s) => s.id === destStationId);

  // Fetch live weather data from Google Maps Platform Weather API
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setLoadingLive(true);
      if (originStation) {
        const liveOrigin = await fetchLiveWeather(originStation.lat, originStation.lng, lang);
        if (isMounted) setLiveOriginWeather(liveOrigin);
      }
      if (destStation) {
        const liveDest = await fetchLiveWeather(destStation.lat, destStation.lng, lang);
        if (isMounted) setLiveDestWeather(liveDest);
      }
      if (isMounted) setLoadingLive(false);
    }
    loadWeather();

    return () => {
      isMounted = false;
    };
  }, [originStationId, destStationId, lang]);

  // Reset dismissal if station changes
  useEffect(() => {
    setIsDismissed(false);
    setIsExpanded(true);
  }, [originStationId, destStationId]);

  if (isDismissed) {
    return (
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-amber-200 shadow-sm animate-in fade-in duration-150">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">
            {lang === 'en'
              ? `Severe weather advisory minimized for ${originStation?.city || ''} ➔ ${destStation?.city || ''}`
              : `የአየር ሁኔታ ማስጠንቀቂያ ተደብቋል`}
          </span>
        </div>
        <button
          onClick={() => {
            triggerHaptic(10);
            setIsDismissed(false);
            setIsExpanded(true);
          }}
          className="text-amber-300 underline font-semibold hover:text-white cursor-pointer text-xs"
        >
          {lang === 'en' ? 'Restore Banner' : 'ማስጠንቀቂያውን አሳይ'}
        </button>
      </div>
    );
  }

  // Determine styling based on highest severity
  const isExtreme = primaryAlert.severity === 'Extreme' || (destAlert?.severity === 'Extreme');
  const isSevere = primaryAlert.severity === 'Severe' || (destAlert?.severity === 'Severe');

  const bgGradient = isExtreme
    ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-rose-500/60 text-rose-50'
    : isSevere
    ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/60 text-amber-50'
    : 'bg-gradient-to-r from-yellow-950 via-slate-900 to-slate-950 border-yellow-500/50 text-yellow-50';

  const badgeBg = isExtreme
    ? 'bg-rose-500 text-white'
    : isSevere
    ? 'bg-amber-500 text-slate-950'
    : 'bg-yellow-500 text-slate-950';

  const roleText =
    affectedRole === 'both'
      ? lang === 'en'
        ? 'Both Origin & Destination Affected'
        : 'ሁለቱም የመነሻና መድረሻ ክልሎች ተጎድተዋል'
      : affectedRole === 'origin'
      ? lang === 'en'
        ? `Origin Region Alert (${originStation?.city || originAlert?.stationName})`
        : `የመነሻ መናኸሪያ ማስጠንቀቂያ (${originStation?.cityAm || originAlert?.stationNameAm})`
      : lang === 'en'
      ? `Destination Region Alert (${destStation?.city || destAlert?.stationName})`
      : `የመድረሻ መናኸሪያ ማስጠንቀቂያ (${destStation?.cityAm || destAlert?.stationNameAm})`;

  // Event icon
  const renderEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'DENSE_MOUNTAIN_FOG':
        return <CloudFog className="w-5 h-5 text-amber-300 shrink-0" />;
      case 'TORRENTIAL_RAIN':
        return <CloudRain className="w-5 h-5 text-rose-300 shrink-0" />;
      case 'SEVERE_THUNDERSTORM':
        return <CloudLightning className="w-5 h-5 text-yellow-300 shrink-0" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />;
    }
  };

  return (
    <div
      className={`rounded-3xl border shadow-xl p-4 sm:p-5 relative overflow-hidden transition-all duration-200 ${bgGradient}`}
      role="alert"
      aria-live="polite"
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none ${
          isExtreme ? 'bg-rose-600/15' : 'bg-amber-500/15'
        }`}
      />

      {/* Top Bar: Badges, Role & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pulsing indicator */}
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isExtreme ? 'bg-rose-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isExtreme ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            />
          </span>

          {/* Severity Tag */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeBg}`}
          >
            {primaryAlert.severity} {lang === 'en' ? 'Weather Warning' : 'የአየር ማስጠንቀቂያ'}
          </span>

          {/* Affected Role Pill */}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 border border-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>{roleText}</span>
          </span>

          {/* Expected Delay Badge */}
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-black/40 border border-white/15 text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              +{Math.max(originAlert?.expectedDelayMin || 0, destAlert?.expectedDelayMin || 0)}m{' '}
              {lang === 'en' ? 'delay' : 'መዘግየት'}
            </span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Quick Simulation / Test Switcher */}
          {onToggleStationAlert && (
            <button
              onClick={() => setShowSimModal(!showSimModal)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition cursor-pointer flex items-center gap-1"
              title="Test Severe Weather Scenarios"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{lang === 'en' ? 'Simulate Incidents' : 'ሁኔታዎችን ሞክር'}</span>
            </button>
          )}

          {/* Expand / Collapse Button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer"
            aria-label={isExpanded ? 'Collapse Alert' : 'Expand Alert'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setIsDismissed(true);
            }}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Alert Content */}
      <div className="mt-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
          {renderEventIcon(primaryAlert.eventType)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug tracking-tight">
            {lang === 'en' ? primaryAlert.eventTitle : primaryAlert.eventTitleAm}
          </h3>

          <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
            {lang === 'en' ? primaryAlert.description : primaryAlert.descriptionAm}
          </p>

          {/* Secondary alert if both origin and destination have alerts */}
          {isBoth && destAlert && (
            <div className="mt-2.5 pt-2.5 border-t border-white/15">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? `Additional Alert at Destination (${destStation?.city}):`
                    : `በመድረሻ መናኸሪያ የተዘገበ ተጨማሪ ማስጠንቀቂያ (${destStation?.cityAm})፡`}
                </span>
              </div>
              <p className="text-xs text-slate-200/90 mt-0.5">
                {lang === 'en' ? destAlert.description : destAlert.descriptionAm}
              </p>
            </div>
          )}

          {/* Expandable Safety Guidance & Highway Details */}
          {isExpanded && (
            <div className="mt-3.5 space-y-3 pt-3 border-t border-white/15 animate-in fade-in duration-200">
              {/* Corridor & Live Telemetry metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {lang === 'en' ? 'Impacted Corridor Highway' : 'የተጎዳው አውራ ጎዳና'}
                    </span>
                    <span className="font-semibold text-white">
                      {primaryAlert.corridorHighway}
                    </span>
                  </div>
                </div>

                {/* Live Weather Readings from Weather API */}
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <CloudFog className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {lang === 'en' ? 'Live Telemetry Readings' : 'የቀጥታ የአየር ሁኔታ ንባብ'}
                    </span>
                    <span className="font-semibold text-white">
                      {liveOriginWeather
                        ? `${liveOriginWeather.temperatureC}°C • Visibility ${liveOriginWeather.visibilityKm}km • Wind ${liveOriginWeather.windSpeedKmh}km/h`
                        : `${primaryAlert.expectedDelayMin}m avg delay • Slow mountain passage`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety Recommendations List */}
              <div className="bg-black/25 rounded-2xl p-3 border border-white/10">
                <h4 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en'
                      ? 'Transit Advisory & Passenger Safety Instructions'
                      : 'የተሳፋሪና የአሽከርካሪ ደህንነት መመሪያዎች'}
                  </span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-200">
                  {(lang === 'en'
                    ? primaryAlert.safetyRecommendations
                    : primaryAlert.safetyRecommendationsAm
                  ).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attribution Requirement Enforcement */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[10px] text-slate-400">
                <div className="flex items-center gap-1 flex-wrap">
                  <span>{lang === 'en' ? 'Authoritative source:' : 'ኦፊሴላዊ የመረጃ ምንጭ፡'}</span>
                  <a
                    href={primaryAlert.dataSource.authorityUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-amber-300 hover:text-white inline-flex items-center gap-0.5 font-medium"
                  >
                    <span>{primaryAlert.dataSource.name}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                {/* Agent mandate: Dedicated line immediately following user-facing content */}
                <div className="font-mono text-slate-400 font-semibold tracking-wider">
                  Google Maps
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal / Scenario Tester */}
      {showSimModal && onToggleStationAlert && allAlertsState && (
        <div className="mt-3 p-3 bg-slate-950/90 rounded-2xl border border-white/20 text-xs text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'en' ? 'Weather Scenario Simulator' : 'የአየር ሁኔታ አስመስሎ መሞከሪያ'}
              </span>
            </span>
            <button
              onClick={() => setShowSimModal(false)}
              className="text-slate-400 hover:text-white cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">
            {lang === 'en'
              ? 'Toggle severe weather reports on any station to test conditional banner rendering:'
              : 'ባነሩ በተገቢው ሁኔታ እንዲታይ በማናቸውም መናኸሪያ ላይ ከባድ የአየር ሁኔታን ያብሩ ወይም ያጥፉ፡'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {AMHARA_STATIONS.map((station) => {
              const hasAlert = allAlertsState[station.id]?.isActive;
              return (
                <button
                  key={station.id}
                  onClick={() => onToggleStationAlert(station.id)}
                  className={`p-1.5 rounded-lg border text-left text-[11px] transition cursor-pointer flex items-center justify-between ${
                    hasAlert
                      ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{lang === 'en' ? station.city : station.cityAm}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

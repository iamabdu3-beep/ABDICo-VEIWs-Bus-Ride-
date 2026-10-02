import React, { useState, useEffect } from 'react';
import { BusStation, RouteConnection, RideTrip, Language, TerminalTrafficStatus } from '../types';
import { AMHARA_STATIONS, ROUTE_CONNECTIONS } from '../data/amharaStations';
import { BASE_TERMINAL_TRAFFIC, getCongestionConfig, getTerminalTraffic } from '../data/terminalTraffic';
import { triggerHaptic } from '../utils/haptics';
import { GoogleTransitMap } from './GoogleTransitMap';
import {
  MapPin,
  Navigation,
  Bus,
  Phone,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Activity,
  AlertTriangle,
  Gauge,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  Layers,
  Flame,
  CheckCircle2,
  Info,
  ChevronRight,
  Map as MapIcon,
  Download,
  DownloadCloud,
  Wifi,
  WifiOff,
  HardDrive,
  Compass,
  Copy,
  Check,
  Trash2,
  Share2,
} from 'lucide-react';

interface StationMapProps {
  lang: Language;
  selectedStationId?: string;
  onSelectStation: (station: BusStation) => void;
  onBookFromStation: (originStationId: string, destStationId?: string) => void;
  activeTrips: RideTrip[];
  highlightFromId?: string;
  highlightToId?: string;
}

const OFFLINE_MAP_STORAGE_KEY = 'amhara_offline_regional_map_v1';

export const StationMap: React.FC<StationMapProps> = ({
  lang,
  selectedStationId,
  onSelectStation,
  onBookFromStation,
  activeTrips,
  highlightFromId,
  highlightToId,
}) => {
  const [activeStation, setActiveStation] = useState<BusStation | null>(
    selectedStationId
      ? AMHARA_STATIONS.find((s) => s.id === selectedStationId) || AMHARA_STATIONS[0]
      : AMHARA_STATIONS[0]
  );
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [hoveredStation, setHoveredStation] = useState<BusStation | null>(null);

  // Map view mode: Google Maps (Real-world satellite/roads) vs Regional Schematic Grid
  const [mapViewMode, setMapViewMode] = useState<'google' | 'schematic'>('google');

  // Offline Regional Map Data & Cache State
  const [isOfflineDownloaded, setIsOfflineDownloaded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(OFFLINE_MAP_STORAGE_KEY) !== null;
    }
    return false;
  });
  const [offlineCachedDate, setOfflineCachedDate] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(OFFLINE_MAP_STORAGE_KEY);
        if (item) {
          const parsed = JSON.parse(item);
          return parsed.timestamp || null;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isDownloadingOffline, setIsDownloadingOffline] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [offlineModeForced, setOfflineModeForced] = useState<boolean>(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // User GPS Location for offline station distance & compass bearing
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [copiedGps, setCopiedGps] = useState<boolean>(false);
  const [offlineToastMessage, setOfflineToastMessage] = useState<string | null>(null);

  // Online / Offline window listeners
  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => {
      setIsDeviceOnline(false);
      setMapViewMode('schematic');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request passenger device GPS location
  const handleRequestUserLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserLocation({ lat: 11.5936, lng: 37.3908 }); // Default to Bahir Dar
      return;
    }
    triggerHaptic(10);
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocatingUser(false);
        triggerHaptic(15);
      },
      () => {
        setIsLocatingUser(false);
        // Default to regional center if user denies permission
        setUserLocation({ lat: 11.5936, lng: 37.3908 });
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Haversine formula to calculate km distance between passenger and station
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Calculate compass bearing
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.cos(((lon2 - lon1) * Math.PI) / 180);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    const compass = (brng + 360) % 360;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(compass / 45) % 8;
    return `${Math.round(compass)}° ${directions[index]}`;
  };

  // Offline map download toggle handler
  const handleToggleOfflineDownload = () => {
    triggerHaptic(12);
    if (isOfflineDownloaded) {
      localStorage.removeItem(OFFLINE_MAP_STORAGE_KEY);
      setIsOfflineDownloaded(false);
      setOfflineCachedDate(null);
      setOfflineModeForced(false);
      setOfflineToastMessage(
        lang === 'am'
          ? 'ከመስመር ውጭ የተቀመጠው ካርታ ተሰርዟል'
          : 'Offline map cache cleared from device storage.'
      );
      setTimeout(() => setOfflineToastMessage(null), 3500);
      return;
    }

    setIsDownloadingOffline(true);
    setDownloadProgress(20);

    setTimeout(() => setDownloadProgress(55), 200);
    setTimeout(() => setDownloadProgress(85), 450);
    setTimeout(() => {
      setDownloadProgress(100);
      const payload = {
        version: '1.0.0',
        timestamp: new Date().toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        stationsCount: AMHARA_STATIONS.length,
        stations: AMHARA_STATIONS,
        connections: ROUTE_CONNECTIONS,
        bundleSizeKb: 1420,
      };

      try {
        localStorage.setItem(OFFLINE_MAP_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      setIsOfflineDownloaded(true);
      setOfflineCachedDate(payload.timestamp);
      setIsDownloadingOffline(false);
      setOfflineToastMessage(
        lang === 'am'
          ? 'የአማራ ክልል ካርታ ሙሉ መረጃ (15 መናኸሪያዎችና አውራ ጎዳናዎች) ያለ ኢንተርኔት እንዲሰራ በስልክዎ ተቀምጧል!'
          : 'Amhara Regional Map data (15 terminals & corridors) successfully cached for offline navigation!'
      );
      setTimeout(() => setOfflineToastMessage(null), 4500);
      triggerHaptic(20);
    }, 700);
  };

  const handleCopyGps = (lat: number, lng: number) => {
    triggerHaptic(10);
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedGps(true);
    setTimeout(() => setCopiedGps(false), 2500);
  };

  const isOfflineActive = !isDeviceOnline || offlineModeForced;
  const effectiveMapViewMode = isOfflineActive ? 'schematic' : mapViewMode;

  // Live traffic congestion overlay state
  const [showTrafficOverlay, setShowTrafficOverlay] = useState<boolean>(true);
  const [trafficData, setTrafficData] = useState<Record<string, TerminalTrafficStatus>>(BASE_TERMINAL_TRAFFIC);
  const [showTerminalCallout, setShowTerminalCallout] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Periodic simulation of real-time traffic fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setTrafficData((prev) => {
        const next = { ...prev };
        const keys = Object.keys(next);
        if (keys.length === 0) return prev;
        // Select 1-2 random terminals to fluctuate
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const current = next[randomKey];
        if (current) {
          const deltaQueue = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
          const deltaSpeed = Math.floor(Math.random() * 3) - 1;
          const newQueue = Math.max(1, current.queueLengthVehicles + deltaQueue);
          const newSpeed = Math.max(6, current.approachSpeedKmH + deltaSpeed);
          next[randomKey] = {
            ...current,
            queueLengthVehicles: newQueue,
            approachSpeedKmH: newSpeed,
            lastUpdated: 'Live telemetry active',
          };
        }
        return next;
      });
    }, 6500);

    return () => clearInterval(timer);
  }, []);

  // Manual refresh / simulation trigger
  const handleRefreshTraffic = () => {
    triggerHaptic(15);
    setIsRefreshing(true);
    setTimeout(() => {
      setTrafficData((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const item = updated[key];
          const deltaSpeed = Math.floor(Math.random() * 5) - 2;
          const deltaQueue = Math.floor(Math.random() * 5) - 2;
          updated[key] = {
            ...item,
            approachSpeedKmH: Math.max(6, item.approachSpeedKmH + deltaSpeed),
            queueLengthVehicles: Math.max(1, item.queueLengthVehicles + deltaQueue),
            lastUpdated: 'Live feed refreshed just now',
          };
        });
        return updated;
      });
      setIsRefreshing(false);
    }, 500);
  };

  const zones = [
    { id: 'all', nameEn: 'All Zones (15 Stations)', nameAm: 'ሁሉም ዞኖች (15 መናኸሪያዎች)' },
    { id: 'Gojjam', nameEn: 'West & East Gojjam', nameAm: 'ምዕራብና ምሥራቅ ጎጃም' },
    { id: 'Gondar', nameEn: 'Central & South Gondar', nameAm: 'ማዕከላዊና ደቡብ ጎንደር' },
    { id: 'Wollo', nameEn: 'North & South Wollo', nameAm: 'ሰሜንና ደቡብ ወሎ' },
    { id: 'Shewa', nameEn: 'North Shewa', nameAm: 'ሰሜን ሸዋ' },
    { id: 'Awi-Wag', nameEn: 'Awi & Wag Hemra', nameAm: 'አዊ እና ዋግ ኽምራ' },
  ];

  const filteredStations = AMHARA_STATIONS.filter((s) => {
    if (zoneFilter === 'all') return true;
    if (zoneFilter === 'Gojjam') return s.zone.includes('Gojjam');
    if (zoneFilter === 'Gondar') return s.zone.includes('Gondar');
    if (zoneFilter === 'Wollo') return s.zone.includes('Wollo');
    if (zoneFilter === 'Shewa') return s.zone.includes('Shewa');
    if (zoneFilter === 'Awi-Wag') return s.zone === 'Awi' || s.zone === 'Wag Hemra';
    return true;
  });

  // Calculate station coordinates in SVG viewBox (0 0 1000 800)
  const getStationPos = (s: BusStation) => {
    return {
      x: (s.x / 100) * 880 + 60,
      y: (s.y / 100) * 680 + 60,
    };
  };

  const getStationById = (id: string) => AMHARA_STATIONS.find((s) => s.id === id);

  // Filter trips for the active station
  const stationDepartures = activeTrips.filter(
    (t) => t.fromStationId === activeStation?.id || t.toStationId === activeStation?.id
  );

  return (
    <div className="space-y-4">
      {/* Zone filter & Map Header */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === 'en'
                ? 'Amhara Regional Bus Transport & Station Grid'
                : 'የአማራ ክልል የአውቶቡስ ትራንስፖርት እና የመናኸሪያዎች ካርታ'}
            </span>
          </h2>
          <p className="text-xs text-neutral-500">
            {lang === 'en'
              ? 'Click any station terminal to view live departure boards, terminal master contacts, and available bays.'
              : 'የቀጥታ መውጫና መግቢያ ሰዓቶችን፣ የመጫኛ በሮችን እና የቢሮ ስልክ ቁጥር ለማየት መናኸሪያዎችን ይጫኑ።'}
          </p>
        </div>

        {/* View Mode Switcher and Filter chips */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Offline Map Data Download Toggle Control */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-xs">
            {isDownloadingOffline ? (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-neutral-800 bg-amber-50 rounded-lg border border-amber-300">
                <Download className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                <span>
                  {lang === 'en'
                    ? `Downloading Map (${downloadProgress}%)...`
                    : `ካርታውን በማውረድ ላይ (${downloadProgress}%)...`}
                </span>
                <div className="w-12 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-200 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : isOfflineDownloaded ? (
              <div className="flex items-center gap-1">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200"
                  title={
                    lang === 'en'
                      ? `Amhara map cached locally on ${offlineCachedDate || 'device'}`
                      : 'የአማራ ካርታ በስልክዎ ላይ ተቀምጧል'
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">
                    {lang === 'en' ? 'Offline Map Cached' : 'ካርታው ተቀምጧል'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                    1.4 MB
                  </span>
                </div>

                {/* Force Offline Nav Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setOfflineModeForced(!offlineModeForced);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    offlineModeForced
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                  }`}
                  title={
                    lang === 'en'
                      ? 'Toggle Offline Navigation Mode (Zero Data)'
                      : 'ከመስመር ውጭ አሰሳ ሞድ ማብሪያ/ማጥፊያ'
                  }
                >
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {lang === 'en' ? 'Offline Mode' : 'ከመስመር ውጭ'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      offlineModeForced ? 'bg-slate-950 animate-pulse' : 'bg-neutral-300'
                    }`}
                  />
                </button>

                {/* Delete cache button */}
                <button
                  type="button"
                  onClick={handleToggleOfflineDownload}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                  title={lang === 'en' ? 'Clear cached offline map data' : 'የተቀመጠውን ካርታ ሰርዝ'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleToggleOfflineDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-xs cursor-pointer active:scale-95"
                title={
                  lang === 'en'
                    ? 'Download Amhara regional map data for offline navigation without internet'
                    : 'ያለ ኢንተርኔት ለመጠቀም የአማራ ክልል ካርታን አውርድ'
                }
              >
                <DownloadCloud className="w-3.5 h-3.5 text-slate-950" />
                <span>{lang === 'en' ? 'Download Offline Map' : 'ካርታውን አውርድ'}</span>
                <span className="text-[10px] bg-slate-950/15 text-slate-950 px-1.5 py-0.2 rounded-full font-mono">
                  1.4 MB
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-xs">
            <button
              onClick={() => {
                triggerHaptic(10);
                setOfflineModeForced(false);
                setMapViewMode('google');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                effectiveMapViewMode === 'google'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'en' ? 'Google Maps (Live)' : 'ጉግል ካርታ (የቀጥታ)'}</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setMapViewMode('schematic');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                effectiveMapViewMode === 'schematic'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Schematic Grid' : 'የክልሉ ንድፍ ካርታ'}</span>
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setZoneFilter(z.id)}
                className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${
                  zoneFilter === z.id
                    ? 'bg-emerald-700 text-white border-emerald-700 font-medium'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {lang === 'en' ? z.nameEn : z.nameAm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Offline Toast Message Notification */}
      {offlineToastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-900 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{offlineToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setOfflineToastMessage(null)}
            className="p-1 text-emerald-300 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Offline Navigation Banner */}
      {isOfflineActive && (
        <div className="p-3 rounded-2xl bg-amber-500 text-neutral-950 border border-amber-600 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-neutral-950 text-amber-300 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-xs block leading-tight">
                {lang === 'en'
                  ? 'Offline Regional Map Active • 15 Stations Cached'
                  : 'ከመስመር ውጭ አሰሳ በርቷል • 15 መናኸሪያዎች በስልክዎ ተቀምጠዋል'}
              </span>
              <span className="text-[11px] opacity-90 block leading-tight mt-0.5">
                {lang === 'en'
                  ? 'All bus station terminals, GPS coordinates, highway connections, and emergency contacts are running offline.'
                  : 'ሁሉም የመናኸሪያ ቦታዎች፣ የጂፒኤስ መጋጠሚያዎች፣ አውራ ጎዳናዎችና የአደጋ ጊዜ ስልኮች ያለ ኢንተርኔት ይሰራሉ።'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {offlineModeForced && (
              <button
                type="button"
                onClick={() => setOfflineModeForced(false)}
                className="px-2.5 py-1 bg-neutral-950 text-white hover:bg-neutral-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {lang === 'en' ? 'Exit Offline Mode' : 'ከመስመር ውጭ ውጣ'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Container (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {effectiveMapViewMode === 'google' ? (
            <GoogleTransitMap
              lang={lang}
              selectedStationId={activeStation?.id || selectedStationId}
              onSelectStation={(st) => {
                setActiveStation(st);
                onSelectStation(st);
              }}
              onBookFromStation={onBookFromStation}
              activeTrips={activeTrips}
              highlightFromId={highlightFromId}
              highlightToId={highlightToId}
              trafficData={trafficData}
              showTrafficOverlay={showTrafficOverlay}
            />
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-neutral-800 shadow-md p-3 relative overflow-hidden">
          {/* Top-bar map controls and live traffic toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Left: Highway Code Legend */}
            <div className="bg-slate-800/90 backdrop-blur-xs border border-slate-700 rounded-xl p-2 text-xs text-slate-200 shadow-lg pointer-events-auto flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-white text-[11px]">
                  {lang === 'en' ? 'Regional Grid' : 'የክልሉ መረብ'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-slate-300 border-l border-slate-700 pl-2.5">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-amber-400 rounded-full" />
                  <span>Route 3</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-emerald-400 rounded-full" />
                  <span>Route 2</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-cyan-400 rounded-full" />
                  <span>Route 22</span>
                </span>
              </div>
            </div>

            {/* Right: Live Traffic Overlay Controls */}
            <div className="flex items-center gap-2 pointer-events-auto flex-wrap justify-end">
              {/* Overlay Toggle Button */}
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setShowTrafficOverlay(!showTrafficOverlay);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer border ${
                  showTrafficOverlay
                    ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title={lang === 'en' ? 'Toggle Live Traffic Congestion Overlay' : 'የቀጥታ ትራፊክ መረጃ ማብሪያ/ማጥፊያ'}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Live Traffic Overlay' : 'የቀጥታ ትራፊክ'}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    showTrafficOverlay ? 'bg-rose-600 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </button>

              {/* Refresh / Telemetry Simulator Button */}
              <button
                onClick={handleRefreshTraffic}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 transition cursor-pointer disabled:opacity-50"
                title={lang === 'en' ? 'Simulate Live Telemetry Ping' : 'ቀጥታ መረጃ አድስ'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{lang === 'en' ? 'Simulate' : 'አድስ'}</span>
              </button>

              {/* Congestion Scale Chips (when overlay enabled) */}
              {showTrafficOverlay && (
                <div className="hidden lg:flex items-center gap-2 bg-slate-800/90 backdrop-blur-xs border border-slate-700 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 shadow-md">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>&lt;5m</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>5-10m</span>
                  </span>
                  <span className="flex items-center gap-1 text-orange-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>10-20m</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>20m+ Gridlock</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom-right Map Legend */}
          <div className="absolute bottom-4 right-4 z-10 bg-slate-800/90 backdrop-blur-xs border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white" />
              <span>{lang === 'en' ? 'Bus Station' : 'መናኸሪያ'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500/80" />
              <span>{lang === 'en' ? 'Lake Tana (ጣና)' : 'ጣና ሐይቅ'}</span>
            </span>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="w-full aspect-[16/11] select-none">
            <svg
              viewBox="0 0 1000 760"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
            >
              <defs>
                {/* Lake Tana gradient */}
                <radialGradient id="tanaWater" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#0369a1" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#075985" stopOpacity="0.3" />
                </radialGradient>

                {/* Lake Haiq gradient */}
                <radialGradient id="haiqWater" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.4" />
                </radialGradient>

                {/* Road Pulse Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Traffic Congestion Halo Gradients */}
                <radialGradient id="trafficHalo-severe" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#e11d48" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="trafficHalo-heavy" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#ea580c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="trafficHalo-moderate" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.75" />
                  <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="trafficHalo-low" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.65" />
                  <stop offset="45%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Geographic Regions Shading */}
              {/* Simien Mountains Relief (North) */}
              <path
                d="M 280 80 Q 360 40 440 90 T 560 110 T 640 60 L 640 180 Q 480 200 320 180 Z"
                fill="#334155"
                fillOpacity="0.35"
              />
              <text x="390" y="95" fill="#94a3b8" fontSize="13" fontWeight="600" letterSpacing="2">
                SIMIEN MOUNTAINS / ሰሜን ተራሮች
              </text>

              {/* Choke Mountains Relief (Gojjam Center) */}
              <path
                d="M 270 480 Q 350 430 420 490 T 400 580 T 290 560 Z"
                fill="#334155"
                fillOpacity="0.3"
              />
              <text x="300" y="520" fill="#94a3b8" fontSize="12" fontWeight="500" letterSpacing="1.5">
                CHOKE RANGE / ጮቄ ተራራ
              </text>

              {/* Abay (Blue Nile) Gorge representation */}
              <path
                d="M 330 630 Q 380 670 420 740"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeOpacity="0.7"
              />
              <text x="345" y="700" fill="#38bdf8" fontSize="11" fontStyle="italic">
                Abay Gorge (አባይ በረሃ)
              </text>

              {/* Lake Tana Water Body (ጣና ሐይቅ) */}
              {/* Accurately positioned between Bahir Dar (south) and Gondar (north) */}
              <path
                d="M 260 270 C 270 230, 340 220, 365 260 C 390 300, 385 360, 350 395 C 315 430, 275 425, 250 380 C 230 340, 250 300, 260 270 Z"
                fill="url(#tanaWater)"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeOpacity="0.8"
              />
              {/* Lake Tana Islands / Monastery markers */}
              <circle cx="310" cy="320" r="4" fill="#10b981" />
              <circle cx="330" cy="285" r="3.5" fill="#10b981" />
              <circle cx="285" cy="350" r="3" fill="#10b981" />
              <text x="278" y="340" fill="#e0f2fe" fontSize="15" fontWeight="bold">
                Lake Tana
              </text>
              <text x="290" y="358" fill="#bae6fd" fontSize="11">
                ጣና ሐይቅ
              </text>

              {/* Lake Haiq (ደሴ / ሐይቅ) */}
              <ellipse cx="730" cy="380" rx="14" ry="18" fill="url(#haiqWater)" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="710" y="360" fill="#7dd3fc" fontSize="10">
                Lake Haiq (ሐይቅ)
              </text>

              {/* Road Connections / Highways */}
              {ROUTE_CONNECTIONS.map((rc) => {
                const s1 = getStationById(rc.fromStationId);
                const s2 = getStationById(rc.toStationId);
                if (!s1 || !s2) return null;

                const p1 = getStationPos(s1);
                const p2 = getStationPos(s2);

                const isHighlighted =
                  (highlightFromId === s1.id && highlightToId === s2.id) ||
                  (highlightFromId === s2.id && highlightToId === s1.id) ||
                  (activeStation?.id === s1.id || activeStation?.id === s2.id);

                // Road color based on highway
                let roadColor = '#475569';
                if (rc.highwayCode.includes('Route 3')) roadColor = '#fbbf24'; // Amber for Route 3
                else if (rc.highwayCode.includes('Route 2')) roadColor = '#34d399'; // Emerald for Route 2
                else if (rc.highwayCode.includes('Route 22')) roadColor = '#22d3ee'; // Cyan for Route 22

                return (
                  <g key={rc.id}>
                    {/* Underlying wide glow when highlighted */}
                    {isHighlighted && (
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={roadColor}
                        strokeWidth="8"
                        strokeOpacity="0.4"
                        filter="url(#glow)"
                      />
                    )}
                    {/* Base Road Line */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={roadColor}
                      strokeWidth={isHighlighted ? '4' : '2.5'}
                      strokeOpacity={isHighlighted ? '0.95' : '0.6'}
                      strokeDasharray={isHighlighted ? '6 3' : undefined}
                    />
                    {/* Midpoint distance badge */}
                    <g transform={`translate(${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}>
                      <circle r="8" fill="#1e293b" stroke={roadColor} strokeWidth="1" />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#f8fafc"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {rc.distanceKm}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Active Moving Buses on Route Simulation */}
              {activeTrips
                .filter((t) => t.status === 'in_transit' || t.status === 'boarding')
                .map((trip) => {
                  const s1 = getStationById(trip.fromStationId);
                  const s2 = getStationById(trip.toStationId);
                  if (!s1 || !s2) return null;

                  const p1 = getStationPos(s1);
                  const p2 = getStationPos(s2);
                  const progress = (trip.currentProgress || 30) / 100;

                  const busX = p1.x + (p2.x - p1.x) * progress;
                  const busY = p1.y + (p2.y - p1.y) * progress;

                  return (
                    <g key={trip.id} transform={`translate(${busX}, ${busY})`}>
                      {/* Pulse circle */}
                      <circle r="14" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                      <circle r="10" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                      <text textAnchor="middle" dy="3.5" fill="#ffffff" fontSize="9" fontWeight="bold">
                        🚌
                      </text>
                      {/* Bus tooltip badge */}
                      <rect x="-35" y="-22" width="70" height="14" rx="4" fill="#0f172a" fillOpacity="0.85" />
                      <text textAnchor="middle" y="-12" fill="#34d399" fontSize="8" fontWeight="600">
                        {trip.busCompany.split(' ')[0]} • {trip.currentSpeedKmH || 65} km/h
                      </text>
                    </g>
                  );
                })}

              {/* Bus Stations Nodes */}
              {filteredStations.map((station) => {
                const pos = getStationPos(station);
                const isSelected = activeStation?.id === station.id;
                const isHovered = hoveredStation?.id === station.id;
                const traffic = trafficData[station.id] || getTerminalTraffic(station.id);
                const cfg = getCongestionConfig(traffic.congestionLevel);
                const isSevere = traffic.congestionLevel === 'severe';
                const isHeavy = traffic.congestionLevel === 'heavy';

                return (
                  <g
                    key={station.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => {
                      triggerHaptic(12);
                      setActiveStation(station);
                      setShowTerminalCallout(true);
                      onSelectStation(station);
                    }}
                    onMouseEnter={() => setHoveredStation(station)}
                    onMouseLeave={() => setHoveredStation(null)}
                    className="cursor-pointer group"
                  >
                    {/* Live Traffic Overlay: Radiating Congestion Heat Halo & Pulse */}
                    {showTrafficOverlay && (
                      <g className="pointer-events-none">
                        {/* Radial Heat Gradient Halo */}
                        <circle
                          r={isSevere ? 36 : isHeavy ? 30 : 24}
                          fill={`url(#trafficHalo-${traffic.congestionLevel})`}
                          className="transition-all duration-300"
                        />

                        {/* Concentric Radar Ring */}
                        <circle
                          r={isSevere ? 30 : isHeavy ? 25 : 20}
                          fill="none"
                          stroke={cfg.colorHex}
                          strokeWidth={isSevere ? '2' : '1.4'}
                          strokeDasharray="4 3"
                          strokeOpacity={isSelected ? 0.95 : 0.75}
                          className={isSevere || isHeavy ? 'animate-spin' : ''}
                          style={{
                            transformOrigin: '0 0',
                            animationDuration: isSevere ? '6s' : '9s',
                          }}
                        />

                        {/* Outward Shockwave for Heavy and Severe Congestion */}
                        {(isSevere || isHeavy) && (
                          <circle
                            r={isSevere ? 42 : 34}
                            fill="none"
                            stroke={cfg.colorHex}
                            strokeWidth="1.2"
                            strokeOpacity="0.4"
                            className="animate-ping"
                            style={{ animationDuration: '3s' }}
                          />
                        )}
                      </g>
                    )}

                    {/* Ripple ring for selected station */}
                    {isSelected && !showTrafficOverlay && (
                      <circle r="22" fill="#10b981" fillOpacity="0.2" className="animate-pulse" />
                    )}

                    {/* Outer Target Circle */}
                    <circle
                      r={isSelected ? '14' : isHovered ? '12' : '9'}
                      fill={isSelected ? '#059669' : '#0f172a'}
                      stroke={
                        showTrafficOverlay
                          ? cfg.colorHex
                          : isSelected
                          ? '#34d399'
                          : '#f59e0b'
                      }
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all duration-200"
                    />

                    {/* Inner Core */}
                    <circle
                      r={isSelected ? '6' : '4'}
                      fill={
                        showTrafficOverlay
                          ? cfg.colorHex
                          : isSelected
                          ? '#ffffff'
                          : '#fbbf24'
                      }
                    />

                    {/* Traffic Delay Pill Badge when Traffic Overlay is Active */}
                    {showTrafficOverlay && (
                      <g transform="translate(-20, -22)" className="pointer-events-none">
                        <rect
                          width="40"
                          height="14"
                          rx="7"
                          fill="#020617"
                          fillOpacity="0.9"
                          stroke={cfg.colorHex}
                          strokeWidth="1.2"
                        />
                        <circle cx="6" cy="7" r="2.5" fill={cfg.colorHex} className="animate-pulse" />
                        <text
                          x="13"
                          y="10.5"
                          fill={cfg.colorHex}
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          +{traffic.averageDelayMin}m
                        </text>
                      </g>
                    )}

                    {/* Station Name Label Badge */}
                    <g
                      transform={`translate(${station.x > 70 ? -12 : 14}, ${
                        station.y > 70 ? (showTrafficOverlay ? 8 : -12) : 4
                      })`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-4"
                        y="-12"
                        width={lang === 'en' ? station.name.length * 6.5 + 16 : station.nameAm.length * 8 + 16}
                        height="20"
                        rx="5"
                        fill="#020617"
                        fillOpacity={isSelected ? '0.95' : '0.8'}
                        stroke={isSelected ? (showTrafficOverlay ? cfg.colorHex : '#10b981') : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        x="4"
                        y="2"
                        fill={isSelected ? '#6ee7b7' : '#f8fafc'}
                        fontSize="10"
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {lang === 'en' ? station.city : station.cityAm}
                        <tspan fill="#94a3b8" fontSize="8" dx="3">
                          ({station.baysCount} {lang === 'en' ? 'bays' : 'በር'})
                        </tspan>
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Floating Status Description Card over the clicked terminal */}
          {showTerminalCallout && activeStation && (() => {
            const pos = getStationPos(activeStation);
            const traffic = trafficData[activeStation.id] || getTerminalTraffic(activeStation.id);
            const cfg = getCongestionConfig(traffic.congestionLevel);
            const isBelow = pos.y < 240;
            const leftClamped = Math.max(24, Math.min(76, (pos.x / 1000) * 100));
            const topPercent = (pos.y / 760) * 100;

            return (
              <div
                className="absolute z-20 pointer-events-auto transition-all duration-200"
                style={{
                  left: `${leftClamped}%`,
                  top: isBelow ? `${topPercent + 4}%` : `${topPercent - 4}%`,
                  transform: isBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                  maxWidth: '350px',
                  minWidth: '280px',
                }}
              >
                <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl text-white relative ring-1 ring-white/10">
                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTerminalCallout(false);
                    }}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    title={lang === 'en' ? 'Close status callout' : 'ዝጋ'}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Header */}
                  <div className="pr-6 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse`} />
                        <span>{cfg.trafficIcon} {lang === 'en' ? cfg.labelEn : cfg.labelAm}</span>
                        <span className="font-mono">+{traffic.averageDelayMin}m</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {traffic.lastUpdated}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">
                      {lang === 'en' ? activeStation.name : activeStation.nameAm}
                    </h4>
                    <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                      {lang === 'en' ? traffic.statusHeadlineEn : traffic.statusHeadlineAm}
                    </p>
                  </div>

                  {/* Brief Status Description */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 mb-2.5">
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {lang === 'en' ? traffic.statusDescriptionEn : traffic.statusDescriptionAm}
                    </p>
                  </div>

                  {/* Live Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-2">
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">
                        {lang === 'en' ? 'Speed' : 'ፍጥነት'}
                      </span>
                      <span className="font-bold text-white font-mono text-[11px]">
                        {traffic.approachSpeedKmH} km/h
                      </span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">
                        {lang === 'en' ? 'Gate Queue' : 'ወረፋ'}
                      </span>
                      <span className="font-bold text-white font-mono text-[11px]">
                        {traffic.queueLengthVehicles} veh
                      </span>
                    </div>
                    <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">
                        {lang === 'en' ? 'Bay Load' : 'መጫኛ በር'}
                      </span>
                      <span className="font-bold text-white font-mono text-[11px]">
                        {traffic.bayOccupancyRate}%
                      </span>
                    </div>
                  </div>

                  {/* Gate status and trend footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1.5 truncate pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {lang === 'en' ? traffic.gateAccessStatusEn : traffic.gateAccessStatusAm}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {traffic.congestionTrend === 'worsening'
                        ? '↗ Worsening'
                        : traffic.congestionTrend === 'improving'
                        ? '↘ Clearing'
                        : '➔ Steady'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
            </div>
          )}
        </div>

        {/* Selected Station Inspection & Live Departure Board (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {activeStation ? (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4 flex flex-col h-full">
              {/* Header with Zone Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>{lang === 'en' ? activeStation.zone : activeStation.zoneAm}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                    {lang === 'en' ? activeStation.name : activeStation.nameAm}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {lang === 'en' ? `${activeStation.city}, Elevation ${activeStation.elevationM}m` : `${activeStation.cityAm} ከተማ፣ ከፍታ ${activeStation.elevationM} ሜትር`}
                  </p>
                </div>

                <div className="text-right">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-center">
                    <span className="text-xs font-mono font-bold text-amber-900 block leading-none">
                      {activeStation.baysCount}
                    </span>
                    <span className="text-[10px] text-amber-700 uppercase font-medium">
                      {lang === 'en' ? 'Bays' : 'በሮች'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Description */}
              <p className="text-xs text-neutral-600 my-3 leading-relaxed">
                {lang === 'en' ? activeStation.description : activeStation.descriptionAm}
              </p>

              {/* Live Terminal Traffic & Gate Status */}
              {(() => {
                const traffic = trafficData[activeStation.id] || getTerminalTraffic(activeStation.id);
                const cfg = getCongestionConfig(traffic.congestionLevel);

                return (
                  <div className={`mb-3.5 p-3 rounded-xl border ${cfg.bgLight} transition-all duration-200 shadow-2xs`}>
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-black/5">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dotColor}`} />
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dotColor}`} />
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Live Traffic & Gate Telemetry' : 'የቀጥታ ትራፊክና በር ሁኔታ'}</span>
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
                        {cfg.trafficIcon} {lang === 'en' ? cfg.labelEn : cfg.labelAm}
                      </span>
                    </div>

                    {/* Headline */}
                    <h4 className="text-xs font-bold text-neutral-900 mb-1.5">
                      {lang === 'en' ? traffic.statusHeadlineEn : traffic.statusHeadlineAm}
                    </h4>

                    {/* Brief Status Description */}
                    <div className="bg-white/80 p-2.5 rounded-lg border border-black/5 mb-2.5">
                      <p className="text-xs leading-relaxed text-neutral-700 font-medium">
                        {lang === 'en' ? traffic.statusDescriptionEn : traffic.statusDescriptionAm}
                      </p>
                    </div>

                    {/* 4-Metric Telemetry Grid */}
                    <div className="grid grid-cols-4 gap-1.5 text-center mb-2">
                      <div className="bg-white/90 p-1.5 rounded-lg border border-black/5">
                        <span className="text-[9px] text-neutral-500 uppercase block font-semibold">
                          {lang === 'en' ? 'Delay' : 'መዘግየት'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          +{traffic.averageDelayMin}m
                        </span>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-black/5">
                        <span className="text-[9px] text-neutral-500 uppercase block font-semibold">
                          {lang === 'en' ? 'Approach' : 'ፍጥነት'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {traffic.approachSpeedKmH} km/h
                        </span>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-black/5">
                        <span className="text-[9px] text-neutral-500 uppercase block font-semibold">
                          {lang === 'en' ? 'Queue' : 'ወረፋ'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {traffic.queueLengthVehicles} veh
                        </span>
                      </div>
                      <div className="bg-white/90 p-1.5 rounded-lg border border-black/5">
                        <span className="text-[9px] text-neutral-500 uppercase block font-semibold">
                          {lang === 'en' ? 'Bay Load' : 'መጫኛ'}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          {traffic.bayOccupancyRate}%
                        </span>
                      </div>
                    </div>

                    {/* Gate Flow & Corridors */}
                    <div className="text-[11px] text-neutral-700 space-y-1 bg-white/70 p-2 rounded-lg border border-black/5">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-tight">
                          <strong className="text-neutral-900">{lang === 'en' ? 'Gate Access: ' : 'የበር ሁኔታ፡ '}</strong>
                          {lang === 'en' ? traffic.gateAccessStatusEn : traffic.gateAccessStatusAm}
                        </span>
                      </div>
                      {traffic.corridorsAffected.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-neutral-600 pt-1 border-t border-black/5 flex-wrap">
                          <span className="font-semibold">{lang === 'en' ? 'Affected Corridors: ' : 'ተጽዕኖ ያለባቸው መስመሮች፡ '}</span>
                          {traffic.corridorsAffected.map((corr, i) => (
                            <span key={i} className="px-1.5 py-0.2 bg-black/5 rounded text-neutral-800 font-medium">
                              {corr}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer with Trend & Last Updated */}
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-neutral-500">
                      <span className="flex items-center gap-1 font-medium">
                        {traffic.congestionTrend === 'worsening' ? (
                          <TrendingUp className="w-3 h-3 text-rose-500" />
                        ) : traffic.congestionTrend === 'improving' ? (
                          <TrendingDown className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Activity className="w-3 h-3 text-amber-500" />
                        )}
                        <span>
                          {lang === 'en' ? 'Trend: ' : 'አቅጣጫ፡ '}
                          {traffic.congestionTrend === 'worsening'
                            ? lang === 'en' ? 'Congestion increasing ↗' : 'እየጨመረ ↗'
                            : traffic.congestionTrend === 'improving'
                            ? lang === 'en' ? 'Clearing steadily ↘' : 'እየቀነሰ ↘'
                            : lang === 'en' ? 'Stable flow ➔' : 'የተረጋጋ ➔'}
                        </span>
                      </span>
                      <span className="font-mono">{traffic.lastUpdated}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Offline Station Navigation Card */}
              <div className="mb-3.5 p-3 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'en' ? 'Offline Station Navigation' : 'ከመስመር ውጭ አሰሳ እና ጂፒኤስ'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {isOfflineDownloaded
                      ? lang === 'en' ? 'Data Cached' : 'ካርታ ተቀምጧል'
                      : lang === 'en' ? 'GPS Ready' : 'ጂፒኤስ ዝግጁ'}
                  </span>
                </div>

                {/* Distance & Bearing from passenger */}
                <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-xs">
                  {userLocation ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {lang === 'en' ? 'Distance from Your Location' : 'ከእርስዎ ያለ ርቀት'}
                        </span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {calculateDistanceKm(userLocation.lat, userLocation.lng, activeStation.lat, activeStation.lng)} km
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {lang === 'en' ? 'Compass Bearing' : 'አቅጣጫ'}
                        </span>
                        <span className="font-bold text-amber-300 text-xs font-mono">
                          {calculateBearing(userLocation.lat, userLocation.lng, activeStation.lat, activeStation.lng)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestUserLocation}
                      disabled={isLocatingUser}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-700 hover:bg-slate-650 text-slate-200 rounded text-xs font-medium transition cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-amber-300 ${isLocatingUser ? 'animate-spin' : ''}`} />
                      <span>
                        {isLocatingUser
                          ? (lang === 'en' ? 'Acquiring GPS...' : 'GPS በመፈለግ ላይ...')
                          : (lang === 'en' ? 'Calculate Distance from My Location' : 'ከእኔ ቦታ ያለውን ርቀት አስላ')}
                      </span>
                    </button>
                  )}
                </div>

                {/* Exact GPS Coordinates with 1-click copy */}
                <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2 rounded-lg border border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'en' ? 'Terminal GPS Coordinates' : 'የመናኸሪያው ጂፒኤስ መጋጠሚያ'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-200">
                      {activeStation.lat.toFixed(4)}°N, {activeStation.lng.toFixed(4)}°E
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyGps(activeStation.lat, activeStation.lng)}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded text-xs font-semibold transition cursor-pointer"
                    title={lang === 'en' ? 'Copy GPS coordinates for offline navigation' : 'የጂፒኤስ መጋጠሚያ ቅዳ'}
                  >
                    {copiedGps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGps ? (lang === 'en' ? 'Copied' : 'ተቀድቷል') : (lang === 'en' ? 'Copy' : 'ቅዳ')}</span>
                  </button>
                </div>

                {/* Emergency Station Master Helpline (offline direct dial) */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="text-[11px] text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'en' ? 'Offline Emergency Line:' : 'የአደጋ ጊዜ ስልክ፡'}</span>
                  </span>
                  <a
                    href={`tel:${activeStation.emergencyPhone || activeStation.phone}`}
                    className="font-mono font-bold text-amber-300 hover:underline text-[11px]"
                  >
                    {activeStation.emergencyPhone || activeStation.phone}
                  </a>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-600 block">
                      {lang === 'en' ? 'Operating Hours' : 'የስራ ሰዓት'}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {lang === 'en' ? activeStation.operatingHours : activeStation.operatingHoursAm}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-neutral-600 block">
                      {lang === 'en' ? 'Station Master Office' : 'የመናኸሪያው ቢሮ'}
                    </span>
                    <span className="font-semibold text-neutral-900 font-mono text-[11px]">
                      {activeStation.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities tags */}
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Terminal Facilities' : 'የመናኸሪያው አገልግሎቶች'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeStation.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[11px] bg-neutral-100 text-neutral-700 rounded-md border border-neutral-200"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active departures from this station */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {lang === 'en' ? 'Next Departures & Shared Rides' : 'ቀጣይ መውጫዎች እና የጋራ ጉዞዎች'}
                    </span>
                  </span>
                  <span className="text-[11px] text-neutral-600 font-mono">
                    {stationDepartures.length} {lang === 'en' ? 'trips' : 'ጉዞዎች'}
                  </span>
                </div>

                {stationDepartures.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {stationDepartures.map((trip) => {
                      const destStation = getStationById(trip.toStationId);
                      const isOrigin = trip.fromStationId === activeStation.id;

                      return (
                        <div
                          key={trip.id}
                          className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs hover:border-emerald-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                              <span>{isOrigin ? '➔' : '⬅'}</span>
                              <span className="font-semibold">
                                {lang === 'en' ? destStation?.city : destStation?.cityAm}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                                {trip.departureTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span>{lang === 'en' ? trip.busCompany : trip.busCompanyAm}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">
                                {trip.priceETB} ETB
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onBookFromStation(trip.fromStationId, trip.toStationId)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition cursor-pointer"
                          >
                            {lang === 'en' ? 'Book' : 'ቦታ ያዝ'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-2">
                    {lang === 'en'
                      ? 'No scheduled departures right now. Check back shortly.'
                      : 'በዚህ ሰዓት የተመዘገበ ጉዞ የለም።'}
                  </p>
                )}
              </div>

              {/* Action: Book ride starting from this station */}
              <div className="pt-3 border-t border-neutral-100 mt-2">
                <button
                  onClick={() => onBookFromStation(activeStation.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Bus className="w-4 h-4 text-amber-300" />
                  <span>
                    {lang === 'en'
                      ? `Search Rides from ${activeStation.city}`
                      : `ከ${activeStation.cityAm} የሚነሱ ጉዞዎችን ፈልግ`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
              <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs text-neutral-500">
                {lang === 'en' ? 'Select a bus station node on the map' : 'በካርታው ላይ መናኸሪያ ይምረጡ'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

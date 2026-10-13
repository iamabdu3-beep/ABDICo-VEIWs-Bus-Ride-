import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  LiveMovingBus,
  LiveTrackedCommuter,
  Language,
  BusStation,
} from '../types';
import { ETHIOPIA_BUS_STATIONS, getEthiopiaStationById } from '../data/ethiopiaStations';
import { getDistanceKm } from '../data/liveTrackingData';
import { triggerHaptic } from '../utils/haptics';
import {
  Bus,
  Users,
  MapPin,
  Navigation,
  Compass,
  Radio,
  Clock,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Layers,
  Sparkles,
  Phone,
  ArrowRight,
  Send,
  Eye,
  CheckCircle2,
  Share2,
  Search,
  X,
  ChevronRight,
  TrendingUp,
  Map as MapIcon,
  Zap,
} from 'lucide-react';

interface LiveTrackingMapProps {
  lang: Language;
  buses: LiveMovingBus[];
  commuters: LiveTrackedCommuter[];
  selectedBusId: string | null;
  selectedCommuterId: string | null;
  onSelectBus: (busId: string | null) => void;
  onSelectCommuter: (commuterId: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
  onBroadcastUserLocation?: (note: string, destId: string) => void;
  onBookTripForBus?: (tripId: string) => void;
}

// Coordinate bounds of Ethiopia for vector SVG projection
const ET_GEO_BOUNDS = {
  minLat: 3.4,
  maxLat: 15.0,
  minLng: 33.0,
  maxLng: 48.0,
};

// Helper component to center and zoom Google Map smoothly
const GoogleMapCameraController: React.FC<{
  target: { lat: number; lng: number } | null;
  zoom: number;
}> = ({ target, zoom }) => {
  const map = useMap('live-tracking-google-map');

  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      map.setZoom(zoom);
    }
  }, [map, target, zoom]);

  return null;
};

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  lang,
  buses,
  commuters,
  selectedBusId,
  selectedCommuterId,
  onSelectBus,
  onSelectCommuter,
  userLocation,
  onBroadcastUserLocation,
  onBookTripForBus,
}) => {
  const isAm = lang === 'am';

  // Display mode: 'radar' (SVG High-Definition Vector Radar) vs 'google' (Google Maps Satellite/Roads)
  const [mapEngine, setMapEngine] = useState<'radar' | 'google'>('radar');
  const [googleMapType, setGoogleMapType] = useState<'terrain' | 'satellite' | 'hybrid' | 'roadmap'>('terrain');

  // Layer filters
  const [showBuses, setShowBuses] = useState(true);
  const [showCommuters, setShowCommuters] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showCorridorLines, setShowCorridorLines] = useState(true);
  const [commuterRadarRadiusKm, setCommuterRadarRadiusKm] = useState<number>(0); // 0 = all

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // SVG Pan & Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Broadcast location popup state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastNote, setBroadcastNote] = useState('');
  const [broadcastDestId, setBroadcastDestId] = useState('addis-autobis-tera');

  // Currently focused entity
  const activeBus = useMemo(() => {
    return buses.find((b) => b.id === selectedBusId) || null;
  }, [buses, selectedBusId]);

  const activeCommuter = useMemo(() => {
    return commuters.find((c) => c.id === selectedCommuterId) || null;
  }, [commuters, selectedCommuterId]);

  // Google Map camera target
  const googleCameraTarget = useMemo(() => {
    if (activeBus) return { lat: activeBus.lat, lng: activeBus.lng };
    if (activeCommuter) return { lat: activeCommuter.lat, lng: activeCommuter.lng };
    if (userLocation) return userLocation;
    return { lat: 9.0348, lng: 38.7469 }; // Addis Ababa
  }, [activeBus, activeCommuter, userLocation]);

  // Project GPS lat/lng to SVG percentage coordinates (0-1000 x 0-800)
  const projectGeoToSvg = (lat: number, lng: number) => {
    const xRatio = (lng - ET_GEO_BOUNDS.minLng) / (ET_GEO_BOUNDS.maxLng - ET_GEO_BOUNDS.minLng);
    const yRatio = (ET_GEO_BOUNDS.maxLat - lat) / (ET_GEO_BOUNDS.maxLat - ET_GEO_BOUNDS.minLat);
    return {
      x: Math.round(xRatio * 1000),
      y: Math.round(yRatio * 800),
    };
  };

  // Calculate distance from user to nearest moving bus
  const nearestBusToUser = useMemo(() => {
    if (!userLocation || buses.length === 0) return null;
    let closest: { bus: LiveMovingBus; distanceKm: number } | null = null;
    buses.forEach((b) => {
      const d = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      if (!closest || d < closest.distanceKm) {
        closest = { bus: b, distanceKm: d };
      }
    });
    return closest;
  }, [userLocation, buses]);

  // Filtered lists
  const filteredBuses = useMemo(() => {
    if (!showBuses) return [];
    if (!searchQuery.trim()) return buses;
    const q = searchQuery.toLowerCase();
    return buses.filter(
      (b) =>
        b.plateNumber.toLowerCase().includes(q) ||
        b.busCompany.toLowerCase().includes(q) ||
        b.busCompanyAm.includes(q) ||
        b.driverName.toLowerCase().includes(q) ||
        b.lastCheckpoint.toLowerCase().includes(q) ||
        b.nextCheckpoint.toLowerCase().includes(q)
    );
  }, [buses, showBuses, searchQuery]);

  const filteredCommuters = useMemo(() => {
    if (!showCommuters) return [];
    return commuters.filter((c) => {
      if (commuterRadarRadiusKm > 0 && userLocation) {
        const d = getDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
        if (d > commuterRadarRadiusKm) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.destinationName.toLowerCase().includes(q) ||
          c.currentStationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [commuters, showCommuters, commuterRadarRadiusKm, userLocation, searchQuery]);

  // Major corridor highway paths for SVG radar background
  const nationalHighwayPaths = useMemo(() => {
    return [
      // Corridor A3: Addis Ababa -> Bahir Dar -> Gondar
      [
        { lat: 9.0348, lng: 38.7469 },
        { lat: 10.1200, lng: 38.1600 },
        { lat: 10.3300, lng: 37.7300 },
        { lat: 10.7025, lng: 37.2625 },
        { lat: 11.5936, lng: 37.3908 },
        { lat: 11.9200, lng: 37.7000 },
        { lat: 12.6075, lng: 37.4650 },
      ],
      // Corridor E1 / R7: Addis Ababa -> Hawassa -> Dilla -> Yirgacheffe
      [
        { lat: 8.9050, lng: 38.7610 },
        { lat: 8.5410, lng: 39.2700 },
        { lat: 7.9330, lng: 38.7200 },
        { lat: 7.0504, lng: 38.4760 },
        { lat: 6.4100, lng: 38.3100 },
        { lat: 6.1600, lng: 38.2000 },
      ],
      // Corridor A2: Addis Ababa -> Dessie -> Mekelle
      [
        { lat: 9.0320, lng: 38.8250 },
        { lat: 9.6800, lng: 39.5300 },
        { lat: 9.8600, lng: 39.7300 },
        { lat: 11.0850, lng: 39.7380 },
        { lat: 11.1300, lng: 39.6350 },
        { lat: 11.8300, lng: 39.6000 },
        { lat: 13.4967, lng: 39.4753 },
      ],
      // Corridor A5: Addis Ababa -> Jimma
      [
        { lat: 9.0020, lng: 38.7050 },
        { lat: 8.2830, lng: 37.7800 },
        { lat: 7.6730, lng: 36.8340 },
      ],
      // Corridor A1: Dessie -> Semera
      [
        { lat: 11.1300, lng: 39.6350 },
        { lat: 11.4300, lng: 40.7600 },
        { lat: 11.7920, lng: 41.0050 },
      ],
      // Corridor Eastern: Dire Dawa -> Harar
      [
        { lat: 9.5930, lng: 41.8660 },
        { lat: 9.3700, lng: 42.0600 },
        { lat: 9.3130, lng: 42.1280 },
      ],
    ];
  }, []);

  // Pan & Drag handlers for SVG Map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetPanZoom = () => {
    triggerHaptic(10);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFocusUserLocation = () => {
    triggerHaptic(12);
    if (!userLocation) return;
    const pt = projectGeoToSvg(userLocation.lat, userLocation.lng);
    setZoomLevel(2.2);
    setPanOffset({ x: -pt.x * 1.2 + 400, y: -pt.y * 1.2 + 300 });
  };

  const handleFocusBus = (bus: LiveMovingBus) => {
    triggerHaptic(10);
    onSelectBus(bus.id);
    onSelectCommuter(null);
    const pt = projectGeoToSvg(bus.lat, bus.lng);
    setZoomLevel(2.4);
    setPanOffset({ x: -pt.x * 1.4 + 400, y: -pt.y * 1.4 + 300 });
  };

  return (
    <div className="space-y-4">
      {/* 1. Map Toolbar & Mode Controls */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {isAm ? 'የቀጥታ ጂፒኤስ ራዳር' : 'Live Dual-Layer Telemetry'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {buses.length} {isAm ? 'አውቶቡሶች' : 'Buses'} • {commuters.length} {isAm ? 'ተሳፋሪዎች' : 'Commuters'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isAm ? 'የአውቶቡሶችና የተሳፋሪዎች የቀጥታ መከታተያ ካርታ' : 'Buses & Commuters Live Tracking Mapping'}
              </h2>
            </div>
          </div>

          {/* Engine Toggle: Radar vs Google Maps */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setMapEngine('radar');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  mapEngine === 'radar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
                <span>{isAm ? 'ዲጂታል ራዳር' : 'Vector Radar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setMapEngine('google');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  mapEngine === 'google'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'ጉግል ካርታ' : 'Google Maps'}</span>
              </button>
            </div>

            {/* Broadcast My Pickup Beacon Trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setBroadcastOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAm ? 'መነሻዬን አጋራ / አሳፍሩኝ' : 'Broadcast My Pickup'}</span>
            </button>
          </div>
        </div>

        {/* Layer Filters & Quick Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Toggle Buses */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                setShowBuses(!showBuses);
              }}
              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                showBuses
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Bus className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAm ? 'አውቶቡሶች' : 'Buses'} ({buses.length})</span>
            </button>

            {/* Toggle Commuters */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                setShowCommuters(!showCommuters);
              }}
              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                showCommuters
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAm ? 'ተሳፋሪዎች' : 'Commuters'} ({commuters.length})</span>
            </button>

            {/* Toggle Stations */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(6);
                setShowStations(!showStations);
              }}
              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                showStations
                  ? 'bg-blue-950/80 text-blue-300 border-blue-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAm ? 'መናኸሪያዎች' : 'Terminals'}</span>
            </button>

            {/* Commuter Radar Radius Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 text-[11px]">
              <span className="text-slate-400">{isAm ? 'የራዳር ርቀት:' : 'Radar Radius:'}</span>
              {[
                { km: 0, label: isAm ? 'ሀገር አቀፍ' : 'Nationwide' },
                { km: 50, label: '50 km' },
                { km: 15, label: '15 km' },
              ].map((r) => (
                <button
                  key={r.km}
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setCommuterRadarRadiusKm(r.km);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                    commuterRadarRadiusKm === r.km
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAm ? 'አውቶቡስ፣ ሰሌዳ ወይም ተሳፋሪ ፈልግ...' : 'Search bus plate, company, commuter...'}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Canvas Container */}
      <div className="relative w-full aspect-[16/10] min-h-[500px] max-h-[720px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 select-none">
        {/* Floating Quick Action Overlay Buttons */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setZoomLevel((z) => Math.min(3.5, z + 0.3));
            }}
            className="w-8 h-8 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setZoomLevel((z) => Math.max(0.7, z - 0.3));
            }}
            className="w-8 h-8 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetPanZoom}
            className="w-8 h-8 rounded-xl bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition cursor-pointer"
            title="Reset Nationwide View"
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
          </button>
          {userLocation && (
            <button
              type="button"
              onClick={handleFocusUserLocation}
              className="w-8 h-8 rounded-xl bg-emerald-900/90 text-emerald-300 hover:bg-emerald-800 border border-emerald-500/50 flex items-center justify-center shadow-lg transition cursor-pointer"
              title="Focus on My Location"
            >
              <Navigation className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nearest Bus Status Floating Pill */}
        {nearestBusToUser && (
          <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-xs shadow-xl flex items-center gap-2.5 max-w-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bus className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                {isAm ? 'ወደ እርስዎ የቀረበ አውቶቡስ' : 'Nearest Live Bus'}
              </span>
              <p className="font-extrabold text-white text-xs truncate">
                {isAm ? nearestBusToUser.bus.busCompanyAm : nearestBusToUser.bus.busCompany} ({nearestBusToUser.bus.plateNumber})
              </p>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                {nearestBusToUser.distanceKm} km {isAm ? 'ርቀት' : 'away'} · {nearestBusToUser.bus.currentSpeedKmH} km/h
              </span>
            </div>
          </div>
        )}

        {/* ========================================================
            ENGINE A: VECTOR RADAR TOPOLOGICAL MAP (SVG Canvas)
            ======================================================== */}
        {mapEngine === 'radar' && (
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            <svg
              viewBox="0 0 1000 800"
              className="w-full h-full"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: '500px 400px',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
                </pattern>
                {/* Radar Sweep Gradient */}
                <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
                  <stop offset="60%" stopColor="#0f172a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Radar Background & Grid */}
              <rect width="1000" height="800" fill="#020617" />
              <rect width="1000" height="800" fill="url(#radarGrid)" />
              <circle cx="500" cy="400" r="350" fill="url(#radarCenterGlow)" />
              <circle cx="500" cy="400" r="180" fill="none" stroke="#059669" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
              <circle cx="500" cy="400" r="320" fill="none" stroke="#059669" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.2" />

              {/* 1. National Highway Corridors Lines */}
              {showCorridorLines &&
                nationalHighwayPaths.map((pathPts, idx) => {
                  const dStr = pathPts
                    .map((pt, pIdx) => {
                      const svgPt = projectGeoToSvg(pt.lat, pt.lng);
                      return `${pIdx === 0 ? 'M' : 'L'} ${svgPt.x} ${svgPt.y}`;
                    })
                    .join(' ');
                  return (
                    <g key={idx}>
                      {/* Glow path */}
                      <path d={dStr} fill="none" stroke="#059669" strokeWidth="3" opacity="0.25" strokeLinecap="round" />
                      {/* Solid route line */}
                      <path d={dStr} fill="none" stroke="#34d399" strokeWidth="1.4" opacity="0.6" strokeDasharray="4 3" strokeLinecap="round" />
                    </g>
                  );
                })}

              {/* 2. Stations & Terminals Markers */}
              {showStations &&
                ETHIOPIA_BUS_STATIONS.map((st) => {
                  const pt = projectGeoToSvg(st.lat, st.lng);
                  const isFederal = st.hierarchyTier === 'federal';
                  const isRegional = st.hierarchyTier === 'regional';
                  const isZonal = st.hierarchyTier === 'zonal';

                  return (
                    <g
                      key={st.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(8);
                      }}
                    >
                      <circle
                        r={isFederal ? 6 : isRegional ? 5 : isZonal ? 3.5 : 2.5}
                        fill={isFederal ? '#9333ea' : isRegional ? '#059669' : isZonal ? '#2563eb' : '#64748b'}
                        stroke="#ffffff"
                        strokeWidth={isFederal ? 1.5 : 1}
                      />
                      {(isFederal || isRegional || zoomLevel > 1.8) && (
                        <text
                          y={isFederal ? -9 : -7}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize={isFederal ? 9 : 8}
                          fontWeight={isFederal ? 'bold' : 'normal'}
                          className="pointer-events-none select-none font-sans"
                        >
                          {isAm ? st.cityAm : st.city}
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* 3. Commuters / Passengers Live Markers */}
              {showCommuters &&
                filteredCommuters.map((commuter) => {
                  const pt = projectGeoToSvg(commuter.lat, commuter.lng);
                  const isSelected = commuter.id === selectedCommuterId;
                  const isCurrentUser = commuter.isCurrentUser;

                  return (
                    <g
                      key={commuter.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(10);
                        onSelectCommuter(commuter.id);
                        onSelectBus(null);
                      }}
                    >
                      {/* Pulsing ring for roadside beacon or current user */}
                      {(commuter.status === 'roadside_beacon' || isCurrentUser) && (
                        <circle r="14" fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.6">
                          <animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Commuter icon marker */}
                      <circle
                        r={isSelected ? 9 : 7}
                        fill={isCurrentUser ? '#0284c7' : '#d97706'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="7"
                        fontWeight="bold"
                        className="pointer-events-none select-none font-sans"
                      >
                        {isCurrentUser ? 'ME' : 'P'}
                      </text>

                      {/* Name tag */}
                      <text
                        y="16"
                        textAnchor="middle"
                        fill="#fde68a"
                        fontSize="7.5"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        {isAm ? commuter.nameAm : commuter.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

              {/* 4. Live Moving Buses with Direction Heading Vectors */}
              {showBuses &&
                filteredBuses.map((bus) => {
                  const pt = projectGeoToSvg(bus.lat, bus.lng);
                  const isSelected = bus.id === selectedBusId;

                  return (
                    <g
                      key={bus.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFocusBus(bus);
                      }}
                    >
                      {/* Selection highlight glow */}
                      {isSelected && (
                        <circle r="18" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3">
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0"
                            to="360"
                            dur="6s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Moving radar ping wave */}
                      <circle r="10" fill="none" stroke={bus.routeColor || '#10b981'} strokeWidth="1" opacity="0.5">
                        <animate attributeName="r" values="5;14;5" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
                      </circle>

                      {/* Directional vehicle marker container rotated by heading */}
                      <g transform={`rotate(${bus.headingDegrees})`}>
                        {/* Bus body rounded rect */}
                        <rect
                          x="-6"
                          y="-10"
                          width="12"
                          height="20"
                          rx="3"
                          fill={bus.routeColor || '#059669'}
                          stroke="#ffffff"
                          strokeWidth="1.2"
                        />
                        {/* Front windshield indicator */}
                        <rect x="-4" y="-8" width="8" height="3" rx="1" fill="#e2e8f0" />
                        {/* Headlight beams */}
                        <path d="M -4 -10 L -6 -15 L 6 -15 L 4 -10 Z" fill="#fef08a" opacity="0.4" />
                      </g>

                      {/* Speed badge */}
                      <rect x="9" y="-8" width="38" height="13" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
                      <text x="28" y="1" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                        {bus.currentSpeedKmH} km/h
                      </text>

                      {/* Bus Company / Plate label */}
                      <text
                        y="-13"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        className="pointer-events-none select-none font-sans"
                      >
                        {isAm ? bus.busCompanyAm.split(' ')[0] : bus.busCompany.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

              {/* 5. User GPS Position Marker */}
              {userLocation && (
                (() => {
                  const userPt = projectGeoToSvg(userLocation.lat, userLocation.lng);
                  return (
                    <g transform={`translate(${userPt.x}, ${userPt.y})`}>
                      <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="1.5">
                        <animate attributeName="r" values="6;24;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="7" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                      <text y="-10" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" className="font-sans">
                        {isAm ? 'የእርስዎ መገኛ' : 'Your GPS'}
                      </text>
                    </g>
                  );
                })()
              )}

              {/* 6. Nearest Bus Radar Ray */}
              {userLocation && nearestBusToUser && (
                (() => {
                  const uPt = projectGeoToSvg(userLocation.lat, userLocation.lng);
                  const bPt = projectGeoToSvg(nearestBusToUser.bus.lat, nearestBusToUser.bus.lng);
                  const midX = (uPt.x + bPt.x) / 2;
                  const midY = (uPt.y + bPt.y) / 2;
                  return (
                    <g className="pointer-events-none select-none">
                      <line
                        x1={uPt.x}
                        y1={uPt.y}
                        x2={bPt.x}
                        y2={bPt.y}
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.85"
                      />
                      <rect
                        x={midX - 32}
                        y={midY - 9}
                        width="64"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke="#06b6d4"
                        strokeWidth="0.8"
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="7.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {nearestBusToUser.distanceKm} km ray
                      </text>
                    </g>
                  );
                })()
              )}
            </svg>
          </div>
        )}

        {/* ========================================================
            ENGINE B: GOOGLE MAPS SATELLITE / TERRAIN INTEGRATION
            ======================================================== */}
        {mapEngine === 'google' && (
          <div className="w-full h-full">
            <Map
              id="live-tracking-google-map"
              defaultCenter={googleCameraTarget}
              defaultZoom={7}
              mapTypeId={googleMapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <GoogleMapCameraController target={googleCameraTarget} zoom={selectedBusId ? 10 : 7} />

              {/* Google Map Type Switcher Floating Controls */}
              <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 flex items-center gap-1 shadow-lg">
                {(['terrain', 'hybrid', 'roadmap', 'satellite'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      setGoogleMapType(t);
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg capitalize transition cursor-pointer ${
                      googleMapType === t
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Google Maps: National Corridors Polylines */}
              {showCorridorLines &&
                nationalHighwayPaths.map((pathPts, idx) => {
                  const colors = ['#059669', '#d97706', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
                  return (
                    <Polyline
                      key={`google-corridor-${idx}`}
                      path={pathPts}
                      strokeColor={colors[idx % colors.length]}
                      strokeWeight={3.5}
                      strokeOpacity={0.75}
                    />
                  );
                })}

              {/* Google Maps: Ethiopian Bus Terminals / Stations */}
              {showStations &&
                ETHIOPIA_BUS_STATIONS.slice(0, 32).map((st) => (
                  <AdvancedMarker
                    key={st.id}
                    position={{ lat: st.lat, lng: st.lng }}
                    onClick={() => {
                      triggerHaptic(6);
                    }}
                  >
                    <div className="group cursor-pointer flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full border border-white shadow-xs ${
                          st.hierarchyTier === 'federal'
                            ? 'bg-purple-600 ring-2 ring-purple-300'
                            : st.hierarchyTier === 'regional'
                            ? 'bg-emerald-600'
                            : st.hierarchyTier === 'zonal'
                            ? 'bg-blue-600'
                            : 'bg-slate-600'
                        }`}
                      />
                      <span className="text-[9px] font-bold text-slate-900 bg-white/95 px-1 rounded shadow-2xs mt-0.5 whitespace-nowrap hidden group-hover:block border border-slate-200">
                        {isAm ? st.cityAm : st.city}
                      </span>
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Google Maps: User Location Live GPS Marker */}
              {userLocation && (
                <AdvancedMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  title={isAm ? 'የእርስዎ የቀጥታ መገኛ' : 'Your Live Location'}
                >
                  <div className="relative group cursor-pointer flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-sky-300 px-2 py-0.5 rounded-full shadow-sm border border-slate-700 mt-1 whitespace-nowrap">
                      {isAm ? 'እርስዎ (ጂፒኤስ)' : 'You (Live GPS)'}
                    </span>
                  </div>
                </AdvancedMarker>
              )}

              {/* Google Maps: Buses as Advanced Markers */}
              {showBuses &&
                filteredBuses.map((bus) => (
                  <AdvancedMarker
                    key={bus.id}
                    position={{ lat: bus.lat, lng: bus.lng }}
                    onClick={() => handleFocusBus(bus)}
                  >
                    <div className="relative group cursor-pointer flex flex-col items-center">
                      <div
                        className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md flex items-center gap-1"
                        style={{ backgroundColor: bus.routeColor || '#059669' }}
                      >
                        <Bus className="w-3 h-3" />
                        <span>{bus.currentSpeedKmH} km/h</span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-900 -mt-0.5" />
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Google Maps: Commuters as Advanced Markers */}
              {showCommuters &&
                filteredCommuters.map((commuter) => (
                  <AdvancedMarker
                    key={commuter.id}
                    position={{ lat: commuter.lat, lng: commuter.lng }}
                    onClick={() => {
                      triggerHaptic(8);
                      onSelectCommuter(commuter.id);
                      onSelectBus(null);
                    }}
                  >
                    <div className="p-1.5 rounded-full bg-amber-500 text-white shadow-md border-2 border-white cursor-pointer animate-pulse">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Google Maps: Active Bus InfoWindow */}
              {activeBus && (
                <InfoWindow
                  position={{ lat: activeBus.lat, lng: activeBus.lng }}
                  onCloseClick={() => onSelectBus(null)}
                >
                  <div className="p-1 max-w-[260px] text-slate-900 text-xs space-y-1.5 font-sans">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="font-extrabold text-sm text-emerald-800">
                        {isAm ? activeBus.busCompanyAm : activeBus.busCompany}
                      </strong>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {activeBus.currentSpeedKmH} km/h
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        <span className="text-slate-400">{isAm ? 'ሰሌዳ፡' : 'Plate:'}</span>{' '}
                        <strong className="font-mono">{activeBus.plateNumber}</strong> · {activeBus.vehicleType}
                      </div>
                      <div>
                        <span className="text-slate-400">{isAm ? 'ያለፈበት፡' : 'Passed:'}</span>{' '}
                        <strong>{isAm ? activeBus.lastCheckpointAm : activeBus.lastCheckpoint}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{isAm ? 'ቀጣይ፡' : 'Next:'}</span>{' '}
                        <strong className="text-emerald-700">{isAm ? activeBus.nextCheckpointAm : activeBus.nextCheckpoint}</strong>
                      </div>
                      <div className="flex justify-between pt-0.5">
                        <span>{isAm ? 'ተሳፋሪዎች፡' : 'Seats:'} <strong>{activeBus.occupiedSeats}/{activeBus.totalSeats}</strong></span>
                        <span className="text-cyan-700 font-bold font-mono">ETA ~{activeBus.estimatedArrivalMin}m</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 border-t">
                      <a
                        href={`tel:${activeBus.driverPhone}`}
                        className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-[10px] text-center"
                      >
                        {isAm ? 'ደውል' : 'Call'}
                      </a>
                      {onBookTripForBus && (
                        <button
                          type="button"
                          onClick={() => onBookTripForBus(activeBus.tripId)}
                          className="flex-1 py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[10px] text-center cursor-pointer"
                        >
                          {isAm ? 'ቦታ ያዝ' : 'Book'}
                        </button>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Google Maps: Active Commuter InfoWindow */}
              {activeCommuter && (
                <InfoWindow
                  position={{ lat: activeCommuter.lat, lng: activeCommuter.lng }}
                  onCloseClick={() => onSelectCommuter(null)}
                >
                  <div className="p-1 max-w-[240px] text-slate-900 text-xs space-y-1 font-sans">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="font-extrabold text-sm text-amber-800">
                        {isAm ? activeCommuter.nameAm : activeCommuter.name}
                      </strong>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1 rounded">
                        {activeCommuter.status === 'roadside_beacon' ? (isAm ? 'መንገድ ዳር' : 'Roadside') : (isAm ? 'ጣቢያ' : 'Terminal')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        <span className="text-slate-400">{isAm ? 'መነሻ፡' : 'From:'}</span>{' '}
                        <strong>{isAm ? activeCommuter.currentStationNameAm : activeCommuter.currentStationName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{isAm ? 'መድረሻ፡' : 'To:'}</span>{' '}
                        <strong className="text-emerald-700">{isAm ? activeCommuter.destinationNameAm : activeCommuter.destinationName}</strong>
                      </div>
                      {activeCommuter.pickupNote && (
                        <p className="text-[10px] italic text-amber-900 bg-amber-50 p-1 rounded">
                          "{activeCommuter.pickupNote}"
                        </p>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono">
                        {isAm ? 'የሚጠብቀው፡' : 'Wait:'} ~{activeCommuter.waitTimeMinutes} min
                      </div>
                    </div>
                    <div className="pt-1 border-t">
                      <a
                        href={`tel:${activeCommuter.phone}`}
                        className="block w-full py-1 bg-amber-600 hover:bg-amber-700 text-white text-center rounded font-bold text-[10px]"
                      >
                        {isAm ? 'ደውል' : 'Call Commuter'} ({activeCommuter.phone})
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        )}

        {/* 3. Floating Detail Drawer / Inspector Card (Bottom-Left) */}
        {(activeBus || activeCommuter) && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                {activeBus ? (isAm ? 'የአውቶቡስ ቴሌሜትሪ' : 'Bus Telemetry') : (isAm ? 'የተሳፋሪ መረጃ' : 'Commuter Profile')}
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectBus(null);
                  onSelectCommuter(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Bus Details */}
            {activeBus && (
              <div className="mt-2.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      {isAm ? activeBus.busCompanyAm : activeBus.busCompany}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {activeBus.plateNumber} · {activeBus.vehicleType}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-emerald-400">
                      {activeBus.currentSpeedKmH} km/h
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Alt: {activeBus.currentAltitudeM}m
                    </span>
                  </div>
                </div>

                {/* Checkpoint row */}
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAm ? 'ያለፈበት፡' : 'Passed:'}</span>
                    <strong className="text-slate-200 line-clamp-1">
                      {isAm ? activeBus.lastCheckpointAm : activeBus.lastCheckpoint}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isAm ? 'ቀጣይ፡' : 'Next:'}</span>
                    <strong className="text-emerald-300 line-clamp-1">
                      {isAm ? activeBus.nextCheckpointAm : activeBus.nextCheckpoint}
                    </strong>
                  </div>
                </div>

                {/* Occupancy and ETA */}
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isAm ? 'ተሳፋሪዎች፡' : 'Occupancy:'}{' '}
                      <strong className="text-white font-mono">{activeBus.occupiedSeats}/{activeBus.totalSeats}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isAm ? 'ቀሪ ሰዓት፡' : 'Arrival ETA:'}{' '}
                      <strong className="text-cyan-300 font-mono">~{activeBus.estimatedArrivalMin} min</strong>
                    </span>
                  </div>
                </div>

                {/* Driver phone and book actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${activeBus.driverPhone}`}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1 text-[11px] transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{isAm ? 'ካፕቴኑን ደውል' : 'Call Captain'}</span>
                  </a>

                  {onBookTripForBus && (
                    <button
                      type="button"
                      onClick={() => onBookTripForBus(activeBus.tripId)}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1 text-[11px] transition shadow-xs cursor-pointer"
                    >
                      <Bus className="w-3 h-3 text-amber-300" />
                      <span>{isAm ? 'ይህን አውቶቡስ ያዝ' : 'Book This Bus'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Active Commuter Details */}
            {activeCommuter && (
              <div className="mt-2.5 space-y-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-sm">
                    {activeCommuter.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isAm ? activeCommuter.nameAm : activeCommuter.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {activeCommuter.phone}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAm ? 'መነሻ፡' : 'From:'}</span>
                    <strong className="text-white">
                      {isAm ? activeCommuter.currentStationNameAm : activeCommuter.currentStationName}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAm ? 'መድረሻ፡' : 'Destination:'}</span>
                    <strong className="text-emerald-300">
                      {isAm ? activeCommuter.destinationNameAm : activeCommuter.destinationName}
                    </strong>
                  </div>
                  {activeCommuter.pickupNote && (
                    <p className="text-[10px] text-amber-300 pt-1 border-t border-slate-700/60 italic">
                      "{activeCommuter.pickupNote}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">
                    {isAm ? 'የሚጠብቅበት ሰዓት፡' : 'Wait Time:'} ~{activeCommuter.waitTimeMinutes} min
                  </span>
                  <a
                    href={`tel:${activeCommuter.phone}`}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{isAm ? 'ደውል' : 'Call'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Broadcast Pickup Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-md w-full text-white shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {isAm ? 'የመነሻ መገኛዎን ለሹፌሮች አጋሩ' : 'Broadcast Commuter Pickup Beacon'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {isAm ? 'በመስመሩ ላይ ላሉ አውቶቡሶችና ሹፌሮች ይታያል' : 'Visible to en-route drivers & dispatch'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAm ? 'የሚሄዱበት መድረሻ (Destination):' : 'Desired Destination:'}
                </label>
                <select
                  value={broadcastDestId}
                  onChange={(e) => setBroadcastDestId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {ETHIOPIA_BUS_STATIONS.slice(0, 25).map((s) => (
                    <option key={s.id} value={s.id}>
                      {isAm ? s.nameAm : s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAm ? 'የመገኛ ዝርዝር ወይም መልዕክት (Pickup Note):' : 'Location Note / Landmark:'}
                </label>
                <input
                  type="text"
                  value={broadcastNote}
                  onChange={(e) => setBroadcastNote(e.target.value)}
                  placeholder={
                    isAm
                      ? 'ምሳሌ፡ በደብረ ብርሃን መውጫ ኬላ ላይ እየጠበቅኩ ነው'
                      : 'e.g. Waiting near Toll gate with 1 luggage'
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-[11px] text-emerald-300">
                <span className="font-bold block mb-0.5">
                  {isAm ? '✅ ፈጣን ግንኙነት፡' : 'Radar Beacon Broadcast:'}
                </span>
                {isAm
                  ? 'የጂፒኤስ መገኛዎ በካርታው ላይ ምልክት ተደርጎበት ወደ እርስዎ የሚመጡ አውቶቡሶች ቦታ ሊይዙልዎ ይችላሉ።'
                  : 'Your live marker will pulse on the radar map allowing approaching coaches and minibuses to pick you up along the corridor.'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                className="flex-1 py-2 text-slate-400 hover:text-white text-xs font-semibold rounded-xl"
              >
                {isAm ? 'ይቅር' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  if (onBroadcastUserLocation) {
                    onBroadcastUserLocation(broadcastNote, broadcastDestId);
                  }
                  setBroadcastOpen(false);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {isAm ? 'አሁን አሰራጭ' : 'Activate Beacon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

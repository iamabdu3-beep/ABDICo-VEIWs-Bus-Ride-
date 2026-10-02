import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  Polyline,
  useMap,
  useApiIsLoaded,
} from '@vis.gl/react-google-maps';
import { BookingTicket, Language, BusStation } from '../types';
import { AMHARA_STATIONS, ROUTE_CONNECTIONS } from '../data/amharaStations';
import { computeTransitRoute, RoutePlanResult } from '../utils/transitAgent';
import { triggerHaptic } from '../utils/haptics';
import {
  MapPin,
  Navigation,
  Bus,
  Clock,
  ArrowRight,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Mountain,
  Compass,
  Radio,
  ExternalLink,
  Info,
  CheckCircle2,
  Flag,
} from 'lucide-react';

interface TicketRouteMiniMapProps {
  ticket: BookingTicket;
  lang: Language;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onExploreFullMap?: (fromStationId: string, toStationId: string) => void;
  onTrackLiveBus?: (ticket: BookingTicket) => void;
}

// Coordinate literal type
interface LatLng {
  lat: number;
  lng: number;
}

// Intermediate highway waypoints across the Amhara corridor network
const CORRIDOR_WAYPOINTS: Record<string, { lat: number; lng: number; nameEn: string; nameAm: string }[]> = {
  'bahir-dar-gondar': [
    { lat: 11.921, lng: 37.701, nameEn: 'Wereta Junction', nameAm: 'ወረታ መገንጠያ' },
    { lat: 12.122, lng: 37.781, nameEn: 'Addis Zemen Ridge', nameAm: 'አዲስ ዘመን አምባ' },
    { lat: 12.558, lng: 37.436, nameEn: 'Azezo Airfield Corridor', nameAm: 'አዘዞ መተላለፊያ' },
  ],
  'gondar-bahir-dar': [
    { lat: 12.558, lng: 37.436, nameEn: 'Azezo Airfield Corridor', nameAm: 'አዘዞ መተላለፊያ' },
    { lat: 12.122, lng: 37.781, nameEn: 'Addis Zemen Ridge', nameAm: 'አዲስ ዘመን አምባ' },
    { lat: 11.921, lng: 37.701, nameEn: 'Wereta Junction', nameAm: 'ወረታ መገንጠያ' },
  ],
  'bahir-dar-debre-markos': [
    { lat: 11.272, lng: 37.491, nameEn: 'Adet Highlands', nameAm: 'አዴት ሜዳ' },
    { lat: 10.702, lng: 37.065, nameEn: 'Bure Mineral Springs', nameAm: 'ቡሬ ምንጭ' },
    { lat: 10.701, lng: 37.265, nameEn: 'Finote Selam Station Bypass', nameAm: 'ፍኖተ ሰላም' },
    { lat: 10.551, lng: 37.481, nameEn: 'Dembecha Foothills', nameAm: 'ደምበጫ ኮረብታ' },
  ],
  'debre-markos-bahir-dar': [
    { lat: 10.551, lng: 37.481, nameEn: 'Dembecha Foothills', nameAm: 'ደምበጫ ኮረብታ' },
    { lat: 10.701, lng: 37.265, nameEn: 'Finote Selam Station Bypass', nameAm: 'ፍኖተ ሰላም' },
    { lat: 10.702, lng: 37.065, nameEn: 'Bure Mineral Springs', nameAm: 'ቡሬ ምንጭ' },
    { lat: 11.272, lng: 37.491, nameEn: 'Adet Highlands', nameAm: 'አዴት ሜዳ' },
  ],
  'dessie-debre-birhan': [
    { lat: 11.083, lng: 39.733, nameEn: 'Kombolcha Basin', nameAm: 'ኮምቦልቻ ሸለቆ' },
    { lat: 10.717, lng: 39.867, nameEn: 'Kemise Corridor', nameAm: 'ከሚሴ መተላለፊያ' },
    { lat: 10.012, lng: 39.900, nameEn: 'Shewa Robit Valley', nameAm: 'ሸዋ ሮቢት ሸለቆ' },
    { lat: 9.832, lng: 39.761, nameEn: 'Termaber Historic Tunnel', nameAm: 'የተርማበር ዋሻ' },
  ],
  'debre-birhan-dessie': [
    { lat: 9.832, lng: 39.761, nameEn: 'Termaber Historic Tunnel', nameAm: 'የተርማበር ዋሻ' },
    { lat: 10.012, lng: 39.900, nameEn: 'Shewa Robit Valley', nameAm: 'ሸዋ ሮቢት ሸለቆ' },
    { lat: 10.717, lng: 39.867, nameEn: 'Kemise Corridor', nameAm: 'ከሚሴ መተላለፊያ' },
    { lat: 11.083, lng: 39.733, nameEn: 'Kombolcha Basin', nameAm: 'ኮምቦልቻ ሸለቆ' },
  ],
  'dessie-woldiya': [
    { lat: 11.311, lng: 39.684, nameEn: 'Haiq Lake Overlook', nameAm: 'ሐይቅ እይታ' },
    { lat: 11.542, lng: 39.610, nameEn: 'Wurgessa Mountain Pass', nameAm: 'ውርጌሳ ተራራ' },
    { lat: 11.667, lng: 39.654, nameEn: 'Mersa Gateway', nameAm: 'መርሳ መግቢያ' },
  ],
  'woldiya-dessie': [
    { lat: 11.667, lng: 39.654, nameEn: 'Mersa Gateway', nameAm: 'መርሳ መግቢያ' },
    { lat: 11.542, lng: 39.610, nameEn: 'Wurgessa Mountain Pass', nameAm: 'ውርጌሳ ተራራ' },
    { lat: 11.311, lng: 39.684, nameEn: 'Haiq Lake Overlook', nameAm: 'ሐይቅ እይታ' },
  ],
  'woldiya-lalibela': [
    { lat: 11.751, lng: 39.314, nameEn: 'Gashena Mountain Junction', nameAm: 'ጋሸና መገንጠያ' },
    { lat: 11.954, lng: 39.112, nameEn: 'Tekeze River Headwaters', nameAm: 'ተከዜ ምንጭ' },
  ],
  'lalibela-woldiya': [
    { lat: 11.954, lng: 39.112, nameEn: 'Tekeze River Headwaters', nameAm: 'ተከዜ ምንጭ' },
    { lat: 11.751, lng: 39.314, nameEn: 'Gashena Mountain Junction', nameAm: 'ጋሸና መገንጠያ' },
  ],
  'debre-markos-debre-birhan': [
    { lat: 10.167, lng: 38.133, nameEn: 'Dejen Switchbacks', nameAm: 'ደጀን ቁልቁለት' },
    { lat: 10.081, lng: 38.192, nameEn: 'Blue Nile Gorge Viaduct', nameAm: 'አባይ በረሃ ድልድይ' },
    { lat: 10.002, lng: 38.241, nameEn: 'Gohatsion Cliffs', nameAm: 'ጎሃጺዮን ገደል' },
  ],
  'debre-birhan-debre-markos': [
    { lat: 10.002, lng: 38.241, nameEn: 'Gohatsion Cliffs', nameAm: 'ጎሃጺዮን ገደል' },
    { lat: 10.081, lng: 38.192, nameEn: 'Blue Nile Gorge Viaduct', nameAm: 'አባይ በረሃ ድልድይ' },
    { lat: 10.167, lng: 38.133, nameEn: 'Dejen Switchbacks', nameAm: 'ደጀን ቁልቁለት' },
  ],
};

// Camera framing helper that smoothly fits the map bounds around origin and destination
const RouteBoundsFitter: React.FC<{
  fromCoords: LatLng;
  toCoords: LatLng;
  mapId: string;
}> = ({ fromCoords, toCoords, mapId }) => {
  const map = useMap(mapId);

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    try {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(fromCoords.lat, fromCoords.lng));
      bounds.extend(new google.maps.LatLng(toCoords.lat, toCoords.lng));

      // Calculate center to ensure good visual balance
      map.fitBounds(bounds, {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      });
    } catch {
      // Fallback center
      map.setCenter({
        lat: (fromCoords.lat + toCoords.lat) / 2,
        lng: (fromCoords.lng + toCoords.lng) / 2,
      });
      map.setZoom(8);
    }
  }, [map, fromCoords.lat, fromCoords.lng, toCoords.lat, toCoords.lng]);

  return null;
};

export const TicketRouteMiniMap: React.FC<TicketRouteMiniMapProps> = ({
  ticket,
  lang,
  isExpanded = false,
  onToggleExpand,
  onExploreFullMap,
  onTrackLiveBus,
}) => {
  const isAm = lang === 'am';
  const apiIsLoaded = useApiIsLoaded();
  const [mapType, setMapType] = useState<'terrain' | 'roadmap' | 'satellite'>('terrain');
  const [useVectorFallback, setUseVectorFallback] = useState<boolean>(false);
  const [simulatedBusProgress, setSimulatedBusProgress] = useState<number>(38);
  const [isHoveredPoint, setIsHoveredPoint] = useState<string | null>(null);

  const fromStation = ticket.fromStation;
  const toStation = ticket.toStation;

  // Unique map ID per ticket so multiple mini-maps in the list never collide
  const mapId = useMemo(() => `ticket-route-map-${ticket.ticketId}`, [ticket.ticketId]);

  // Compute rich corridor metrics
  const routePlan: RoutePlanResult | null = useMemo(() => {
    return computeTransitRoute(fromStation.id, toStation.id, []);
  }, [fromStation.id, toStation.id]);

  // Corridor key
  const corridorKey = `${fromStation.id}-${toStation.id}`;
  const reverseCorridorKey = `${toStation.id}-${fromStation.id}`;

  const waypoints = useMemo(() => {
    if (CORRIDOR_WAYPOINTS[corridorKey]) {
      return CORRIDOR_WAYPOINTS[corridorKey];
    }
    if (CORRIDOR_WAYPOINTS[reverseCorridorKey]) {
      return [...CORRIDOR_WAYPOINTS[reverseCorridorKey]].reverse();
    }
    // Generate a natural midpoint along the curve
    const midLat = (fromStation.lat + toStation.lat) / 2;
    const midLng = (fromStation.lng + toStation.lng) / 2 + 0.04;
    return [
      {
        lat: midLat,
        lng: midLng,
        nameEn: 'Regional Scenic Overlook',
        nameAm: 'የአማራ ማራኪ እይታ',
      },
    ];
  }, [corridorKey, reverseCorridorKey, fromStation, toStation]);

  // Full polyline coordinates array
  const fullRoutePath: LatLng[] = useMemo(() => {
    return [
      { lat: fromStation.lat, lng: fromStation.lng },
      ...waypoints.map((w) => ({ lat: w.lat, lng: w.lng })),
      { lat: toStation.lat, lng: toStation.lng },
    ];
  }, [fromStation, toStation, waypoints]);

  // Simulated bus location along the path
  const busPosition: LatLng = useMemo(() => {
    const fraction = simulatedBusProgress / 100;
    if (fullRoutePath.length < 2) {
      return { lat: fromStation.lat, lng: fromStation.lng };
    }
    const totalSegments = fullRoutePath.length - 1;
    const segmentIndex = Math.min(
      Math.floor(fraction * totalSegments),
      totalSegments - 1
    );
    const subFraction = (fraction * totalSegments) - segmentIndex;
    const p1 = fullRoutePath[segmentIndex];
    const p2 = fullRoutePath[segmentIndex + 1];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * subFraction,
      lng: p1.lng + (p2.lng - p1.lng) * subFraction,
    };
  }, [fullRoutePath, simulatedBusProgress, fromStation]);

  // Subtle telemetry pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedBusProgress((prev) => {
        const next = prev + 0.8;
        return next > 95 ? 10 : next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const distanceKm = routePlan ? routePlan.distanceKm : 175;
  const durationStr = routePlan ? routePlan.durationFormatted : '3h 15m';
  const highwayCode = routePlan ? routePlan.highwayCode : 'Route 3 (A3)';

  return (
    <div className="bg-neutral-900 text-white rounded-2xl overflow-hidden border border-neutral-700/80 shadow-md">
      {/* Mini-Map Header Bar */}
      <div className="bg-neutral-800/90 px-3.5 py-2.5 border-b border-neutral-700 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-neutral-100 text-xs sm:text-sm">
              <span>{isAm ? fromStation.cityAm : fromStation.city}</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
              <span>{isAm ? toStation.cityAm : toStation.city}</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {highwayCode} • {distanceKm} km • ~{durationStr}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Map Type Selector */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-0.5 flex items-center text-[10px]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setUseVectorFallback(false);
                setMapType('terrain');
              }}
              className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                !useVectorFallback && mapType === 'terrain'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Google Terrain View"
            >
              {isAm ? 'ተራራ' : 'Terrain'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setUseVectorFallback(false);
                setMapType('satellite');
              }}
              className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                !useVectorFallback && mapType === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Google Satellite View"
            >
              {isAm ? 'ሳተላይት' : 'Satellite'}
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setUseVectorFallback(true);
              }}
              className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                useVectorFallback
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Vector Schematic Corridor"
            >
              {isAm ? 'ንድፍ' : 'Vector'}
            </button>
          </div>

          {/* Expand / Minimize Toggle */}
          {onToggleExpand && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onToggleExpand();
              }}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition cursor-pointer"
              title={isExpanded ? 'Collapse Map' : 'Expand Route Map'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div
        className={`relative w-full transition-all duration-300 ${
          isExpanded ? 'h-72 sm:h-84' : 'h-48 sm:h-56'
        }`}
      >
        {/* Render Vector Schematic when selected or when Google Maps is unavailable */}
        {useVectorFallback || !apiIsLoaded ? (
          <div className="w-full h-full bg-linear-to-b from-slate-950 via-slate-900 to-emerald-950 p-4 relative overflow-hidden flex flex-col justify-between">
            {/* Topographic Contour Lines SVG */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="topoGrid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 40 M 0 0 L 40 40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                  />
                </pattern>
                <linearGradient id="routeGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#topoGrid)" />
              {/* Dynamic decorative contour curves */}
              <path
                d="M 0 50 Q 150 10 300 60 T 600 40"
                fill="none"
                stroke="#047857"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                d="M 0 120 Q 200 80 400 130 T 800 110"
                fill="none"
                stroke="#065f46"
                strokeWidth="1.5"
                opacity="0.3"
              />
            </svg>

            {/* Vector Route Path Visualizer */}
            <div className="relative z-10 w-full flex-1 flex flex-col justify-center px-4">
              <div className="relative w-full py-4">
                {/* Connecting Road Line */}
                <div className="h-2 w-full bg-linear-to-r from-emerald-500 via-sky-400 to-amber-500 rounded-full shadow-lg shadow-emerald-500/20 relative">
                  {/* Pulsing Road Line dashes */}
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#ffffff_8px,#ffffff_14px)] opacity-60 rounded-full animate-pulse" />

                  {/* Simulated Moving Bus Marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 flex flex-col items-center pointer-events-none"
                    style={{ left: `${simulatedBusProgress}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-neutral-900 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                      <Bus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-neutral-950/90 text-amber-300 px-1.5 py-0.5 rounded border border-neutral-700 mt-1 whitespace-nowrap">
                      {ticket.plateNumber || 'ETH-BUS'} • 68 km/h
                    </span>
                  </div>
                </div>

                {/* Waypoint Nodes along the route */}
                <div className="flex items-center justify-between w-full mt-3">
                  {/* Origin Station Node */}
                  <div className="flex flex-col items-start max-w-[30%]">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/30 mb-1" />
                    <span className="font-extrabold text-xs text-emerald-300 leading-tight">
                      {isAm ? fromStation.nameAm : fromStation.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      Dep: {ticket.departureTime} (Bay {ticket.bayNumber})
                    </span>
                  </div>

                  {/* Intermediate Waypoint Milestones */}
                  {waypoints.slice(0, 2).map((w, idx) => (
                    <div
                      key={idx}
                      className="hidden sm:flex flex-col items-center text-center max-w-[25%]"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/30 mb-1" />
                      <span className="text-[11px] font-semibold text-sky-200">
                        {isAm ? w.nameAm : w.nameEn}
                      </span>
                      <span className="text-[9px] text-neutral-400">
                        {idx === 0 ? 'Highway Pass' : 'Scenic Corridor'}
                      </span>
                    </div>
                  ))}

                  {/* Destination Station Node */}
                  <div className="flex flex-col items-end text-right max-w-[30%]">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-500/30 mb-1" />
                    <span className="font-extrabold text-xs text-amber-300 leading-tight">
                      {isAm ? toStation.nameAm : toStation.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      Dest: {toStation.city} (~{durationStr})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-800/80 pt-1.5 mt-auto">
              <span className="flex items-center gap-1 text-emerald-400">
                <Mountain className="w-3 h-3 text-emerald-400" />
                <span>
                  {routePlan?.terrainDescEn || 'Highland plateau with scenic curves'}
                </span>
              </span>
              <span className="font-mono text-neutral-300 font-bold">
                Elev: {fromStation.elevationM}m ➔ {toStation.elevationM}m
              </span>
            </div>
          </div>
        ) : (
          <Map
            id={mapId}
            defaultCenter={{
              lat: (fromStation.lat + toStation.lat) / 2,
              lng: (fromStation.lng + toStation.lng) / 2,
            }}
            defaultZoom={8}
            mapTypeId={mapType}
            gestureHandling="cooperative"
            disableDefaultUI={true}
            className="w-full h-full"
          >
            {/* Auto bounds fitter */}
            <RouteBoundsFitter
              fromCoords={{ lat: fromStation.lat, lng: fromStation.lng }}
              toCoords={{ lat: toStation.lat, lng: toStation.lng }}
              mapId={mapId}
            />

            {/* Glowing route corridor polyline */}
            <Polyline
              path={fullRoutePath}
              strokeColor="#047857"
              strokeWeight={7}
              strokeOpacity={0.4}
            />
            <Polyline
              path={fullRoutePath}
              strokeColor="#10b981"
              strokeWeight={4}
              strokeOpacity={0.95}
            />

            {/* Origin Terminal Marker */}
            <AdvancedMarker
              position={{ lat: fromStation.lat, lng: fromStation.lng }}
              title={isAm ? fromStation.nameAm : fromStation.name}
            >
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mb-1 flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {isAm ? fromStation.cityAm : fromStation.city} (Bay {ticket.bayNumber})
                  </span>
                </div>
                <Pin
                  background="#059669"
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={0.9}
                />
              </div>
            </AdvancedMarker>

            {/* Destination Terminal Marker */}
            <AdvancedMarker
              position={{ lat: toStation.lat, lng: toStation.lng }}
              title={isAm ? toStation.nameAm : toStation.name}
            >
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="bg-amber-950/90 border border-amber-400 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mb-1 flex items-center gap-1 whitespace-nowrap">
                  <Flag className="w-2.5 h-2.5 text-amber-400" />
                  <span>{isAm ? toStation.cityAm : toStation.city}</span>
                </div>
                <Pin
                  background="#d97706"
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={0.9}
                />
              </div>
            </AdvancedMarker>

            {/* Waypoint Markers */}
            {waypoints.map((wp, idx) => (
              <AdvancedMarker
                key={idx}
                position={{ lat: wp.lat, lng: wp.lng }}
                title={isAm ? wp.nameAm : wp.nameEn}
              >
                <div className="flex flex-col items-center group cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-white shadow-sm" />
                </div>
              </AdvancedMarker>
            ))}

            {/* Simulated Live Bus Indicator along the Route */}
            <AdvancedMarker position={busPosition} title="Live Bus Telemetry">
              <div className="flex flex-col items-center pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-neutral-900 border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                  <Bus className="w-3 h-3" />
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        )}

        {/* Live Route Telemetry Overlay Floating Badge */}
        <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-xs border border-neutral-700/80 rounded-xl px-2.5 py-1.5 text-[11px] shadow-lg flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-neutral-100 font-mono">
            {distanceKm} km
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-emerald-400 font-mono font-semibold">
            ~{durationStr}
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-300 font-medium">
            {ticket.busCompany}
          </span>
        </div>
      </div>

      {/* Corridor Elevation & Waypoint Milestones Tray */}
      <div className="bg-neutral-800/80 px-3.5 py-2.5 border-t border-neutral-700/80 space-y-2">
        {/* Scenic Waypoints list */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none pb-0.5">
          <span className="text-neutral-400 font-semibold text-[10px] uppercase shrink-0">
            {isAm ? 'የመንገዱ ቦታዎች፡' : 'Corridor Milestones:'}
          </span>
          {waypoints.map((wp, i) => (
            <span
              key={i}
              className="bg-neutral-900/90 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700 shrink-0 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{isAm ? wp.nameAm : wp.nameEn}</span>
            </span>
          ))}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-700/50 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <Mountain className="w-3 h-3 text-emerald-400" />
            <span>
              {isAm
                ? `ከ${fromStation.elevationM}ሜ ወደ ${toStation.elevationM}ሜ ከፍታ`
                : `Elev: ${fromStation.elevationM}m ➔ ${toStation.elevationM}m`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onTrackLiveBus && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onTrackLiveBus(ticket);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Radio className="w-3 h-3 text-amber-300" />
                <span>{isAm ? 'ቀጥታ ክትትል' : 'Live Bus Radar'}</span>
              </button>
            )}

            {onExploreFullMap && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onExploreFullMap(fromStation.id, toStation.id);
                }}
                className="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3 h-3" />
                <span>{isAm ? 'በሙሉ ካርታ እይ' : 'Open in Main Map'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

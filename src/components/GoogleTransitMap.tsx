import React, { useState, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import { BusStation, RideTrip, Language, TerminalTrafficStatus } from '../types';
import { AMHARA_STATIONS, ROUTE_CONNECTIONS } from '../data/amharaStations';
import { CITY_BUS_STOPS, CityBusStop } from '../data/cityBusStops';
import { getCongestionConfig, getTerminalTraffic } from '../data/terminalTraffic';
import { computeTransitRoute, queryTransitAgent, RoutePlanResult } from '../utils/transitAgent';
import { triggerHaptic } from '../utils/haptics';
import {
  Bus,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Activity,
  ArrowRight,
  Clock,
  Phone,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  Gauge,
  TrendingUp,
  Map as MapIcon,
  Crosshair,
  ExternalLink,
} from 'lucide-react';

interface GoogleTransitMapProps {
  lang: Language;
  selectedStationId?: string;
  onSelectStation: (station: BusStation) => void;
  onBookFromStation: (originStationId: string, destStationId?: string) => void;
  activeTrips: RideTrip[];
  highlightFromId?: string;
  highlightToId?: string;
  trafficData: Record<string, TerminalTrafficStatus>;
  showTrafficOverlay: boolean;
}

// Helper to smoothly fly camera to target position
const CameraController: React.FC<{
  target: { lat: number; lng: number } | null;
  zoom?: number;
}> = ({ target, zoom = 10 }) => {
  const map = useMap('amhara-google-map');

  useEffect(() => {
    if (map && target) {
      map.panTo(target);
      if (zoom) {
        map.setZoom(zoom);
      }
    }
  }, [map, target, zoom]);

  return null;
};

export const GoogleTransitMap: React.FC<GoogleTransitMapProps> = ({
  lang,
  selectedStationId,
  onSelectStation,
  onBookFromStation,
  activeTrips,
  highlightFromId,
  highlightToId,
  trafficData,
  showTrafficOverlay,
}) => {
  // Map Type state
  const [mapType, setMapType] = useState<google.maps.MapTypeId | 'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('terrain');
  const [showCityStops, setShowCityStops] = useState<boolean>(true);
  const [showAgentPanel, setShowAgentPanel] = useState<boolean>(false);

  // Selected station / InfoWindow state
  const [activeStation, setActiveStation] = useState<BusStation | null>(
    selectedStationId
      ? AMHARA_STATIONS.find((s) => s.id === selectedStationId) || AMHARA_STATIONS[0]
      : AMHARA_STATIONS[0]
  );
  const [infoWindowStation, setInfoWindowStation] = useState<BusStation | null>(null);
  const [selectedCityStop, setSelectedCityStop] = useState<CityBusStop | null>(null);

  // Camera focus target
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Transit & Route Agent state
  const [agentQuery, setAgentQuery] = useState<string>('');
  const [agentRouteOrigin, setAgentRouteOrigin] = useState<string>(highlightFromId || 'bahir-dar');
  const [agentRouteDest, setAgentRouteDest] = useState<string>(highlightToId || 'gondar');
  const [routePlan, setRoutePlan] = useState<RoutePlanResult | null>(null);
  const [agentMessage, setAgentMessage] = useState<{ en: string; am: string } | null>(null);

  // Sync selectedStationId
  useEffect(() => {
    if (selectedStationId) {
      const st = AMHARA_STATIONS.find((s) => s.id === selectedStationId);
      if (st) {
        setActiveStation(st);
        setInfoWindowStation(st);
        setCameraTarget({ lat: st.lat, lng: st.lng });
      }
    }
  }, [selectedStationId]);

  // Compute route plan when origin/dest changes in agent
  useEffect(() => {
    if (agentRouteOrigin && agentRouteDest && agentRouteOrigin !== agentRouteDest) {
      const plan = computeTransitRoute(agentRouteOrigin, agentRouteDest, activeTrips);
      setRoutePlan(plan);
    }
  }, [agentRouteOrigin, agentRouteDest, activeTrips]);

  // Handle agent search submission
  const handleAgentSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agentQuery.trim()) return;
    triggerHaptic(12);

    const result = queryTransitAgent(agentQuery, activeTrips);
    if (result.matchedRoute) {
      setRoutePlan(result.matchedRoute);
      setAgentRouteOrigin(result.matchedRoute.originStation.id);
      setAgentRouteDest(result.matchedRoute.destStation.id);
      setActiveStation(result.matchedRoute.originStation);
      setCameraTarget({
        lat: (result.matchedRoute.originStation.lat + result.matchedRoute.destStation.lat) / 2,
        lng: (result.matchedRoute.originStation.lng + result.matchedRoute.destStation.lng) / 2,
      });
    } else if (result.suggestedStations.length > 0) {
      const first = result.suggestedStations[0];
      setActiveStation(first);
      setInfoWindowStation(first);
      setCameraTarget({ lat: first.lat, lng: first.lng });
    }
    setAgentMessage({ en: result.responseEn, am: result.responseAm });
  };

  // Center on Amhara region center
  const handleResetView = () => {
    triggerHaptic(10);
    setCameraTarget({ lat: 11.5936, lng: 38.0000 });
  };

  // Geolocation locate me
  const handleLocateMe = () => {
    triggerHaptic(15);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCameraTarget({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Default to regional hub Bahir Dar
          setCameraTarget({ lat: 11.5936, lng: 37.3908 });
        },
        { timeout: 5000 }
      );
    }
  };

  return (
    <div className="relative w-full aspect-[16/11] min-h-[460px] rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-slate-950">
      {/* Top Floating Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Map Type Switcher & Attribution */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-lg pointer-events-auto flex items-center gap-1">
          <div className="flex items-center gap-1.5 px-2 py-1 border-r border-slate-700 mr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Maps</span>
            </span>
          </div>

          {(['terrain', 'hybrid', 'roadmap', 'satellite'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                triggerHaptic(10);
                setMapType(type);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition cursor-pointer ${
                mapType === type
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type === 'terrain'
                ? lang === 'en' ? 'Terrain' : 'መልክአ-ምድር'
                : type === 'hybrid'
                ? lang === 'en' ? 'Hybrid' : 'ድብልቅ'
                : type === 'satellite'
                ? lang === 'en' ? 'Satellite' : 'ሳተላይት'
                : lang === 'en' ? 'Roadmap' : 'መንገዶች'}
            </button>
          ))}
        </div>

        {/* Right: City Stops Toggle & Transit Agent Launcher */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {/* City Bus Stops Toggle */}
          <button
            onClick={() => {
              triggerHaptic(10);
              setShowCityStops(!showCityStops);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer shadow-md ${
              showCityStops
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={lang === 'en' ? 'Toggle City Bus Stop Terminals' : 'የከተማ አውቶቡስ ፌርማታዎች'}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'City Stops' : 'የከተማ ፌርማታዎች'}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showCityStops ? 'bg-cyan-400' : 'bg-slate-600'
              }`}
            />
          </button>

          {/* Transit & Route Explorer Agent Toggle */}
          <button
            onClick={() => {
              triggerHaptic(12);
              setShowAgentPanel(!showAgentPanel);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer shadow-md ${
              showAgentPanel
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-900/90 text-amber-300 border-amber-400/40 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'en' ? 'Transit Route Agent' : 'የትራንዚት አቅጣጫ ወኪል'}</span>
          </button>

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            className="p-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition cursor-pointer shadow-md"
            title={lang === 'en' ? 'Center My Location' : 'የእኔን ቦታ አግኝ'}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Reset Amhara View */}
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-800 transition cursor-pointer shadow-md"
            title={lang === 'en' ? 'Reset to Regional Amhara View' : 'የክልሉን ካርታ አሳይ'}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Google Maps Component */}
      <Map
        id="amhara-google-map"
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        defaultCenter={{ lat: 11.5936, lng: 38.0000 }}
        defaultZoom={7}
        mapTypeId={mapType}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {/* Dynamic Camera Panner */}
        <CameraController target={cameraTarget} zoom={activeStation ? 9 : 7} />

        {/* Highway Corridors Polylines */}
        {ROUTE_CONNECTIONS.map((rc) => {
          const s1 = AMHARA_STATIONS.find((s) => s.id === rc.fromStationId);
          const s2 = AMHARA_STATIONS.find((s) => s.id === rc.toStationId);
          if (!s1 || !s2) return null;

          const isHighlighted =
            (routePlan &&
              ((routePlan.originStation.id === s1.id && routePlan.destStation.id === s2.id) ||
                (routePlan.originStation.id === s2.id && routePlan.destStation.id === s1.id))) ||
            (highlightFromId === s1.id && highlightToId === s2.id) ||
            (highlightFromId === s2.id && highlightToId === s1.id) ||
            (activeStation?.id === s1.id || activeStation?.id === s2.id);

          let strokeColor = '#64748b';
          if (rc.highwayCode.includes('Route 3')) strokeColor = '#f59e0b';
          else if (rc.highwayCode.includes('Route 2')) strokeColor = '#10b981';
          else if (rc.highwayCode.includes('Route 22')) strokeColor = '#06b6d4';

          if (isHighlighted) strokeColor = '#38bdf8';

          return (
            <Polyline
              key={rc.id}
              path={[
                { lat: s1.lat, lng: s1.lng },
                { lat: s2.lat, lng: s2.lng },
              ]}
              strokeColor={strokeColor}
              strokeWeight={isHighlighted ? 6 : 3}
              strokeOpacity={isHighlighted ? 0.95 : 0.65}
            />
          );
        })}

        {/* Regional Bus Station Terminals (AdvancedMarker & Pin) */}
        {AMHARA_STATIONS.map((station) => {
          const isSelected = activeStation?.id === station.id;
          const traffic = trafficData[station.id] || getTerminalTraffic(station.id);
          const cfg = getCongestionConfig(traffic.congestionLevel);

          return (
            <AdvancedMarker
              key={station.id}
              position={{ lat: station.lat, lng: station.lng }}
              title={lang === 'en' ? station.name : station.nameAm}
              onClick={() => {
                triggerHaptic(12);
                setActiveStation(station);
                setInfoWindowStation(station);
                setSelectedCityStop(null);
                setCameraTarget({ lat: station.lat, lng: station.lng });
                onSelectStation(station);
              }}
            >
              {/* Custom Pin with delay indicator */}
              <div className="relative flex flex-col items-center group cursor-pointer">
                {/* Traffic Delay Badge above Pin */}
                {showTrafficOverlay && (
                  <div
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono shadow-md border mb-0.5 flex items-center gap-1 ${
                      traffic.congestionLevel === 'severe'
                        ? 'bg-rose-950 text-rose-200 border-rose-500'
                        : traffic.congestionLevel === 'heavy'
                        ? 'bg-amber-950 text-amber-200 border-amber-500'
                        : 'bg-slate-900 text-emerald-300 border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} animate-pulse`} />
                    <span>+{traffic.averageDelayMin}m</span>
                  </div>
                )}

                <Pin
                  background={isSelected ? '#059669' : cfg.colorHex}
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                  scale={isSelected ? 1.3 : 1.05}
                >
                  <span className="text-[10px] font-bold text-white">🚌</span>
                </Pin>

                {/* Station City Name Label Tag */}
                <div
                  className={`mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md border whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-400'
                      : 'bg-slate-900/90 text-slate-100 border-slate-700'
                  }`}
                >
                  {lang === 'en' ? station.city : station.cityAm}
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* City Bus Stop Terminals Markers */}
        {showCityStops &&
          CITY_BUS_STOPS.map((stop) => (
            <AdvancedMarker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              title={lang === 'en' ? stop.name : stop.nameAm}
              onClick={() => {
                triggerHaptic(10);
                setSelectedCityStop(stop);
                setInfoWindowStation(null);
                setCameraTarget({ lat: stop.lat, lng: stop.lng });
              }}
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-cyan-600 border border-white shadow-md flex items-center justify-center text-[10px] text-white">
                  🚏
                </div>
                <div className="hidden group-hover:block mt-0.5 px-1.5 py-0.5 rounded bg-slate-950 text-cyan-200 text-[9px] border border-cyan-800 whitespace-nowrap">
                  {lang === 'en' ? stop.name : stop.nameAm}
                </div>
              </div>
            </AdvancedMarker>
          ))}

        {/* Moving Active Vehicles on Google Map */}
        {activeTrips
          .filter((t) => t.status === 'in_transit' || t.status === 'boarding')
          .map((trip) => {
            const s1 = AMHARA_STATIONS.find((s) => s.id === trip.fromStationId);
            const s2 = AMHARA_STATIONS.find((s) => s.id === trip.toStationId);
            if (!s1 || !s2) return null;

            const progress = (trip.currentProgress || 35) / 100;
            const busLat = s1.lat + (s2.lat - s1.lat) * progress;
            const busLng = s1.lng + (s2.lng - s1.lng) * progress;

            return (
              <AdvancedMarker
                key={trip.id}
                position={{ lat: busLat, lng: busLng }}
                title={`${trip.busCompany} (${trip.currentSpeedKmH || 65} km/h)`}
              >
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <span className="w-8 h-8 rounded-full bg-emerald-400/30 animate-ping absolute -top-1.5 -left-1.5" />
                    <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-xs">
                      🚍
                    </div>
                  </div>
                  <div className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/90 border border-slate-700 text-[8px] font-mono font-bold text-emerald-300 whitespace-nowrap">
                    {trip.currentSpeedKmH || 65} km/h
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

        {/* Station InfoWindow */}
        {infoWindowStation && (
          <InfoWindow
            position={{ lat: infoWindowStation.lat, lng: infoWindowStation.lng }}
            onCloseClick={() => setInfoWindowStation(null)}
            maxWidth={320}
          >
            <div className="p-1 text-slate-900">
              <div className="flex items-center justify-between gap-1 border-b border-neutral-200 pb-1.5 mb-1.5">
                <div>
                  <span className="inline-block px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold">
                    {lang === 'en' ? infoWindowStation.zone : infoWindowStation.zoneAm}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 leading-tight mt-0.5">
                    {lang === 'en' ? infoWindowStation.name : infoWindowStation.nameAm}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    {infoWindowStation.baysCount}
                  </span>
                  <span className="text-[9px] text-neutral-500 block uppercase">
                    {lang === 'en' ? 'Bays' : 'በሮች'}
                  </span>
                </div>
              </div>

              {/* Traffic Summary */}
              {(() => {
                const traffic =
                  trafficData[infoWindowStation.id] || getTerminalTraffic(infoWindowStation.id);
                const cfg = getCongestionConfig(traffic.congestionLevel);
                return (
                  <div className={`p-2 rounded-lg border ${cfg.bgLight} mb-2 text-xs`}>
                    <div className="flex items-center justify-between font-bold text-[10px] mb-1">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-neutral-700" />
                        <span>{lang === 'en' ? 'Live Telemetry' : 'የቀጥታ ሁኔታ'}</span>
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-full border ${cfg.badgeBg}`}>
                        +{traffic.averageDelayMin}m
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono">
                      <div className="bg-white/80 p-1 rounded">
                        <span className="block text-[8px] text-neutral-500 uppercase">Speed</span>
                        <span className="font-bold">{traffic.approachSpeedKmH} km/h</span>
                      </div>
                      <div className="bg-white/80 p-1 rounded">
                        <span className="block text-[8px] text-neutral-500 uppercase">Queue</span>
                        <span className="font-bold">{traffic.queueLengthVehicles} veh</span>
                      </div>
                      <div className="bg-white/80 p-1 rounded">
                        <span className="block text-[8px] text-neutral-500 uppercase">Bay Load</span>
                        <span className="font-bold">{traffic.bayOccupancyRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1 text-[11px] text-neutral-600 mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{lang === 'en' ? infoWindowStation.operatingHours : infoWindowStation.operatingHoursAm}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-mono">{infoWindowStation.phone}</span>
                </div>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
                <button
                  onClick={() => {
                    onBookFromStation(infoWindowStation.id);
                    setInfoWindowStation(null);
                  }}
                  className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Bus className="w-3 h-3 text-amber-300" />
                  <span>{lang === 'en' ? 'Book Departures' : 'ጉዞ ፈልግ'}</span>
                </button>
                <button
                  onClick={() => {
                    setAgentRouteOrigin(infoWindowStation.id);
                    setShowAgentPanel(true);
                  }}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition"
                  title={lang === 'en' ? 'Plan route from this station' : 'አቅጣጫ እቀድ'}
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* City Stop InfoWindow */}
        {selectedCityStop && (
          <InfoWindow
            position={{ lat: selectedCityStop.lat, lng: selectedCityStop.lng }}
            onCloseClick={() => setSelectedCityStop(null)}
            maxWidth={260}
          >
            <div className="p-1 text-slate-900">
              <span className="inline-block px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded text-[10px] font-semibold mb-1">
                {lang === 'en' ? 'City Bus Stop' : 'የከተማ ፌርማታ'}
              </span>
              <h4 className="text-xs font-bold text-neutral-900">
                {lang === 'en' ? selectedCityStop.name : selectedCityStop.nameAm}
              </h4>
              <p className="text-[11px] text-neutral-600 mt-1">
                {lang === 'en'
                  ? `Serves: ${selectedCityStop.connectingRoutes.join(', ')}`
                  : `የሚያስተናግደው፡ ${selectedCityStop.connectingRoutes.join(', ')}`}
              </p>
              <div className="mt-2 pt-1 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span>{selectedCityStop.linesCount} lines</span>
                <span className="text-cyan-700 font-bold">{selectedCityStop.city}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Transit & Route Explorer Agent Drawer / Panel */}
      {showAgentPanel && (
        <div className="absolute top-16 right-3 bottom-3 w-full max-w-sm z-20 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl p-3.5 flex flex-col text-white overflow-hidden ring-1 ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">
                  {lang === 'en' ? 'Transit & Route Agent' : 'የትራንዚትና አቅጣጫ ወኪል'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {lang === 'en'
                    ? 'Connect users, vehicles & city bus stops'
                    : 'ተሳፋሪዎችን፣ አውቶቡሶችንና ፌርማታዎችን ያገናኙ'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAgentPanel(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleAgentSearch} className="my-2.5">
            <div className="relative">
              <input
                type="text"
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Ask route (e.g. "Bahir Dar to Gondar")...'
                    : 'ስለ መስመር ይጠይቁ (ምሳሌ፡ "ባሕር ዳር ወደ ጎንደር")...'
                }
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-8 pr-16 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded-lg transition"
              >
                {lang === 'en' ? 'Query' : 'ፈልግ'}
              </button>
            </div>
          </form>

          {/* Origin & Destination Selectors */}
          <div className="grid grid-cols-2 gap-2 mb-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <div>
              <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">
                {lang === 'en' ? 'From Station' : 'መነሻ'}
              </label>
              <select
                value={agentRouteOrigin}
                onChange={(e) => setAgentRouteOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              >
                {AMHARA_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {lang === 'en' ? st.city : st.cityAm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-slate-400 uppercase font-semibold block mb-1">
                {lang === 'en' ? 'To Station' : 'መድረሻ'}
              </label>
              <select
                value={agentRouteDest}
                onChange={(e) => setAgentRouteDest(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
              >
                {AMHARA_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {lang === 'en' ? st.city : st.cityAm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Agent Narrative Result */}
          {agentMessage && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-2 mb-2 text-[11px] text-amber-200">
              {lang === 'en' ? agentMessage.en : agentMessage.am}
            </div>
          )}

          {/* Route Plan Breakdown */}
          {routePlan && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {/* Distance & Highway Badge */}
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {routePlan.highwayCode}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {routePlan.distanceKm} km
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'en' ? 'Est. Duration' : 'የሚፈጀው ሰዓት'}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    ~{routePlan.durationFormatted}
                  </span>
                </div>
              </div>

              {/* Road Condition & Elevation Profile */}
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>{lang === 'en' ? 'Road Status:' : 'የመንገድ ሁኔታ፡'}</span>
                  <span className="font-semibold text-emerald-300">
                    {lang === 'en' ? routePlan.roadStatus : routePlan.roadStatusAm}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>{lang === 'en' ? 'Elevation change:' : 'የከፍታ ልዩነት፡'}</span>
                  <span className="font-mono">
                    {routePlan.elevationProfileM.origin}m ➔ {routePlan.elevationProfileM.dest}m (Δ{routePlan.elevationProfileM.climbM}m)
                  </span>
                </div>
              </div>

              {/* Connecting Vehicles */}
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  {lang === 'en'
                    ? `Connecting Vehicles (${routePlan.connectingVehicles.length})`
                    : `በዚህ መስመር ያሉ አውቶቡሶች (${routePlan.connectingVehicles.length})`}
                </span>
                {routePlan.connectingVehicles.length > 0 ? (
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {routePlan.connectingVehicles.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-white block">
                            {lang === 'en' ? v.busCompany : v.busCompanyAm}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {v.departureTime} • {v.availableSeats} seats left
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onBookFromStation(routePlan.originStation.id, routePlan.destStation.id);
                            setShowAgentPanel(false);
                          }}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]"
                        >
                          {v.priceETB} ETB
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">
                    {lang === 'en'
                      ? 'No scheduled direct buses right now. Search open bookings below.'
                      : 'በዚህ ሰዓት ቀጥተኛ አውቶቡስ የለም።'}
                  </p>
                )}
              </div>

              {/* Connecting City Bus Stops at Arrival Terminal */}
              {routePlan.connectingCityStopsDest.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                    {lang === 'en'
                      ? `City Bus Stops at ${routePlan.destStation.city} (${routePlan.connectingCityStopsDest.length})`
                      : `በ${routePlan.destStation.cityAm} ያሉ የከተማ ፌርማታዎች`}
                  </span>
                  <div className="space-y-1">
                    {routePlan.connectingCityStopsDest.slice(0, 2).map((cs) => (
                      <div
                        key={cs.id}
                        className="bg-cyan-950/40 p-1.5 rounded-lg border border-cyan-800/40 text-[10px] text-cyan-200 flex items-center justify-between"
                      >
                        <span className="font-medium">
                          {lang === 'en' ? cs.name : cs.nameAm}
                        </span>
                        <span className="text-[9px] text-cyan-400 font-mono">
                          {cs.linesCount} lines
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Route Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onBookFromStation(routePlan.originStation.id, routePlan.destStation.id);
                    setShowAgentPanel(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Bus className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {lang === 'en'
                      ? `Book ${routePlan.originStation.city} ➔ ${routePlan.destStation.city}`
                      : `ከ${routePlan.originStation.cityAm} ወደ ${routePlan.destStation.cityAm} ቦታ ያዝ`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

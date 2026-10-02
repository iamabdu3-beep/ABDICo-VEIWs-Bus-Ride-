import { BusStation, RouteConnection, RideTrip, RideShareOffer } from '../types';
import { AMHARA_STATIONS, ROUTE_CONNECTIONS } from '../data/amharaStations';
import { CITY_BUS_STOPS, CityBusStop } from '../data/cityBusStops';
import { getTerminalTraffic } from '../data/terminalTraffic';

export interface RoutePlanResult {
  originStation: BusStation;
  destStation: BusStation;
  distanceKm: number;
  durationHrs: number;
  durationFormatted: string;
  highwayCode: string;
  terrainDescEn: string;
  terrainDescAm: string;
  scenicPoints: string[];
  connectingVehicles: RideTrip[];
  connectingCarpools: RideShareOffer[];
  connectingCityStopsOrigin: CityBusStop[];
  connectingCityStopsDest: CityBusStop[];
  estimatedFareRangeETB: { min: number; max: number };
  elevationProfileM: { origin: number; dest: number; climbM: number };
  roadStatus: 'Clear' | 'Mountain Fog' | 'Heavy Traffic' | 'Scenic Curves';
  roadStatusAm: string;
}

export function computeTransitRoute(
  fromStationId: string,
  toStationId: string,
  activeTrips: RideTrip[],
  carpoolOffers: RideShareOffer[] = []
): RoutePlanResult | null {
  const origin = AMHARA_STATIONS.find((s) => s.id === fromStationId);
  const dest = AMHARA_STATIONS.find((s) => s.id === toStationId);
  if (!origin || !dest) return null;

  // Direct connection or find closest highway link
  const directConn = ROUTE_CONNECTIONS.find(
    (rc) =>
      (rc.fromStationId === origin.id && rc.toStationId === dest.id) ||
      (rc.fromStationId === dest.id && rc.toStationId === origin.id)
  );

  let distanceKm = 0;
  let durationHrs = 0;
  let highwayCode = 'Federal Highway Network';
  let terrainEn = 'Highland plateau with paved double-lane road';
  let terrainAm = 'የተደላደለ የአስፋልት አውራ ጎዳና';
  let scenicPoints: string[] = [];

  if (directConn) {
    distanceKm = directConn.distanceKm;
    durationHrs = directConn.durationHrs;
    highwayCode = directConn.highwayCode;
    terrainEn = directConn.terrain;
    terrainAm = directConn.terrainAm;
    scenicPoints = directConn.scenicPoints;
  } else {
    // Estimate by Haversine formula
    const lat1 = (origin.lat * Math.PI) / 180;
    const lat2 = (dest.lat * Math.PI) / 180;
    const dLat = ((dest.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((dest.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = Math.round(6371 * c);
    distanceKm = Math.round(straightKm * 1.32); // factoring road curves in Ethiopian highlands
    durationHrs = Number((distanceKm / 55).toFixed(1)); // avg 55 km/h bus speed
    highwayCode = 'Route 3 / Route 2 Regional Corridor';
    scenicPoints = ['Regional Scenic Mountain Pass', 'Highland Valley Overlook'];
  }

  const hours = Math.floor(durationHrs);
  const minutes = Math.round((durationHrs - hours) * 60);
  const durationFormatted = hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}` : `${minutes}m`;

  // Find active vehicles operating on this route
  const connectingVehicles = activeTrips.filter(
    (t) =>
      (t.fromStationId === origin.id && t.toStationId === dest.id) ||
      (t.fromStationId === dest.id && t.toStationId === origin.id)
  );

  // Find connecting carpools
  const connectingCarpools = carpoolOffers.filter(
    (o) =>
      (o.fromStationId === origin.id && o.toStationId === dest.id) ||
      (o.fromStationId === dest.id && o.toStationId === origin.id)
  );

  // Find city bus stops for local urban transit
  const connectingCityStopsOrigin = CITY_BUS_STOPS.filter((cs) => cs.parentStationId === origin.id);
  const connectingCityStopsDest = CITY_BUS_STOPS.filter((cs) => cs.parentStationId === dest.id);

  // Estimated fare
  const minFare = Math.round(distanceKm * 2.1);
  const maxFare = Math.round(distanceKm * 2.85);

  const climbM = Math.abs(dest.elevationM - origin.elevationM);

  // Live traffic road status
  const originTraffic = getTerminalTraffic(origin.id);
  let roadStatus: RoutePlanResult['roadStatus'] = 'Clear';
  let roadStatusAm = 'መንገዱ ክፍትና ምቹ ነው';
  if (originTraffic.congestionLevel === 'severe') {
    roadStatus = 'Heavy Traffic';
    roadStatusAm = 'በመናኸሪያው መግቢያ አካባቢ ከፍተኛ መጨናነቅ አለ';
  } else if (climbM > 500) {
    roadStatus = 'Scenic Curves';
    roadStatusAm = 'ተራራማና ጠመዝማዛ ውብ መስመር';
  }

  return {
    originStation: origin,
    destStation: dest,
    distanceKm,
    durationHrs,
    durationFormatted,
    highwayCode,
    terrainDescEn: terrainEn,
    terrainDescAm: terrainAm,
    scenicPoints,
    connectingVehicles,
    connectingCarpools,
    connectingCityStopsOrigin,
    connectingCityStopsDest,
    estimatedFareRangeETB: { min: minFare, max: maxFare },
    elevationProfileM: {
      origin: origin.elevationM,
      dest: dest.elevationM,
      climbM,
    },
    roadStatus,
    roadStatusAm,
  };
}

export function queryTransitAgent(
  prompt: string,
  activeTrips: RideTrip[],
  carpoolOffers: RideShareOffer[] = []
): {
  matchedRoute: RoutePlanResult | null;
  suggestedStations: BusStation[];
  suggestedCityStops: CityBusStop[];
  responseEn: string;
  responseAm: string;
} {
  const lower = prompt.toLowerCase();

  // Search stations
  const matchedStations = AMHARA_STATIONS.filter(
    (s) =>
      lower.includes(s.name.toLowerCase()) ||
      lower.includes(s.city.toLowerCase()) ||
      lower.includes(s.cityAm) ||
      lower.includes(s.nameAm) ||
      lower.includes(s.id)
  );

  // Search city bus stops
  const matchedCityStops = CITY_BUS_STOPS.filter(
    (cs) =>
      lower.includes(cs.name.toLowerCase()) ||
      lower.includes(cs.city.toLowerCase()) ||
      lower.includes(cs.nameAm) ||
      lower.includes(cs.cityAm)
  );

  let route: RoutePlanResult | null = null;
  if (matchedStations.length >= 2) {
    route = computeTransitRoute(matchedStations[0].id, matchedStations[1].id, activeTrips, carpoolOffers);
  } else if (matchedStations.length === 1) {
    // Default destination to Bahir Dar or Gondar if only 1 station mentioned
    const otherId = matchedStations[0].id === 'bahir-dar' ? 'gondar' : 'bahir-dar';
    route = computeTransitRoute(matchedStations[0].id, otherId, activeTrips, carpoolOffers);
  }

  let responseEn = '';
  let responseAm = '';

  if (route) {
    responseEn = `Transit Corridor Plan: ${route.originStation.city} ➔ ${route.destStation.city} via ${route.highwayCode}. Distance is ${route.distanceKm} km (~${route.durationFormatted}). Found ${route.connectingVehicles.length} scheduled/active buses and ${route.connectingCityStopsDest.length} city bus stops at arrival.`;
    responseAm = `የትራንዚት መስመር ዕቅድ፡ ${route.originStation.cityAm} ➔ ${route.destStation.cityAm} በ${route.highwayCode} በኩል፤ ርቀት ${route.distanceKm} ኪ.ሜ (~${route.durationFormatted})። ${route.connectingVehicles.length} የሚጓዙ አውቶቡሶች እና ${route.connectingCityStopsDest.length} የከተማ ፌርማታዎች ተገኝተዋል።`;
  } else if (matchedCityStops.length > 0) {
    const cs = matchedCityStops[0];
    const parent = AMHARA_STATIONS.find((s) => s.id === cs.parentStationId);
    responseEn = `Found City Bus Stop: "${cs.name}" in ${cs.city}, connecting to ${parent?.name || 'Regional Terminal'}. Serves routes: ${cs.connectingRoutes.join(', ')}.`;
    responseAm = `የከተማ ፌርማታ ተገኝቷል፡ "${cs.nameAm}" በ${cs.cityAm}፤ ከ${parent?.nameAm || 'ዋናው መናኸሪያ'} ጋር የተገናኘ። የሚያስተናግደው፡ ${cs.connectingRoutes.join(', ')}።`;
  } else {
    responseEn = `Transit Agent Ready: Ask about any regional bus route (e.g., "Bahir Dar to Gondar", "Dessie to Lalibela", "Kombolcha stops") to view distances, active buses, connecting city stops, and real-time highway conditions.`;
    responseAm = `የትራንዚት ወኪል ዝግጁ ነው፡ ስለ ማንኛውም የክልል አውቶቡስ መስመር ይጠይቁ (ምሳሌ፡ "ባሕር ዳር ወደ ጎንደር"፣ "ደሴ ወደ ላሊበላ")፤ ርቀቶችን፣ ንቁ አውቶቡሶችን እና የከተማ ፌርማታዎችን ይመልከቱ።`;
  }

  return {
    matchedRoute: route,
    suggestedStations: matchedStations.length > 0 ? matchedStations : AMHARA_STATIONS.slice(0, 4),
    suggestedCityStops: matchedCityStops,
    responseEn,
    responseAm,
  };
}

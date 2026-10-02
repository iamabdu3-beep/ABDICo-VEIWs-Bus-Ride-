import {
  BusStation,
  RideTrip,
  RideShareOffer,
  VehicleCategory,
  PlannedTripItinerary,
  PlannedTripLeg,
  SavedTripPlan,
  TripPlanSortOption,
} from '../types';
import { AMHARA_STATIONS, ROUTE_CONNECTIONS } from '../data/amharaStations';

// Helper to convert "HH:MM AM/PM" to minutes from midnight
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 360; // default 06:00 AM
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 360;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Helper to format minutes from midnight to "HH:MM AM/PM"
export function formatMinutesToTime(totalMins: number): string {
  const norm = ((totalMins % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDurationHoursMins(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export interface TripPlanQuery {
  originId: string;
  destId: string;
  viaId?: string;
  travelDate: string;
  departureWindow?: 'any' | 'early' | 'morning' | 'afternoon';
  maxTransfers?: number; // 0 = direct only, 1 = max 1 transfer, 2+ = any
  vehiclePreference?: 'all' | VehicleCategory;
  sortBy?: TripPlanSortOption;
  passengerCount?: number;
}

export interface AdjacencyEdge {
  fromId: string;
  toId: string;
  distanceKm: number;
  durationHrs: number;
  highwayCode: string;
  terrain: string;
  terrainAm: string;
  scenicPoints: string[];
}

// Build bidirectional graph from ROUTE_CONNECTIONS
export function buildTransitGraph(): Map<string, AdjacencyEdge[]> {
  const graph = new Map<string, AdjacencyEdge[]>();

  AMHARA_STATIONS.forEach((s) => {
    graph.set(s.id, []);
  });

  ROUTE_CONNECTIONS.forEach((rc) => {
    const forward: AdjacencyEdge = {
      fromId: rc.fromStationId,
      toId: rc.toStationId,
      distanceKm: rc.distanceKm,
      durationHrs: rc.durationHrs,
      highwayCode: rc.highwayCode,
      terrain: rc.terrain,
      terrainAm: rc.terrainAm,
      scenicPoints: rc.scenicPoints,
    };
    const reverse: AdjacencyEdge = {
      fromId: rc.toStationId,
      toId: rc.fromStationId,
      distanceKm: rc.distanceKm,
      durationHrs: rc.durationHrs,
      highwayCode: rc.highwayCode,
      terrain: rc.terrain,
      terrainAm: rc.terrainAm,
      scenicPoints: rc.scenicPoints,
    };

    graph.get(rc.fromStationId)?.push(forward);
    graph.get(rc.toStationId)?.push(reverse);
  });

  return graph;
}

// Realistic Ethiopian bus companies by corridor
const CORRIDOR_OPERATORS: Record<
  string,
  { name: string; nameAm: string; vehicle: VehicleCategory; baseFarePerKm: number }[]
> = {
  default: [
    { name: 'Selam Bus Line', nameAm: 'ሰላም ባስ', vehicle: 'Luxury Coach', baseFarePerKm: 1.85 },
    { name: 'Sky Bus Express', nameAm: 'ስካይ ባስ', vehicle: 'Luxury Coach', baseFarePerKm: 1.9 },
    { name: 'Golden Bus Transport', nameAm: 'ጎልደን ባስ', vehicle: 'Standard Express', baseFarePerKm: 1.55 },
    { name: 'Walya Express Intercity', nameAm: 'ዋልያ ኤክስፕረስ', vehicle: 'Luxury Coach', baseFarePerKm: 1.8 },
    { name: 'Amhara Regional Transport Co-op', nameAm: 'የአማራ ትራንስፖርት ማህበር', vehicle: 'Minibus Dolphin', baseFarePerKm: 1.4 },
    { name: 'Zemen Intercity Shuttle', nameAm: 'ዘመን ሹትል', vehicle: 'Coaster Bus', baseFarePerKm: 1.65 },
  ],
};

function getStation(id: string): BusStation {
  const found = AMHARA_STATIONS.find((s) => s.id === id);
  if (found) return found;
  return AMHARA_STATIONS[0];
}

// Find existing scheduled trip or offer if available between fromId and toId
function findMatchingTripOrOffer(
  fromId: string,
  toId: string,
  trips: RideTrip[],
  offers: RideShareOffer[]
): {
  trip?: RideTrip;
  offer?: RideShareOffer;
  operator: string;
  operatorAm: string;
  vehicle: VehicleCategory;
  priceETB: number;
  depTime: string;
} {
  const trip = trips.find((t) => t.fromStationId === fromId && t.toStationId === toId);
  if (trip) {
    return {
      trip,
      operator: trip.busCompany,
      operatorAm: trip.busCompanyAm,
      vehicle: trip.vehicleType,
      priceETB: trip.priceETB,
      depTime: trip.departureTime.includes(':') ? trip.departureTime : '06:30 AM',
    };
  }

  const offer = offers.find((o) => o.fromStationId === fromId && o.toStationId === toId);
  if (offer) {
    return {
      offer,
      operator: `${offer.driverName}'s Shared Pool`,
      operatorAm: `${offer.driverName} የጋራ ጉዞ`,
      vehicle: 'Carpool Shared',
      priceETB: offer.pricePerSeatETB,
      depTime: offer.departureTime,
    };
  }

  // Fallback realistic operator based on distance
  const conn = ROUTE_CONNECTIONS.find(
    (c) =>
      (c.fromStationId === fromId && c.toStationId === toId) ||
      (c.fromStationId === toId && c.toStationId === fromId)
  );
  const dist = conn ? conn.distanceKm : 120;
  const op = CORRIDOR_OPERATORS.default[Math.floor(Math.random() * CORRIDOR_OPERATORS.default.length)];
  const estimatedPrice = Math.round(dist * op.baseFarePerKm);

  return {
    operator: op.name,
    operatorAm: op.nameAm,
    vehicle: op.vehicle,
    priceETB: Math.max(120, estimatedPrice),
    depTime: '06:45 AM',
  };
}

// Find all paths up to maxHops (DFS)
function findAllPaths(
  graph: Map<string, AdjacencyEdge[]>,
  currentId: string,
  destId: string,
  visited: Set<string>,
  currentPath: AdjacencyEdge[],
  allPaths: AdjacencyEdge[][],
  maxHops: number
) {
  if (currentPath.length > maxHops) return;

  if (currentId === destId && currentPath.length > 0) {
    allPaths.push([...currentPath]);
    return;
  }

  const edges = graph.get(currentId) || [];
  for (const edge of edges) {
    if (!visited.has(edge.toId)) {
      visited.add(edge.toId);
      currentPath.push(edge);
      findAllPaths(graph, edge.toId, destId, visited, currentPath, allPaths, maxHops);
      currentPath.pop();
      visited.delete(edge.toId);
    }
  }
}

// Generate comprehensive itineraries for a given pair
export function generatePlannedTrips(
  query: TripPlanQuery,
  trips: RideTrip[],
  offers: RideShareOffer[]
): PlannedTripItinerary[] {
  const { originId, destId, viaId, departureWindow = 'any', maxTransfers = 2 } = query;

  if (originId === destId) return [];

  const graph = buildTransitGraph();
  const rawPaths: AdjacencyEdge[][] = [];

  if (viaId && viaId !== originId && viaId !== destId) {
    // 2-segment path: Origin -> Via -> Dest
    const p1: AdjacencyEdge[][] = [];
    const p2: AdjacencyEdge[][] = [];
    findAllPaths(graph, originId, viaId, new Set([originId]), [], p1, 2);
    findAllPaths(graph, viaId, destId, new Set([viaId]), [], p2, 2);

    p1.forEach((leg1) => {
      p2.forEach((leg2) => {
        rawPaths.push([...leg1, ...leg2]);
      });
    });
  } else {
    // Direct or 1-2 transfers (max 3 edges)
    const allowedHops = Math.min(3, maxTransfers + 1);
    findAllPaths(graph, originId, destId, new Set([originId]), [], rawPaths, allowedHops);
  }

  // If no paths found via direct graph (rare disconnected nodes), create fallback direct/scenic simulated connection
  if (rawPaths.length === 0) {
    const originStation = getStation(originId);
    const destStation = getStation(destId);
    // Estimate distance via coordinates
    const dx = (originStation.x - destStation.x) * 4.5;
    const dy = (originStation.y - destStation.y) * 4.5;
    const estDistance = Math.round(Math.sqrt(dx * dx + dy * dy) * 1.8 + 80);
    const estDuration = parseFloat((estDistance / 55).toFixed(1));

    rawPaths.push([
      {
        fromId: originId,
        toId: destId,
        distanceKm: estDistance,
        durationHrs: estDuration,
        highwayCode: 'Amhara Regional Highway Network',
        terrain: 'Highland Plateau & Valleys',
        terrainAm: 'የአማራ ደጋና ሸለቆ መንገዶች',
        scenicPoints: ['Regional Escarpment View', 'Highland Plains'],
      },
    ]);
  }

  // Base departure times according to window
  const windowDepMinutes: number[] =
    departureWindow === 'early'
      ? [330, 360, 390] // 05:30 AM, 06:00 AM, 06:30 AM
      : departureWindow === 'morning'
      ? [480, 540, 600] // 08:00 AM, 09:00 AM, 10:00 AM
      : departureWindow === 'afternoon'
      ? [780, 840, 930] // 01:00 PM, 02:00 PM, 03:30 PM
      : [360, 420, 510, 780]; // Varied defaults

  const itineraries: PlannedTripItinerary[] = [];

  rawPaths.forEach((pathEdges, pathIdx) => {
    // Determine transfer count
    const transferCount = pathEdges.length - 1;
    if (maxTransfers !== undefined && transferCount > maxTransfers) {
      return;
    }

    // Generate up to 2 schedule variants per physical path (e.g. morning vs early bird or coach vs minibus)
    const variants = pathEdges.length === 1 ? [0, 1] : [0];

    variants.forEach((vIdx) => {
      const baseDepMin = windowDepMinutes[(pathIdx * 2 + vIdx) % windowDepMinutes.length];
      let currentClock = baseDepMin;
      let totalDistance = 0;
      let totalFare = 0;
      const legs: PlannedTripLeg[] = [];
      const roadTypes = new Set<string>();
      const allScenicPoints: string[] = [];

      pathEdges.forEach((edge, edgeIdx) => {
        const fromSt = getStation(edge.fromId);
        const toSt = getStation(edge.toId);
        totalDistance += edge.distanceKm;
        roadTypes.add(edge.highwayCode);
        edge.scenicPoints.forEach((p) => allScenicPoints.push(p));

        const match = findMatchingTripOrOffer(edge.fromId, edge.toId, trips, offers);

        const legDurationMins = Math.round(edge.durationHrs * 60);
        const legDepTimeStr = formatMinutesToTime(currentClock);
        const legArrMins = currentClock + legDurationMins;
        const legArrTimeStr = formatMinutesToTime(legArrMins);

        // Advance clock for next leg with transfer layover buffer
        const isLastLeg = edgeIdx === pathEdges.length - 1;
        const layoverMinutes = isLastLeg ? 0 : edge.distanceKm > 150 ? 45 : 30;

        // Operator styling
        let operator = match.operator;
        let operatorAm = match.operatorAm;
        let vehicle = match.vehicle;
        let fare = match.priceETB;

        // If variant 1 on direct route, make it a distinct alternative (e.g., Minibus or Luxury Coach)
        if (vIdx === 1 && pathEdges.length === 1) {
          if (vehicle === 'Luxury Coach') {
            operator = 'Tana Co-op Express Minibus';
            operatorAm = 'የጣና ማህበር ፈጣን ሚኒባስ';
            vehicle = 'Minibus Dolphin';
            fare = Math.round(fare * 0.82);
          } else {
            operator = 'Selam Bus Executive Class';
            operatorAm = 'ሰላም ባስ ኤግዚክዩቲቭ';
            vehicle = 'Luxury Coach';
            fare = Math.round(fare * 1.25);
          }
        }

        totalFare += fare;

        legs.push({
          id: `leg-${edge.fromId}-${edge.toId}-${pathIdx}-${vIdx}-${edgeIdx}`,
          fromStation: fromSt,
          toStation: toSt,
          departureTime: legDepTimeStr,
          arrivalTime: legArrTimeStr,
          durationFormatted: formatDurationHoursMins(legDurationMins),
          durationMinutes: legDurationMins,
          distanceKm: edge.distanceKm,
          priceETB: fare,
          vehicleType: vehicle,
          operatorName: operator,
          operatorNameAm: operatorAm,
          highwayCode: edge.highwayCode,
          terrain: edge.terrain,
          terrainAm: edge.terrainAm,
          scenicPoints: edge.scenicPoints,
          matchedTripId: match.trip?.id,
          matchedOfferId: match.offer?.id,
          bayNumber: ((edgeIdx * 3 + 2) % (fromSt.baysCount || 12)) + 1,
          layoverAfterMinutes: isLastLeg ? undefined : layoverMinutes,
          layoverStation: isLastLeg ? undefined : toSt,
        });

        // Set clock for next leg
        currentClock = legArrMins + layoverMinutes;
      });

      const totalDurationMinutes = currentClock - baseDepMin;
      const originStation = getStation(query.originId);
      const destStation = getStation(query.destId);

      // Collect elevation range
      const stationsOnRoute = [
        originStation,
        ...legs.map((l) => l.toStation),
      ];
      const elevations = stationsOnRoute.map((s) => s.elevationM);
      const elevationMinM = Math.min(...elevations);
      const elevationMaxM = Math.max(...elevations);

      // CO2 calculation: ~0.038 kg per passenger-km on modern coach
      const co2EstimateKg = parseFloat((totalDistance * 0.038).toFixed(1));

      // Category tagging
      let categoryTag: PlannedTripItinerary['categoryTag'] = 'fastest';
      if (vIdx === 1) {
        categoryTag = 'cheapest';
      } else if (transferCount === 0) {
        categoryTag = 'fastest';
      } else if (allScenicPoints.length >= 3) {
        categoryTag = 'scenic';
      } else if (legs.some((l) => l.vehicleType === 'Luxury Coach')) {
        categoryTag = 'comfort';
      }

      if (baseDepMin <= 360) {
        categoryTag = 'early_bird';
      }

      const viaStation = query.viaId ? getStation(query.viaId) : undefined;

      const title =
        transferCount === 0
          ? `Direct Express: ${originStation.city} to ${destStation.city}`
          : `Connected via ${legs[0].toStation.city}: ${originStation.city} ➔ ${destStation.city}`;

      const titleAm =
        transferCount === 0
          ? `ቀጥታ ጉዞ፡ ከ${originStation.cityAm} ወደ ${destStation.cityAm}`
          : `በ${legs[0].toStation.cityAm} በኩል የተገናኘ፡ ከ${originStation.cityAm} ወደ ${destStation.cityAm}`;

      itineraries.push({
        id: `itinerary-${originId}-${destId}-${pathIdx}-${vIdx}`,
        title,
        titleAm,
        originStation,
        destStation,
        viaStation,
        legs,
        totalDurationMinutes,
        totalDurationFormatted: formatDurationHoursMins(totalDurationMinutes),
        totalDistanceKm: totalDistance,
        totalFareETB: totalFare,
        transferCount,
        departureTime: legs[0]?.departureTime || '06:00 AM',
        arrivalTime: legs[legs.length - 1]?.arrivalTime || '12:00 PM',
        categoryTag,
        scenicHighlights: Array.from(new Set(allScenicPoints)),
        elevationMinM,
        elevationMaxM,
        co2EstimateKg,
        routeRoadTypes: Array.from(roadTypes),
      });
    });
  });

  // Filter by vehicle preference if requested
  let filtered = itineraries;
  if (query.vehiclePreference && query.vehiclePreference !== 'all') {
    filtered = filtered.filter((it) =>
      it.legs.some((l) => l.vehicleType === query.vehiclePreference)
    );
  }

  // Sort results
  const sortBy = query.sortBy || 'fastest';
  return filtered.sort((a, b) => {
    if (sortBy === 'fastest') {
      return a.totalDurationMinutes - b.totalDurationMinutes;
    }
    if (sortBy === 'cheapest') {
      return a.totalFareETB - b.totalFareETB;
    }
    if (sortBy === 'fewest_transfers') {
      return a.transferCount - b.transferCount || a.totalDurationMinutes - b.totalDurationMinutes;
    }
    if (sortBy === 'scenic') {
      return b.scenicHighlights.length - a.scenicHighlights.length;
    }
    return 0;
  });
}

// Popular Planned Journeys for inspiration
export const POPULAR_PLANNED_JOURNEYS = [
  {
    id: 'pop-1',
    originId: 'bahir-dar',
    destId: 'lalibela',
    titleEn: 'Lake Tana to Lalibela Rock Churches',
    titleAm: 'ከጣና ሐይቅ ወደ ላሊበላ ውቅር አብያተ ክርስቲያናት',
    descriptionEn: 'Scenic passage via Debre Tabor & Gashena mountain corridor',
    descriptionAm: 'በደብረ ታቦርና ጋሸና የተራራ ሰንሰለት በኩል ማራኪ ጉዞ',
    highlightTag: 'Scenic Highland',
    typicalDuration: '6h 30m',
  },
  {
    id: 'pop-2',
    originId: 'gondar',
    destId: 'dessie',
    titleEn: 'Trans-Regional Highland Link: Gondar to Wollo Hub',
    titleAm: 'የክልሉ አገናኝ መስመር፡ ከጎንደር ወደ ደሴ',
    descriptionEn: 'Traverses South Gondar, Gashena spur, and Wollo crests',
    descriptionAm: 'ደቡብ ጎንደርን፣ ጋሸናን እና የወሎ ተራሮችን ያቋርጣል',
    highlightTag: 'Cross-Corridor',
    typicalDuration: '7h 15m',
  },
  {
    id: 'pop-3',
    originId: 'debre-birhan',
    destId: 'bahir-dar',
    titleEn: 'Abay (Blue Nile) Gorge Explorer',
    titleAm: 'የታላቁ አባይ በረሃና ገደል መስመር',
    descriptionEn: 'Through North Shewa, Dejen switchbacks, and East Gojjam plateau',
    descriptionAm: 'በሰሜን ሸዋ፣ ደጀን እና ምስራቅ ጎጃም ለም አምባ በኩል',
    highlightTag: 'Canyon Viaduct',
    typicalDuration: '9h 45m',
  },
  {
    id: 'pop-4',
    originId: 'dessie',
    destId: 'shewa-robit',
    titleEn: 'Termaber Historic Tunnel Descent',
    titleAm: 'የተርማበር ታሪካዊ ዋሻና ሸዋ ሮቢት ቁልቁለት',
    descriptionEn: 'Alpine 3,100m pass descending to pleasant acacia foothills',
    descriptionAm: 'ከ3,100 ሜትር ከፍታ ወደ ለም ሸለቆ የሚወርድ የተፈጥሮ ገፅታ',
    highlightTag: 'Engineering Heritage',
    typicalDuration: '3h 45m',
  },
];

// Local Storage for Saved Trips
const STORAGE_KEY = 'bus_ride_saved_trip_plans';

export function getSavedTripPlans(): SavedTripPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading saved trips', err);
    return [];
  }
}

export function saveTripPlan(
  itinerary: PlannedTripItinerary,
  travelDate: string,
  passengerCount: number,
  notes?: string
): SavedTripPlan {
  const newPlan: SavedTripPlan = {
    id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    savedAt: new Date().toISOString(),
    travelDate,
    passengerCount,
    itinerary,
    customNotes: notes,
  };

  if (typeof window !== 'undefined') {
    const existing = getSavedTripPlans();
    const updated = [newPlan, ...existing.filter((p) => p.itinerary.id !== itinerary.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return newPlan;
}

export function deleteSavedTripPlan(id: string): void {
  if (typeof window !== 'undefined') {
    const existing = getSavedTripPlans();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

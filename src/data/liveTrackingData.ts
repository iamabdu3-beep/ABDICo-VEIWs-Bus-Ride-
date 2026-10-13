import { LiveMovingBus, LiveTrackedCommuter, VehicleCategory } from '../types';
import { ETHIOPIA_BUS_STATIONS, getEthiopiaStationById } from './ethiopiaStations';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name: string;
  nameAm: string;
  altitudeM: number;
}

// ========================================================
// HIGHWAY REALISTIC WAYPOINTS FOR ET INTERCITY CORRIDORS
// ========================================================
export const CORRIDOR_WAYPOINTS: Record<string, RouteWaypoint[]> = {
  // 1. Addis Ababa (Autobis Tera) <-> Bahir Dar (Route 3 A3)
  'addis-autobis-tera_bahir-dar': [
    { lat: 9.0348, lng: 38.7469, name: 'Addis Autobis Tera Hub', nameAm: 'አውቶቢስ ተራ መናኸሪያ', altitudeM: 2360 },
    { lat: 9.2980, lng: 38.7390, name: 'Chancho Checkpoint', nameAm: 'ጫንጮ ኬላ', altitudeM: 2600 },
    { lat: 9.5480, lng: 38.8600, name: 'Muketure Toll Crossing', nameAm: 'ሙከጡሪ', altitudeM: 2650 },
    { lat: 9.9800, lng: 38.2500, name: 'Gohatsion Gorge Rim', nameAm: 'ጎሃጺዮን አባይ ሸለቆ ዳርቻ', altitudeM: 2480 },
    { lat: 10.0800, lng: 38.1900, name: 'Blue Nile (Abay) Gorge Bridge', nameAm: 'የዓባይ ወንዝ ድልድይ', altitudeM: 1080 },
    { lat: 10.1700, lng: 38.1400, name: 'Dejen Gorge Ascent', nameAm: 'ደጀን ሽቅብ መውጫ', altitudeM: 2420 },
    { lat: 10.3300, lng: 37.7300, name: 'Debre Markos Zonal Terminal', nameAm: 'ደብረ ማርቆስ ጣቢያ', altitudeM: 2440 },
    { lat: 10.7025, lng: 37.2625, name: 'Finote Selam Station Hub', nameAm: 'ፍኖተ ሰላም መናኸሪያ', altitudeM: 1915 },
    { lat: 10.7000, lng: 37.0650, name: 'Bure Junction Bypass', nameAm: 'ቡሬ መስቀለኛ', altitudeM: 2090 },
    { lat: 11.0200, lng: 37.0300, name: 'Injibara High Plains', nameAm: 'እንጅባራ ሜዳ', altitudeM: 2560 },
    { lat: 11.5936, lng: 37.3908, name: 'Bahir Dar Central Terminal', nameAm: 'ባሕር ዳር ማዕከላዊ መናኸሪያ', altitudeM: 1800 },
  ],

  // 2. Addis Ababa (Kaliti) <-> Hawassa (Expressway E1 / Highway 7)
  'addis-kality_hawassa-regional': [
    { lat: 8.9050, lng: 38.7610, name: 'Addis Kaliti Federal Terminal', nameAm: 'ቃሊቲ መናኸሪያ', altitudeM: 2210 },
    { lat: 8.7520, lng: 38.9830, name: 'Bishoftu Expressway Toll', nameAm: 'ቢሾፍቱ መውጫ ኬላ', altitudeM: 1920 },
    { lat: 8.5950, lng: 39.1200, name: 'Mojo Fast Interchange', nameAm: 'ሞጆ መጋጠሚያ', altitudeM: 1790 },
    { lat: 8.5410, lng: 39.2700, name: 'Adama Bypass Gate', nameAm: 'አዳማ መታጠፊያ', altitudeM: 1710 },
    { lat: 7.9330, lng: 38.7200, name: 'Batu (Ziway) Lake Shore', nameAm: 'ባቱ (ዝዋይ) ሐይቅ ዳር', altitudeM: 1640 },
    { lat: 7.3500, lng: 38.6500, name: 'Arsi Negele Acacia Corridor', nameAm: 'አርሲ ነገሌ', altitudeM: 1960 },
    { lat: 7.2000, lng: 38.6000, name: 'Shashemene Crossroads Hub', nameAm: 'ሻሸመኔ አውራ ጎዳና', altitudeM: 1930 },
    { lat: 7.0504, lng: 38.4760, name: 'Hawassa Regional Grand Terminal', nameAm: 'ሐዋሳ ክልላዊ ዋና መናኸሪያ', altitudeM: 1708 },
  ],

  // 3. Bahir Dar <-> Gondar (Lake Tana Highway)
  'bahir-dar_gondar': [
    { lat: 11.5936, lng: 37.3908, name: 'Bahir Dar Central Terminal', nameAm: 'ባሕር ዳር ማዕከላዊ መናኸሪያ', altitudeM: 1800 },
    { lat: 11.9200, lng: 37.7000, name: 'Wereta Rice Plain Junction', nameAm: 'ወረታ መጋጠሚያ', altitudeM: 1820 },
    { lat: 12.1200, lng: 37.7800, name: 'Addis Zemen Historic Pass', nameAm: 'አዲስ ዘመን ማለፊያ', altitudeM: 1980 },
    { lat: 12.5400, lng: 37.4300, name: 'Azezo Airport Crossroad', nameAm: 'አዘዞ አውሮፕላን ማረፊያ', altitudeM: 2100 },
    { lat: 12.6075, lng: 37.4650, name: 'Gondar Central Terminal', nameAm: 'ጎንደር ማዕከላዊ መናኸሪያ', altitudeM: 2133 },
  ],

  // 4. Addis Ababa (Lamberet) <-> Dessie <-> Mekelle (Route 2 A2)
  'addis-lamberet_dessie': [
    { lat: 9.0320, lng: 38.8250, name: 'Addis Lamberet Terminal', nameAm: 'ላምበረት መናኸሪያ', altitudeM: 2410 },
    { lat: 9.6800, lng: 39.5300, name: 'Debre Birhan Station', nameAm: 'ደብረ ብርሃን መናኸሪያ', altitudeM: 2840 },
    { lat: 9.8600, lng: 39.7300, name: 'Termaber Mountain Tunnel (3,120m)', nameAm: 'ጠርማበር የተራራ ዋሻ', altitudeM: 3120 },
    { lat: 9.8500, lng: 39.7600, name: 'Debre Sina Escarpment Curve', nameAm: 'ደብረ ሲና ቁልቁለት', altitudeM: 2650 },
    { lat: 10.4500, lng: 39.8800, name: 'Robi River Valley', nameAm: 'ሸዋ ሮቢት ሸለቆ', altitudeM: 1280 },
    { lat: 11.0850, lng: 39.7380, name: 'Kombolcha Dry Port Terminal', nameAm: 'ኮምቦልቻ መናኸሪያ', altitudeM: 1842 },
    { lat: 11.1300, lng: 39.6350, name: 'Dessie Boru Meda Terminal', nameAm: 'ደሴ ቦሩ ሜዳ መናኸሪያ', altitudeM: 2470 },
  ],

  // 5. Jimma <-> Addis Ababa (Ayer Tena / Southwest A5)
  'jimma-zonal_addis-ayer-tena': [
    { lat: 7.6730, lng: 36.8340, name: 'Jimma Aba Jifar Zonal Terminal', nameAm: 'ጅማ አባ ጅፋር መናኸሪያ', altitudeM: 1780 },
    { lat: 7.7700, lng: 37.2300, name: 'Asendabo Coffee Plains', nameAm: 'አሰንዳቦ', altitudeM: 1760 },
    { lat: 8.2830, lng: 37.7800, name: 'Wolkite Zonal Gateway', nameAm: 'ወልቂጤ መናኸሪያ', altitudeM: 1910 },
    { lat: 8.5400, lng: 37.9800, name: 'Weliso Hot Spring Corridor', nameAm: 'ወሊሶ', altitudeM: 2060 },
    { lat: 8.9100, lng: 38.6200, name: 'Sebeta Industrial Junction', nameAm: 'ሰበታ መጋጠሚያ', altitudeM: 2280 },
    { lat: 9.0020, lng: 38.7050, name: 'Addis Ayer Tena West Terminal', nameAm: 'አየር ጤና መናኸሪያ', altitudeM: 2350 },
  ],

  // 6. Dire Dawa <-> Harar
  'dire-dawa-regional_harar-regional': [
    { lat: 9.5930, lng: 41.8660, name: 'Dire Dawa Ras Makonnen Hub', nameAm: 'ድሬዳዋ ራስ መኮንን መናኸሪያ', altitudeM: 1200 },
    { lat: 9.4500, lng: 41.9800, name: 'Haramaya Lake Basin', nameAm: 'ሐረማያ ሐይቅ', altitudeM: 1950 },
    { lat: 9.3700, lng: 42.0600, name: 'Aweday Commercial Bypass', nameAm: 'አወደይ ገበያ', altitudeM: 2080 },
    { lat: 9.3130, lng: 42.1280, name: 'Harar Jugol Heritage Terminal', nameAm: 'ሐረር ጁጎል መናኸሪያ', altitudeM: 1885 },
  ],

  // 7. Dessie <-> Semera (Afar Corridor)
  'dessie_semera-regional': [
    { lat: 11.1300, lng: 39.6350, name: 'Dessie Boru Terminal', nameAm: 'ደሴ መናኸሪያ', altitudeM: 2470 },
    { lat: 11.0850, lng: 39.7380, name: 'Kombolcha Crossroad', nameAm: 'ኮምቦልቻ', altitudeM: 1842 },
    { lat: 11.1900, lng: 40.0200, name: 'Bati Historic Market Gate', nameAm: 'ባቲ መተላለፊያ', altitudeM: 1500 },
    { lat: 11.4300, lng: 40.7600, name: 'Mille Hot Springs Junction', nameAm: 'ሚሌ መጋጠሚያ', altitudeM: 520 },
    { lat: 11.7300, lng: 40.9700, name: 'Logiya Highway Town', nameAm: 'ሎጊያ', altitudeM: 410 },
    { lat: 11.7920, lng: 41.0050, name: 'Semera Sultan Ali Mirah Hub', nameAm: 'ሰመራ ሱልጣን አሊ ሚራህ መናኸሪያ', altitudeM: 433 },
  ],

  // 8. Dilla <-> Yirgacheffe
  'dilla-zonal_yirgacheffe-woreda': [
    { lat: 6.4100, lng: 38.3100, name: 'Dilla Gedeo Zonal Hub', nameAm: 'ዲላ የጌዴኦ ዞን መናኸሪያ', altitudeM: 1570 },
    { lat: 6.3200, lng: 38.2600, name: 'Wenago Coffee Terraces', nameAm: 'ወናጎ እርሻዎች', altitudeM: 1720 },
    { lat: 6.1600, lng: 38.2000, name: 'Yirgacheffe Specialty Woreda Station', nameAm: 'ይርጋጨፌ ወረዳ መናኸሪያ', altitudeM: 1910 },
  ],

  // 9. Finote Selam <-> Bure Woreda <-> Sekela Woreda
  'finote-selam_bure-woreda': [
    { lat: 10.7025, lng: 37.2625, name: 'Finote Selam Station', nameAm: 'ፍኖተ ሰላም ጣቢያ', altitudeM: 1915 },
    { lat: 10.6800, lng: 37.1500, name: 'Tilili Agriculture Bypass', nameAm: 'ቲሊሊ', altitudeM: 2020 },
    { lat: 10.7000, lng: 37.0650, name: 'Bure Commercial Woreda Station', nameAm: 'ቡሬ ወረዳ መናኸሪያ', altitudeM: 2090 },
  ],
};

// Compute bearing angle between two lat/lng points in degrees
export function calculateBearingDegrees(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

// Haversine distance in km
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Interpolate position along waypoints
export function interpolateWaypointPosition(
  fromId: string,
  toId: string,
  progressPercent: number
): {
  lat: number;
  lng: number;
  heading: number;
  altitudeM: number;
  lastPoint: string;
  lastPointAm: string;
  nextPoint: string;
  nextPointAm: string;
} {
  const forwardKey = `${fromId}_${toId}`;
  const reverseKey = `${toId}_${fromId}`;

  let waypoints: RouteWaypoint[] | null = null;
  let isReversed = false;

  if (CORRIDOR_WAYPOINTS[forwardKey]) {
    waypoints = CORRIDOR_WAYPOINTS[forwardKey];
  } else if (CORRIDOR_WAYPOINTS[reverseKey]) {
    waypoints = [...CORRIDOR_WAYPOINTS[reverseKey]].reverse();
    isReversed = true;
  }

  // Fallback to straight line between stations
  if (!waypoints || waypoints.length < 2) {
    const stA = getEthiopiaStationById(fromId) || ETHIOPIA_BUS_STATIONS[0];
    const stB = getEthiopiaStationById(toId) || ETHIOPIA_BUS_STATIONS[1];
    const t = Math.min(1, Math.max(0, progressPercent / 100));
    const lat = stA.lat + (stB.lat - stA.lat) * t;
    const lng = stA.lng + (stB.lng - stA.lng) * t;
    const heading = calculateBearingDegrees(stA.lat, stA.lng, stB.lat, stB.lng);
    const alt = Math.round(stA.elevationM + (stB.elevationM - stA.elevationM) * t);

    return {
      lat,
      lng,
      heading,
      altitudeM: alt,
      lastPoint: t < 0.5 ? stA.city : `${stA.city} En-Route`,
      lastPointAm: t < 0.5 ? stA.cityAm : `${stA.cityAm} በመንገድ ላይ`,
      nextPoint: stB.city,
      nextPointAm: stB.cityAm,
    };
  }

  // Map progress (0-100) to index in waypoints
  const totalSegments = waypoints.length - 1;
  const scaledProgress = (Math.min(100, Math.max(0, progressPercent)) / 100) * totalSegments;
  const segIndex = Math.min(totalSegments - 1, Math.floor(scaledProgress));
  const segmentFraction = scaledProgress - segIndex;

  const p1 = waypoints[segIndex];
  const p2 = waypoints[segIndex + 1];

  const lat = p1.lat + (p2.lat - p1.lat) * segmentFraction;
  const lng = p1.lng + (p2.lng - p1.lng) * segmentFraction;
  const heading = calculateBearingDegrees(p1.lat, p1.lng, p2.lat, p2.lng);
  const altitudeM = Math.round(p1.altitudeM + (p2.altitudeM - p1.altitudeM) * segmentFraction);

  return {
    lat,
    lng,
    heading,
    altitudeM,
    lastPoint: p1.name,
    lastPointAm: p1.nameAm,
    nextPoint: p2.name,
    nextPointAm: p2.nameAm,
  };
}

// ========================================================
// INITIAL FLEET OF REAL-TIME MOVING BUSES ACROSS ETHIOPIA
// ========================================================
export const INITIAL_LIVE_BUSES: LiveMovingBus[] = [
  {
    id: 'bus-selam-101',
    tripId: 'trip-fed-addis-bd-1',
    busCompany: 'Selam Bus Express',
    busCompanyAm: 'ሰላም ባስ ኤክስፕረስ',
    vehicleType: 'Luxury Coach',
    plateNumber: 'ET 3-45210',
    fromStationId: 'addis-autobis-tera',
    toStationId: 'bahir-dar',
    driverName: 'Captain Tsegaye Alemu',
    driverPhone: '+251 91 184 9201',
    progressPercent: 44,
    currentSpeedKmH: 68,
    headingDegrees: 330,
    lat: 10.12,
    lng: 38.16,
    currentAltitudeM: 1080,
    lastCheckpoint: 'Blue Nile (Abay) Gorge Bridge',
    lastCheckpointAm: 'የዓባይ ወንዝ ድልድይ',
    nextCheckpoint: 'Dejen Gorge Ascent',
    nextCheckpointAm: 'ደጀን ሽቅብ መውጫ',
    totalSeats: 49,
    occupiedSeats: 46,
    estimatedArrivalMin: 185,
    status: 'on_time',
    statusLabelEn: 'On Time (Abay Gorge)',
    statusLabelAm: 'በሰዓቱ (ዓባይ በረሃ)',
    highwayCode: 'Route 3 (A3)',
    gpsSignal: 'rtk_high',
    satellitesLocked: 16,
    routeColor: '#059669', // Emerald
    fuelOrBatteryPercent: 78,
    cabinTempC: 22.4,
  },
  {
    id: 'bus-golden-204',
    tripId: 'trip-fed-addis-haw-1',
    busCompany: 'Golden Bus Lines',
    busCompanyAm: 'ጎልደን ባስ መስመር',
    vehicleType: 'Luxury Coach',
    plateNumber: 'ET 3-89102',
    fromStationId: 'addis-kality',
    toStationId: 'hawassa-regional',
    driverName: 'Captain Yohannes Desta',
    driverPhone: '+251 92 340 1192',
    progressPercent: 62,
    currentSpeedKmH: 82,
    headingDegrees: 185,
    lat: 7.933,
    lng: 38.72,
    currentAltitudeM: 1640,
    lastCheckpoint: 'Batu (Ziway) Lake Shore',
    lastCheckpointAm: 'ባቱ (ዝዋይ) ሐይቅ ዳር',
    nextCheckpoint: 'Arsi Negele Acacia Corridor',
    nextCheckpointAm: 'አርሲ ነገሌ',
    totalSeats: 49,
    occupiedSeats: 48,
    estimatedArrivalMin: 68,
    status: 'ahead',
    statusLabelEn: 'Ahead of Schedule (-12m)',
    statusLabelAm: 'ከመርሐግብር ቀድሟል (-12ደቂቃ)',
    highwayCode: 'Expressway E1',
    gpsSignal: 'rtk_high',
    satellitesLocked: 18,
    routeColor: '#d97706', // Amber
    fuelOrBatteryPercent: 84,
    cabinTempC: 21.8,
  },
  {
    id: 'bus-abay-308',
    tripId: 'trip-bd-gon-1',
    busCompany: 'Abay Bus Coast',
    busCompanyAm: 'ዓባይ ባስ የባሕር ዳርቻ',
    vehicleType: 'Standard Express',
    plateNumber: 'ET 3-12845',
    fromStationId: 'bahir-dar',
    toStationId: 'gondar',
    driverName: 'Captain Worku Mekonnen',
    driverPhone: '+251 91 876 2201',
    progressPercent: 35,
    currentSpeedKmH: 64,
    headingDegrees: 25,
    lat: 11.92,
    lng: 37.70,
    currentAltitudeM: 1820,
    lastCheckpoint: 'Wereta Rice Plain Junction',
    lastCheckpointAm: 'ወረታ መጋጠሚያ',
    nextCheckpoint: 'Addis Zemen Historic Pass',
    nextCheckpointAm: 'አዲስ ዘመን ማለፊያ',
    totalSeats: 55,
    occupiedSeats: 42,
    estimatedArrivalMin: 72,
    status: 'on_time',
    statusLabelEn: 'Cruising Lake Route',
    statusLabelAm: 'በጣና ዳርቻ እየተጓዘ',
    highwayCode: 'Route 3 (A3)',
    gpsSignal: '4g_good',
    satellitesLocked: 14,
    routeColor: '#2563eb', // Blue
    fuelOrBatteryPercent: 69,
    cabinTempC: 23.1,
  },
  {
    id: 'bus-walia-412',
    tripId: 'trip-fed-addis-des-1',
    busCompany: 'Walia Trans-Highland',
    busCompanyAm: 'ዋልያ ትራንስ-ደጋ',
    vehicleType: 'Standard Express',
    plateNumber: 'ET 3-77291',
    fromStationId: 'addis-lamberet',
    toStationId: 'dessie',
    driverName: 'Captain Bekele Tessema',
    driverPhone: '+251 91 200 4811',
    progressPercent: 54,
    currentSpeedKmH: 52,
    headingDegrees: 40,
    lat: 9.86,
    lng: 39.73,
    currentAltitudeM: 3120,
    lastCheckpoint: 'Termaber Mountain Tunnel (3,120m)',
    lastCheckpointAm: 'ጠርማበር ዋሻ ማለፊያ',
    nextCheckpoint: 'Debre Sina Escarpment Curve',
    nextCheckpointAm: 'ደብረ ሲና ቁልቁለት',
    totalSeats: 49,
    occupiedSeats: 45,
    estimatedArrivalMin: 140,
    status: 'delayed',
    statusLabelEn: 'Mountain Fog Slowdown (+15m)',
    statusLabelAm: 'በጉም ምክንያት ዘግይቷል (+15ደ)',
    highwayCode: 'Route 2 (A2)',
    gpsSignal: 'mountain_fringe',
    satellitesLocked: 11,
    routeColor: '#9333ea', // Purple
    fuelOrBatteryPercent: 62,
    cabinTempC: 19.5,
  },
  {
    id: 'bus-zemen-505',
    tripId: 'trip-fed-addis-mek-1',
    busCompany: 'Zemen Express Coach',
    busCompanyAm: 'ዘመን ኤክስፕረስ ኮች',
    vehicleType: 'Luxury Coach',
    plateNumber: 'ET 3-33901',
    fromStationId: 'mekelle-regional',
    toStationId: 'addis-autobis-tera',
    driverName: 'Captain Gebrehiwot Berhe',
    driverPhone: '+251 94 402 9981',
    progressPercent: 78,
    currentSpeedKmH: 72,
    headingDegrees: 190,
    lat: 9.68,
    lng: 39.53,
    currentAltitudeM: 2840,
    lastCheckpoint: 'Debre Birhan Station',
    lastCheckpointAm: 'ደብረ ብርሃን መናኸሪያ',
    nextCheckpoint: 'Addis Lamberet Approach',
    nextCheckpointAm: 'አዲስ ላምበረት መዳረሻ',
    totalSeats: 49,
    occupiedSeats: 49,
    estimatedArrivalMin: 95,
    status: 'on_time',
    statusLabelEn: 'Approaching Capital',
    statusLabelAm: 'ወደ አዲስ አበባ በመቃረብ ላይ',
    highwayCode: 'Route 2 (A2)',
    gpsSignal: 'rtk_high',
    satellitesLocked: 17,
    routeColor: '#dc2626', // Red
    fuelOrBatteryPercent: 55,
    cabinTempC: 22.0,
  },
  {
    id: 'bus-ethio-610',
    tripId: 'trip-fed-addis-jim-1',
    busCompany: 'Ethio Coach Southwest',
    busCompanyAm: 'ኢትዮ ኮች ደቡብ-ምዕራብ',
    vehicleType: 'Standard Express',
    plateNumber: 'ET 3-61102',
    fromStationId: 'jimma-zonal',
    toStationId: 'addis-ayer-tena',
    driverName: 'Captain Dawit Kebede',
    driverPhone: '+251 91 789 0041',
    progressPercent: 48,
    currentSpeedKmH: 66,
    headingDegrees: 65,
    lat: 8.283,
    lng: 37.78,
    currentAltitudeM: 1910,
    lastCheckpoint: 'Wolkite Zonal Gateway',
    lastCheckpointAm: 'ወልቂጤ መናኸሪያ',
    nextCheckpoint: 'Weliso Hot Spring Corridor',
    nextCheckpointAm: 'ወሊሶ',
    totalSeats: 49,
    occupiedSeats: 41,
    estimatedArrivalMin: 155,
    status: 'on_time',
    statusLabelEn: 'Cruising Gurage Highlands',
    statusLabelAm: 'ጉራጌ ደጋማ መስመር',
    highwayCode: 'Highway A5',
    gpsSignal: '4g_good',
    satellitesLocked: 15,
    routeColor: '#0891b2', // Cyan
    fuelOrBatteryPercent: 71,
    cabinTempC: 23.0,
  },
  {
    id: 'bus-harar-715',
    tripId: 'trip-reg-dd-har-1',
    busCompany: 'Eastern Twin Shuttle',
    busCompanyAm: 'የምሥራቅ ከተሞች ሹትል',
    vehicleType: 'Coaster Bus',
    plateNumber: 'ET 3-20419',
    fromStationId: 'dire-dawa-regional',
    toStationId: 'harar-regional',
    driverName: 'Captain Mohammed Nur',
    driverPhone: '+251 91 500 8114',
    progressPercent: 70,
    currentSpeedKmH: 58,
    headingDegrees: 140,
    lat: 9.37,
    lng: 42.06,
    currentAltitudeM: 2080,
    lastCheckpoint: 'Aweday Commercial Bypass',
    lastCheckpointAm: 'አወደይ ገበያ',
    nextCheckpoint: 'Harar Jugol Heritage Terminal',
    nextCheckpointAm: 'ሐረር ጁጎል መናኸሪያ',
    totalSeats: 24,
    occupiedSeats: 24,
    estimatedArrivalMin: 18,
    status: 'approaching_stop',
    statusLabelEn: 'Arriving in 18 min',
    statusLabelAm: 'በ18 ደቂቃ ውስጥ ይደርሳል',
    highwayCode: 'Highway R10',
    gpsSignal: 'rtk_high',
    satellitesLocked: 15,
    routeColor: '#ea580c', // Orange
    fuelOrBatteryPercent: 88,
    cabinTempC: 24.2,
  },
  {
    id: 'bus-feeder-820',
    tripId: 'trip-woreda-fin-bur-1',
    busCompany: 'Gojjam Feeder Dolphin',
    busCompanyAm: 'የጎጃም መጋቢ ዶልፊን',
    vehicleType: 'Minibus Dolphin',
    plateNumber: 'ET 3-19402',
    fromStationId: 'finote-selam',
    toStationId: 'bure-woreda',
    driverName: 'Captain Getachew Assefa',
    driverPhone: '+251 92 110 4429',
    progressPercent: 60,
    currentSpeedKmH: 64,
    headingDegrees: 260,
    lat: 10.68,
    lng: 37.15,
    currentAltitudeM: 2020,
    lastCheckpoint: 'Tilili Agriculture Bypass',
    lastCheckpointAm: 'ቲሊሊ',
    nextCheckpoint: 'Bure Commercial Woreda Station',
    nextCheckpointAm: 'ቡሬ ወረዳ መናኸሪያ',
    totalSeats: 14,
    occupiedSeats: 14,
    estimatedArrivalMin: 14,
    status: 'approaching_stop',
    statusLabelEn: 'Woreda Feeder Express',
    statusLabelAm: 'የወረዳ ፈጣን መጋቢ',
    highwayCode: 'Feeder B31',
    gpsSignal: '4g_good',
    satellitesLocked: 13,
    routeColor: '#16a34a', // Green
    fuelOrBatteryPercent: 92,
    cabinTempC: 22.8,
  },
  {
    id: 'bus-coffee-922',
    tripId: 'trip-woreda-dil-yir-1',
    busCompany: 'Gedeo Highlands Coaster',
    busCompanyAm: 'ጌዴኦ ደጋማ ኮስተር',
    vehicleType: 'Coaster Bus',
    plateNumber: 'ET 3-51209',
    fromStationId: 'dilla-zonal',
    toStationId: 'yirgacheffe-woreda',
    driverName: 'Captain Tamirat Shiferaw',
    driverPhone: '+251 91 632 7701',
    progressPercent: 50,
    currentSpeedKmH: 50,
    headingDegrees: 210,
    lat: 6.32,
    lng: 38.26,
    currentAltitudeM: 1720,
    lastCheckpoint: 'Wenago Coffee Terraces',
    lastCheckpointAm: 'ወናጎ እርሻዎች',
    nextCheckpoint: 'Yirgacheffe Specialty Woreda',
    nextCheckpointAm: 'ይርጋጨፌ ወረዳ',
    totalSeats: 24,
    occupiedSeats: 22,
    estimatedArrivalMin: 22,
    status: 'on_time',
    statusLabelEn: 'Coffee Belt Route',
    statusLabelAm: 'ቡና አብቃይ መስመር',
    highwayCode: 'Highway R7',
    gpsSignal: 'mountain_fringe',
    satellitesLocked: 12,
    routeColor: '#7c3aed', // Violet
    fuelOrBatteryPercent: 76,
    cabinTempC: 21.5,
  },
  {
    id: 'bus-afar-1033',
    tripId: 'trip-reg-des-sem-1',
    busCompany: 'Red Sea Gateway Coach',
    busCompanyAm: 'ቀይ ባሕር በር ኮች',
    vehicleType: 'Luxury Coach',
    plateNumber: 'ET 3-41098',
    fromStationId: 'dessie',
    toStationId: 'semera-regional',
    driverName: 'Captain Ali Hassen',
    driverPhone: '+251 91 388 4402',
    progressPercent: 42,
    currentSpeedKmH: 74,
    headingDegrees: 85,
    lat: 11.43,
    lng: 40.76,
    currentAltitudeM: 520,
    lastCheckpoint: 'Mille Hot Springs Junction',
    lastCheckpointAm: 'ሚሌ መጋጠሚያ',
    nextCheckpoint: 'Logiya Highway Town',
    nextCheckpointAm: 'ሎጊያ',
    totalSeats: 49,
    occupiedSeats: 38,
    estimatedArrivalMin: 85,
    status: 'on_time',
    statusLabelEn: 'Afar Valley Highway',
    statusLabelAm: 'አፋር ሸለቆ አውራ ጎዳና',
    highwayCode: 'Route 1 (A1)',
    gpsSignal: '4g_good',
    satellitesLocked: 16,
    routeColor: '#f59e0b', // Amber-Yellow
    fuelOrBatteryPercent: 81,
    cabinTempC: 26.5,
  },
];

// ========================================================
// INITIAL POOL OF REAL-TIME TRACKED USERS & COMMUTERS
// ========================================================
export const INITIAL_COMMUTERS: LiveTrackedCommuter[] = [
  {
    id: 'commuter-user-me',
    name: 'You (Current Commuter)',
    nameAm: 'እርስዎ (ተሳፋሪ)',
    phone: '+251 91 123 4567',
    lat: 11.5936,
    lng: 37.3908,
    currentStationId: 'bahir-dar',
    currentStationName: 'Bahir Dar Central Terminal',
    currentStationNameAm: 'ባሕር ዳር ማዕከላዊ መናኸሪያ',
    destinationStationId: 'addis-autobis-tera',
    destinationName: 'Addis Ababa (Autobis Tera)',
    destinationNameAm: 'አዲስ አበባ (አውቶቢስ ተራ)',
    status: 'waiting_at_terminal',
    ticketId: 'ET-BD-ADD-8821',
    luggageCount: 2,
    waitTimeMinutes: 15,
    pickupNote: 'Waiting at Gate 3 Passenger Lounge with CBE Birr ticket',
    isCurrentUser: true,
    assignedBusId: 'bus-selam-101',
    partySize: 1,
  },
  {
    id: 'commuter-selamawit',
    name: 'Selamawit Kebede',
    nameAm: 'ሰላማዊት ከበደ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    phone: '+251 92 144 8821',
    lat: 8.9050,
    lng: 38.7610,
    currentStationId: 'addis-kality',
    currentStationName: 'Addis Kaliti Federal Terminal',
    currentStationNameAm: 'ቃሊቲ መናኸሪያ',
    destinationStationId: 'hawassa-regional',
    destinationName: 'Hawassa Regional Terminal',
    destinationNameAm: 'ሐዋሳ መናኸሪያ',
    status: 'waiting_at_terminal',
    ticketId: 'ET-KAL-HAW-4019',
    luggageCount: 1,
    waitTimeMinutes: 20,
    pickupNote: 'Seated at Platform 4 Express waiting area',
    isCurrentUser: false,
    assignedBusId: 'bus-golden-204',
    partySize: 1,
  },
  {
    id: 'commuter-tadesse',
    name: 'Tadesse Mengistu',
    nameAm: 'ታደሰ መንግስቱ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    phone: '+251 91 870 1234',
    lat: 9.8600,
    lng: 39.7300,
    currentStationName: 'Termaber Tunnel North Gate',
    currentStationNameAm: 'ጠርማበር ዋሻ ሰሜን መውጫ',
    destinationStationId: 'dessie',
    destinationName: 'Dessie Boru Terminal',
    destinationNameAm: 'ደሴ ቦሩ መናኸሪያ',
    status: 'roadside_beacon',
    luggageCount: 1,
    waitTimeMinutes: 8,
    pickupNote: 'Waving at highway checkpoint for Dessie-bound express',
    isCurrentUser: false,
    partySize: 2,
    sharedBeaconBroadcastAt: '5 min ago',
  },
  {
    id: 'commuter-ephrem',
    name: 'Ephrem Bekele',
    nameAm: 'ኤፍሬም በቀለ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    phone: '+251 93 411 9021',
    lat: 11.9200,
    lng: 37.7000,
    currentStationName: 'Wereta Junction Roadside Shelter',
    currentStationNameAm: 'ወረታ መጋጠሚያ መጠለያ',
    destinationStationId: 'gondar',
    destinationName: 'Gondar Central Terminal',
    destinationNameAm: 'ጎንደር መናኸሪያ',
    status: 'roadside_beacon',
    luggageCount: 0,
    waitTimeMinutes: 12,
    pickupNote: 'Boarding flagged from Wereta market crossing',
    isCurrentUser: false,
    assignedBusId: 'bus-abay-308',
    partySize: 1,
    sharedBeaconBroadcastAt: '8 min ago',
  },
  {
    id: 'commuter-marta',
    name: 'Marta Hailu',
    nameAm: 'ማርታ ኃይሉ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    phone: '+251 91 300 2219',
    lat: 10.7025,
    lng: 37.2625,
    currentStationId: 'finote-selam',
    currentStationName: 'Finote Selam Station Hub',
    currentStationNameAm: 'ፍኖተ ሰላም ጣቢያ',
    destinationStationId: 'bure-woreda',
    destinationName: 'Bure Woreda Station',
    destinationNameAm: 'ቡሬ ወረዳ መናኸሪያ',
    status: 'waiting_at_terminal',
    ticketId: 'ET-FIN-BUR-1102',
    luggageCount: 2,
    waitTimeMinutes: 6,
    pickupNote: 'Front bay ticket booth with agricultural cargo',
    isCurrentUser: false,
    assignedBusId: 'bus-feeder-820',
    partySize: 1,
  },
  {
    id: 'commuter-birhanu',
    name: 'Birhanu Alemu',
    nameAm: 'ብርሃኑ አለሙ',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    phone: '+251 91 088 7766',
    lat: 9.6800,
    lng: 39.5300,
    currentStationId: 'debre-birhan',
    currentStationName: 'Debre Birhan Station',
    currentStationNameAm: 'ደብረ ብርሃን መናኸሪያ',
    destinationStationId: 'addis-lamberet',
    destinationName: 'Addis Ababa (Lamberet)',
    destinationNameAm: 'አዲስ አበባ (ላምበረት)',
    status: 'waiting_at_terminal',
    ticketId: 'ET-DB-LAM-7201',
    luggageCount: 1,
    waitTimeMinutes: 14,
    pickupNote: 'Waiting for Zemen coach return leg',
    isCurrentUser: false,
    assignedBusId: 'bus-zemen-505',
    partySize: 1,
  },
  {
    id: 'commuter-fatima',
    name: 'Fatima Ahmed',
    nameAm: 'ፋጢማ አሕመድ',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    phone: '+251 94 881 2003',
    lat: 9.5930,
    lng: 41.8660,
    currentStationId: 'dire-dawa-regional',
    currentStationName: 'Dire Dawa Ras Makonnen Hub',
    currentStationNameAm: 'ድሬዳዋ ራስ መኮንን መናኸሪያ',
    destinationStationId: 'harar-regional',
    destinationName: 'Harar Jugol Heritage Terminal',
    destinationNameAm: 'ሐረር ጁጎል መናኸሪያ',
    status: 'waiting_at_terminal',
    ticketId: 'ET-DD-HAR-9032',
    luggageCount: 1,
    waitTimeMinutes: 10,
    pickupNote: 'Near main ticket gate ready with Telebirr QR',
    isCurrentUser: false,
    assignedBusId: 'bus-harar-715',
    partySize: 2,
  },
  {
    id: 'commuter-genet',
    name: 'Genet Wolde',
    nameAm: 'ገነት ወልዴ',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=80',
    phone: '+251 91 760 3390',
    lat: 6.4100,
    lng: 38.3100,
    currentStationId: 'dilla-zonal',
    currentStationName: 'Dilla Gedeo Zonal Hub',
    currentStationNameAm: 'ዲላ የጌዴኦ ዞን መናኸሪያ',
    destinationStationId: 'yirgacheffe-woreda',
    destinationName: 'Yirgacheffe Specialty Woreda',
    destinationNameAm: 'ይርጋጨፌ ወረዳ',
    status: 'waiting_at_terminal',
    ticketId: 'ET-DIL-YIR-3341',
    luggageCount: 3,
    waitTimeMinutes: 18,
    pickupNote: 'Coffee exporter luggage loaded',
    isCurrentUser: false,
    assignedBusId: 'bus-coffee-922',
    partySize: 1,
  },
];

// Telemetry simulation update function
export function advanceBusTelemetry(
  buses: LiveMovingBus[],
  multiplier: number = 1.0
): LiveMovingBus[] {
  return buses.map((bus) => {
    // Increment progress
    const step = 0.6 * multiplier;
    let nextProgress = bus.progressPercent + step;
    let nextOccupancy = bus.occupiedSeats;

    if (nextProgress >= 100) {
      nextProgress = 2; // Loop back or turn around
      // Simulate passenger turnaround
      nextOccupancy = Math.max(10, Math.min(bus.totalSeats, Math.floor(bus.totalSeats * (0.7 + Math.random() * 0.28))));
    }

    // Speed fluctuation
    const speedDrift = (Math.random() - 0.5) * 5;
    const baseSpeed = bus.vehicleType === 'Luxury Coach' ? 70 : bus.vehicleType === 'Minibus Dolphin' ? 62 : 65;
    const nextSpeed = Math.min(85, Math.max(40, Math.round(bus.currentSpeedKmH + speedDrift)));

    // Waypoint calculation
    const wp = interpolateWaypointPosition(bus.fromStationId, bus.toStationId, nextProgress);

    // Dynamic arrival minutes calculation
    const remainingFraction = (100 - nextProgress) / 100;
    const totalDistEstKm = 400; // rough baseline
    const remainingKm = Math.round(totalDistEstKm * remainingFraction);
    const estArrivalMin = Math.max(5, Math.round((remainingKm / (nextSpeed || 60)) * 60));

    // Status evaluation
    let status: LiveMovingBus['status'] = 'on_time';
    let statusLabelEn = 'On Time';
    let statusLabelAm = 'በሰዓቱ';

    if (nextProgress > 92) {
      status = 'approaching_stop';
      statusLabelEn = `Approaching ${wp.nextPoint}`;
      statusLabelAm = `ወደ ${wp.nextPointAm} በመቃረብ ላይ`;
    } else if (nextSpeed < 50) {
      status = 'delayed';
      statusLabelEn = 'Mountain Slowdown';
      statusLabelAm = 'የተራራ ዝግታ';
    } else if (nextSpeed > 75) {
      status = 'ahead';
      statusLabelEn = 'Ahead (-10m)';
      statusLabelAm = 'ቀድሟል (-10ደ)';
    }

    return {
      ...bus,
      progressPercent: Math.round(nextProgress * 10) / 10,
      currentSpeedKmH: nextSpeed,
      lat: wp.lat,
      lng: wp.lng,
      headingDegrees: wp.heading,
      currentAltitudeM: wp.altitudeM,
      lastCheckpoint: wp.lastPoint,
      lastCheckpointAm: wp.lastPointAm,
      nextCheckpoint: wp.nextPoint,
      nextCheckpointAm: wp.nextPointAm,
      occupiedSeats: nextOccupancy,
      estimatedArrivalMin: estArrivalMin,
      status,
      statusLabelEn,
      statusLabelAm,
      fuelOrBatteryPercent: Math.max(15, (bus.fuelOrBatteryPercent || 80) - (0.05 * multiplier)),
    };
  });
}

import { RideTrip } from '../types';
import { ROUTE_CONNECTIONS } from '../data/amharaStations';

export interface RouteSpeedProfile {
  corridorKey: string;
  historicalAvgSpeedKmH: number;
  corridorNameEn: string;
  corridorNameAm: string;
  speedCategory: 'Highland Expressway' | 'Mountain Pass & Tunnel' | 'River Canyon Switchback' | 'Lakeside Flat';
  speedCategoryAm: string;
}

// Historical speed baseline empirically calibrated for Amhara regional transport corridors
export const CORRIDOR_HISTORICAL_SPEEDS: Record<string, RouteSpeedProfile> = {
  'bahir-dar-gondar': {
    corridorKey: 'bahir-dar-gondar',
    historicalAvgSpeedKmH: 58.4,
    corridorNameEn: 'Lake Tana Shore & Azezo Corridor (Route 3)',
    corridorNameAm: 'የጣና ዳርቻ እና አዘዞ አውራ ጎዳና (መስመር 3)',
    speedCategory: 'Highland Expressway',
    speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
  },
  'gondar-bahir-dar': {
    corridorKey: 'gondar-bahir-dar',
    historicalAvgSpeedKmH: 58.4,
    corridorNameEn: 'Gondar to Lake Tana Southbound (Route 3)',
    corridorNameAm: 'ከጎንደር ወደ ጣና ደቡባዊ መስመር (መስመር 3)',
    speedCategory: 'Highland Expressway',
    speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
  },
  'bahir-dar-debre-markos': {
    corridorKey: 'bahir-dar-debre-markos',
    historicalAvgSpeedKmH: 56.2,
    corridorNameEn: 'West Gojjam Agricultural Plateau (Route 3)',
    corridorNameAm: 'የምዕራብ ጎጃም አምባ ሜዳዎች (መስመር 3)',
    speedCategory: 'Highland Expressway',
    speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
  },
  'debre-markos-bahir-dar': {
    corridorKey: 'debre-markos-bahir-dar',
    historicalAvgSpeedKmH: 56.2,
    corridorNameEn: 'Debre Markos to Tana Capital (Route 3)',
    corridorNameAm: 'ደብረ ማርቆስ ወደ ጣና መናኸሪያ (መስመር 3)',
    speedCategory: 'Highland Expressway',
    speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
  },
  'dessie-debre-birhan': {
    corridorKey: 'dessie-debre-birhan',
    historicalAvgSpeedKmH: 49.1,
    corridorNameEn: 'Termaber Tunnel & High Escarpment Pass (Route 2)',
    corridorNameAm: 'የተርማበር ዋሻ እና የስምጥ ሸለቆ ቁልቁለት (መስመር 2)',
    speedCategory: 'Mountain Pass & Tunnel',
    speedCategoryAm: 'የተራራ ማለፊያ እና ዋሻ',
  },
  'debre-birhan-dessie': {
    corridorKey: 'debre-birhan-dessie',
    historicalAvgSpeedKmH: 49.1,
    corridorNameEn: 'Shewa to Wollo Alpine Ascent (Route 2)',
    corridorNameAm: 'ከሸዋ ወደ ወሎ የተራራ ዳገት (መስመር 2)',
    speedCategory: 'Mountain Pass & Tunnel',
    speedCategoryAm: 'የተራራ ማለፊያ እና ዋሻ',
  },
  'debre-markos-debre-birhan': {
    corridorKey: 'debre-markos-debre-birhan',
    historicalAvgSpeedKmH: 44.8,
    corridorNameEn: 'Abay (Blue Nile) Gorge Switchbacks',
    corridorNameAm: 'ታላቁ የአባይ በረሃ ጥልቅ ገደል እና ድልድይ',
    speedCategory: 'River Canyon Switchback',
    speedCategoryAm: 'ጥልቅ የበረሃ ገደል መንገድ',
  },
  'debre-birhan-debre-markos': {
    corridorKey: 'debre-birhan-debre-markos',
    historicalAvgSpeedKmH: 44.8,
    corridorNameEn: 'Abay Gorge Crossing Northbound',
    corridorNameAm: 'የአባይ በረሃ መሻገሪያ ወደ ጎጃም',
    speedCategory: 'River Canyon Switchback',
    speedCategoryAm: 'ጥልቅ የበረሃ ገደል መንገድ',
  },
  'dessie-kombolcha': {
    corridorKey: 'dessie-kombolcha',
    historicalAvgSpeedKmH: 38.5,
    corridorNameEn: 'Boru Meda Mountain Descent',
    corridorNameAm: 'የቦሩ ሜዳ ቁልቁለት መንገድ',
    speedCategory: 'Mountain Pass & Tunnel',
    speedCategoryAm: 'የተራራ ቁልቁለት መንገድ',
  },
  'dessie-woldiya': {
    corridorKey: 'dessie-woldiya',
    historicalAvgSpeedKmH: 52.0,
    corridorNameEn: 'Wollo Mountain Ridges via Lake Haiq',
    corridorNameAm: 'የወሎ ተራራ ሰንሰለት እና ሐይቅ ዳርቻ',
    speedCategory: 'Highland Expressway',
    speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
  },
  'woldiya-lalibela': {
    corridorKey: 'woldiya-lalibela',
    historicalAvgSpeedKmH: 41.2,
    corridorNameEn: 'Gashena Alpine Spur & Tekeze Basin',
    corridorNameAm: 'የጋሸና ተራራማ የላሊበላ መታጠፊያ',
    speedCategory: 'Mountain Pass & Tunnel',
    speedCategoryAm: 'የተራራ ማለፊያ እና ገደላማ መንገድ',
  },
  'bahir-dar-debre-tabor': {
    corridorKey: 'bahir-dar-debre-tabor',
    historicalAvgSpeedKmH: 51.5,
    corridorNameEn: 'East Tana Plain & South Gondar Ascent (Route 22)',
    corridorNameAm: 'የምስራቅ ጣና ሜዳ እና ደቡብ ጎንደር ዳገት (መስመር 22)',
    speedCategory: 'Lakeside Flat',
    speedCategoryAm: 'የጣና ዳርቻና ኮረብታማ መንገድ',
  },
};

export interface DynamicArrivalEstimate {
  totalDistanceKm: number;
  distanceCoveredKm: number;
  remainingDistanceKm: number;
  historicalAvgSpeedKmH: number;
  currentSpeedKmH: number;
  effectivePredictedSpeedKmH: number;
  estimatedRemainingMinutes: number;
  estimatedRemainingFormatted: string;
  scheduledArrivalTime: string;
  dynamicExpectedArrivalTime: string;
  varianceMinutes: number;
  status: 'ahead' | 'on_time' | 'delayed';
  statusLabelEn: string;
  statusLabelAm: string;
  speedDeltaKmH: number;
  speedCategoryEn: string;
  speedCategoryAm: string;
}

/**
 * Parses time string like "06:30 AM" or "09:45 PM" into total minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = (match[3] || '').toUpperCase();

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight back to "HH:MM AM/PM"
 */
export function formatMinutesToTime(totalMinutes: number): string {
  // Normalize within 24 hours
  let normalized = Math.round(totalMinutes) % 1440;
  if (normalized < 0) normalized += 1440;

  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours12}:${minutesStr} ${ampm}`;
}

/**
 * Formats remaining minutes into readable string (e.g. "1h 45m" or "32m")
 */
export function formatRemainingTime(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

/**
 * Computes dynamic live arrival estimate using historical speed & live telemetry
 */
export function calculateDynamicArrivalEstimate(
  trip: RideTrip,
  progressPercentage: number,
  currentSpeedKmH: number
): DynamicArrivalEstimate {
  // 1. Resolve corridor distance and historical baseline
  const connKey = `${trip.fromStationId}-${trip.toStationId}`;
  const reverseKey = `${trip.toStationId}-${trip.fromStationId}`;

  const routeConn = ROUTE_CONNECTIONS.find(
    (rc) =>
      (rc.fromStationId === trip.fromStationId && rc.toStationId === trip.toStationId) ||
      (rc.fromStationId === trip.toStationId && rc.toStationId === trip.fromStationId)
  );

  const totalDistanceKm = routeConn?.distanceKm || 175;

  const speedProfile =
    CORRIDOR_HISTORICAL_SPEEDS[connKey] ||
    CORRIDOR_HISTORICAL_SPEEDS[reverseKey] || {
      historicalAvgSpeedKmH: routeConn
        ? Math.round((routeConn.distanceKm / routeConn.durationHrs) * 10) / 10
        : 56.0,
      corridorNameEn: 'Amhara Regional Highway Network',
      corridorNameAm: 'የአማራ ክልል አውራ ጎዳና',
      speedCategory: 'Highland Expressway' as const,
      speedCategoryAm: 'የተደላደለ የአስፋልት አውራ ጎዳና',
    };

  const historicalAvgSpeedKmH = speedProfile.historicalAvgSpeedKmH;

  // 2. Distance math
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));
  const distanceCoveredKm = Math.round((totalDistanceKm * (clampedProgress / 100)) * 10) / 10;
  const remainingDistanceKm = Math.max(0, Math.round((totalDistanceKm - distanceCoveredKm) * 10) / 10);

  // 3. Dynamic predictive speed modeling:
  // Weight: 60% historical route baseline (prevents erratic jumps when bus briefly stops at toll/checkpoint)
  // + 40% current live telemetry speed
  const effectivePredictedSpeedKmH = Number(
    (historicalAvgSpeedKmH * 0.6 + Math.max(25, currentSpeedKmH) * 0.4).toFixed(1)
  );

  // 4. Remaining transit duration based on predicted speed
  const estimatedRemainingHours = remainingDistanceKm / effectivePredictedSpeedKmH;
  const estimatedRemainingMinutes = Math.max(1, Math.round(estimatedRemainingHours * 60));
  const estimatedRemainingFormatted = formatRemainingTime(estimatedRemainingMinutes);

  // 5. Scheduled vs Dynamic Arrival Time comparison
  const departureMins = parseTimeToMinutes(trip.departureTime);
  const scheduledArrivalMins = parseTimeToMinutes(trip.arrivalTime);
  const scheduledTotalDurationMins =
    scheduledArrivalMins >= departureMins
      ? scheduledArrivalMins - departureMins
      : scheduledArrivalMins + 1440 - departureMins;

  // Expected remaining minutes according to the official timetable at this percentage:
  const scheduledRemainingMins = Math.round(scheduledTotalDurationMins * (1 - clampedProgress / 100));

  // Variance: positive = taking longer than scheduled timetable (delayed), negative = ahead of schedule
  const varianceMinutes = estimatedRemainingMinutes - scheduledRemainingMins;

  // Dynamic Expected Arrival Time at destination terminal
  const dynamicArrivalMins = scheduledArrivalMins + varianceMinutes;
  const dynamicExpectedArrivalTime = formatMinutesToTime(dynamicArrivalMins);

  // Status classification
  let status: 'ahead' | 'on_time' | 'delayed' = 'on_time';
  let statusLabelEn = 'On Schedule';
  let statusLabelAm = 'በሰዓቱ';

  if (varianceMinutes <= -4) {
    status = 'ahead';
    statusLabelEn = `${Math.abs(varianceMinutes)}m Ahead of Schedule`;
    statusLabelAm = `${Math.abs(varianceMinutes)}ደቂቃ ቀድሞ`;
  } else if (varianceMinutes >= 4) {
    status = 'delayed';
    statusLabelEn = `${varianceMinutes}m Expected Delay`;
    statusLabelAm = `${varianceMinutes}ደቂቃ መዘግየት`;
  }

  const speedDeltaKmH = Math.round(currentSpeedKmH - historicalAvgSpeedKmH);

  return {
    totalDistanceKm,
    distanceCoveredKm,
    remainingDistanceKm,
    historicalAvgSpeedKmH,
    currentSpeedKmH,
    effectivePredictedSpeedKmH,
    estimatedRemainingMinutes,
    estimatedRemainingFormatted,
    scheduledArrivalTime: trip.arrivalTime,
    dynamicExpectedArrivalTime,
    varianceMinutes,
    status,
    statusLabelEn,
    statusLabelAm,
    speedDeltaKmH,
    speedCategoryEn: speedProfile.speedCategory,
    speedCategoryAm: speedProfile.speedCategoryAm,
  };
}

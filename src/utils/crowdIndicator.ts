/**
 * Dynamic Live Crowd Indicator & Terminal Busyness Engine
 * Evaluates real-time passenger density, gate clearance pressure,
 * and upcoming vehicle flow based on scheduled departures within the next 2 hours.
 */

import { BusStation, RideTrip, Language } from '../types';
import { parseTimeToMinutes, formatMinutesToTimeString } from './departureScheduler';

export type CrowdLevel = 'calm' | 'moderate' | 'busy' | 'peak';

export interface StationCrowdMetrics {
  stationId: string;
  crowdLevel: CrowdLevel;
  crowdScore: number; // 0 to 100 percentage
  upcomingTrips: RideTrip[];
  departuresCount: number;
  totalDepartingSeats: number;
  bookedPassengersCount: number;
  estimatedGateWaitMin: number;
  nextDepartureMinutes: number | null;
  nextTrip: RideTrip | null;
  timeWindowLabel: string; // e.g. "06:30 AM - 08:30 AM"
  peakBayConcentration: number; // estimated active bays
}

/**
 * Calculates departure minutes remaining relative to current time of day,
 * properly wrapping across midnight if necessary.
 */
export function getMinutesUntilDeparture(departureTimeStr: string, currentMinutesOfDay: number): number | null {
  // Check for recurring frequency like "Every 15 mins (06:00 - 20:00)"
  const recurringMatch = departureTimeStr.match(/Every\s+(\d+)\s+mins?\s*\((\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\)/i);
  if (recurringMatch) {
    const intervalMins = parseInt(recurringMatch[1], 10);
    const startMins = parseTimeToMinutes(recurringMatch[2]) ?? 360; // 06:00
    const endMins = parseTimeToMinutes(recurringMatch[3]) ?? 1200; // 20:00

    if (currentMinutesOfDay >= startMins && currentMinutesOfDay <= endMins) {
      // Find the next upcoming recurring departure
      const elapsedSinceStart = currentMinutesOfDay - startMins;
      const nextOffset = intervalMins - (elapsedSinceStart % intervalMins);
      return nextOffset === 0 ? intervalMins : nextOffset;
    }
  }

  const depMinutes = parseTimeToMinutes(departureTimeStr);
  if (depMinutes === null) return null;

  let diff = depMinutes - currentMinutesOfDay;
  // If difference is negative by more than 12 hours, assume tomorrow's cycle
  if (diff < 0) {
    if (diff < -720) {
      diff += 1440;
    } else {
      return null; // Already departed earlier today
    }
  }

  return diff;
}

/**
 * Calculates live crowd indicators for a station based on scheduled departures in the next 120 minutes.
 */
export function calculateStationCrowd(
  station: BusStation,
  trips: RideTrip[],
  currentMinutesOfDay: number
): StationCrowdMetrics {
  const windowMins = 120; // 2 hours
  const stationTrips = trips.filter((t) => t.fromStationId === station.id);

  const upcomingWithDiff: { trip: RideTrip; diff: number }[] = [];

  for (const trip of stationTrips) {
    // If recurring shuttle
    if (trip.departureTime.toLowerCase().includes('every')) {
      const diff = getMinutesUntilDeparture(trip.departureTime, currentMinutesOfDay);
      if (diff !== null && diff <= windowMins) {
        upcomingWithDiff.push({ trip, diff });
        // Also simulate a second recurring service within the 2-hour window if applicable
        if (diff + 30 <= windowMins) {
          upcomingWithDiff.push({
            trip: {
              ...trip,
              id: `${trip.id}-shuttle-2`,
              departureTime: formatMinutesToTimeString(currentMinutesOfDay + diff + 30),
            },
            diff: diff + 30,
          });
        }
      }
      continue;
    }

    const diff = getMinutesUntilDeparture(trip.departureTime, currentMinutesOfDay);
    if (diff !== null && diff >= 0 && diff <= windowMins) {
      upcomingWithDiff.push({ trip, diff });
    }
  }

  // Sort upcoming departures by time
  upcomingWithDiff.sort((a, b) => a.diff - b.diff);
  const upcomingTrips = upcomingWithDiff.map((item) => item.trip);

  const departuresCount = upcomingTrips.length;
  const totalDepartingSeats = upcomingTrips.reduce((acc, t) => acc + (t.totalSeats || 30), 0);
  const bookedPassengersCount = upcomingTrips.reduce(
    (acc, t) => acc + (t.bookedSeats ? t.bookedSeats.length : Math.floor((t.totalSeats || 30) * 0.7)),
    0
  );

  const nextDepartureMinutes = upcomingWithDiff.length > 0 ? upcomingWithDiff[0].diff : null;
  const nextTrip = upcomingWithDiff.length > 0 ? upcomingWithDiff[0].trip : null;

  // Calculate dynamic crowd score based on departures, passengers, and station bay capacity
  let rawScore = 12; // baseline quiet terminal background
  const bays = Math.max(1, station.baysCount || 14);

  if (departuresCount > 0) {
    // Capacity pressure: ratio of simultaneous departures vs bays
    const bayRatio = departuresCount / bays;
    const passengerPressure = bookedPassengersCount / (bays * 18);

    // Terminal tier sensitivity
    if (bays >= 20) {
      // Large Hub (Bahir Dar, Dessie, Gondar)
      if (departuresCount >= 4) rawScore = 86 + Math.min(12, (departuresCount - 4) * 4);
      else if (departuresCount === 3) rawScore = 68 + Math.floor(passengerPressure * 10);
      else if (departuresCount === 2) rawScore = 48 + Math.floor(passengerPressure * 10);
      else rawScore = 28;
    } else if (bays >= 14) {
      // Medium Regional Hub (Debre Markos, Debre Birhan, Kombolcha, Woldiya, Debre Tabor, Finote Selam)
      if (departuresCount >= 3) rawScore = 84 + Math.min(14, (departuresCount - 3) * 5);
      else if (departuresCount === 2) rawScore = 64 + Math.floor(bayRatio * 20);
      else rawScore = 42;
    } else {
      // Mountain / Smaller Stations (Lalibela, Enjibara, Shewa Robit, Sekota, Motta, Kobo)
      if (departuresCount >= 2) rawScore = 78 + Math.min(18, (departuresCount - 2) * 8);
      else rawScore = 46;
    }

    // Add passenger fullness boost
    if (totalDepartingSeats > 0 && bookedPassengersCount / totalDepartingSeats > 0.8) {
      rawScore += 5;
    }
  }

  const crowdScore = Math.max(8, Math.min(98, Math.round(rawScore)));

  // Map to category
  let crowdLevel: CrowdLevel = 'calm';
  if (crowdScore >= 80) {
    crowdLevel = 'peak';
  } else if (crowdScore >= 60) {
    crowdLevel = 'busy';
  } else if (crowdScore >= 35) {
    crowdLevel = 'moderate';
  } else {
    crowdLevel = 'calm';
  }

  // Estimated security check & boarding gate wait time
  let estimatedGateWaitMin = 3;
  if (crowdLevel === 'peak') {
    estimatedGateWaitMin = 18 + Math.min(12, departuresCount * 2);
  } else if (crowdLevel === 'busy') {
    estimatedGateWaitMin = 11 + departuresCount;
  } else if (crowdLevel === 'moderate') {
    estimatedGateWaitMin = 6 + Math.floor(departuresCount * 1.5);
  } else {
    estimatedGateWaitMin = 2 + (departuresCount > 0 ? 1 : 0);
  }

  const startFormatted = formatMinutesToTimeString(currentMinutesOfDay);
  const endFormatted = formatMinutesToTimeString((currentMinutesOfDay + windowMins) % 1440);
  const timeWindowLabel = `${startFormatted} – ${endFormatted}`;

  const peakBayConcentration = Math.min(bays, departuresCount);

  return {
    stationId: station.id,
    crowdLevel,
    crowdScore,
    upcomingTrips,
    departuresCount,
    totalDepartingSeats,
    bookedPassengersCount,
    estimatedGateWaitMin,
    nextDepartureMinutes,
    nextTrip,
    timeWindowLabel,
    peakBayConcentration,
  };
}

/**
 * Visual styling and localization configurations for each crowd level.
 */
export const getCrowdLevelConfig = (level: CrowdLevel, lang: Language) => {
  switch (level) {
    case 'peak':
      return {
        label: lang === 'en' ? 'Peak Rush' : 'የበዛ መጨናነቅ (Peak)',
        subLabel: lang === 'en' ? 'Heavy Boarding Queues' : 'ከፍተኛ የተሳፋሪ ወረፋ',
        colorHex: '#dc2626', // red-600
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-200',
        cardBorderClass: 'border-rose-300/80 hover:border-rose-400',
        dotColor: 'bg-rose-600',
        pulseRing: 'bg-rose-400',
        meterFill: 'from-orange-500 to-rose-600',
        iconEmoji: '🔴',
        accentBg: 'bg-rose-500/10 text-rose-700',
        advice: lang === 'en' ? 'Allow 20+ mins for baggage & security check' : 'ለሻንጣና ፍተሻ ተጨማሪ 20 ደቂቃ ይያዙ',
      };
    case 'busy':
      return {
        label: lang === 'en' ? 'High Busyness' : 'ከፍተኛ ጭንቅንቅ',
        subLabel: lang === 'en' ? 'Active Gate Flow' : 'ንቁ የመጫኛ በር ፍሰት',
        colorHex: '#ea580c', // orange-600
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-300 ring-orange-200',
        cardBorderClass: 'border-orange-300/80 hover:border-orange-400',
        dotColor: 'bg-orange-600',
        pulseRing: 'bg-orange-400',
        meterFill: 'from-amber-400 to-orange-500',
        iconEmoji: '🟠',
        accentBg: 'bg-orange-500/10 text-orange-700',
        advice: lang === 'en' ? 'Moderate queues at boarding bays' : 'በመጫኛ በሮች ላይ መጠነኛ ወረፋ አለ',
      };
    case 'moderate':
      return {
        label: lang === 'en' ? 'Moderate Activity' : 'መካከለኛ እንቅስቃሴ',
        subLabel: lang === 'en' ? 'Steady Passenger Transit' : 'የተረጋጋ የመንገደኛ ፍሰት',
        colorHex: '#d97706', // amber-600
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-200',
        cardBorderClass: 'border-amber-300/80 hover:border-amber-400',
        dotColor: 'bg-amber-500',
        pulseRing: 'bg-amber-400',
        meterFill: 'from-emerald-400 to-amber-500',
        iconEmoji: '🟡',
        accentBg: 'bg-amber-500/10 text-amber-700',
        advice: lang === 'en' ? 'Standard turnaround, minimal delays' : 'መደበኛ የመሳፈሪያ ጊዜ፣ አጭር ወረፋ',
      };
    case 'calm':
    default:
      return {
        label: lang === 'en' ? 'Calm Flow' : 'ረጋ ያለ / ነጻ ፍሰት',
        subLabel: lang === 'en' ? 'Open Waiting Lounges' : 'ክፍት የመጠባበቂያ አዳራሽ',
        colorHex: '#059669', // emerald-600
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-200',
        cardBorderClass: 'border-emerald-200/80 hover:border-emerald-300',
        dotColor: 'bg-emerald-500',
        pulseRing: 'bg-emerald-400',
        meterFill: 'from-teal-400 to-emerald-500',
        iconEmoji: '🟢',
        accentBg: 'bg-emerald-500/10 text-emerald-700',
        advice: lang === 'en' ? 'Rapid gate clearance, plenty of seating' : 'ፈጣን የመግቢያ ሂደትና በቂ የመቀመጫ ቦታ',
      };
  }
};

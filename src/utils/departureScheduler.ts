/**
 * Departure Scheduler & Push Notification Utilities for Amhara Transit
 */

export interface DepartureAlertInfo {
  ticketId: string;
  tripId: string;
  passengerName: string;
  fromCity: string;
  fromCityAm: string;
  fromStationName: string;
  toCity: string;
  toCityAm: string;
  busCompany: string;
  plateNumber: string;
  departureTime: string;
  bayNumber: number;
  seatNumbers: number[];
  minutesRemaining: number;
  secondsRemaining: number;
  isUrgent: boolean; // under 15 mins
  triggeredAt: number;
}

/**
 * Parses time format like "06:30 AM", "6:30 AM", "02:15 PM", "14:00" into total minutes from midnight.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight into 12-hour AM/PM string (e.g. 365 -> "06:05 AM")
 */
export function formatMinutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm} ${meridiem}`;
}

/**
 * Calculates remaining minutes between current schedule time and departure time.
 */
export function calculateMinutesRemaining(
  departureTimeStr: string,
  currentMinutesOfDay: number
): number | null {
  const depMinutes = parseTimeToMinutes(departureTimeStr);
  if (depMinutes === null) return null;

  let diff = depMinutes - currentMinutesOfDay;
  // If difference is negative by more than 12 hours, consider next day schedule
  if (diff < -720) {
    diff += 1440;
  }
  return diff;
}

/**
 * Formats seconds into MM:SS display
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00m 00s (Departed)';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Station announcement chime using browser Web Audio API.
 * Emulates a realistic airport / terminal departure bell.
 */
export function playTransitChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Chime notes: F5 (698.46 Hz) then A5 (880 Hz) then C6 (1046.5 Hz)
    const tones = [
      { freq: 698.46, time: 0, duration: 0.35 },
      { freq: 880.0, time: 0.18, duration: 0.45 },
      { freq: 1046.5, time: 0.36, duration: 0.7 },
    ];

    tones.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.time);

      gain.gain.setValueAtTime(0.001, now + t.time);
      gain.gain.exponentialRampToValueAtTime(0.18, now + t.time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.time + t.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t.time);
      osc.stop(now + t.time + t.duration);
    });
  } catch {
    // AudioContext blocked or not supported; gracefully ignore
  }
}

/**
 * Dispatches a native browser notification if user permitted it.
 */
export function triggerNativeNotification(
  title: string,
  options: {
    body: string;
    tag?: string;
  }
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options.body,
        tag: options.tag || 'departure-alert',
        icon: '/icon.png',
      });
    } catch {
      // Ignore if failed in iframe sandbox
    }
  }
}

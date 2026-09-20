import React, { useState, useEffect } from 'react';
import { DepartureAlertInfo, formatCountdown, playTransitChime } from '../utils/departureScheduler';
import { Language } from '../types';
import { translations } from '../translations';
import {
  BellRing,
  Clock,
  Bus,
  MapPin,
  QrCode,
  Radio,
  X,
  Volume2,
  VolumeX,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

interface DepartureNotificationToastProps {
  alert: DepartureAlertInfo;
  secondsRemaining: number;
  lang: Language;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onViewBoardingPass: (ticketId: string) => void;
  onTrackLiveBus: () => void;
}

export const DepartureNotificationToast: React.FC<DepartureNotificationToastProps> = ({
  alert,
  secondsRemaining,
  lang,
  onDismiss,
  onSnooze,
  onViewBoardingPass,
  onTrackLiveBus,
}) => {
  const t = translations[lang];
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isImminent = secondsRemaining <= 900; // under 15 minutes

  // Play transit chime once when the component mounts if sound is enabled
  useEffect(() => {
    if (soundEnabled) {
      playTransitChime();
    }
  }, []);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playTransitChime();
    }
  };

  const minutesRemainingCalc = Math.max(0, Math.ceil(secondsRemaining / 60));

  return (
    <aside
      aria-label="Departure Alert Notification"
      className="fixed top-16 right-3 sm:right-6 z-50 max-w-md w-[calc(100vw-1.5rem)] sm:w-[430px] animate-in slide-in-from-top-6 duration-300 ease-out"
    >
      <div
        className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
          isImminent
            ? 'bg-slate-900/98 text-white border-rose-500/80 ring-2 ring-rose-500/30'
            : 'bg-slate-900/95 text-white border-amber-500/80 ring-2 ring-amber-500/30'
        }`}
      >
        {/* Top Notification Status Header */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isImminent ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950 font-bold'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <div>
              <span className="font-extrabold text-[11px] tracking-wider uppercase flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full animate-ping ${
                    isImminent ? 'bg-rose-400' : 'bg-amber-400'
                  }`}
                />
                <span>
                  {lang === 'en'
                    ? 'Amhara Transit Push Notification'
                    : 'የአማራ ትራንስፖርት የጉዞ ማሳሰቢያ'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute announcement chime' : 'Enable announcement chime'}
              className="p-1 hover:text-white rounded transition cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <span className="text-[10px] font-mono text-slate-500">Just now</span>

            <button
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="p-1 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Main Departure Headline & Countdown */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Clock className="w-3 h-3" />
                <span>
                  {lang === 'en'
                    ? `Departure in ${minutesRemainingCalc} Minutes`
                    : `በ ${minutesRemainingCalc} ደቂቃ ውስጥ ይነሳል`}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                {lang === 'en'
                  ? 'Boarding Call: Prepare for Departure!'
                  : 'የመሳፈሪያ ጥሪ፡ ለመነሳት ይዘጋጁ!'}
              </h3>
            </div>

            {/* Live seconds countdown pill */}
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                {lang === 'en' ? 'Countdown' : 'ቀሪ ጊዜ'}
              </span>
              <span
                className={`font-mono font-black text-sm px-2.5 py-1 rounded-xl border block mt-0.5 ${
                  isImminent
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {formatCountdown(secondsRemaining)}
              </span>
            </div>
          </div>

          {/* Route & Platform Bay highlight */}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-800/80 flex items-center justify-center text-emerald-200">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-sm block leading-tight">
                    {lang === 'en' ? alert.fromCity : alert.fromCityAm} ➔{' '}
                    {lang === 'en' ? alert.toCity : alert.toCityAm}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {alert.busCompany} ({alert.plateNumber})
                  </span>
                </div>
              </div>

              {/* Bay number badge */}
              <div className="text-right">
                <span className="text-[10px] text-amber-300 uppercase font-semibold block">
                  {lang === 'en' ? 'Boarding Gate' : 'መጫኛ በር'}
                </span>
                <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg inline-block font-mono">
                  BAY #{alert.bayNumber}
                </span>
              </div>
            </div>

            {/* Passenger & Seats info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-[11px] text-slate-300">
              <span>
                {lang === 'en' ? 'Passenger: ' : 'መንገደኛ፡ '}
                <strong className="text-white">{alert.passengerName}</strong>
              </span>
              <span>
                {lang === 'en' ? 'Seat(s): ' : 'መቀመጫ፡ '}
                <strong className="text-amber-300 font-mono">
                  #{alert.seatNumbers.join(', #')}
                </strong>
              </span>
            </div>
          </div>

          {/* Action guidance callout */}
          <div className="flex items-center gap-2 text-[11px] text-amber-200/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'en'
                ? `Report to Platform Bay #${alert.bayNumber} at ${alert.fromStationName}. Have your QR code ready.`
                : `እባክዎ በ ${alert.fromStationName} ወደ መጫኛ በር #${alert.bayNumber} ይሂዱ። የQR ኮድዎን ያዘጋጁ።`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => onViewBoardingPass(alert.ticketId)}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'View Boarding Pass' : 'ትኬት እና QR ኮድ እይ'}</span>
            </button>

            <button
              onClick={onTrackLiveBus}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">
                {lang === 'en' ? 'Live Radar' : 'ራዳር'}
              </span>
            </button>

            <button
              onClick={() => onSnooze(5)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-medium text-xs transition cursor-pointer"
              title="Snooze alert for 5 minutes"
            >
              {lang === 'en' ? 'Snooze 5m' : 'አዘግይ'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

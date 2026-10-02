import React, { useState } from 'react';
import { TerminalDisruptionAlert, Language } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { playTransitChime } from '../utils/departureScheduler';
import {
  AlertTriangle,
  XOctagon,
  X,
  Volume2,
  VolumeX,
  ArrowRight,
  Star,
  Clock,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  BellRing,
} from 'lucide-react';

export interface TerminalDisruptionToastProps {
  alert: TerminalDisruptionAlert;
  lang: Language;
  onDismiss: () => void;
  onOpenMonitor: () => void;
  onFindAlternatives?: (terminalId: string) => void;
  onSnooze?: (minutes: number) => void;
}

export const TerminalDisruptionToast: React.FC<TerminalDisruptionToastProps> = ({
  alert,
  lang,
  onDismiss,
  onOpenMonitor,
  onFindAlternatives,
  onSnooze,
}) => {
  const isAm = lang === 'am';
  const isCancelled = alert.type === 'TERMINAL_CANCELLATION' || alert.status === 'cancelled';
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playTransitChime();
    }
  };

  return (
    <aside
      aria-label="Proactive Terminal Disruption Alert"
      className="fixed top-16 left-3 right-3 sm:left-auto sm:right-6 z-50 sm:max-w-lg w-auto sm:w-[460px] animate-in slide-in-from-top-6 duration-300 ease-out"
    >
      <div
        className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
          isCancelled
            ? 'bg-rose-950/95 text-white border-rose-500/80 ring-2 ring-rose-500/40 shadow-rose-950/50'
            : 'bg-amber-950/95 text-white border-amber-500/80 ring-2 ring-amber-500/40 shadow-amber-950/50'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between text-xs font-bold ${
            isCancelled
              ? 'bg-rose-900/90 border-rose-800 text-rose-100'
              : 'bg-amber-900/90 border-amber-800 text-amber-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-black/30 flex items-center justify-center">
              {isCancelled ? (
                <XOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/40">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>{isAm ? 'የተመረጠ መናኸሪያ ማንቂያ' : 'Preferred Terminal Alert'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-neutral-300 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'Mute announcement' : 'Unmute announcement'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
            </button>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onDismiss();
              }}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-neutral-300 hover:text-white transition cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs uppercase font-mono font-bold tracking-wider opacity-80">
                {isAm ? alert.cityAm : alert.city} • {isAm ? alert.terminalNameAm : alert.terminalName}
              </span>
              {alert.expectedDelayMinutes && (
                <span className="text-xs font-mono font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  +{alert.expectedDelayMinutes}m DELAY
                </span>
              )}
              {isCancelled && (
                <span className="text-xs font-mono font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                  SUSPENDED
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-extrabold leading-snug">
              {isAm ? alert.headlineAm : alert.headlineEn}
            </h3>

            <p className="text-xs opacity-90 leading-relaxed mt-1.5 line-clamp-3">
              {isAm ? alert.detailAm : alert.detailEn}
            </p>
          </div>

          {/* Advice / Authority Footer */}
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] space-y-1">
            <div className="flex items-start gap-1.5 font-medium">
              <span className="font-bold text-amber-300 shrink-0">
                {isAm ? 'የመመሪያ ምክር፡' : 'Action:'}
              </span>
              <span className="opacity-95">
                {isAm ? alert.recommendedActionAm : alert.recommendedActionEn}
              </span>
            </div>
            <div className="text-[10px] opacity-70 flex items-center justify-between pt-0.5">
              <span>{alert.issuedByAuthority}</span>
              <span className="font-mono">{alert.reportedAt}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onOpenMonitor();
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md ${
                isCancelled
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
            >
              <span>{isAm ? 'የመናኸሪያውን ሁኔታ ተመልከት' : 'Monitor Terminal Details'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {onFindAlternatives && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onFindAlternatives(alert.terminalId);
                }}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
              >
                {isAm ? 'አማራጭ ጉዞዎች' : 'Find Alternatives'}
              </button>
            )}

            {onSnooze && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSnooze(10);
                }}
                className="py-2 px-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-neutral-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
              >
                {isAm ? 'ለ10ደቅ አሸልብ' : 'Snooze 10m'}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

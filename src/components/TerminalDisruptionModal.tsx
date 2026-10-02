import React, { useState, useEffect } from 'react';
import {
  TerminalDisruptionAlert,
  PreferredTerminalSettings,
  Language,
  BusStation,
} from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { terminalMonitorService } from '../services/terminalMonitorService';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  Star,
  BellRing,
  AlertTriangle,
  XOctagon,
  CheckCircle2,
  RefreshCw,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldCheck,
  Building2,
  Radio,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface TerminalDisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectTerminalForBooking?: (terminalId: string) => void;
}

export const TerminalDisruptionModal: React.FC<TerminalDisruptionModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectTerminalForBooking,
}) => {
  if (!isOpen) return null;

  const isAm = lang === 'am';

  const [settings, setSettings] = useState<PreferredTerminalSettings>(
    terminalMonitorService.getSettings()
  );
  const [alerts, setAlerts] = useState<Record<string, TerminalDisruptionAlert>>(
    terminalMonitorService.getAlerts()
  );
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'board' | 'simulator' | 'settings'>('board');
  const [browserPermissionState, setBrowserPermissionState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Subscribe to service updates
  useEffect(() => {
    const unsub = terminalMonitorService.subscribeToAlerts((updated) => {
      setAlerts(updated);
    });
    return () => unsub();
  }, []);

  const preferredStation =
    AMHARA_STATIONS.find((s) => s.id === settings.preferredTerminalId) || AMHARA_STATIONS[0];
  const preferredDisruption = alerts[settings.preferredTerminalId];

  const handleSetPreferred = (stationId: string) => {
    triggerHaptic(15);
    terminalMonitorService.setPreferredTerminal(stationId);
    setSettings(terminalMonitorService.getSettings());
  };

  const handleToggleSetting = (key: keyof PreferredTerminalSettings) => {
    triggerHaptic(10);
    const updated = { ...settings, [key]: !settings[key] };
    terminalMonitorService.updateSettings(updated);
    setSettings(updated);
  };

  const handleRequestPushPermission = async () => {
    triggerHaptic(12);
    const granted = await terminalMonitorService.requestNotificationPermission();
    setBrowserPermissionState(granted ? 'granted' : 'denied');
    setSettings(terminalMonitorService.getSettings());
  };

  // Simulation Actions
  const handleSimulateDelay = (stationId: string) => {
    triggerHaptic(20);
    terminalMonitorService.triggerUnexpectedDelay(
      stationId,
      45,
      isAm
        ? undefined
        : `Terminal Access Road Gridlock: Unexpected +45m Departure Delay`
    );
  };

  const handleSimulateCancellation = (stationId: string) => {
    triggerHaptic(25);
    terminalMonitorService.triggerTerminalCancellation(
      stationId,
      isAm
        ? undefined
        : `SAFETY EMERGENCY: Terminal Operations & Intercity Corridors Temporarily Suspended`
    );
  };

  const handleClearDisruption = (stationId: string) => {
    triggerHaptic(10);
    terminalMonitorService.clearTerminalDisruption(stationId);
  };

  const handleResetAll = () => {
    triggerHaptic(15);
    terminalMonitorService.resetToDefaultDisruptions();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disruption-modal-title"
    >
      <div
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="disruption-modal-title" className="text-base sm:text-lg font-black tracking-tight text-white">
                  {translations[lang].modalTerminalDisruptionTitle || (isAm ? 'የመናኸሪያዎች አገልግሎት መከታተያ ማዕከል' : 'Terminal Disruption & Incident Monitor')}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                  Live Service
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {translations[lang].modalTerminalDisruptionSub || (isAm
                  ? 'የተመረጡ መናኸሪያዎችን ያልተጠበቁ መዘግየቶች እና መሰረዞችን ቀድመው ይወቁ'
                  : 'Proactive delay alerts & terminal cancellation radar for preferred regional stations')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preferred Terminal Highlight Bar */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 p-3.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950">
                  {isAm ? 'የተመረጠ መናኸሪያ (Your Preferred Terminal):' : 'Your Monitored Preferred Terminal:'}
                </span>
                <span className="text-xs font-black text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                  {isAm ? preferredStation.nameAm : preferredStation.name}
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80">
                {preferredDisruption
                  ? preferredDisruption.status === 'cancelled'
                    ? `🚨 ${isAm ? 'መናኸሪያው ለጊዜው ተዘግቷል' : 'Operations suspended'} (${preferredDisruption.headlineEn})`
                    : `⚠️ ${isAm ? 'ያልተጠበቀ መዘግየት' : 'Unexpected delay'} (+${preferredDisruption.expectedDelayMinutes || 45}m)`
                  : `🟢 ${isAm ? 'ሁሉም ጉዞዎች በመደበኛ መርሐ-ግብር እየሰሩ ይገኛሉ' : 'Normal Operations — Departures on schedule'}`}
              </p>
            </div>
          </div>

          {/* Quick Simulation Trigger on Preferred Terminal */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {!preferredDisruption ? (
              <button
                type="button"
                onClick={() => handleSimulateDelay(settings.preferredTerminalId)}
                className="px-2.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                title="Test unexpected delay alert on preferred station"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAm ? 'መዘግየት ሞክር (+45m)' : 'Simulate Delay (+45m)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleClearDisruption(settings.preferredTerminalId)}
                className="px-2.5 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAm ? 'መደበኛ አድርግ' : 'Clear & Restore Normal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 sm:px-6 pt-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'board'
                  ? 'border-emerald-700 text-emerald-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isAm ? 'የመናኸሪያዎች ሁኔታ (15)' : 'All Terminals Radar (15)'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'border-emerald-700 text-emerald-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAm ? 'የሙከራ ሲሙሌተር' : 'Incident Simulator'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-emerald-700 text-emerald-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isAm ? 'የማንቂያ ምርጫዎች' : 'Alert Preferences'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            className="text-[11px] text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1 cursor-pointer pb-2"
            title="Reset alerts to default test dataset"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isAm ? 'ዳግም ጀምር' : 'Reset Alerts'}</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ALL TERMINALS STATUS RADAR */}
          {activeTab === 'board' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-neutral-600">
                  {isAm
                    ? 'የመረጡትን መናኸሪያ ለመቀየር የኮከብ (★) ምልክቱን ይጫኑ።'
                    : 'Click the star (★) to set as your primary monitored terminal.'}
                </p>

                {/* Filter */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-neutral-500">{isAm ? 'አጣራ፡' : 'Filter:'}</span>
                  <select
                    value={selectedStationFilter}
                    onChange={(e) => setSelectedStationFilter(e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="all">{isAm ? 'ሁሉም መናኸሪያዎች (15)' : 'All 15 Terminals'}</option>
                    <option value="disrupted">{isAm ? 'ችግር ያጋጠማቸው ብቻ' : 'Active Disrupted Only'}</option>
                    <option value="normal">{isAm ? 'መደበኛ ብቻ' : 'Normal Status Only'}</option>
                  </select>
                </div>
              </div>

              {/* Station Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AMHARA_STATIONS.filter((st) => {
                  const hasDisruption = !!alerts[st.id];
                  if (selectedStationFilter === 'disrupted') return hasDisruption;
                  if (selectedStationFilter === 'normal') return !hasDisruption;
                  return true;
                }).map((station) => {
                  const alert = alerts[station.id];
                  const isPreferred = station.id === settings.preferredTerminalId;
                  const isCancelled = alert?.status === 'cancelled';
                  const isDelayed = alert?.status === 'delayed';

                  return (
                    <div
                      key={station.id}
                      className={`p-3.5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                        isPreferred
                          ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/50'
                          : alert
                          ? isCancelled
                            ? 'border-rose-300 bg-rose-50/30'
                            : 'border-amber-300 bg-amber-50/20'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        {/* Station Name & Preferred Toggle */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="truncate">
                            <span className="text-xs font-bold text-neutral-900 block truncate">
                              {isAm ? station.nameAm : station.name}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              {isAm ? station.cityAm : station.city} • {station.baysCount} {isAm ? 'በሮች' : 'Bays'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetPreferred(station.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                              isPreferred
                                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-bold'
                                : 'bg-white hover:bg-neutral-100 text-neutral-400 border-neutral-200'
                            }`}
                            title={isPreferred ? 'Currently preferred terminal' : 'Set as preferred terminal'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isPreferred ? 'fill-slate-950' : ''}`} />
                          </button>
                        </div>

                        {/* Status Label */}
                        <div className="mt-2">
                          {isCancelled && alert ? (
                            <div className="p-2 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-900 text-xs space-y-1">
                              <div className="flex items-center gap-1 font-bold">
                                <XOctagon className="w-3.5 h-3.5 text-rose-700" />
                                <span>{isAm ? 'መናኸሪያው ለጊዜው ተዘግቷል' : 'TERMINAL CANCELLATION'}</span>
                              </div>
                              <p className="text-[11px] line-clamp-2 leading-tight">
                                {isAm ? alert.headlineAm : alert.headlineEn}
                              </p>
                            </div>
                          ) : isDelayed && alert ? (
                            <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-200 text-amber-900 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                                  <span>{isAm ? 'ያልተጠበቀ መዘግየት' : 'UNEXPECTED DELAY'}</span>
                                </div>
                                <span className="font-mono text-[11px] bg-amber-300 text-amber-950 px-1.5 py-0.2 rounded font-black">
                                  +{alert.expectedDelayMinutes || 45}m
                                </span>
                              </div>
                              <p className="text-[11px] line-clamp-2 leading-tight">
                                {isAm ? alert.headlineAm : alert.headlineEn}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold py-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>{isAm ? 'መደበኛ የጉዞ መርሐ-ግብር' : 'Normal Schedule Operations'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions at Bottom of Station Card */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs">
                        {onSelectTerminalForBooking && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTerminalForBooking(station.id);
                              onClose();
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                          >
                            {isAm ? 'ጉዞዎችን ፈልግ' : 'View Departures'}
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          {!alert ? (
                            <button
                              type="button"
                              onClick={() => handleSimulateDelay(station.id)}
                              className="text-[10px] font-bold text-neutral-600 hover:text-amber-800 bg-neutral-100 hover:bg-amber-100 px-2 py-0.5 rounded cursor-pointer transition"
                            >
                              +45m Test
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleClearDisruption(station.id)}
                              className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded cursor-pointer transition"
                            >
                              {isAm ? 'አጽዳ' : 'Clear'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INCIDENT SIMULATOR (Immediate Testing) */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{isAm ? 'የሙከራ ሲሙሌተር መመሪያ' : 'Local Mock Monitor Simulator'}</span>
                </span>
                <p className="text-amber-900/90 leading-relaxed">
                  {isAm
                    ? 'ይህ ሲሙሌተር በመረጡት መናኸሪያ ላይ ያልተጠበቀ መዘግየት ወይም ድንገተኛ መሰረዝን በመፍጠር የመተግበሪያውን ቀዳሚ ማንቂያ (Proactive Notification Toast, Audio Chime, Haptics) ወዲያውኑ ለመሞከር ያስችላል።'
                    : 'This simulator lets you trigger unexpected delay spikes or terminal-wide cancellations on any terminal. If the impacted station matches your Preferred Terminal, a proactive push notification will be immediately dispatched!'}
                </p>
              </div>

              {/* Station Selection for simulation */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-700 block">
                  {isAm ? 'የሚሞከርበትን መናኸሪያ ይምረጡ፡' : 'Select Target Terminal to Test:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMHARA_STATIONS.slice(0, 6).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSetPreferred(st.id)}
                      className={`p-2 rounded-xl border text-xs font-bold text-left transition cursor-pointer flex items-center justify-between ${
                        st.id === settings.preferredTerminalId
                          ? 'bg-amber-100 border-amber-500 text-amber-950'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="truncate">{isAm ? st.nameAm : st.name}</span>
                      {st.id === settings.preferredTerminalId && (
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Simulation Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateDelay(settings.preferredTerminalId)}
                    className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <AlertTriangle className="w-5 h-5 text-slate-950" />
                    <span>{isAm ? 'ያልተጠበቀ መዘግየት ፍጠር (+45ደቅ)' : 'Trigger Unexpected Delay (+45m)'}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      Dispatches proactive delay toast
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateCancellation(settings.preferredTerminalId)}
                    className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <XOctagon className="w-5 h-5 text-white" />
                    <span>{isAm ? 'መናኸሪያውን አቋርጥ (Cancel)' : 'Trigger Terminal Cancellation'}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      Emergency terminal closure
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClearDisruption(settings.preferredTerminalId)}
                    className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>{isAm ? 'ሁኔታውን አጽዳ' : 'Clear & Restore Normal'}</span>
                    <span className="text-[10px] font-normal opacity-80">
                      Resets to normal schedule
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & PREFERENCES */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-xl">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  {isAm ? 'የማንቂያ ማሳወቂያ ምርጫዎች' : 'Proactive Notification Preferences'}
                </h3>

                {/* Setting 1: Delays */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {isAm ? 'ያልተጠበቁ መዘግየቶች ማንቂያ' : 'Notify on Unexpected Delays'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {isAm
                        ? 'የተመረጠው መናኸሪያ ከ15 ደቂቃ በላይ መዘግየት ሲያጋጥመው ያሳውቀኝ'
                        : 'Alert when preferred terminal experiences delays > 15 minutes'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('notifyOnDelays')}
                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                      settings.notifyOnDelays ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition ${
                        settings.notifyOnDelays ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 2: Cancellations */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {isAm ? 'ድንገተኛ መሰረዞች ማንቂያ' : 'Notify on Terminal Cancellations'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {isAm
                        ? 'የመናኸሪያ በሮች ሲዘጉ ወይም ጉዞዎች ሲሰረዙ አስቸኳይ ማንቂያ ላክ'
                        : 'Critical alerts when departures or bays are suspended'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('notifyOnCancellations')}
                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                      settings.notifyOnCancellations ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition ${
                        settings.notifyOnCancellations ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 3: Audio Chime */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {isAm ? 'የመናኸሪያ ድምጽ ማንቂያ' : 'Terminal Chime Sound'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {isAm
                        ? 'የመናኸሪያ የድምጽ ቅላጼ በማንቂያ ወቅት ያሰማ'
                        : 'Play transit chime on proactive alerts'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSetting('soundEnabled')}
                    className={`w-10 h-6 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                      settings.soundEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition ${
                        settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 4: Browser Push Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      {isAm ? 'የብራውዘር ፑሽ ማንቂያ' : 'Native Browser Push Notifications'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {browserPermissionState === 'granted'
                        ? isAm ? 'ፈቃድ ተሰጥቷል (Active)' : 'Permission granted'
                        : isAm ? 'ፈቃድ አልተሰጠም' : 'Requires browser permission'}
                    </span>
                  </div>

                  {browserPermissionState !== 'granted' ? (
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition cursor-pointer"
                    >
                      {isAm ? 'ፍቀድ' : 'Allow'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleSetting('browserNotificationsEnabled')}
                      className={`w-10 h-6 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                        settings.browserNotificationsEnabled ? 'bg-emerald-600' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition ${
                          settings.browserNotificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500 font-mono">
            {isAm ? 'አማራ ትራንስፖርት ባለስልጣን ዲጂታል ሞኒተር' : 'Amhara Regional Transport Authority Dispatch'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close Monitor'}
          </button>
        </div>
      </div>
    </div>
  );
};

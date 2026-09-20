import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Bus,
  AlertTriangle,
  Radio,
  BarChart3,
  Users,
  CheckCircle2,
  DollarSign,
  Send,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  Activity,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { Language, UserProfile, AdminAlertNotice, TerminalTrafficStatus } from '../types';
import { INITIAL_ADMIN_ALERTS } from '../data/mockUsers';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { BASE_TERMINAL_TRAFFIC } from '../data/terminalTraffic';
import { triggerHaptic } from '../utils/haptics';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  admin: UserProfile;
  onLogout: () => void;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  lang,
  admin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'terminals' | 'alerts' | 'revenue' | 'fleet'>('terminals');
  const [alerts, setAlerts] = useState<AdminAlertNotice[]>(INITIAL_ADMIN_ALERTS);
  const [stationTraffic, setStationTraffic] = useState<Record<string, TerminalTrafficStatus>>(BASE_TERMINAL_TRAFFIC);

  // New alert form state
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSeverity, setNewSeverity] = useState<'advisory' | 'warning' | 'emergency'>('advisory');
  const [targetStation, setTargetStation] = useState<string>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAm = lang === 'am';

  // Toggle alert active state
  const handleToggleAlert = (id: string) => {
    triggerHaptic(10);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  // Broadcast a new dispatch advisory
  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    triggerHaptic(15);
    const newNotice: AdminAlertNotice = {
      id: `alt-amh-${Date.now().toString().slice(-4)}`,
      severity: newSeverity,
      titleEn: newTitle,
      titleAm: newTitle,
      messageEn: newMessage,
      messageAm: newMessage,
      issuedByStaffId: admin.adminStaffId || 'RTA-AMH-001',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetStations: targetStation === 'all' ? ['all'] : [targetStation],
      isActive: true,
    };

    setAlerts((prev) => [newNotice, ...prev]);
    setNewTitle('');
    setNewMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3500);
  };

  // Quick congestion level adjuster for a terminal
  const handleUpdateCongestion = (stationId: string, level: 'low' | 'moderate' | 'heavy' | 'severe') => {
    triggerHaptic(10);
    setStationTraffic((prev) => {
      const current = prev[stationId];
      if (!current) return prev;
      return {
        ...prev,
        [stationId]: {
          ...current,
          congestionLevel: level,
          lastUpdated: 'Updated by Station Master just now',
        },
      };
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden my-auto transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-rose-900/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  {isAm ? admin.fullNameAm : admin.fullName}
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 border border-rose-700">
                  {admin.adminStaffId} • {admin.accessTier}
                </span>
              </div>
              <p className="text-xs text-rose-200">
                {isAm ? admin.adminDepartmentAm : admin.adminDepartment} • {isAm ? admin.assignedOfficeAm : admin.assignedOffice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(10);
                onLogout();
                onClose();
              }}
              className="text-xs font-bold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {isAm ? 'ውጣ' : 'Logout'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Core Top Metrics Row */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {isAm ? 'የነቁ መናኸሪያዎች' : 'Active Terminals'}
            </span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">
              15 / 15 <span className="text-[10px] font-normal text-slate-300">Online</span>
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {isAm ? 'አውቶቡሶች በጉዞ ላይ' : 'Active Fleet En Route'}
            </span>
            <span className="text-lg font-black font-mono text-amber-400 mt-0.5 block">
              142 <span className="text-[10px] font-normal text-slate-300">Coaches</span>
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {isAm ? 'የዛሬ ተሳፋሪዎች' : 'Bookings Today'}
            </span>
            <span className="text-lg font-black font-mono text-cyan-400 mt-0.5 block">
              4,820 <span className="text-[10px] font-normal text-slate-300">Pax</span>
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {isAm ? 'የሰዓት አከባበር ምጣኔ' : 'On-Time Dispatch'}
            </span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">
              94.8% <span className="text-[10px] font-normal text-slate-300">Pass</span>
            </span>
          </div>
        </div>

        {/* Administration Navigation Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-100 px-4 sm:px-6 shrink-0 gap-2">
          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('terminals');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'terminals'
                ? 'border-rose-600 text-rose-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-rose-600" />
            <span>{isAm ? '15ቱ መናኸሪያዎችና መጫኛ በሮች' : '15 Terminals & Bays'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('alerts');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-rose-600 text-rose-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{isAm ? 'የአደጋና መንገድ ማሳሰቢያዎች' : 'Broadcast Advisories'}</span>
            <span className="bg-rose-100 text-rose-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {alerts.filter((a) => a.isActive).length}
            </span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('revenue');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'revenue'
                ? 'border-rose-600 text-rose-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>{isAm ? 'የገቢ ኦዲት (ቴሌብር / ንግድ ባንክ)' : 'Revenue & Fare Audit'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: TERMINAL STATIONS & BAY MONITOR */}
          {activeTab === 'terminals' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">
                    {isAm ? 'የአማራ ክልል 15 ዋና መናኸሪያዎች የቁጥጥር ሰንጠረዥ' : '15 Amhara Terminal Bays & Flow Control'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {isAm
                      ? 'የመጫኛ በሮች ሙላት፣ የትራፊክ መጨናነቅ እና የቀጥታ መውጫ ፈቃድ'
                      : 'Real-time terminal bay occupancy, approach delays, and gate status.'}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 bg-white px-2.5 py-1 rounded-lg border border-neutral-300">
                  Live Dispatch Grid: Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AMHARA_STATIONS.map((station) => {
                  const traffic = stationTraffic[station.id];
                  const level = traffic ? traffic.congestionLevel : 'low';

                  return (
                    <div
                      key={station.id}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-2xs hover:border-neutral-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                              {isAm ? station.nameAm : station.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500">
                            {station.city} • {station.baysCount} Departure Bays • Alt: {station.elevationM}m
                          </p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            level === 'severe'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : level === 'heavy'
                              ? 'bg-orange-100 text-orange-900 border-orange-300'
                              : level === 'moderate'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {level} flow
                        </span>
                      </div>

                      {traffic && (
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs bg-neutral-50 p-2 rounded-lg mb-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 block uppercase">Queue</span>
                            <span className="font-bold font-mono text-neutral-800">
                              {traffic.queueLengthVehicles} veh
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block uppercase">Approach</span>
                            <span className="font-bold font-mono text-neutral-800">
                              {traffic.approachSpeedKmH} km/h
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block uppercase">Bay Load</span>
                            <span className="font-bold font-mono text-neutral-800">
                              {traffic.bayOccupancyRate}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Admin Quick Congestion Override */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                        <span className="text-neutral-500 font-medium">{isAm ? 'ሁኔታ ቀይር፡' : 'Override:'}</span>
                        <div className="flex items-center gap-1">
                          {(['low', 'moderate', 'heavy', 'severe'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => handleUpdateCongestion(station.id, lvl)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                level === lvl
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                              }`}
                            >
                              {lvl[0].toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BROADCAST ADVISORIES & EMERGENCY DISPATCH */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {/* Broadcast Form */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 mb-2">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>{isAm ? 'አዲስ የቀጥታ ትራንስፖርት ማሳሰቢያ ይላኩ' : 'Broadcast Regional Highway Advisory'}</span>
                </h3>
                <form onSubmit={handleBroadcastAlert} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder={
                          isAm
                            ? 'የማሳሰቢያው ርዕስ (e.g. በደብረ ማርቆስ-ባሕር ዳር መስመር ላይ ከባድ ዝናብ)'
                            : 'Advisory headline (e.g. Heavy rainfall reported on Debre Markos-Bahir Dar)'
                        }
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      >
                        <option value="advisory">Advisory (Notice)</option>
                        <option value="warning">Warning (Caution)</option>
                        <option value="emergency">Emergency (Closure)</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      isAm
                        ? 'ዝርዝር መመሪያዎችን ለአሽከርካሪዎችና ተሳፋሪዎች እዚህ ይጻፉ...'
                        : 'Detailed instructions for operators, drivers, and waiting passengers...'
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-medium">Target:</span>
                      <select
                        value={targetStation}
                        onChange={(e) => setTargetStation(e.target.value)}
                        className="px-2 py-1 bg-white border border-neutral-300 rounded-lg text-xs"
                      >
                        <option value="all">All 15 Amhara Terminals</option>
                        {AMHARA_STATIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.city} ({s.name})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAm ? 'ይሰራጭ' : 'Broadcast Dispatch'}</span>
                    </button>
                  </div>
                </form>

                {broadcastSuccess && (
                  <p className="text-xs text-emerald-800 font-bold mt-2 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isAm ? 'ማሳሰቢያው በሁሉም ተርሚናሎችና መተግበሪያ ላይ ተሰራጭቷል!' : 'Advisory broadcast live across the regional network!'}</span>
                  </p>
                )}
              </div>

              {/* Active Advisories List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  {isAm ? 'አሁን በስራ ላይ ያሉ ማሳሰቢያዎች' : 'Active Broadcast Advisories'} ({alerts.length})
                </h4>

                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                      alert.isActive ? 'bg-white border-neutral-300 shadow-2xs' : 'bg-neutral-100 border-neutral-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          alert.severity === 'emergency'
                            ? 'bg-rose-600 text-white'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900">{isAm ? alert.titleAm : alert.titleEn}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                            {alert.issuedAt}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                          {isAm ? alert.messageAm : alert.messageEn}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                          Staff ID: {alert.issuedByStaffId} • Target: {alert.targetStations.join(', ')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAlert(alert.id)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0 ${
                        alert.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                      }`}
                    >
                      {alert.isActive ? (isAm ? 'ንቁ ✅' : 'Active') : (isAm ? 'የጠፋ ✖' : 'Archived')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE AUDIT (TELEBIRR & CBE BIRR) */}
          {activeTab === 'revenue' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-900 text-sm">
                    {isAm ? 'የዛሬው የትራንስፖርት ክፍያ ገቢ ሪፖርት' : 'Daily Regional Fare Collection Audit'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Telebirr / CBE Gateway
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {isAm
                    ? 'በቴሌብር፣ በንግድ ባንክ ብር (CBE Birr) እና በአዋሽ ባንክ የተሰበሰቡ የቲኬት ክፍያዎች'
                    : 'Aggregated digital ticketing transactions across 15 Amhara intercity terminals.'}
                </p>
              </div>

              {/* Revenue Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Telebirr Collections</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">1,048,832 ETB</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">68% of digital volume</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">CBE Birr Collections</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">370,176 ETB</span>
                  <span className="text-[11px] text-purple-600 font-semibold">24% of digital volume</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Terminal Station Cash</span>
                  <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">123,392 ETB</span>
                  <span className="text-[11px] text-amber-600 font-semibold">8% physical counter</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-200 uppercase font-semibold">Total Revenue Transport Bureau</span>
                  <h3 className="text-2xl font-black font-mono text-amber-300 mt-0.5">1,542,400 ETB</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-200 block">4,820 Tickets Audited</span>
                  <span className="text-[11px] text-emerald-300">Gov Transport Levy: 46,272 ETB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t border-neutral-200 px-5 py-3 shrink-0 flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1 font-medium">
            <Building2 className="w-4 h-4 text-rose-600" />
            <span>{isAm ? 'የአማራ ክልል ትራንስፖርት ባለስልጣን ቁጥጥር' : 'Amhara Regional Transport Authority Dispatch Command'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close Command Center'}
          </button>
        </div>
      </div>
    </div>
  );
};

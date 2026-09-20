import React, { useState } from 'react';
import {
  X,
  Bus,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  Phone,
  AlertTriangle,
  UserCheck,
  Send,
  Navigation,
  Gauge,
  Luggage,
  Sparkles,
  RefreshCw,
  MapPin,
  FileCheck2,
  Car,
} from 'lucide-react';
import { Language, UserProfile, PassengerManifestItem, VehicleReadinessChecklist, RideTrip } from '../types';
import { INITIAL_DRIVER_MANIFEST, INITIAL_VEHICLE_CHECKLIST } from '../data/mockUsers';
import { triggerHaptic } from '../utils/haptics';

interface DriverPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  driver: UserProfile;
  activeTrip?: RideTrip | null;
  onLogout: () => void;
}

export const DriverPortalModal: React.FC<DriverPortalModalProps> = ({
  isOpen,
  onClose,
  lang,
  driver,
  activeTrip,
  onLogout,
}) => {
  const [manifest, setManifest] = useState<PassengerManifestItem[]>(INITIAL_DRIVER_MANIFEST);
  const [checklist, setChecklist] = useState<VehicleReadinessChecklist>(INITIAL_VEHICLE_CHECKLIST);
  const [vehicleStatus, setVehicleStatus] = useState<'boarding' | 'departing' | 'en_route' | 'arrived'>('boarding');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [manualTicketInput, setManualTicketInput] = useState<string>('');
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);
  const [delayNotice, setDelayNotice] = useState<string>('');
  const [delaySubmitted, setDelaySubmitted] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'manifest' | 'checklist' | 'telemetry'>('manifest');

  if (!isOpen) return null;

  const isAm = lang === 'am';

  // Calculate passenger counts
  const totalPassengers = manifest.reduce((acc, p) => acc + p.seatNumbers.length, 0);
  const boardedPassengers = manifest
    .filter((p) => p.boarded)
    .reduce((acc, p) => acc + p.seatNumbers.length, 0);
  const boardedPercent = Math.round((boardedPassengers / Math.max(1, totalPassengers)) * 100);

  // Toggle passenger boarding
  const handleToggleBoarding = (ticketId: string) => {
    triggerHaptic(12);
    setManifest((prev) =>
      prev.map((item) => {
        if (item.ticketId === ticketId) {
          const newStatus = !item.boarded;
          return {
            ...item,
            boarded: newStatus,
            boardedAt: newStatus ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return item;
      })
    );
  };

  // Quick QR Scan ticket validation
  const handleScanTicket = (ticketCode?: string) => {
    const codeToVerify = (ticketCode || manualTicketInput || 'ETH-AMH-784108').trim();
    triggerHaptic(15);

    const found = manifest.find((p) => p.ticketId.toLowerCase() === codeToVerify.toLowerCase());

    if (found) {
      if (found.boarded) {
        setScanSuccessMessage(
          isAm
            ? `⚠️ ተሳፋሪ ${found.passengerName} አስቀድመው ተሳፍረዋል!`
            : `⚠️ Passenger ${found.passengerName} is already checked in!`
        );
      } else {
        handleToggleBoarding(found.ticketId);
        setScanSuccessMessage(
          isAm
            ? `✅ ትኬት ${found.ticketId} ተረጋግጧል! ተሳፋሪ: ${found.passengerName} (ወንበር ${found.seatNumbers.join(', ')})`
            : `✅ Ticket ${found.ticketId} verified! Passenger: ${found.passengerName} (Seat ${found.seatNumbers.join(', ')})`
        );
      }
    } else {
      setScanSuccessMessage(
        isAm
          ? `❌ ትኬት "${codeToVerify}" በዚህ አውቶቡስ ዝርዝር ውስጥ አልተገኘም!`
          : `❌ Ticket "${codeToVerify}" not found on this trip manifest!`
      );
    }

    setManualTicketInput('');
    setTimeout(() => setScanSuccessMessage(null), 4000);
  };

  // Toggle vehicle checklist items
  const handleToggleChecklist = (key: keyof VehicleReadinessChecklist) => {
    triggerHaptic(10);
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  const handleReportDelay = () => {
    if (!delayNotice.trim()) return;
    triggerHaptic(15);
    setDelaySubmitted(true);
    setTimeout(() => {
      setDelayNotice('');
      setDelaySubmitted(false);
    }, 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden my-auto transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Driver Console Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Bus className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  {isAm ? driver.fullNameAm : driver.fullName}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-900 text-amber-200 border border-amber-600">
                  {driver.driverLicenseNumber || 'CDL-DRIVER'}
                </span>
              </div>
              <p className="text-xs text-amber-200">
                {driver.companyName} • {isAm ? driver.terminalBaseAm : driver.terminalBase} • Plate:{' '}
                <strong className="text-white font-mono">{driver.assignedPlateNumber}</strong>
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
              className="text-xs font-bold text-amber-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition cursor-pointer"
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

        {/* Active Trip Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-bold text-amber-950 block">
                {isAm ? 'የቀጥታ ጉዞ፡ ባሕር ዳር (ጣና መናኸሪያ) ➔ ጎንደር (አዘዞ)' : 'Active Run: Bahir Dar (Bay #4) ➔ Gondar (Azezo Terminal)'}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                {isAm ? 'የመነሻ ሰዓት፡ 06:30 AM • ርቀት፡ 175 ኪ.ሜ • መስመር 3 (A3)' : 'Scheduled Departure: 06:30 AM • Distance: 175 km • Route 3 (A3)'}
              </span>
            </div>
          </div>

          {/* Vehicle Departure State Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-300 text-xs">
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('boarding');
                setCurrentSpeed(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'boarding'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'መጫኛ በር (Boarding)' : 'At Bay (Boarding)'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('departing');
                setCurrentSpeed(15);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'departing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'መነሳት (Departed)' : 'Gate Clearance'}
            </button>
            <button
              onClick={() => {
                triggerHaptic(10);
                setVehicleStatus('en_route');
                setCurrentSpeed(78);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                vehicleStatus === 'en_route'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {isAm ? 'በጉዞ ላይ (En Route)' : 'En Route (Highway)'}
            </button>
          </div>
        </div>

        {/* Sub-Tabs: Manifest | Inspection Checklist | En Route Telemetry */}
        <div className="flex border-b border-neutral-200 bg-neutral-100 px-4 sm:px-6 shrink-0 gap-2">
          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('manifest');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeSubTab === 'manifest'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>{isAm ? 'የተሳፋሪዎች ዝርዝር (Manifest)' : 'Passenger Manifest'}</span>
            <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
              {boardedPassengers}/{totalPassengers}
            </span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('checklist');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeSubTab === 'checklist'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>{isAm ? 'የተሸከርካሪ ደህንነት ፍተሻ' : 'Vehicle Safety Checklist'}</span>
            {allChecksPassed ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic(8);
              setActiveSubTab('telemetry');
            }}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeSubTab === 'telemetry'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Gauge className="w-4 h-4 text-blue-600" />
            <span>{isAm ? 'የፍጥነትና መንገድ ሁኔታ' : 'Route & Road Telemetry'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: PASSENGER MANIFEST & QR VERIFICATION */}
          {activeSubTab === 'manifest' && (
            <div className="space-y-4">
              {/* Boarding stats card & Quick QR Validator */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-neutral-700">
                      {isAm ? 'የተሳፋሪዎች መሳፈር ሁኔታ' : 'Boarding Readiness Progress'}
                    </span>
                    <span className="text-xs font-bold text-amber-900">{boardedPercent}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${boardedPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {boardedPassengers} {isAm ? 'ተሳፍረዋል' : 'Boarded'} • {totalPassengers - boardedPassengers}{' '}
                    {isAm ? 'ይቀራሉ' : 'Pending at Bay'}
                  </p>
                </div>

                {/* Quick QR Ticket Scanner Input */}
                <div className="md:col-span-7 flex items-center gap-2">
                  <div className="relative flex-1">
                    <QrCode className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={manualTicketInput}
                      onChange={(e) => setManualTicketInput(e.target.value)}
                      placeholder={isAm ? 'ትኬት ቁጥር ወይም QR ይቃኙ (e.g. ETH-AMH-784108)' : 'Scan ticket or type ID (e.g. ETH-AMH-784108)'}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleScanTicket()}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ትኬት ፈትሽ' : 'Verify QR'}</span>
                  </button>
                  <button
                    onClick={() => handleScanTicket('ETH-AMH-784108')}
                    className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold px-2.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                    title={isAm ? 'የሙከራ ትኬት መቃኛ' : 'Demo Scan Next'}
                  >
                    {isAm ? 'ቀጣይ' : 'Demo'}
                  </button>
                </div>
              </div>

              {scanSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 animate-in fade-in flex items-center justify-between">
                  <span>{scanSuccessMessage}</span>
                  <button onClick={() => setScanSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-950">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Manifest Passenger Table */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>{isAm ? 'የተሳፋሪዎች ስም ዝርዝር' : 'Passenger Manifest (Bay #4 Coach)'}</span>
                  <span className="text-neutral-500">{manifest.length} Registered Bookings</span>
                </div>

                <div className="divide-y divide-neutral-200 text-xs">
                  {manifest.map((passenger) => (
                    <div
                      key={passenger.ticketId}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        passenger.boarded ? 'bg-emerald-50/40' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleBoarding(passenger.ticketId)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 mt-0.5 ${
                            passenger.boarded
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-neutral-400 text-transparent hover:border-emerald-600'
                          }`}
                          title={isAm ? 'የቦርዲንግ ሁኔታ ይቀይሩ' : 'Toggle boarded status'}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 text-sm">{passenger.passengerName}</span>
                            <span className="font-mono text-[10px] text-neutral-500">#{passenger.ticketId}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                              Seat {passenger.seatNumbers.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{passenger.passengerPhone}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Luggage className="w-3 h-3 text-neutral-400" />
                              <span>{passenger.luggageCount} Bags</span>
                            </span>
                            <span className="font-mono text-neutral-400">ID: {passenger.nationalIdOrPassport}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {passenger.boarded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isAm ? 'ተሳፍረዋል' : 'Boarded'} ({passenger.boardedAt || '06:15 AM'})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleBoarding(passenger.ticketId)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-xs"
                          >
                            {isAm ? 'አሳፍር (Check In)' : 'Check In'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE-TRIP VEHICLE READINESS INSPECTION */}
          {activeSubTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-900 text-sm">
                    {isAm ? 'የአማራ ትራንስፖርት ባለስልጣን የቅድመ-ጉዞ ደህንነት ፍተሻ' : 'Regional Transport Authority Pre-Trip Inspection'}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      allChecksPassed
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {allChecksPassed
                      ? isAm ? 'ለመነሳት ዝግጁ ✅' : 'Road Ready ✅'
                      : isAm ? 'ያልተጠናቀቀ ፍተሻ ⚠️' : 'Incomplete ⚠️'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {isAm
                    ? 'አውቶቡሱ ከመናኸሪያው መጫኛ በር ከመውጣቱ በፊት በሹፌሩ እና በመናኸሪያው ተቆጣጣሪ መረጋገጥ አለበት።'
                    : 'Must be verified by operator and terminal gate supervisor before dispatching onto highway corridors.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: 'tiresInspection' as const,
                    titleEn: 'Tire Pressure & Tread Depth',
                    titleAm: 'የጎማ አየር ግፊትና የጥርስ ጥልቀት',
                    descEn: 'All 6 coach tires inspected for mountain highway safety.',
                  },
                  {
                    key: 'brakesAndFluid' as const,
                    titleEn: 'Air Brakes & Brake Fluid',
                    titleAm: 'የፍሬን አየርና ፈሳሽ ደረጃ',
                    descEn: 'Dual-circuit air pressure tested above 8.5 bar.',
                  },
                  {
                    key: 'engineAndCoolant' as const,
                    titleEn: 'Engine Oil & Radiator Coolant',
                    titleAm: 'የሞተር ዘይትና ራዲያተር ውሃ',
                    descEn: 'Checked for steep grades on Lake Tana / Simien passes.',
                  },
                  {
                    key: 'emergencyKitAndExtinguisher' as const,
                    titleEn: 'First Aid Kit & Fire Extinguisher',
                    titleAm: 'የመጀመሪያ እርዳታ ሳጥንና የእሳት ማጥፊያ',
                    descEn: 'Certified ABC powder canister and trauma medical pack.',
                  },
                  {
                    key: 'gpsTransponderOnline' as const,
                    titleEn: 'GPS Telemetry Transponder',
                    titleAm: 'የጂፒኤስ ራዳር ትራንስፖንደር',
                    descEn: 'Broadcasting live speed and coordinates to Regional Dispatch.',
                  },
                  {
                    key: 'terminalSecurityPermitSigned' as const,
                    titleEn: 'Terminal Gate Dispatch Permit',
                    titleAm: 'የመናኸሪያው የደህንነት መውጫ ፍቃድ',
                    descEn: 'Signed manifest stamped by Bahir Dar Station Master.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleToggleChecklist(item.key)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      checklist[item.key]
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-white border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 ${
                        checklist[item.key] ? 'bg-emerald-600 text-white' : 'border border-neutral-400 bg-white'
                      }`}
                    >
                      {checklist[item.key] && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{isAm ? item.titleAm : item.titleEn}</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE & ROAD TELEMETRY / DELAY REPORTING */}
          {activeSubTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Telemetry Gauge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'የአሁኑ ፍጥነት' : 'Current Speed'}
                  </span>
                  <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">
                    {currentSpeed} <span className="text-xs font-normal text-slate-300">km/h</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Limit: 80 km/h (A3)</span>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'ቀጣይ ጣቢያ' : 'Next Milestone'}
                  </span>
                  <span className="text-sm font-bold text-white mt-1.5 block">Wereta Junction (ወረታ)</span>
                  <span className="text-[10px] text-emerald-400">ETA 07:15 AM (55 km)</span>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {isAm ? 'የመንገድ ሁኔታ' : 'Corridor Condition'}
                  </span>
                  <span className="text-sm font-bold text-white mt-1.5 block">Smooth &amp; Dry</span>
                  <span className="text-[10px] text-slate-400">Elevation: 1,820m</span>
                </div>
              </div>

              {/* Report Delay to Station Dispatch */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{isAm ? 'ለመናኸሪያው የቁጥጥር ማዕከል ማሳወቂያ ይላኩ' : 'Report Delay or Road Advisory to Dispatch'}</span>
                </h3>
                <p className="text-xs text-neutral-600 mb-3">
                  {isAm
                    ? 'የመንገድ መዘጋት፣ ጭጋግ ወይም የተሸከርካሪ መዘግየት ሲያጋጥም ወዲያውኑ ለተሳፋሪዎችና ለጣቢያ አስተዳደር ይላካል።'
                    : 'Notifies terminal station masters and sends live push notifications to waiting passengers.'}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={delayNotice}
                    onChange={(e) => setDelayNotice(e.target.value)}
                    placeholder={
                      isAm
                        ? 'e.g. በወረታ አቅራቢያ የ15 ደቂቃ የመንገድ ጥገና መዘግየት አለ...'
                        : 'e.g. Expecting 15 min slowdown near Wereta due to roadworks...'
                    }
                    className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={handleReportDelay}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAm ? 'አሳውቅ' : 'Transmit'}</span>
                  </button>
                </div>

                {delaySubmitted && (
                  <p className="text-xs text-emerald-800 font-bold mt-2 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isAm ? 'ማሳሰቢያው ለጣቢያ አስተዳደር ተልኳል!' : 'Advisory successfully transmitted to Regional Dispatch!'}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 border-t border-neutral-200 px-5 py-3 shrink-0 flex items-center justify-between text-xs text-neutral-600">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isAm ? 'የአማራ ትራንስፖርት ባለስልጣን የሹፌር ፖርታል' : 'Amhara Transport Authority Operator Console'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg text-xs transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close Console'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RideTrip, BusStation, Language } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import {
  Radio,
  Bus,
  Gauge,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Navigation,
} from 'lucide-react';

interface LiveBusTrackerProps {
  lang: Language;
  trips: RideTrip[];
  onBookTrip: (trip: RideTrip) => void;
  onViewTripOnMap: (fromId: string, toId: string) => void;
}

export const LiveBusTracker: React.FC<LiveBusTrackerProps> = ({
  lang,
  trips,
  onBookTrip,
  onViewTripOnMap,
}) => {
  const t = translations[lang];

  // Active simulated telemetry state
  const [telemetry, setTelemetry] = useState<
    { tripId: string; progress: number; speed: number; lastPoint: string }[]
  >([
    { tripId: 'trip-bd-gon-1', progress: 35, speed: 68, lastPoint: 'Wereta Junction' },
    { tripId: 'trip-des-db-1', progress: 68, speed: 72, lastPoint: 'Termaber Tunnel Entrance' },
    { tripId: 'trip-bd-dm-1', progress: 52, speed: 64, lastPoint: 'Finote Selam Station Bypass' },
    { tripId: 'trip-dm-db-1', progress: 82, speed: 58, lastPoint: 'Gohatsion Gorge Ascent' },
  ]);

  const [isSimulating, setIsSimulating] = useState(true);

  // Interval timer for real-time telemetry simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTelemetry((prev) =>
        prev.map((item) => {
          let nextProgress = item.progress + 1.2;
          if (nextProgress >= 100) nextProgress = 5; // loop route

          // Speed fluctuation around realistic average
          const speedVariance = Math.floor(Math.random() * 9) - 4;
          const nextSpeed = Math.min(85, Math.max(50, item.speed + speedVariance));

          return {
            ...item,
            progress: nextProgress,
            speed: nextSpeed,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const getStationById = (id: string) => AMHARA_STATIONS.find((s) => s.id === id);

  return (
    <div className="space-y-5">
      {/* Radar Overview Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {lang === 'en'
                  ? 'Real-Time Intercity Bus Telemetry'
                  : 'የቀጥታ የአውቶቡሶች መከታተያ ራዳር'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t.liveRadarTitle}
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              {t.liveRadarSub}
            </p>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'en' ? 'Pause Radar' : 'አፍታ አቁም'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'en' ? 'Resume Radar' : 'ቀጥል'}</span>
                </>
              )}
            </button>

            <button
              onClick={() =>
                setTelemetry((prev) =>
                  prev.map((i) => ({ ...i, progress: 10 }))
                )
              }
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Reset Simulator"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global summary stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {lang === 'en' ? 'Active En-Route Buses' : 'በመንገድ ላይ ያሉ አውቶቡሶች'}
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              4 Express Coaches
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {lang === 'en' ? 'Average Highway Speed' : 'አማካኝ የፍጥነት መጠን'}
            </span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              66.5 km/h
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {lang === 'en' ? 'High Altitude Mountain Pass' : 'ከፍተኛው የተራራ ማለፊያ'}
            </span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              Termaber (3,120m)
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block">
              {lang === 'en' ? 'Dispatch Security Status' : 'የትራንስፖርት ደህንነት'}
            </span>
            <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Normal 100%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Buses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {telemetry.map((item) => {
          const trip = trips.find((t) => t.id === item.tripId);
          if (!trip) return null;

          const s1 = getStationById(trip.fromStationId);
          const s2 = getStationById(trip.toStationId);

          return (
            <div
              key={item.tripId}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-emerald-300 transition duration-150 space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-bold text-base text-neutral-900">
                      {lang === 'en' ? trip.busCompany : trip.busCompanyAm}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                    <span className="font-mono font-medium">{trip.plateNumber}</span>
                    <span>•</span>
                    <span>{trip.vehicleType}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                    <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.speed} km/h</span>
                  </div>
                </div>
              </div>

              {/* Highway Corridor */}
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-600 uppercase font-semibold block">
                    {lang === 'en' ? 'From Terminal' : 'መነሻ'}
                  </span>
                  <span className="font-bold text-neutral-900">
                    {s1 ? (lang === 'en' ? s1.city : s1.cityAm) : ''}
                  </span>
                </div>

                <div className="text-center px-2">
                  <ArrowRight className="w-4 h-4 text-emerald-700 mx-auto" />
                  <span className="text-[10px] font-mono text-neutral-600">
                    {trip.durationFormatted}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-600 uppercase font-semibold block">
                    {lang === 'en' ? 'Destination' : 'መድረሻ'}
                  </span>
                  <span className="font-bold text-neutral-900">
                    {s2 ? (lang === 'en' ? s2.city : s2.cityAm) : ''}
                  </span>
                </div>
              </div>

              {/* Real-time Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Passing: </span>
                    <strong className="text-neutral-800">{item.lastPoint}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {Math.round(item.progress)}% completed
                  </span>
                </div>

                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-700"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Driver & Safety status */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <div className="text-neutral-500">
                  <span>{lang === 'en' ? 'Captain: ' : 'አሽከርካሪ፡ '}</span>
                  <span className="font-medium text-neutral-800">
                    {trip.driverName.split('(')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewTripOnMap(trip.fromStationId, trip.toStationId)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition cursor-pointer text-xs"
                  >
                    {lang === 'en' ? 'Track on Map' : 'በካርታ እይ'}
                  </button>

                  <button
                    onClick={() => onBookTrip(trip)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition cursor-pointer text-xs"
                  >
                    {lang === 'en' ? 'Book Seat' : 'ቦታ ያዝ'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

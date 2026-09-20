import React, { useState } from 'react';
import { RideShareOffer, BusStation, Language, DriverContactContext } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import {
  Users,
  Car,
  PlusCircle,
  Phone,
  Calendar,
  Clock,
  Luggage,
  Wind,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface RideSharePoolProps {
  lang: Language;
  offers: RideShareOffer[];
  onOpenPostRide: () => void;
  onBookOffer: (offer: RideShareOffer) => void;
  onContactDriver?: (context: DriverContactContext) => void;
}

export const RideSharePool: React.FC<RideSharePoolProps> = ({
  lang,
  offers,
  onOpenPostRide,
  onBookOffer,
  onContactDriver,
}) => {
  const t = translations[lang];
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const getStationById = (id: string) => AMHARA_STATIONS.find((s) => s.id === id);

  const filteredOffers = offers.filter((o) => {
    const matchesFrom = !filterFrom || o.fromStationId === filterFrom;
    const matchesTo = !filterTo || o.toStationId === filterTo;
    return matchesFrom && matchesTo;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-amber-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>
                {lang === 'en'
                  ? 'Community Carpooling & Minibus Seat Share'
                  : 'የአማራ ከተሞች የጋራ ሚኒባስ እና መኪና መጋራት'}
              </span>
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'en'
                ? 'Amhara Intercity Ride-Share Pool'
                : 'የጋራ ጉዞዎች እና ክፍት ወንበሮች ሰሌዳ'}
            </h2>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {lang === 'en'
                ? 'Connect with verified local drivers and minibus operators departing from official Amhara bus stations. Split fuel costs, travel faster, and travel together.'
                : 'ከመናኸሪያዎች የሚነሱ ታማኝ አሽከርካሪዎችን እና ሚኒባሶችን ያግኙ፤ የነዳጅ ወጪ ተጋርተው በፍጥነት ይጓዙ።'}
            </p>
          </div>

          <div>
            <button
              onClick={onOpenPostRide}
              className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.postRide}</span>
            </button>
          </div>
        </div>

        {/* Station Filter bar inside hero */}
        <div className="mt-6 pt-5 border-t border-amber-700/50 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <div>
            <label className="text-[11px] text-amber-200 block mb-1 font-medium">
              {t.fromStation}
            </label>
            <select
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 text-white border border-amber-600/40 focus:outline-hidden cursor-pointer"
            >
              <option value="">{t.selectStation} (All)</option>
              {AMHARA_STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'en' ? s.city : s.cityAm} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-amber-200 block mb-1 font-medium">
              {t.toStation}
            </label>
            <select
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 text-white border border-amber-600/40 focus:outline-hidden cursor-pointer"
            >
              <option value="">{t.selectStation} (All)</option>
              {AMHARA_STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {lang === 'en' ? s.city : s.cityAm} ({s.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <span>{filteredOffers.length} {lang === 'en' ? 'rideshare offers open' : 'ክፍት የጋራ ጉዞዎች'}</span>
          <span>{lang === 'en' ? 'Departures from Station Bays' : 'ከመናኸሪያ በሮች የሚነሱ'}</span>
        </div>

        {filteredOffers.map((offer) => {
          const s1 = getStationById(offer.fromStationId);
          const s2 = getStationById(offer.toStationId);

          return (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition duration-150"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Driver & Vehicle */}
                <div className="space-y-1.5 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-neutral-900">
                      {offer.driverName}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 font-medium">
                    {offer.vehicleModel}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                      {offer.plateNumber}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {offer.driverPhone}
                    </span>
                  </div>

                  {onContactDriver && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(12);
                        onContactDriver({
                          driverName: offer.driverName,
                          driverPhone: offer.driverPhone,
                          driverRating: 4.8,
                          vehiclePlate: offer.plateNumber,
                          vehicleType: 'Rideshare Carpool',
                          companyOrModel: offer.vehicleModel,
                          routeTitle: `${s1 ? (lang === 'en' ? s1.city : s1.cityAm) : ''} ➔ ${s2 ? (lang === 'en' ? s2.city : s2.cityAm) : ''}`,
                          departureTime: offer.departureTime,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 px-2.5 py-1 rounded-lg border border-teal-300 transition cursor-pointer active:scale-95 shadow-2xs mt-1"
                      title={lang === 'en' ? 'Chat or SMS with driver' : 'ከአሽከርካሪው ጋር በChat ወይም SMS ተወያይ'}
                    >
                      <MessageSquare className="w-3 h-3 text-teal-700" />
                      <span>{lang === 'en' ? 'Chat / SMS Driver' : 'የአሽከርካሪ ውይይት'}</span>
                    </button>
                  )}
                </div>

                {/* Center: Route, Time, and Notes */}
                <div className="flex-1 bg-amber-50/40 p-3.5 rounded-xl border border-amber-200/60">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">
                        {lang === 'en' ? 'Pick-up Station' : 'መነሻ መናኸሪያ'}
                      </span>
                      <span className="text-sm font-extrabold text-neutral-900">
                        {s1 ? (lang === 'en' ? s1.city : s1.cityAm) : ''}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        {s1 ? (lang === 'en' ? s1.name : s1.nameAm) : ''}
                      </span>
                    </div>

                    <div className="text-center px-2">
                      <Car className="w-5 h-5 text-amber-700 mx-auto" />
                      <span className="text-[10px] text-amber-800 font-mono font-bold">
                        {offer.departureTime}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold block">
                        {lang === 'en' ? 'Drop-off Station' : 'መድረሻ መናኸሪያ'}
                      </span>
                      <span className="text-sm font-extrabold text-neutral-900">
                        {s2 ? (lang === 'en' ? s2.city : s2.cityAm) : ''}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        {s2 ? (lang === 'en' ? s2.name : s2.nameAm) : ''}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 bg-white/80 p-2 rounded-lg border border-amber-100 italic">
                    "{offer.notes}"
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Luggage className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{offer.luggageSpace} Luggage</span>
                    </span>
                    {offer.acAvailable && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          ❄ Air Conditioned
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="text-neutral-400">{offer.postedAt}</span>
                  </div>
                </div>

                {/* Right: Price & Claim */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 min-w-[160px]">
                  <div className="text-left lg:text-right">
                    <span className="text-xl font-extrabold text-emerald-800 font-mono">
                      {offer.pricePerSeatETB} ETB
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      {offer.availableSeats} {t.seatsLeft}
                    </span>
                  </div>

                  <button
                    onClick={() => onBookOffer(offer)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t.instantBook}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

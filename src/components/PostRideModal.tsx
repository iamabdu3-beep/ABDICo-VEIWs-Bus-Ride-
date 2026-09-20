import React, { useState } from 'react';
import { BusStation, RideShareOffer, Language } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import { X, PlusCircle, CheckCircle2, Car, Phone, User, Calendar, Clock, Luggage } from 'lucide-react';

interface PostRideModalProps {
  lang: Language;
  onClose: () => void;
  onAddRide: (offer: RideShareOffer) => void;
}

export const PostRideModal: React.FC<PostRideModalProps> = ({
  lang,
  onClose,
  onAddRide,
}) => {
  const t = translations[lang];

  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+251 9');
  const [vehicleModel, setVehicleModel] = useState('Toyota HiAce Dolphin Minibus');
  const [plateNumber, setPlateNumber] = useState('ET 03-');
  const [fromStationId, setFromStationId] = useState(AMHARA_STATIONS[0].id);
  const [toStationId, setToStationId] = useState(AMHARA_STATIONS[1].id);
  const [departureDate, setDepartureDate] = useState('Today');
  const [departureTime, setDepartureTime] = useState('02:00 PM');
  const [availableSeats, setAvailableSeats] = useState(4);
  const [pricePerSeatETB, setPricePerSeatETB] = useState(250);
  const [luggageSpace, setLuggageSpace] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [notes, setNotes] = useState('');
  const [acAvailable, setAcAvailable] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || driverPhone.length < 10) return;

    const newOffer: RideShareOffer = {
      id: `share-${Date.now()}`,
      driverName,
      driverPhone,
      vehicleModel,
      plateNumber,
      fromStationId,
      toStationId,
      departureDate,
      departureTime,
      availableSeats,
      pricePerSeatETB,
      luggageSpace,
      notes: notes || 'Direct ride between station terminals. Telebirr accepted.',
      acAvailable,
      postedAt: 'Just now',
    };

    onAddRide(newOffer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'en'
                ? 'Community Transport & Empty Seat Sharing'
                : 'የማህበረሰብ የጋራ ትራንስፖርት'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            {t.postRideModalTitle}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.postRideModalSub}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Driver Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.driverName} *
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Dawit Hailu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.driverPhone} *
              </label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+251 91 234 5678"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Vehicle & Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.vehicleModel} *
              </label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Toyota HiAce Dolphin / Suzuki"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {lang === 'en' ? 'Plate Number' : 'የሰሌዳ ቁጥር'} *
              </label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="ET 03-B48100"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* From & To Stations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.fromStation} *
              </label>
              <select
                value={fromStationId}
                onChange={(e) => setFromStationId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {AMHARA_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {lang === 'en' ? st.city : st.cityAm} ({st.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.toStation} *
              </label>
              <select
                value={toStationId}
                onChange={(e) => setToStationId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {AMHARA_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {lang === 'en' ? st.city : st.cityAm} ({st.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seats, Price, Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.availableSeatsInput}
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={availableSeats}
                onChange={(e) => setAvailableSeats(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.pricePerSeatInput}
              </label>
              <input
                type="number"
                min={20}
                max={2000}
                value={pricePerSeatETB}
                onChange={(e) => setPricePerSeatETB(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.departureTimeInput}
              </label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="02:30 PM"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Luggage space & AC toggle */}
          <div className="grid grid-cols-2 gap-3 items-center pt-1">
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">
                {t.luggageSpace}
              </label>
              <select
                value={luggageSpace}
                onChange={(e) => setLuggageSpace(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white"
              >
                <option value="Small">Small Backpacks Only</option>
                <option value="Medium">Medium Travel Bags</option>
                <option value="Large">Large Suitcases & Sacks</option>
              </select>
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acAvailable}
                  onChange={(e) => setAcAvailable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-semibold text-neutral-800">
                  {lang === 'en' ? 'Air Conditioning / AC' : 'ኤሲ አለው'}
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-neutral-800 block mb-1">
              {lang === 'en' ? 'Notes for Passengers (e.g. Gate pickup details)' : 'ለመንገደኞች ተጨማሪ መረጃ'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Waiting near Station Gate 3, leaving sharply on time' : 'ምሳሌ፡ በመናኸሪያው በር 3 አጠገብ እንጠብቃለን'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>{t.publishRide}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

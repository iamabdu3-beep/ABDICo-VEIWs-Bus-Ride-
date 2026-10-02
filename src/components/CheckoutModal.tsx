import React, { useState, useEffect } from 'react';
import { RideTrip, BusStation, BookingTicket, Language, UserProfile } from '../types';
import { translations } from '../translations';
import { X, ShieldCheck, CheckCircle2, CreditCard, Luggage, User, Phone, IdCard, Bus, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CheckoutModalProps {
  trip: RideTrip;
  fromStation: BusStation;
  toStation: BusStation;
  selectedSeats: number[];
  travelDate: string;
  lang: Language;
  onClose: () => void;
  onBookingConfirmed: (ticket: BookingTicket) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  trip,
  fromStation,
  toStation,
  selectedSeats,
  travelDate,
  lang,
  onClose,
  onBookingConfirmed,
  currentUser,
  onOpenLogin,
}) => {
  const t = translations[lang];

  const [passengerName, setPassengerName] = useState(
    currentUser ? (lang === 'am' ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName) : ''
  );
  const [passengerPhone, setPassengerPhone] = useState(
    currentUser?.phoneNumber || '+251 9'
  );
  const [nationalId, setNationalId] = useState(currentUser?.nationalId || '');
  const [luggagePieces, setLuggagePieces] = useState(1);

  // Sync if user signs in mid-session
  useEffect(() => {
    if (currentUser) {
      setPassengerName(lang === 'am' ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName);
      setPassengerPhone(currentUser.phoneNumber);
      if (currentUser.nationalId) setNationalId(currentUser.nationalId);
    }
  }, [currentUser, lang]);
  const [paymentMethod, setPaymentMethod] = useState<
    'Telebirr' | 'CBE Birr' | 'Awash Birr' | 'Cash at Station'
  >('Telebirr');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAm = lang === 'am';
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const baseFare = selectedSeats.length * trip.priceETB;
  const extraLuggageFee = luggagePieces > 2 ? (luggagePieces - 2) * 50 : 0;
  const totalFare = baseFare + extraLuggageFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim()) {
      triggerHaptic(30);
      setCheckoutError(t.errInvalidName || t.errRequiredField);
      return;
    }
    const cleanPhone = passengerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      triggerHaptic(30);
      setCheckoutError(t.errInvalidPhone);
      return;
    }
    setCheckoutError(null);

    setIsProcessing(true);

    // Simulate payment clearing / confirmation
    setTimeout(() => {
      const ticketId = `ETH-AMH-${Math.floor(100000 + Math.random() * 900000)}`;
      const paymentRef = `${paymentMethod.slice(0, 3).toUpperCase()}-${Math.floor(
        10000000 + Math.random() * 90000000
      )}`;

      const newTicket: BookingTicket = {
        ticketId,
        tripId: trip.id,
        passengerName,
        passengerPhone,
        nationalIdOrPassport: nationalId || undefined,
        fromStation,
        toStation,
        departureTime: trip.departureTime,
        departureDate: travelDate,
        seatNumbers: selectedSeats,
        totalFareETB: totalFare,
        vehicleType: trip.vehicleType,
        busCompany: trip.busCompany,
        plateNumber: trip.plateNumber,
        bayNumber: (fromStation.baysCount % 8) + 2, // deterministic bay number
        paymentMethod,
        paymentRef,
        bookingTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        luggagePieces,
        driverName: trip.driverName,
        driverPhone: trip.driverPhone,
        qrPayload: `PASS:${ticketId}|NAME:${passengerName}|ROUTE:${fromStation.id}->${toStation.id}|SEATS:${selectedSeats.join(',')}|FARE:${totalFare}ETB`,
        status: 'confirmed',
        ussdCode: `*805*1*${ticketId.replace(/\D/g, '') || '784102'}#`,
        callCenterNumber: '994',
        callCenterDispatch: '+251 58 220 0110',
        callCenterHours: '24/7 Toll-Free Support',
      };

      setIsProcessing(false);
      onBookingConfirmed(newTicket);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isAm
                ? 'የአማራ ክልል ይፋዊ ኤሌክትሮኒክ ምዝገባ'
                : 'Official Regional Electronic Manifest'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900">
            {t.modalCheckoutTitle || t.passengerDetailsTitle}
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {t.modalCheckoutSub || `${isAm ? fromStation.nameAm : fromStation.name} ➔ ${isAm ? toStation.nameAm : toStation.name}`}
          </p>
        </div>

        {/* Dynamic Form Validation Alert */}
        {checkoutError && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{checkoutError}</span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutError(null)}
              className="text-rose-500 hover:text-rose-700 cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selected Route Info banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
              {lang === 'en' ? 'Bus & Seats' : 'አውቶቡስ እና መቀመጫ'}
            </span>
            <span className="font-bold text-emerald-950">
              {lang === 'en' ? trip.busCompany : trip.busCompanyAm} • Seats: {selectedSeats.join(', ')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
              {lang === 'en' ? 'Departure Time' : 'የመነሻ ሰዓት'}
            </span>
            <span className="font-mono font-bold text-emerald-900">
              {trip.departureTime}
            </span>
          </div>
        </div>

        {/* Quick Sign-In Option for Unauthenticated Passengers */}
        {!currentUser && onOpenLogin && (
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-neutral-700">
                {lang === 'en' ? 'Have an account? Sign in for 1-click booking' : 'መለያ አለዎት? በፍጥነት ለመሙላት ይግቡ'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-xs shrink-0"
            >
              {lang === 'en' ? 'Sign In' : 'ግባ'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Passenger Name */}
          <div>
            <label className="font-semibold text-neutral-800 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t.fullName} *</span>
            </label>
            <input
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Almaz Bekele / Abebe Kebede' : 'ምሳሌ፡ አልማዝ በቀለ / አበበ ከበደ'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Phone Number & National ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-800 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.phoneNumber} *</span>
              </label>
              <input
                type="tel"
                required
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="+251 91 234 5678"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-800 flex items-center gap-1.5 mb-1">
                <IdCard className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.nationalId}</span>
              </label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="FAYDA-98214"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Luggage pieces */}
          <div>
            <label className="font-semibold text-neutral-800 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.luggageItems}</span>
              </span>
              <span className="text-[10px] text-neutral-500">
                {lang === 'en' ? 'Up to 2 pieces free' : 'እስከ 2 ሻንጣ በነፃ'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setLuggagePieces(count)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                    luggagePieces === count
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {count} {isAm ? 'ሻንጣ' : count === 1 ? 'piece' : 'pieces'}
                  {count > 2 && (isAm ? ' (+50 ብር)' : ' (+50 ETB)')}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="font-semibold text-neutral-800 block mb-1.5">
              {t.paymentMethod}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Telebirr')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition ${
                  paymentMethod === 'Telebirr'
                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center shrink-0">
                  📱
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block leading-tight">
                    Telebirr
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {lang === 'en' ? 'Instant Mobile Pay' : 'ፈጣን የሞባይል ክፍያ'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CBE Birr')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition ${
                  paymentMethod === 'CBE Birr'
                    ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white font-bold flex items-center justify-center shrink-0">
                  🏦
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block leading-tight">
                    CBE Birr
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Commercial Bank of Ethiopia
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Awash Birr')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition ${
                  paymentMethod === 'Awash Birr'
                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                  💳
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block leading-tight">
                    Awash Birr
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Digital Wallet
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash at Station')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition ${
                  paymentMethod === 'Cash at Station'
                    ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                    : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                  💵
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block leading-tight">
                    Station Cash
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {lang === 'en' ? 'Pay at Bay Counter' : 'በመናኸሪያው በር'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Pricing breakdown & Confirmation */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-neutral-500">
                {selectedSeats.length} {isAm ? 'መቀመጫ' : 'seat(s)'} × {trip.priceETB} {isAm ? 'ብር' : 'ETB'}
                {extraLuggageFee > 0 && (isAm ? ` + ${extraLuggageFee} ብር ለሻንጣ` : ` + ${extraLuggageFee} ETB luggage`)}
              </div>
              <div className="text-lg font-extrabold text-emerald-800 font-mono">
                {totalFare} {isAm ? 'ብር' : 'ETB'}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer disabled:bg-neutral-400"
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {isAm ? 'በማረጋገጥ ላይ...' : 'Verifying...'}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{t.confirmBooking}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

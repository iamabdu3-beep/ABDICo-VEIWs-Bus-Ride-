import React, { useState, useEffect } from 'react';
import {
  PlannedTripItinerary,
  PlannedTripLeg,
  BookingTicket,
  Language,
  UserProfile,
} from '../types';
import { translations } from '../translations';
import { QRCodeDisplay } from './QRCodeDisplay';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Bus,
  ArrowRight,
  Coffee,
  Check,
  Luggage,
  Sparkles,
  CreditCard,
  Printer,
  Share2,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Phone,
  User,
  Smartphone,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface MultiLegBookingModalProps {
  itinerary: PlannedTripItinerary;
  travelDate: string;
  lang: Language;
  onClose: () => void;
  onBookingConfirmed: (tickets: BookingTicket[]) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onViewTicket?: (ticket: BookingTicket) => void;
}

export const MultiLegBookingModal: React.FC<MultiLegBookingModalProps> = ({
  itinerary,
  travelDate,
  lang,
  onClose,
  onBookingConfirmed,
  currentUser,
  onOpenLogin,
  onViewTicket,
}) => {
  const t = translations[lang];
  const isAm = lang === 'am';

  // Ensure we have two distinct legs for multi-leg booking
  const leg1: PlannedTripLeg = itinerary.legs[0];
  const leg2: PlannedTripLeg = itinerary.legs[1] || itinerary.legs[0];
  const transferStation = leg1.toStation;

  // Multi-step workflow state
  // 1: Leg 1 Booking, 2: Leg 2 Booking, 3: Passenger Manifest, 4: 1-Transaction Payment, 5: Dual Tickets Confirmed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Leg 1 Seat selection state (Bus 1: 45 seats layout)
  const [selectedSeatLeg1, setSelectedSeatLeg1] = useState<number>(14);
  const bookedSeatsLeg1 = [2, 5, 6, 11, 15, 23, 24, 30, 31, 38];

  // Leg 2 Seat selection state (Bus 2: 45 seats layout)
  const [selectedSeatLeg2, setSelectedSeatLeg2] = useState<number>(18);
  const bookedSeatsLeg2 = [1, 3, 7, 8, 12, 19, 25, 26, 33, 40];

  // Passenger Manifest State
  const [passengerName, setPassengerName] = useState<string>(
    currentUser
      ? isAm
        ? currentUser.fullNameAm || currentUser.fullName
        : currentUser.fullName
      : 'Abebe Bikila'
  );
  const [passengerPhone, setPassengerPhone] = useState<string>(
    currentUser?.phoneNumber || '+251 91 123 4567'
  );
  const [nationalId, setNationalId] = useState<string>(
    currentUser?.nationalId || 'FAYDA-882194'
  );
  const [luggagePieces, setLuggagePieces] = useState<number>(1);
  const [autoTransferLuggage, setAutoTransferLuggage] = useState<boolean>(true);

  // Sync if user logs in
  useEffect(() => {
    if (currentUser) {
      setPassengerName(
        isAm ? currentUser.fullNameAm || currentUser.fullName : currentUser.fullName
      );
      setPassengerPhone(currentUser.phoneNumber);
      if (currentUser.nationalId) setNationalId(currentUser.nationalId);
    }
  }, [currentUser, isAm]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<
    'Telebirr' | 'CBE Birr' | 'Awash Birr' | 'Cash at Station'
  >('Telebirr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Confirmed tickets state
  const [confirmedTickets, setConfirmedTickets] = useState<BookingTicket[]>([]);
  const [activeConfirmedTab, setActiveConfirmedTab] = useState<'leg1' | 'leg2' | 'both'>('both');
  const [masterTxnRef, setMasterTxnRef] = useState<string>('');

  // Financial calculations
  const leg1Fare = leg1.priceETB;
  const leg2Fare = leg2.priceETB;
  const extraLuggageFee = luggagePieces > 2 ? (luggagePieces - 2) * 50 : 0;
  const transferInsuranceFee = 0; // Included free
  const totalTransactionFare = leg1Fare + leg2Fare + extraLuggageFee;

  // Seat map generator helper (1 to 44 seats, 4 columns: A B aisle C D)
  const renderSeatMap = (
    selectedSeat: number,
    onSelectSeat: (seat: number) => void,
    bookedSeats: number[],
    legLabel: string
  ) => {
    const rows = Array.from({ length: 11 }, (_, i) => i + 1);
    return (
      <div className="bg-neutral-900 text-white rounded-2xl p-4 border border-neutral-800 shadow-inner">
        {/* Front of Bus indicator */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3 text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-emerald-400">{legLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
              {isAm ? 'የሹፌር ክፍል (Front)' : 'Front / Driver Cabin'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400 mb-3">
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-neutral-800 border border-neutral-700" />
            <span>{isAm ? 'ክፍት' : 'Available'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-black font-bold flex items-center justify-center text-[9px]">
              ✓
            </div>
            <span>{isAm ? 'የተመረጠ' : 'Selected'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 rounded bg-neutral-700 opacity-40" />
            <span>{isAm ? 'የተያዘ' : 'Occupied'}</span>
          </div>
        </div>

        {/* Bus Grid: 11 rows of 4 seats */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {rows.map((row) => {
            const sA = (row - 1) * 4 + 1;
            const sB = (row - 1) * 4 + 2;
            const sC = (row - 1) * 4 + 3;
            const sD = (row - 1) * 4 + 4;

            const renderButton = (seatNum: number) => {
              const isOccupied = bookedSeats.includes(seatNum);
              const isSelected = selectedSeat === seatNum;
              return (
                <button
                  key={seatNum}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => {
                    triggerHaptic(12);
                    onSelectSeat(seatNum);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-neutral-950 ring-2 ring-emerald-300 font-black shadow-md scale-105'
                      : isOccupied
                      ? 'bg-neutral-800/60 text-neutral-600 cursor-not-allowed border border-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 hover:border-emerald-500'
                  }`}
                  title={isOccupied ? 'Occupied' : `Seat #${seatNum}`}
                >
                  {seatNum}
                </button>
              );
            };

            return (
              <div key={row} className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  {renderButton(sA)}
                  {renderButton(sB)}
                </div>
                {/* Central Aisle */}
                <div className="text-[9px] text-neutral-600 font-mono px-2 select-none">
                  {row}
                </div>
                <div className="flex items-center gap-1.5">
                  {renderButton(sC)}
                  {renderButton(sD)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Execution of the Single Unified Transaction
  const handleExecuteSingleTransactionPayment = () => {
    if (!passengerName.trim() || passengerPhone.length < 9) return;

    triggerHaptic(20);
    setIsProcessing(true);

    setTimeout(() => {
      const txnNumber = `TXN-MLG-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const groupId = `MLG-GROUP-${Date.now()}`;
      setMasterTxnRef(txnNumber);

      const ticket1Id = `ETH-AMH-LEG1-${Math.floor(100000 + Math.random() * 900000)}`;
      const ticket2Id = `ETH-AMH-LEG2-${Math.floor(100000 + Math.random() * 900000)}`;

      // Ticket 1: Origin to Transfer Hub
      const ticket1: BookingTicket = {
        ticketId: ticket1Id,
        tripId: leg1.matchedTripId || `trip-${leg1.fromStation.id}-${transferStation.id}`,
        passengerName,
        passengerPhone,
        nationalIdOrPassport: nationalId || undefined,
        fromStation: leg1.fromStation,
        toStation: transferStation,
        departureTime: leg1.departureTime,
        departureDate: travelDate,
        seatNumbers: [selectedSeatLeg1],
        totalFareETB: leg1Fare,
        vehicleType: leg1.vehicleType,
        busCompany: leg1.operatorName,
        plateNumber: `ET 03-A${Math.floor(10000 + Math.random() * 90000)}`,
        bayNumber: leg1.bayNumber || 4,
        paymentMethod,
        paymentRef: `${txnNumber}-L1`,
        bookingTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        luggagePieces,
        driverName: 'Capt. Kassahun Worku (Leg 1)',
        driverPhone: '+251 91 876 5432',
        qrPayload: `PASS:${ticket1Id}|TXN:${txnNumber}|LEG:1/2|FROM:${leg1.fromStation.id}->${transferStation.id}|SEAT:${selectedSeatLeg1}|FARE:${leg1Fare}ETB`,
        status: 'confirmed',
        ussdCode: `*805*1*${ticket1Id.replace(/\D/g, '').slice(0, 6) || '784102'}#`,
        callCenterNumber: '994',
        callCenterDispatch: '+251 58 220 0110',
        callCenterHours: '24/7 Toll-Free Support',
        multiLegGroupId: groupId,
        legIndex: 1,
        totalLegs: 2,
        transferStationName: transferStation.name,
        transferStationNameAm: transferStation.nameAm,
        layoverDurationMinutes: leg1.layoverAfterMinutes || 45,
        connectingTicketId: ticket2Id,
        masterTransactionRef: txnNumber,
      };

      // Ticket 2: Transfer Hub to Destination
      const ticket2: BookingTicket = {
        ticketId: ticket2Id,
        tripId: leg2.matchedTripId || `trip-${transferStation.id}-${leg2.toStation.id}`,
        passengerName,
        passengerPhone,
        nationalIdOrPassport: nationalId || undefined,
        fromStation: transferStation,
        toStation: leg2.toStation,
        departureTime: leg2.departureTime,
        departureDate: travelDate,
        seatNumbers: [selectedSeatLeg2],
        totalFareETB: leg2Fare + extraLuggageFee,
        vehicleType: leg2.vehicleType,
        busCompany: leg2.operatorName,
        plateNumber: `ET 03-B${Math.floor(10000 + Math.random() * 90000)}`,
        bayNumber: leg2.bayNumber || 2,
        paymentMethod,
        paymentRef: `${txnNumber}-L2`,
        bookingTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        luggagePieces,
        driverName: 'Capt. Yonas Belay (Leg 2)',
        driverPhone: '+251 91 345 6789',
        qrPayload: `PASS:${ticket2Id}|TXN:${txnNumber}|LEG:2/2|FROM:${transferStation.id}->${leg2.toStation.id}|SEAT:${selectedSeatLeg2}|FARE:${leg2Fare}ETB`,
        status: 'confirmed',
        ussdCode: `*805*1*${ticket2Id.replace(/\D/g, '').slice(0, 6) || '891042'}#`,
        callCenterNumber: '994',
        callCenterDispatch: '+251 58 220 0110',
        callCenterHours: '24/7 Toll-Free Support',
        multiLegGroupId: groupId,
        legIndex: 2,
        totalLegs: 2,
        transferStationName: transferStation.name,
        transferStationNameAm: transferStation.nameAm,
        layoverDurationMinutes: leg1.layoverAfterMinutes || 45,
        connectingTicketId: ticket1Id,
        masterTransactionRef: txnNumber,
      };

      const dualTickets = [ticket1, ticket2];
      setConfirmedTickets(dualTickets);
      setIsProcessing(false);
      setCurrentStep(5);

      // Save both confirmed tickets into the parent application store
      onBookingConfirmed(dualTickets);
    }, 950);
  };

  const handlePrintDualTickets = () => {
    triggerHaptic(10);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" />
            <span>{isAm ? 'ባለ2-ደረጃ የተቀናጀ የትኬት ግብይት' : 'Coordinated Multi-Leg Booking · 1 Transaction'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAm ? itinerary.titleAm : itinerary.title}
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200 mt-2">
            <span className="flex items-center gap-1 font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{travelDate}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{itinerary.departureTime} ➔ {itinerary.arrivalTime} ({itinerary.totalDurationFormatted})</span>
            </span>
            <span>·</span>
            <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
              2 {isAm ? 'ትኬቶች በ1 ክፍያ' : 'Tickets in 1 Checkout'}
            </span>
          </div>

          {/* Workflow Step Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-white/15 text-[10px] sm:text-xs font-bold text-center">
            <div
              className={`p-1.5 rounded-xl border transition ${
                currentStep === 1
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-800/80 text-emerald-100 border-emerald-700'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              <span>1. {isAm ? 'ደረጃ 1 ወንበር' : 'Leg 1 Seat'}</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border transition ${
                currentStep === 2
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-800/80 text-emerald-100 border-emerald-700'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              <span>2. {isAm ? 'ደረጃ 2 ወንበር' : 'Leg 2 Seat'}</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border transition ${
                currentStep === 3
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                  : currentStep > 3
                  ? 'bg-emerald-800/80 text-emerald-100 border-emerald-700'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              <span>3. {isAm ? 'የተሳፋሪ መረጃ' : 'Passenger'}</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border transition ${
                currentStep === 4 || currentStep === 5
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                  : 'bg-white/5 text-neutral-400 border-white/10'
              }`}
            >
              <span>4. {isAm ? 'የ1 ግብይት ክፍያ' : '1 Transaction'}</span>
            </div>
          </div>
        </div>

        {/* Modal Body: Active Step Views */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* STEP 1: LEG 1 WORKFLOW */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Leg 1 Summary Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                        {isAm ? 'የመጀመሪያው ጉዞ (Leg 1)' : 'Departure Leg 1'}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-neutral-900">
                        {isAm ? leg1.fromStation.cityAm : leg1.fromStation.city} ➔ {isAm ? transferStation.cityAm : transferStation.city}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-900 font-mono block">
                      {leg1Fare} ETB
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {isAm ? `መጫኛ በር #${leg1.bayNumber || 4}` : `Platform Bay #${leg1.bayNumber || 4}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-xs text-neutral-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'ኦፕሬተር' : 'Operator'}</span>
                    <span className="font-extrabold text-neutral-900">{isAm ? leg1.operatorNameAm : leg1.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'የአውቶቡስ ዓይነት' : 'Vehicle'}</span>
                    <span className="font-bold text-neutral-800">{leg1.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'መነሻ ሰዓት' : 'Departure'}</span>
                    <span className="font-mono font-bold text-neutral-900">{leg1.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'መድረሻ በመናኸሪያ' : 'Transfer Arrival'}</span>
                    <span className="font-mono font-bold text-neutral-900">{leg1.arrivalTime}</span>
                  </div>
                </div>
              </div>

              {/* Leg 1 Seat Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-emerald-700" />
                    <span>{isAm ? 'ለደረጃ 1 መቀመጫ ይምረጡ፡' : 'Select Seat for Leg 1:'}</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {isAm ? `የተመረጠ ወንበር፡ #${selectedSeatLeg1}` : `Selected: Seat #${selectedSeatLeg1}`}
                  </span>
                </div>

                {renderSeatMap(
                  selectedSeatLeg1,
                  setSelectedSeatLeg1,
                  bookedSeatsLeg1,
                  isAm ? `${leg1.operatorNameAm} - ደረጃ 1` : `${leg1.operatorName} - Leg 1`
                )}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                >
                  {isAm ? 'ሰርዝ' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setCurrentStep(2);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <span>{isAm ? 'ወደ ደረጃ 2 ወንበር ምርጫ ቀጥል' : 'Proceed to Leg 2 Seat Selection'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LEG 2 WORKFLOW */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Coordinated Layover Station Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 block">
                      {isAm
                        ? `የ${leg1.layoverAfterMinutes || 45} ደቂቃ የተቀናጀ ዝውውር በ${transferStation.cityAm} (${transferStation.nameAm})`
                        : `${leg1.layoverAfterMinutes || 45} min Coordinated Layover at ${transferStation.city} (${transferStation.name})`}
                    </span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      {isAm
                        ? 'የተሳፋሪ ዋስትና፡ ደረጃ 1 ከዘገየ ደረጃ 2 አውቶቡስ ይጠብቃል ወይም ያለምንም ተጨማሪ ክፍያ ቀጣይ አውቶቡስ ይሰጣል'
                        : 'Transfer Guarantee: Leg 2 holds or provides immediate free re-booking if Leg 1 encounters highway delays.'}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 bg-amber-200 text-amber-950 rounded-xl">
                  {isAm ? 'የተረጋገጠ ዝውውር' : 'Guaranteed Link'}
                </span>
              </div>

              {/* Leg 2 Summary Card */}
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-800 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">
                        {isAm ? 'ሁለተኛው ተቀጣጣይ ጉዞ (Leg 2)' : 'Connecting Leg 2'}
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-neutral-900">
                        {isAm ? transferStation.cityAm : transferStation.city} ➔ {isAm ? leg2.toStation.cityAm : leg2.toStation.city}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-sky-950 font-mono block">
                      {leg2Fare} ETB
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {isAm ? `መጫኛ በር #${leg2.bayNumber || 2}` : `Platform Bay #${leg2.bayNumber || 2}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-sky-200/60 text-xs text-neutral-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'ኦፕሬተር' : 'Operator'}</span>
                    <span className="font-extrabold text-neutral-900">{isAm ? leg2.operatorNameAm : leg2.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'የአውቶቡስ ዓይነት' : 'Vehicle'}</span>
                    <span className="font-bold text-neutral-800">{leg2.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'መነሻ ሰዓት' : 'Departure'}</span>
                    <span className="font-mono font-bold text-neutral-900">{leg2.departureTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">{isAm ? 'የመጨረሻ መድረሻ' : 'Final Arrival'}</span>
                    <span className="font-mono font-bold text-neutral-900">{leg2.arrivalTime}</span>
                  </div>
                </div>
              </div>

              {/* Leg 2 Seat Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Bus className="w-4 h-4 text-sky-700" />
                    <span>{isAm ? 'ለደረጃ 2 መቀመጫ ይምረጡ፡' : 'Select Seat for Leg 2:'}</span>
                  </label>
                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {isAm ? `የተመረጠ ወንበር፡ #${selectedSeatLeg2}` : `Selected: Seat #${selectedSeatLeg2}`}
                  </span>
                </div>

                {renderSeatMap(
                  selectedSeatLeg2,
                  setSelectedSeatLeg2,
                  bookedSeatsLeg2,
                  isAm ? `${leg2.operatorNameAm} - ደረጃ 2` : `${leg2.operatorName} - Leg 2`
                )}
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setCurrentStep(1);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isAm ? 'ወደ ደረጃ 1 ተመለስ' : 'Back to Leg 1'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setCurrentStep(3);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <span>{isAm ? 'ወደ ተሳፋሪ መረጃ ቀጥል' : 'Proceed to Passenger Info'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PASSENGER MANIFEST & LUGGAGE */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <h4 className="text-base font-extrabold text-neutral-900">
                    {isAm ? 'ይፋዊ የተሳፋሪ ምዝገባ (Regional Passenger Manifest)' : 'Official Intercity Passenger Manifest'}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {isAm
                      ? 'ይህ መረጃ በሁለቱም ትኬቶች ላይ በይፋዊ ሁኔታ ይሰፍራል'
                      : 'This passenger identity will be stamped onto both tickets simultaneously.'}
                  </p>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{isAm ? 'ሙሉ ስም (Full Name)' : 'Passenger Full Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{isAm ? 'ስልክ ቁጥር (Mobile Phone)' : 'Mobile Phone (for SMS / USSD)'}</span>
                  </label>
                  <input
                    type="text"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isAm ? 'ብሔራዊ መታወቂያ / ፓስፖርት (National ID)' : 'Fayda ID / National ID / Passport'}
                  </label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. FAYDA-882194"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{isAm ? 'የሻንጣ ብዛት (Luggage Pieces)' : 'Luggage Pieces'}</span>
                  </label>
                  <select
                    value={luggagePieces}
                    onChange={(e) => setLuggagePieces(parseInt(e.target.value, 10))}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-bold text-neutral-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 {isAm ? 'ሻንጣ (ነፃ)' : 'Piece (Included Free)'}</option>
                    <option value={2}>2 {isAm ? 'ሻንጣዎች (ነፃ)' : 'Pieces (Included Free)'}</option>
                    <option value={3}>3 {isAm ? 'ሻንጣዎች (+50 ብር)' : 'Pieces (+50 ETB)'}</option>
                    <option value={4}>4 {isAm ? 'ሻንጣዎች (+100 ብር)' : 'Pieces (+100 ETB)'}</option>
                  </select>
                </div>
              </div>

              {/* Coordinated Luggage Transfer Option */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-start gap-3 text-xs">
                <input
                  type="checkbox"
                  id="autoTransferCheck"
                  checked={autoTransferLuggage}
                  onChange={(e) => setAutoTransferLuggage(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                />
                <label htmlFor="autoTransferCheck" className="cursor-pointer text-emerald-950 font-medium">
                  <span className="font-bold block text-emerald-900">
                    {isAm
                      ? `የተቀናጀ የሻንጣ ዝውውር መለያ ታግ (Luggage Transfer Tag)`
                      : `Automated Luggage Transfer Tagging at ${transferStation.city}`}
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {isAm
                      ? `በ${transferStation.cityAm} መናኸሪያ ዝውውር ወቅት ሻንጣዎ ከመጀመሪያው አውቶቡስ ወደ ሁለተኛው አውቶቡስ እንዲተላለፍ የተረጋገጠ ባጅ ይሰጠዋል`
                      : `Tags your luggage with unified dual-route barcodes so terminal porters safely transfer cargo between bays.`}
                  </span>
                </label>
              </div>

              {/* Bottom Nav */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isAm ? 'ወደ ደረጃ 2 ተመለስ' : 'Back to Leg 2'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setCurrentStep(4);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <span>{isAm ? 'ወደ አንድ ወጥ የክፍያ ገጽ ቀጥል' : 'Proceed to Single Transaction Payment'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SINGLE UNIFIED TRANSACTION PAYMENT */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <h4 className="text-base font-extrabold text-neutral-900">
                    {isAm ? 'የ1 ግብይት የተጠቃለለ ክፍያ' : '1 Unified Transaction Checkout'}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {isAm
                      ? 'አንድ ክፍያ በመፈፀም ሁለት የተለያዩ ኦፊሴላዊ የጉዞ ትኬቶችን ይቀበሉ'
                      : 'One consolidated payment simultaneously issues two separate verified travel tickets.'}
                  </p>
                </div>
                <CreditCard className="w-6 h-6 text-emerald-600 shrink-0" />
              </div>

              {/* Itemized Single Transaction Breakdown */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block">
                  {isAm ? 'የግብይት ዝርዝር ሂሳብ (Itemized Single Transaction):' : 'Itemized Transaction Breakdown:'}
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        {isAm ? 'ትኬት #1 (ደረጃ 1)' : 'Ticket #1 (Leg 1)'}: {isAm ? leg1.fromStation.cityAm : leg1.fromStation.city} ➔ {isAm ? transferStation.cityAm : transferStation.city}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {isAm ? leg1.operatorNameAm : leg1.operatorName} · {isAm ? `ወንበር #${selectedSeatLeg1}` : `Seat #${selectedSeatLeg1}`} · {leg1.departureTime}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">{leg1Fare} ETB</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80">
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        {isAm ? 'ትኬት #2 (ደረጃ 2)' : 'Ticket #2 (Leg 2)'}: {isAm ? transferStation.cityAm : transferStation.city} ➔ {isAm ? leg2.toStation.cityAm : leg2.toStation.city}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {isAm ? leg2.operatorNameAm : leg2.operatorName} · {isAm ? `ወንበር #${selectedSeatLeg2}` : `Seat #${selectedSeatLeg2}`} · {leg2.departureTime}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neutral-900">{leg2Fare} ETB</span>
                  </div>

                  {extraLuggageFee > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80">
                      <span className="text-neutral-700 font-medium">
                        {isAm ? 'ተጨማሪ የሻንጣ ክፍያ' : 'Excess Luggage Fee'} ({luggagePieces} pieces)
                      </span>
                      <span className="font-mono font-bold text-neutral-900">{extraLuggageFee} ETB</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80 text-emerald-800 font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isAm ? 'የዝውውር ዋስትናና ኢንሹራንስ' : 'Coordinated Layover Protection & Manifest'}</span>
                    </span>
                    <span className="font-bold text-emerald-700 uppercase text-[10px]">
                      {isAm ? 'ነፃ (Included)' : '0 ETB (Included)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-neutral-300 text-sm font-black text-neutral-900">
                  <span>{isAm ? 'ጠቅላላ የሚከፈል (1 ግብይት):' : 'Total 1-Transaction Payment:'}</span>
                  <span className="text-lg font-mono text-emerald-800 font-black">
                    {totalTransactionFare} ETB
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-700 block">
                  {isAm ? 'የክፍያ ዘዴ ይምረጡ (Select Payment Gateway):' : 'Select Cashless Payment Method:'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Telebirr', 'CBE Birr', 'Awash Birr', 'Cash at Station'] as const).map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setPaymentMethod(method);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <CreditCard className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-neutral-400'}`} />
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Processing Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteSingleTransactionPayment}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAm ? 'ክፍያው እየተረጋገጠና 2 ትኬቶች እየወጡ ነው...' : 'Processing 1-Transaction Payment & Generating Both Tickets...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-amber-300" />
                      <span>
                        {isAm
                          ? `${totalTransactionFare} ብር በ${paymentMethod} ክፈልና 2 ትኬቶችን አውጣ`
                          : `Pay ${totalTransactionFare} ETB via ${paymentMethod} & Issue 2 Tickets`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setCurrentStep(3);
                  }}
                  className="hover:text-neutral-900 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isAm ? 'ወደ ተሳፋሪ መረጃ ተመለስ' : 'Back to Passenger Info'}</span>
                </button>

                <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAm ? '100% ደህንነቱ የተጠበቀ ክፍያ' : 'Bank-Grade Cashless Manifest'}</span>
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: DUAL TICKETS CONFIRMED & BOARDING PASSES */}
          {currentStep === 5 && confirmedTickets.length === 2 && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Celebration Banner */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-4 text-center space-y-1 shadow-md">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto text-amber-300 mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black tracking-tight">
                  {isAm ? 'ባለ2-ደረጃ ጉዞዎ በአንድ ግብይት ተሳክቷል!' : 'Multi-Leg Journey Booked in 1 Transaction!'}
                </h3>
                <p className="text-xs text-emerald-100 font-mono">
                  {isAm ? 'ዋና የግብይት ቁጥር' : 'Master Transaction Ref'}: <strong>{masterTxnRef}</strong>
                </p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-black/20 text-[11px] font-bold text-amber-200">
                  {isAm ? '2 ይፋዊ የዲጂታል ትኬቶች ወጥተዋል' : '2 Official Boarding Passes Generated'}
                </span>
              </div>

              {/* Ticket View Tabs (Leg 1, Leg 2, Both Side-by-Side) */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setActiveConfirmedTab('both');
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    activeConfirmedTab === 'both'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {isAm ? 'ሁለቱንም ትኬቶች እይ' : 'View Both Tickets'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setActiveConfirmedTab('leg1');
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    activeConfirmedTab === 'leg1'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {isAm ? 'ትኬት 1 (ደረጃ 1)' : 'Ticket 1 (Leg 1)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setActiveConfirmedTab('leg2');
                  }}
                  className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    activeConfirmedTab === 'leg2'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {isAm ? 'ትኬት 2 (ደረጃ 2)' : 'Ticket 2 (Leg 2)'}
                </button>
              </div>

              {/* Render Tickets Side-by-Side or Selected */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TICKET 1 CARD */}
                {(activeConfirmedTab === 'both' || activeConfirmedTab === 'leg1') && (
                  <div className="bg-white rounded-2xl border-2 border-emerald-500 p-4 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-black flex items-center justify-center">
                          1
                        </span>
                        <span className="text-[11px] font-black uppercase text-emerald-800">
                          {isAm ? 'የመጀመሪያ ትኬት (Leg 1)' : 'Boarding Ticket 1'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        {confirmedTickets[0].ticketId}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-black text-neutral-900 block">
                        {isAm ? confirmedTickets[0].fromStation.cityAm : confirmedTickets[0].fromStation.city} ➔ {isAm ? confirmedTickets[0].toStation.cityAm : confirmedTickets[0].toStation.city}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium">
                        {confirmedTickets[0].busCompany} · {confirmedTickets[0].vehicleType}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'ወንበር' : 'Seat'}</span>
                        <span className="font-black text-emerald-800 text-sm">#{confirmedTickets[0].seatNumbers[0]}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'መጫኛ በር' : 'Bay'}</span>
                        <span className="font-black text-neutral-900 text-sm">#{confirmedTickets[0].bayNumber}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'መነሻ' : 'Dep'}</span>
                        <span className="font-black text-neutral-900 font-mono text-xs">{confirmedTickets[0].departureTime}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-center pt-1">
                      <QRCodeDisplay value={confirmedTickets[0].qrPayload} size={110} />
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-neutral-500 font-mono block">
                        USSD: {confirmedTickets[0].ussdCode}
                      </span>
                    </div>

                    {onViewTicket && (
                      <button
                        type="button"
                        onClick={() => onViewTicket(confirmedTickets[0])}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        {isAm ? 'የደረጃ 1 ዲጂታል ቦርዲንግ ፓስ እይ' : 'Open Full Leg 1 Boarding Pass'}
                      </button>
                    )}
                  </div>
                )}

                {/* TICKET 2 CARD */}
                {(activeConfirmedTab === 'both' || activeConfirmedTab === 'leg2') && (
                  <div className="bg-white rounded-2xl border-2 border-sky-500 p-4 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-sky-800 text-white text-[10px] font-black flex items-center justify-center">
                          2
                        </span>
                        <span className="text-[11px] font-black uppercase text-sky-800">
                          {isAm ? 'ሁለተኛ ትኬት (Leg 2)' : 'Boarding Ticket 2'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-500">
                        {confirmedTickets[1].ticketId}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-black text-neutral-900 block">
                        {isAm ? confirmedTickets[1].fromStation.cityAm : confirmedTickets[1].fromStation.city} ➔ {isAm ? confirmedTickets[1].toStation.cityAm : confirmedTickets[1].toStation.city}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium">
                        {confirmedTickets[1].busCompany} · {confirmedTickets[1].vehicleType}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'ወንበር' : 'Seat'}</span>
                        <span className="font-black text-sky-800 text-sm">#{confirmedTickets[1].seatNumbers[0]}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'መጫኛ በር' : 'Bay'}</span>
                        <span className="font-black text-neutral-900 text-sm">#{confirmedTickets[1].bayNumber}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-neutral-400 block">{isAm ? 'መነሻ' : 'Dep'}</span>
                        <span className="font-black text-neutral-900 font-mono text-xs">{confirmedTickets[1].departureTime}</span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex items-center justify-center pt-1">
                      <QRCodeDisplay value={confirmedTickets[1].qrPayload} size={110} />
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-neutral-500 font-mono block">
                        USSD: {confirmedTickets[1].ussdCode}
                      </span>
                    </div>

                    {onViewTicket && (
                      <button
                        type="button"
                        onClick={() => onViewTicket(confirmedTickets[1])}
                        className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        {isAm ? 'የደረጃ 2 ዲጂታል ቦርዲንግ ፓስ እይ' : 'Open Full Leg 2 Boarding Pass'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={handlePrintDualTickets}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-neutral-600" />
                  <span>{isAm ? 'ሁለቱንም ቦርዲንግ ፓሶች አትም' : 'Print Both Boarding Passes'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  {isAm ? 'ተጠናቀቀ / ዝጋ' : 'Done · Ready to Travel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

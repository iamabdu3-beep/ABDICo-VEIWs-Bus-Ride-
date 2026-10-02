import React, { useRef, useState } from 'react';
import { BookingTicket, Language } from '../types';
import { translations } from '../translations';
import { QRCodeDisplay } from './QRCodeDisplay';
import { UssdSimulatorModal } from './UssdSimulatorModal';
import { CallCenterModal } from './CallCenterModal';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Bus,
  MapPin,
  Calendar,
  Clock,
  User,
  Luggage,
  Share2,
  Check,
  MessageSquare,
  Phone,
  Smartphone,
  Headphones,
  Copy,
} from 'lucide-react';
import { triggerHaptic, shareNative } from '../utils/haptics';

interface DigitalTicketModalProps {
  ticket: BookingTicket;
  lang: Language;
  onClose: () => void;
  onOpenLuggageTracking?: (ticket: BookingTicket) => void;
  onContactDriver?: (ticket: BookingTicket) => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  ticket,
  lang,
  onClose,
  onOpenLuggageTracking,
  onContactDriver,
}) => {
  const t = translations[lang];
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [ussdCopied, setUssdCopied] = useState(false);
  const [isUssdModalOpen, setIsUssdModalOpen] = useState(false);
  const [isCallCenterModalOpen, setIsCallCenterModalOpen] = useState(false);

  const ussdCode = ticket.ussdCode || `*805*1*${ticket.ticketId.replace(/\D/g, '') || '784102'}#`;
  const callCenterNumber = ticket.callCenterNumber || '994';
  const callCenterDispatch = ticket.callCenterDispatch || '+251 58 220 0110';

  const handlePrint = () => {
    triggerHaptic(10);
    window.print();
  };

  const handleCopyUssd = (code: string) => {
    triggerHaptic(10);
    navigator.clipboard.writeText(code);
    setUssdCopied(true);
    setTimeout(() => setUssdCopied(false), 2000);
  };

  const handleShare = async () => {
    triggerHaptic(15);
    const origin = lang === 'am' ? ticket.fromStation?.cityAm || ticket.fromStation?.nameAm : ticket.fromStation?.city || ticket.fromStation?.name;
    const dest = lang === 'am' ? ticket.toStation?.cityAm || ticket.toStation?.nameAm : ticket.toStation?.city || ticket.toStation?.name;
    const text = `🎫 Bus Ride Boarding Pass: ${ticket.ticketId}\nRoute: ${origin} ➔ ${dest}\nDeparture: ${ticket.departureTime} (Bay #${ticket.bayNumber})\nSeats: ${ticket.seatNumbers.join(', ')}\nPlate: ${ticket.plateNumber}\nUSSD Access: ${ussdCode}\n24/7 Call Center: ${callCenterNumber}`;
    const shared = await shareNative({
      title: 'Bus Ride App Boarding Ticket',
      text,
      url: window.location.href,
    });
    if (!shared) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Success Badge */}
        <div className="flex items-center gap-2 mb-3 text-emerald-800">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight">
              {t.modalDigitalTicketTitle || t.ticketConfirmed}
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              {ticket.ticketId} • {t.modalDigitalTicketSub || (lang === 'am' ? 'የተረጋገጠ ዲጂታል ትኬት' : 'Verified passenger pass')}
            </span>
          </div>
        </div>

        {/* Printable Ticket Card with Ethiopian Bus Pass Aesthetic */}
        <div
          ref={ticketRef}
          className="border-2 border-emerald-700/80 rounded-2xl bg-gradient-to-b from-white to-neutral-50 overflow-hidden shadow-md relative"
        >
          {/* Decorative Tri-color stripe (Green, Yellow, Red) on top */}
          <div className="h-2 w-full flex">
            <div className="flex-1 bg-emerald-600" />
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-rose-600" />
          </div>

          {/* Ticket Header */}
          <div className="bg-emerald-900 text-white p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/app-logo.png"
                alt={lang === 'am' ? 'ባስ ራይድ' : 'Bus Ride'}
                className="w-11 h-11 rounded-xl object-cover border border-amber-300/40 shrink-0 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {lang === 'am'
                      ? 'ባስ ራይድ • የተረጋገጠ ትኬት'
                      : 'Bus Ride • Verified Pass'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {ticket.busCompany}
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-300 uppercase tracking-widest block font-mono">
                {ticket.vehicleType}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {ticket.plateNumber}
              </span>
            </div>
          </div>

          {/* Multi-Leg Coordinated Journey Indicator */}
          {ticket.multiLegGroupId && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950 font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {lang === 'am'
                    ? `የተቀናጀ ባለ2-ደረጃ ጉዞ • ክፍል ${ticket.legIndex || 1} ከ 2`
                    : `Coordinated Multi-Leg Journey • Leg ${ticket.legIndex || 1} of 2`}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                {ticket.masterTransactionRef || '1 Transaction'}
              </span>
            </div>
          )}

          {/* Route Display */}
          <div className="p-4 border-b border-dashed border-neutral-300 bg-emerald-50/40">
            <div className="flex items-center justify-between gap-4">
              {/* Origin */}
              <div className="flex-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {lang === 'en' ? 'Origin Terminal' : 'መነሻ መናኸሪያ'}
                </span>
                <span className="text-base font-extrabold text-neutral-900 block leading-tight">
                  {lang === 'en' ? ticket.fromStation.city : ticket.fromStation.cityAm}
                </span>
                <span className="text-[11px] text-neutral-500 line-clamp-1">
                  {lang === 'en' ? ticket.fromStation.name : ticket.fromStation.nameAm}
                </span>
              </div>

              {/* Arrow and Bay icon */}
              <div className="text-center px-2">
                <Bus className="w-5 h-5 text-emerald-700 mx-auto animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full mt-1 inline-block">
                  BAY #{ticket.bayNumber}
                </span>
              </div>

              {/* Destination */}
              <div className="flex-1 text-right">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {lang === 'en' ? 'Destination' : 'መድረሻ መናኸሪያ'}
                </span>
                <span className="text-base font-extrabold text-neutral-900 block leading-tight">
                  {lang === 'en' ? ticket.toStation.city : ticket.toStation.cityAm}
                </span>
                <span className="text-[11px] text-neutral-500 line-clamp-1">
                  {lang === 'en' ? ticket.toStation.name : ticket.toStation.nameAm}
                </span>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-dashed border-neutral-300">
            <div>
              <span className="text-[10px] text-neutral-500 font-medium block">
                {lang === 'en' ? 'Departure Time' : 'የመነሻ ሰዓት'}
              </span>
              <span className="font-bold text-neutral-900 font-mono">
                {ticket.departureTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-medium block">
                {lang === 'en' ? 'Seat Number(s)' : 'የመቀመጫ ቁጥር'}
              </span>
              <span className="font-bold text-emerald-800 font-mono bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                {ticket.seatNumbers.join(', ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-medium block">
                {lang === 'en' ? 'Luggage' : 'ሻንጣ'}
              </span>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="font-bold text-neutral-900">
                  {ticket.luggagePieces} {lang === 'en' ? 'piece(s)' : 'ሻንጣ'}
                </span>
                {onOpenLuggageTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      onOpenLuggageTracking(ticket);
                    }}
                    className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition flex items-center gap-1 border border-emerald-300 cursor-pointer shadow-2xs"
                    title={lang === 'en' ? 'Track luggage status & checkpoints' : 'የሻንጣ ሂደትና ኬላዎችን ተከታተል'}
                  >
                    <Luggage className="w-3 h-3 text-emerald-700" />
                    <span>{lang === 'en' ? 'Track' : 'ተከታተል'}</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 font-medium block">
                {lang === 'en' ? 'Fare Paid' : 'የተከፈለ ሂሳብ'}
              </span>
              <span className="font-bold text-emerald-800 font-mono">
                {ticket.totalFareETB} ETB
              </span>
            </div>
          </div>

          {/* Passenger & QR Code Validation Area */}
          <div className="p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div>
                <span className="text-[10px] text-neutral-500 block">
                  {lang === 'en' ? 'Passenger Name' : 'የመንገደኛ ስም'}
                </span>
                <span className="font-bold text-neutral-900 text-sm">
                  {ticket.passengerName}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 block">
                  {lang === 'en' ? 'Contact Phone' : 'ስልክ'}
                </span>
                <span className="font-mono text-neutral-700 text-xs">
                  {ticket.passengerPhone}
                </span>
              </div>

              <div className="pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span>✓ {ticket.paymentMethod} Verified</span>
                  <span className="font-mono text-neutral-500">({ticket.paymentRef})</span>
                </span>
              </div>
            </div>

            {/* Visual Vector QR Code */}
            <div className="text-center shrink-0">
              <QRCodeDisplay value={ticket.qrPayload} size={110} />
              <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
                SCAN AT BAY GATE
              </span>
            </div>
          </div>

          {/* USSD & 24/7 Call Center Assistance Strip (Printed & Interactive) */}
          <div className="p-3.5 bg-neutral-900 text-white border-t border-dashed border-neutral-300">
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-neutral-800">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {lang === 'am' ? 'ከመስመር ውጭ USSD እና 24/7 የጥሪ ማዕከል' : 'Offline USSD & 24/7 Call Center'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                NO DATA NEEDED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* USSD Box */}
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      {lang === 'am' ? 'የUSSD ኮድ' : 'USSD Self-Service'}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">Ethio Telecom</span>
                  </div>
                  <div className="text-sm font-mono font-black text-amber-300 mt-0.5 tracking-wide">
                    {ussdCode}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                    {lang === 'am'
                      ? 'ያለ ዳታ በር (Bay) ለማረጋገጥ ወይም SMS ለመቀበል ይደውሉ'
                      : 'Dial on any phone to check bay status or resend SMS'}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 pt-1.5 border-t border-neutral-800/80">
                  <a
                    href={`tel:${encodeURIComponent(ussdCode)}`}
                    onClick={() => triggerHaptic(12)}
                    className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{lang === 'am' ? 'ይደውሉ' : 'Dial'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyUssd(ussdCode)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer text-[10px] font-semibold flex items-center gap-1 border border-neutral-700"
                    title="Copy USSD Code"
                  >
                    {ussdCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      setIsUssdModalOpen(true);
                    }}
                    className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-bold rounded-lg transition cursor-pointer border border-neutral-700 active:scale-95"
                    title="Open interactive USSD simulator"
                  >
                    {lang === 'am' ? 'ሞክር' : 'Test'}
                  </button>
                </div>
              </div>

              {/* Call Center Box */}
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                      {lang === 'am' ? 'የጥሪ ማዕከል' : 'Transit Hotline'}
                    </span>
                    <span className="text-[9px] text-amber-400 font-bold">24/7 LIVE</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-white font-mono">994</span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {lang === 'am' ? 'ከክፍያ ነፃ' : 'Toll-Free'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                    {lang === 'am'
                      ? 'ባሕር ዳር መቆጣጠሪያ፡ +251 58 220 0110'
                      : 'Regional Dispatch: +251 58 220 0110'}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 pt-1.5 border-t border-neutral-800/80">
                  <a
                    href="tel:994"
                    onClick={() => triggerHaptic(15)}
                    className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] font-bold rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{lang === 'am' ? '994 ይደውሉ' : 'Call 994'}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      setIsCallCenterModalOpen(true);
                    }}
                    className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold rounded-lg transition cursor-pointer border border-neutral-700 active:scale-95"
                    title="Open regional dispatch directory & IVR options"
                  >
                    {lang === 'am' ? 'ዝርዝር' : 'Details'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="bg-neutral-100 px-4 py-2 text-[10px] text-neutral-500 text-center border-t border-neutral-200">
            {t.scanQrAtBay}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
            >
              {t.close}
            </button>

            {onContactDriver && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onContactDriver(ticket);
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-xl transition cursor-pointer shadow-2xs active:scale-95"
                title={lang === 'en' ? 'Direct chat or SMS with bus driver' : 'ከአሽከርካሪው ጋር በChat ወይም SMS ተወያይ'}
              >
                <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>{lang === 'en' ? 'Chat / SMS Driver' : 'የአሽከርካሪ ውይይት'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
              title="Share via Android apps"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'Copied' : 'ተቀድቷል'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'en' ? 'Share' : 'አጋራ'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-neutral-600" />
              <span>{t.printTicket}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition cursor-pointer"
            >
              {lang === 'en' ? 'Done' : 'ጨርስ'}
            </button>
          </div>
        </div>

        {/* Interactive USSD Simulator Modal */}
        <UssdSimulatorModal
          isOpen={isUssdModalOpen}
          onClose={() => setIsUssdModalOpen(false)}
          ticket={ticket}
          lang={lang}
        />

        {/* 24/7 Call Center Information & Dispatch Directory Modal */}
        <CallCenterModal
          isOpen={isCallCenterModalOpen}
          onClose={() => setIsCallCenterModalOpen(false)}
          ticket={ticket}
          lang={lang}
        />
      </div>
    </div>
  );
};

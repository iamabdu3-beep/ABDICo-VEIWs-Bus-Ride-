import React, { useRef, useState } from 'react';
import { BookingTicket, Language } from '../types';
import { translations } from '../translations';
import { QRCodeDisplay } from './QRCodeDisplay';
import { X, Printer, CheckCircle2, ShieldCheck, Bus, MapPin, Calendar, Clock, User, Luggage, Share2, Check, MessageSquare } from 'lucide-react';
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

  const handlePrint = () => {
    triggerHaptic(10);
    window.print();
  };

  const handleShare = async () => {
    triggerHaptic(15);
    const text = `🎫 Bus Ride App Boarding Ticket: ${ticket.ticketId}\nRoute: ${ticket.fromStationName} ➔ ${ticket.toStationName}\nDate: ${ticket.travelDate} at ${ticket.departureTime}\nSeats: ${ticket.seatNumbers.join(', ')}\nPlate: ${ticket.plateNumber}`;
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
              {t.ticketConfirmed}
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              {ticket.ticketId}
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
                alt="Bus Ride App Logo"
                className="w-11 h-11 rounded-xl object-cover border border-amber-300/40 shrink-0 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bus Ride App • {lang === 'en' ? 'Verified Pass' : 'የተረጋገጠ ትኬት'}</span>
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
      </div>
    </div>
  );
};

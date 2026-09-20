import React, { useState } from 'react';
import { BookingTicket, Language, TripFeedback } from '../types';
import { translations } from '../translations';
import {
  X,
  Ticket,
  ArrowRight,
  Bus,
  Calendar,
  Clock,
  QrCode,
  BellRing,
  Luggage,
  Radio,
  MessageSquare,
  Star,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { LuggageTrackingView } from './LuggageTrackingView';
import { TripFeedbackView } from './TripFeedbackView';
import { getOrGenerateLuggageItems, getStatusBadgeConfig } from '../utils/luggageGenerator';
import { triggerHaptic } from '../utils/haptics';

interface MyTicketsModalProps {
  tickets: BookingTicket[];
  lang: Language;
  onClose: () => void;
  onSelectTicket: (ticket: BookingTicket) => void;
  onSearchRides: () => void;
  onSimulateAlertForTicket?: (ticket: BookingTicket) => void;
  initialTrackingTicket?: BookingTicket | null;
  onContactDriver?: (ticket: BookingTicket) => void;
  onUpdateFeedback?: (ticketId: string, feedback: TripFeedback) => void;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({
  tickets,
  lang,
  onClose,
  onSelectTicket,
  onSearchRides,
  onSimulateAlertForTicket,
  initialTrackingTicket = null,
  onContactDriver,
  onUpdateFeedback,
}) => {
  const t = translations[lang];
  const isAm = lang === 'am';
  const [trackingTicket, setTrackingTicket] = useState<BookingTicket | null>(initialTrackingTicket);
  const [feedbackTicket, setFeedbackTicket] = useState<BookingTicket | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTickets = tickets.filter((tk) => {
    if (activeFilter === 'active') return tk.status !== 'completed';
    if (activeFilter === 'completed') return tk.status === 'completed' || !!tk.feedback;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        className={`bg-white rounded-3xl w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 transition-all ${
          trackingTicket || feedbackTicket ? 'max-w-2xl' : 'max-w-xl'
        }`}
      >
        <button
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {feedbackTicket ? (
          <TripFeedbackView
            ticket={feedbackTicket}
            lang={lang}
            onBack={() => {
              triggerHaptic(10);
              setFeedbackTicket(null);
            }}
            onSubmitFeedback={(ticketId, feedback) => {
              if (onUpdateFeedback) {
                onUpdateFeedback(ticketId, feedback);
              }
              setFeedbackTicket((prev) =>
                prev ? { ...prev, feedback, status: 'completed' } : null
              );
            }}
          />
        ) : trackingTicket ? (
          <LuggageTrackingView
            ticket={trackingTicket}
            lang={lang}
            onBack={() => {
              triggerHaptic(10);
              setTrackingTicket(null);
            }}
            onContactDriver={onContactDriver}
          />
        ) : (
          <>
            {/* Modal Header */}
            <div className="border-b border-neutral-200 pb-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-xl font-bold text-neutral-900">
                    {t.myTickets}
                  </h3>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {tickets.length}
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {lang === 'en'
                  ? 'Your Amhara regional bus ride passes, luggage tracking & journey feedback'
                  : 'የተያዙ የአውቶቡስ ትኬቶች፣ የቦርዲንግ ፓሶች፣ የሻንጣ ክትትል እና የጉዞ ግምገማዎች'}
              </p>

              {/* Filter Tabs */}
              {tickets.length > 1 && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setActiveFilter('all');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {isAm ? 'ሁሉም' : 'All'} ({tickets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setActiveFilter('active');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      activeFilter === 'active'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {isAm ? 'ንቁ ጉዞዎች' : 'Active'} (
                    {tickets.filter((t) => t.status !== 'completed').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setActiveFilter('completed');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      activeFilter === 'completed'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {isAm ? 'የተጠናቀቁ / ደረጃ የተሰጣቸው' : 'Completed & Rated'} (
                    {
                      tickets.filter(
                        (t) => t.status === 'completed' || !!t.feedback
                      ).length
                    }
                    )
                  </button>
                </div>
              )}
            </div>

            {/* Tickets List */}
            {filteredTickets.length > 0 ? (
              <div className="space-y-3 max-h-[470px] overflow-y-auto pr-1">
                {filteredTickets.map((ticket) => {
                  const luggageItems = getOrGenerateLuggageItems(ticket);
                  const primaryLuggage = luggageItems[0];
                  const luggageBadge = primaryLuggage
                    ? getStatusBadgeConfig(primaryLuggage.status, lang)
                    : null;

                  return (
                    <div
                      key={ticket.ticketId}
                      onClick={() => onSelectTicket(ticket)}
                      className="bg-neutral-50 hover:bg-emerald-50/40 p-4 rounded-2xl border border-neutral-200 hover:border-emerald-400 transition cursor-pointer shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {ticket.ticketId}
                          </span>
                          <span className="text-[11px] text-neutral-600 font-bold">
                            {ticket.busCompany}
                          </span>
                          {ticket.status === 'completed' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                              {isAm ? 'የተጠናቀቀ ጉዞ' : 'Completed'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                              {isAm ? 'የተረጋገጠ' : 'Confirmed'}
                            </span>
                          )}
                        </div>

                        {/* Luggage quick status pill on top right */}
                        {luggageBadge && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 self-start sm:self-auto">
                            <Luggage className="w-3.5 h-3.5 text-emerald-700" />
                            <span>
                              {ticket.luggagePieces || 1} {t.luggagePiecesCount}:
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${luggageBadge.bgColor}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${luggageBadge.dotColor}`}
                              />
                              {luggageBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 font-black text-sm sm:text-base text-neutral-900">
                        <span>
                          {lang === 'en'
                            ? ticket.fromStation.city
                            : ticket.fromStation.cityAm}
                        </span>
                        <ArrowRight className="w-4 h-4 text-emerald-600" />
                        <span>
                          {lang === 'en'
                            ? ticket.toStation.city
                            : ticket.toStation.cityAm}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-neutral-500 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ticket.departureTime}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[11px]">
                          Bay #{ticket.bayNumber}
                        </span>
                        <span>•</span>
                        <span>
                          Seats:{' '}
                          <strong className="text-neutral-800">
                            {ticket.seatNumbers.join(', ')}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold font-mono">
                          {ticket.totalFareETB} ETB
                        </span>
                      </div>

                      {/* Prominent Rating Feedback Summary if rated */}
                      {ticket.feedback && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic(10);
                            setFeedbackTicket(ticket);
                          }}
                          className="bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex items-center text-amber-400 shrink-0">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= ticket.feedback!.overallRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-neutral-200 text-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-black text-neutral-900 font-mono text-xs shrink-0">
                              {ticket.feedback.overallRating}.0
                            </span>
                            {ticket.feedback.comment && (
                              <span className="text-xs text-neutral-600 truncate italic">
                                "{ticket.feedback.comment}"
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline shrink-0 ml-2">
                            {isAm ? 'አስተያየት እይ' : 'View Review'}
                          </span>
                        </div>
                      )}

                      {/* Action buttons row */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200/70 flex-wrap">
                        {/* Luggage tracking & Driver chat buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic(15);
                              setTrackingTicket(ticket);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Luggage className="w-3.5 h-3.5 text-emerald-800" />
                            <span>{t.trackLuggage}</span>
                          </button>

                          {onContactDriver && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic(12);
                                onContactDriver(ticket);
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                              title={
                                lang === 'en'
                                  ? 'Direct chat or SMS with bus driver'
                                  : 'ከአሽከርካሪው ጋር በChat ወይም SMS ተወያይ'
                              }
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                              <span>
                                {lang === 'en' ? 'Driver Chat' : 'የአሽከርካሪ ውይይት'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Post-Trip Feedback Rating & QR Code buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Rate Trip / Feedback button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic(12);
                              setFeedbackTicket(ticket);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                              ticket.feedback
                                ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                                : 'text-neutral-900 bg-amber-300 hover:bg-amber-400 border border-amber-400 ring-2 ring-amber-200/60'
                            }`}
                            title={
                              ticket.feedback
                                ? isAm
                                  ? 'የተሰጠውን ደረጃ ይመልከቱ'
                                  : 'View or edit journey rating'
                                : isAm
                                ? 'ለጉዞው ደረጃና አስተያየት ይስጡ'
                                : 'Rate this journey & service quality'
                            }
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                ticket.feedback
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'fill-neutral-900 text-neutral-900'
                              }`}
                            />
                            <span>
                              {ticket.feedback
                                ? isAm
                                  ? 'ደረጃ ተሰጥቷል ★'
                                  : 'Rated ★'
                                : isAm
                                ? 'ጉዞ ገምግም'
                                : 'Rate Journey'}
                            </span>
                          </button>

                          {onSimulateAlertForTicket && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic(10);
                                onSimulateAlertForTicket(ticket);
                              }}
                              className="px-2 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                              title={
                                lang === 'en'
                                  ? 'Simulate 30-min departure alert'
                                  : 'የ30 ደቂቃ መነሻ ማሳሰቢያ ሞክር'
                              }
                            >
                              <BellRing className="w-3 h-3 text-amber-700" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic(10);
                              onSelectTicket(ticket);
                            }}
                            className="text-xs font-bold text-neutral-800 hover:text-emerald-800 flex items-center gap-1 px-3 py-1.5 bg-neutral-200/80 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                            <span>
                              {lang === 'en' ? 'Pass & QR' : 'ቦርዲንግ ፓስ'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <Ticket className="w-12 h-12 text-neutral-300 mx-auto" />
                <h4 className="text-base font-bold text-neutral-700">
                  {lang === 'en'
                    ? 'No tickets found in this filter'
                    : 'በዚህ ምድብ ምንም ትኬት አልተገኘም'}
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {lang === 'en'
                    ? 'Select a destination in the Amhara region to book your virtual seat or share a ride.'
                    : 'በአማራ ክልል ከተሞች መካከል ለመጓዝ አውቶቡስ ይምረጡ እና ቦታዎን ይያዙ።'}
                </p>
                <button
                  onClick={() => {
                    triggerHaptic(10);
                    onClose();
                    onSearchRides();
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  {lang === 'en' ? 'Search Available Rides' : 'ጉዞዎችን ፈልግ'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};


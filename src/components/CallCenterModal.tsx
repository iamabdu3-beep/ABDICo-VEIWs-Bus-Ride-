import React, { useState } from 'react';
import { BookingTicket, Language } from '../types';
import { translations } from '../translations';
import { X, Phone, Headphones, Clock, Globe, ShieldCheck, Check, Copy, AlertCircle, ChevronRight, User } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: BookingTicket;
  lang: Language;
}

export const CallCenterModal: React.FC<CallCenterModalProps> = ({
  isOpen,
  onClose,
  ticket,
  lang,
}) => {
  const isAm = lang === 'am';
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIvr, setSelectedIvr] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    triggerHaptic(10);
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const ivrOptions = [
    {
      num: 1,
      titleEn: 'Departure Schedules & Platform Bays',
      titleAm: 'የመነሻ ሰዓቶች እና የመጫኛ በሮች (Bays)',
      descEn: 'Confirm current bus bay, departure delays, and scheduled arrival times.',
      descAm: 'የወቅቱ መጫኛ በር፣ መዘግየቶች እና የሚደርስበት ሰዓት ማረጋገጫ።',
    },
    {
      num: 2,
      titleEn: 'Ticket Re-issue & SMS Delivery',
      titleAm: 'ትኬት እንደገና ማግኘት እና በSMS መቀበል',
      descEn: 'Resend digital boarding pass to mobile or update passenger contact phone.',
      descAm: 'የዲጂታል ትኬት ወደ ስልክዎ በSMS መላክ ወይም ስልክ ቁጥር ማስተካከል።',
    },
    {
      num: 3,
      titleEn: 'Lost Baggage & Cargo Bay Claims',
      titleAm: 'የጠፋ ሻንጣ እና የጭነት ክፍል ጥያቄዎች',
      descEn: 'Track missing luggage tags or verify cargo security seal status.',
      descAm: 'የሻንጣ ታግ መፈለግ ወይም የጭነት ክፍል ማህተም ማረጋገጥ።',
    },
    {
      num: 4,
      titleEn: 'Speak to Live Transit Dispatcher',
      titleAm: 'ከቀጥታ የትራንስፖርት ተቆጣጣሪ ጋር ይነጋገሩ',
      descEn: 'Connect immediately to a regional duty officer at the nearest terminal.',
      descAm: 'በቅርብ መናኸሪያ ካለ ተረኛ መኮንን ጋር በቀጥታ ይገናኙ።',
    },
  ];

  const regionalStations = [
    { nameEn: 'Bahir Dar Central Station', nameAm: 'ባሕር ዳር ማዕከላዊ መናኸሪያ', phone: '+251 58 220 0110' },
    { nameEn: 'Gondar Bus Station', nameAm: 'ጎንደር አውቶቡስ መናኸሪያ', phone: '+251 58 111 2233' },
    { nameEn: 'Dessie Bus Terminal', nameAm: 'ደሴ አውቶቡስ መናኸሪያ', phone: '+251 33 111 4455' },
    { nameEn: 'Debre Markos Station', nameAm: 'ደብረ ማርቆስ መናኸሪያ', phone: '+251 58 771 1290' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="callcenter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic(8);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 shadow-md">
              <Headphones className="w-6 h-6 text-neutral-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30">
                  {isAm ? 'የ24/7 የትራንስፖርት አገልግሎት' : '24/7 Regional Transit Helpline'}
                </span>
              </div>
              <h2 id="callcenter-modal-title" className="text-lg font-black tracking-tight text-white mt-1">
                {translations[lang].modalCallCenterTitle || (isAm ? 'የ24/7 የትራንስፖርት ጥሪ ማዕከል (994)' : '24/7 Regional Transit Helpline (994)')}
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {translations[lang].modalCallCenterSub || (isAm ? 'ለፈጣን እርዳታ፣ የጉዞ ለውጥ እና ድንገተኛ ሁኔታዎች ይደውሉ' : 'Instant phone assistance for boarding, re-routing, and lost items')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
            aria-label="Close"
            className="p-1.5 text-neutral-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toll-Free Hero Dialer Section */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-emerald-50/50">
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                {isAm ? 'ይፋዊ ነጻ የስልክ መስመር' : 'Official Toll-Free Shortcode'}
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-neutral-900 font-mono tracking-tight">994</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {isAm ? 'ከክፍያ ነፃ' : 'Free of Charge'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{isAm ? '24 ሰዓት ክፍት • አማርኛ፣ እንግሊዝኛ፣ አፋን ኦሮሞ' : '24/7 Service • Amharic, English, Afaan Oromoo'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy('994', '994')}
                className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition cursor-pointer text-xs font-semibold flex items-center gap-1"
                title="Copy number"
              >
                {copied === '994' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href="tel:994"
                onClick={() => triggerHaptic(15)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>{isAm ? 'በ 994 ይደውሉ' : 'Call 994 Now'}</span>
              </a>
            </div>
          </div>

          {/* Ticket Reference helper if provided */}
          {ticket && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-neutral-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 font-medium block">
                  {isAm ? 'ለትኬት ጥያቄ ይጥቀሱ፡' : 'Quote this Pass ID to agent:'}
                </span>
                <span className="font-mono font-bold text-neutral-900 text-sm">
                  #{ticket.ticketId}
                </span>
                <span className="text-neutral-500 text-[11px] ml-2">
                  ({ticket.passengerName} • {ticket.departureTime})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(ticket.ticketId, 'ticket')}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition cursor-pointer"
              >
                {copied === 'ticket' ? (isAm ? 'ተቀድቷል' : 'Copied') : (isAm ? 'ኮፒ' : 'Copy')}
              </button>
            </div>
          )}
        </div>

        {/* IVR Voice Menu Guide */}
        <div className="p-4 sm:p-5 border-b border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
            {isAm ? 'የስልክ አማራጮች ማውጫ (IVR Options)' : 'Interactive Voice Menu (IVR)'}
          </h3>
          <div className="space-y-2">
            {ivrOptions.map((opt) => (
              <div
                key={opt.num}
                onClick={() => {
                  triggerHaptic(8);
                  setSelectedIvr(selectedIvr === opt.num ? null : opt.num);
                }}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  selectedIvr === opt.num
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-neutral-50/70 hover:bg-neutral-100/70 border-neutral-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {opt.num}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">
                      {isAm ? opt.titleAm : opt.titleEn}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-neutral-400 transition-transform ${
                      selectedIvr === opt.num ? 'rotate-90' : ''
                    }`}
                  />
                </div>
                {selectedIvr === opt.num && (
                  <p className="text-[11px] text-neutral-600 mt-2 pl-8 animate-in fade-in">
                    {isAm ? opt.descAm : opt.descEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Regional Terminal Dispatch Directory */}
        <div className="p-4 sm:p-5 bg-neutral-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
            {isAm ? 'የቀጠናዊ መናኸሪያዎች ቀጥታ መስመሮች' : 'Regional Terminal Direct Dispatches'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {regionalStations.map((st) => (
              <div
                key={st.phone}
                className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-neutral-900 block text-[11px] leading-tight">
                    {isAm ? st.nameAm : st.nameEn}
                  </span>
                  <span className="font-mono text-neutral-500 text-[10px]">
                    {st.phone}
                  </span>
                </div>
                <a
                  href={`tel:${st.phone.replace(/\s+/g, '')}`}
                  onClick={() => triggerHaptic(10)}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition cursor-pointer"
                  title="Call terminal"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200 rounded-xl transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

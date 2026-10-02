import React, { useState } from 'react';
import { BookingTicket, Language } from '../types';
import { X, Smartphone, Phone, ArrowLeft, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface UssdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: BookingTicket;
  lang: Language;
}

export const UssdSimulatorModal: React.FC<UssdSimulatorModalProps> = ({
  isOpen,
  onClose,
  ticket,
  lang,
}) => {
  const isAm = lang === 'am';
  const cleanCode = ticket.ussdCode || `*805*1*${ticket.ticketId.replace(/\D/g, '') || '784102'}#`;
  const [inputVal, setInputVal] = useState('');
  const [currentScreen, setCurrentScreen] = useState<'main' | 'bay' | 'sms' | 'driver' | 'callcenter' | 'luggage'>('main');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (opt: string) => {
    triggerHaptic(12);
    setStatusMessage(null);
    if (opt === '1') {
      setCurrentScreen('bay');
    } else if (opt === '2') {
      setCurrentScreen('sms');
      setStatusMessage(isAm ? 'የSMS ትኬት ወደ ስልክዎ ተልኳል!' : 'SMS ticket dispatched to your mobile number!');
    } else if (opt === '3') {
      setCurrentScreen('driver');
    } else if (opt === '4') {
      setCurrentScreen('callcenter');
    } else if (opt === '5') {
      setCurrentScreen('luggage');
    } else if (opt === '0') {
      setCurrentScreen('main');
    }
    setInputVal('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    if (currentScreen === 'main') {
      handleSelectOption(trimmed);
    } else if (trimmed === '0') {
      setCurrentScreen('main');
      setInputVal('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ussd-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic(8);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-sm bg-neutral-900 rounded-3xl shadow-2xl border-4 border-neutral-700 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Phone Notch & USSD Title Bar */}
        <div className="bg-neutral-800 px-4 py-3 border-b border-neutral-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span id="ussd-modal-title" className="text-xs font-bold text-white tracking-wide block">
                Ethio Telecom • USSD
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block">
                {cleanCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
            aria-label="Close USSD Simulator"
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulated Feature-phone Monospace Screen */}
        <div className="p-4 bg-neutral-950 text-emerald-400 font-mono text-xs select-none min-h-[290px] flex flex-col justify-between border-b border-neutral-800">
          <div>
            <div className="text-[10px] text-neutral-500 border-b border-neutral-800 pb-1 mb-2.5 flex items-center justify-between">
              <span>{isAm ? 'ባስ ራይድ ከመስመር ውጭ የUSSD አገልግሎት' : 'BUS RIDE ETHIOPIA • OFFLINE USSD'}</span>
              <span>2G/3G/4G</span>
            </div>

            {currentScreen === 'main' && (
              <div className="space-y-1.5 leading-relaxed">
                <p className="text-white font-bold text-[13px]">
                  {isAm ? 'እንኳን ደህና መጡ!' : 'Welcome to Bus Ride Amhara!'}
                </p>
                <p className="text-[11px] text-neutral-300">
                  {isAm ? 'ትኬት' : 'Pass'}: #{ticket.ticketId} ({ticket.status.toUpperCase()})
                </p>
                <p className="text-[11px] text-amber-300">
                  {isAm ? ticket.fromStation.cityAm : ticket.fromStation.city} ➔{' '}
                  {isAm ? ticket.toStation.cityAm : ticket.toStation.city}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {ticket.busCompany} • {ticket.departureTime} (Bay #{ticket.bayNumber})
                </p>

                <div className="pt-2 border-t border-neutral-800 space-y-1 text-emerald-300">
                  <p>1. {isAm ? 'የመጫኛ በርና መድረክ (Bay #)' : 'Boarding Gate & Bay #'}</p>
                  <p>2. {isAm ? 'ትኬት በነጻ SMS ላክ' : 'Resend SMS Boarding Pass'}</p>
                  <p>3. {isAm ? 'የአውቶቡስ ሹፌር ስልክ' : 'Driver Contact Info'}</p>
                  <p>4. {isAm ? 'የ24/7 የጥሪ ማዕከል (994)' : '24/7 Call Center (994)'}</p>
                  <p>5. {isAm ? 'የተመዘገበ ሻንጣ መረጃ' : 'Checked Baggage Info'}</p>
                  <p className="text-neutral-500">0. {isAm ? 'ውጣ' : 'Exit'}</p>
                </div>
              </div>
            )}

            {currentScreen === 'bay' && (
              <div className="space-y-2">
                <p className="text-white font-bold">
                  {isAm ? '✓ የመጫኛ መረጃ (Boarding Gate):' : '✓ Boarding Gate & Platform:'}
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-[11px]">
                  <p className="text-amber-300 font-bold text-sm">
                    {isAm ? `በር (BAY) ቁጥር #${ticket.bayNumber}` : `PLATFORM BAY #${ticket.bayNumber}`}
                  </p>
                  <p className="text-neutral-300">
                    {isAm ? 'መነሻ መናኸሪያ' : 'Origin'}: {isAm ? ticket.fromStation.nameAm : ticket.fromStation.name}
                  </p>
                  <p className="text-neutral-300">
                    {isAm ? 'የመነሻ ሰዓት' : 'Departure'}: {ticket.departureTime}
                  </p>
                  <p className="text-neutral-300">
                    {isAm ? 'መቀመጫዎች' : 'Seat(s)'}: {ticket.seatNumbers.join(', ')}
                  </p>
                  <p className="text-neutral-400 text-[10px]">
                    {isAm ? 'እባክዎ ከመነሻው 30 ደቂቃ አስቀድመው ይድረሱ።' : 'Please arrive 30 mins before departure.'}
                  </p>
                </div>
                <p className="text-neutral-500 text-[11px] pt-1">0. {isAm ? 'ወደ ዋና ሜኑ ተመለስ' : 'Back to Main Menu'}</p>
              </div>
            )}

            {currentScreen === 'sms' && (
              <div className="space-y-2">
                <p className="text-white font-bold">
                  {isAm ? '✓ የSMS ትኬት ማረጋገጫ:' : '✓ SMS Boarding Pass Dispatched:'}
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-[11px]">
                  <p className="text-emerald-400">
                    {isAm ? `የተላከበት ስልክ፡ ${ticket.passengerPhone}` : `Sent to phone: ${ticket.passengerPhone}`}
                  </p>
                  <p className="text-neutral-300">
                    {isAm
                      ? `ባስ ራይድ ትኬት #${ticket.ticketId}። መነሻ፡ ${ticket.departureTime}፣ በር #${ticket.bayNumber}፣ ወንበር፡ ${ticket.seatNumbers.join(', ')}።`
                      : `Bus Ride Pass #${ticket.ticketId}. Departs: ${ticket.departureTime}, Bay #${ticket.bayNumber}, Seats: ${ticket.seatNumbers.join(', ')}.`}
                  </p>
                  <p className="text-amber-300 text-[10px]">
                    {isAm ? 'የSMS ክፍያ፡ ነፃ (Free)' : 'Tariff: 0.00 ETB (Toll-Free)'}
                  </p>
                </div>
                <p className="text-neutral-500 text-[11px] pt-1">0. {isAm ? 'ወደ ዋና ሜኑ ተመለስ' : 'Back to Main Menu'}</p>
              </div>
            )}

            {currentScreen === 'driver' && (
              <div className="space-y-2">
                <p className="text-white font-bold">
                  {isAm ? '✓ የአውቶቡስ ሹፌር መረጃ:' : '✓ Assigned Bus Captain:'}
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-[11px]">
                  <p className="text-white font-bold">
                    {ticket.driverName || 'Captain Fasil Demeke'}
                  </p>
                  <p className="text-amber-300">
                    {ticket.driverPhone || '+251 91 876 5432'}
                  </p>
                  <p className="text-neutral-400">
                    {ticket.busCompany} • {ticket.plateNumber}
                  </p>
                  <a
                    href={`tel:${ticket.driverPhone || '+251918765432'}`}
                    className="inline-block mt-1 text-[10px] font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded transition"
                  >
                    📞 {isAm ? 'ወደ ሹፌሩ ይደውሉ' : 'Call Driver Now'}
                  </a>
                </div>
                <p className="text-neutral-500 text-[11px] pt-1">0. {isAm ? 'ወደ ዋና ሜኑ ተመለስ' : 'Back to Main Menu'}</p>
              </div>
            )}

            {currentScreen === 'callcenter' && (
              <div className="space-y-2">
                <p className="text-white font-bold">
                  {isAm ? '✓ የ24/7 የትራንስፖርት ጥሪ ማዕከል:' : '✓ 24/7 Regional Transit Hotline:'}
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-[11px]">
                  <p className="text-amber-300 font-bold text-sm">
                    {isAm ? 'ነጻ የስልክ መስመር፡ 994' : 'Toll-Free Hotline: 994'}
                  </p>
                  <p className="text-neutral-300">
                    {isAm ? 'ባሕር ዳር መቆጣጠሪያ፡ +251 58 220 0110' : 'Bahir Dar Central Dispatch: +251 58 220 0110'}
                  </p>
                  <p className="text-neutral-400 text-[10px]">
                    {isAm ? 'ቋንቋዎች፡ አማርኛ፣ እንግሊዝኛ፣ አፋን ኦሮሞ' : 'Languages: Amharic, English, Afaan Oromoo'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href="tel:994"
                      className="text-[10px] font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 rounded transition"
                    >
                      📞 {isAm ? '994 ይደውሉ' : 'Dial 994'}
                    </a>
                    <a
                      href="tel:+251582200110"
                      className="text-[10px] font-bold text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded border border-neutral-700 transition"
                    >
                      📞 {isAm ? 'መቆጣጠሪያ' : 'Dispatch'}
                    </a>
                  </div>
                </div>
                <p className="text-neutral-500 text-[11px] pt-1">0. {isAm ? 'ወደ ዋና ሜኑ ተመለስ' : 'Back to Main Menu'}</p>
              </div>
            )}

            {currentScreen === 'luggage' && (
              <div className="space-y-2">
                <p className="text-white font-bold">
                  {isAm ? '✓ የተመዘገበ ሻንጣ መረጃ:' : '✓ Checked Baggage Status:'}
                </p>
                <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-[11px]">
                  <p className="text-emerald-300">
                    {ticket.luggagePieces} {isAm ? 'የተመዘገቡ ሻንጣዎች' : 'Checked Bags Loaded'}
                  </p>
                  <p className="text-neutral-400">
                    {isAm ? 'የሻንጣ ታግ' : 'Baggage Tag'}: #{ticket.ticketId}-BAG
                  </p>
                  <p className="text-neutral-400">
                    {isAm ? 'የመጫኛ ሳጥን' : 'Cargo Bay'}: Compartment B-02
                  </p>
                  <p className="text-emerald-400 text-[10px]">
                    ✓ {isAm ? 'የደህንነት ፍተሻ አልፏል (Security Cleared)' : 'Security Cleared & Loaded'}
                  </p>
                </div>
                <p className="text-neutral-500 text-[11px] pt-1">0. {isAm ? 'ወደ ዋና ሜኑ ተመለስ' : 'Back to Main Menu'}</p>
              </div>
            )}
          </div>

          {/* Status Toast */}
          {statusMessage && (
            <div className="mt-2 p-1.5 bg-emerald-950 text-emerald-300 text-[10px] rounded border border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Dial Buttons */}
        <div className="p-3 bg-neutral-900 border-b border-neutral-800">
          <div className="text-[10px] text-neutral-400 mb-2 font-medium">
            {isAm ? 'ፈጣን ምርጫዎችን ይጫኑ፡' : 'Quick Interactive Keys:'}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {currentScreen === 'main' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectOption('1')}
                  className="py-2 px-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  1 • Bay #
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOption('2')}
                  className="py-2 px-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  2 • SMS
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOption('3')}
                  className="py-2 px-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  3 • Driver
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOption('4')}
                  className="py-2 px-1 text-xs font-mono font-bold bg-amber-900/60 hover:bg-amber-900 text-amber-300 rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  4 • 994 Call
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectOption('5')}
                  className="py-2 px-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  5 • Luggage
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    onClose();
                  }}
                  className="py-2 px-1 text-xs font-mono font-bold bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-lg transition active:scale-95 cursor-pointer text-center"
                >
                  0 • Exit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectOption('0')}
                className="col-span-3 py-2 px-2 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg transition active:scale-95 cursor-pointer text-center"
              >
                0 • {isAm ? 'ወደ ዋና ሜኑ ተመለስ (Back)' : 'Back to Main Menu'}
              </button>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-neutral-850 flex gap-2">
          <input
            type="number"
            min="0"
            max="9"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isAm ? 'ቁጥር ያስገቡ...' : 'Enter option (1-5)...'}
            className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder:text-neutral-500 focus:outline-hidden focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <span>{isAm ? 'ላክ' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

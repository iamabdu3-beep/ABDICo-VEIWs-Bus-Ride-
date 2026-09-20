import React, { useState } from 'react';
import {
  Luggage,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Package,
  Radio,
  Truck,
  QrCode,
  Phone,
  AlertCircle,
  Sparkles,
  Barcode,
  ChevronRight,
  Info,
  MessageSquare,
} from 'lucide-react';
import { BookingTicket, Language, LuggageItem, LuggageCheckpoint } from '../types';
import { getOrGenerateLuggageItems, getStatusBadgeConfig } from '../utils/luggageGenerator';
import { triggerHaptic } from '../utils/haptics';

interface LuggageTrackingViewProps {
  ticket: BookingTicket;
  lang: Language;
  onBack: () => void;
  onContactDriver?: (ticket: BookingTicket) => void;
}

export const LuggageTrackingView: React.FC<LuggageTrackingViewProps> = ({
  ticket,
  lang,
  onBack,
  onContactDriver,
}) => {
  const isAm = lang === 'am';
  const luggageItems = getOrGenerateLuggageItems(ticket);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number>(0);
  const [showClaimTagModal, setShowClaimTagModal] = useState<boolean>(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState<boolean>(false);

  const activeItem: LuggageItem = luggageItems[selectedPieceIndex] || luggageItems[0];
  const activeStatusConfig = getStatusBadgeConfig(activeItem.status, lang);

  const getCheckpointIcon = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted && !isCurrent) {
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    }
    switch (status) {
      case 'checked_in':
        return <Package className="w-4 h-4 text-white" />;
      case 'security_cleared':
        return <ShieldCheck className="w-4 h-4 text-white" />;
      case 'loaded':
        return <Truck className="w-4 h-4 text-white" />;
      case 'in_transit':
        return <Radio className="w-4 h-4 text-white animate-pulse" />;
      case 'arrived_at_terminal':
        return <MapPin className="w-4 h-4 text-white" />;
      case 'claimed':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-150">
      {/* Top Header with Back Action */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-neutral-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onBack();
            }}
            className="p-1.5 -ml-1 text-neutral-500 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition cursor-pointer"
            aria-label="Back to tickets list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                <Luggage className="w-3.5 h-3.5 text-emerald-700" />
                {isAm ? 'የሻንጣ መከታተያ' : 'Luggage Radar & Tracking'}
              </span>
              <span className="font-mono text-[11px] text-neutral-500 font-semibold">
                {ticket.ticketId}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-neutral-900 mt-0.5">
              {isAm ? ticket.fromStation.cityAm : ticket.fromStation.city} ➔{' '}
              {isAm ? ticket.toStation.cityAm : ticket.toStation.city}
            </h3>
          </div>
        </div>

        {/* Bus plate & operator pill */}
        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-neutral-800 block">
            {ticket.busCompany}
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            {ticket.plateNumber} • Bay #{ticket.bayNumber}
          </span>
        </div>
      </div>

      {/* Multi-piece selector tabs if passenger has > 1 piece */}
      {luggageItems.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 shrink-0">
          {luggageItems.map((item, idx) => {
            const isSelected = selectedPieceIndex === idx;
            const badge = getStatusBadgeConfig(item.status, lang);
            return (
              <button
                type="button"
                key={item.tagId}
                onClick={() => {
                  triggerHaptic(12);
                  setSelectedPieceIndex(idx);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-200'
                }`}
              >
                <Luggage className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-neutral-500'}`} />
                <span>
                  {isAm ? `ሻንጣ #${item.pieceNumber}` : `Piece #${item.pieceNumber}`}{' '}
                  <span className="font-normal opacity-85">({item.weightKg} kg)</span>
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? 'bg-amber-300' : badge.dotColor
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollable Main Area */}
      <div className="overflow-y-auto space-y-4 pr-1 flex-1 max-h-[520px]">
        {/* Active Luggage Tag Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-neutral-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-emerald-800 relative overflow-hidden">
          {/* Subtle watermark background pattern */}
          <div className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none">
            <Luggage className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-3">
            {/* Top row: Tag ID + Status Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">
                  {isAm ? 'ይፋዊ የሻንጣ ታግ ቁጥር' : 'Luggage Tag & Security Identifier'}
                </span>
                <span className="font-mono text-lg font-black tracking-wider text-amber-300">
                  {activeItem.tagId}
                </span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border shadow-xs ${activeStatusConfig.bgColor}`}
              >
                <span className={`w-2 h-2 rounded-full ${activeStatusConfig.dotColor}`} />
                <span>{activeStatusConfig.label}</span>
              </div>
            </div>

            {/* Simulated Digital Barcode */}
            <div className="bg-white/95 rounded-xl p-2.5 flex items-center justify-between text-neutral-900">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  {/* CSS Barcode lines */}
                  <div className="h-6 flex items-stretch gap-[2px] px-1">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4].map(
                      (w, i) => (
                        <div
                          key={i}
                          style={{ width: `${w}px` }}
                          className="bg-neutral-900 h-full rounded-[0.5px]"
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono text-[9px] text-neutral-500 font-bold tracking-widest text-center mt-0.5">
                    {activeItem.tagId}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setShowClaimTagModal(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAm ? 'ዲጂታል ታግ አሳይ' : 'Show Claim Tag'}</span>
              </button>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">
                  {isAm ? 'የሻንጣ ዓይነት' : 'Item Type'}
                </span>
                <span className="font-bold text-white truncate block">
                  {isAm ? activeItem.typeAm : activeItem.type}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">
                  {isAm ? 'የተመዘነ ክብደት' : 'Weight'}
                </span>
                <span className="font-bold text-amber-300">
                  {activeItem.weightKg} kg
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">
                  {isAm ? 'የደህንነት ማህተም' : 'Security Seal'}
                </span>
                <span className="font-mono font-bold text-white text-[11px] truncate block">
                  {activeItem.securitySeal}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">
                  {isAm ? 'የጭነት ክፍል' : 'Cargo Bay'}
                </span>
                <span className="font-bold text-white text-[11px] truncate block">
                  {isAm ? activeItem.cargoBayCompartmentAm : activeItem.cargoBayCompartment}
                </span>
              </div>
            </div>

            {/* Current Geo/Highway Location */}
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-100 bg-black/20 px-3 py-2 rounded-xl">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-emerald-300 font-semibold mr-1">
                  {isAm ? 'የአሁኑ አካባቢ፡' : 'Current Location:'}
                </span>
                <span className="font-bold text-white">
                  {isAm ? activeItem.currentLocationAm : activeItem.currentLocation}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 shrink-0">
                {activeItem.lastUpdated}
              </span>
            </div>
          </div>
        </div>

        {/* Transit Checkpoints Timeline Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>{isAm ? 'የጉዞ ፍተሻ ኬላዎች እና ሂደት' : 'Transit Checkpoint Timeline'}</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            {activeItem.checkpoints.filter((c) => c.isCompleted).length} /{' '}
            {activeItem.checkpoints.length} {isAm ? 'ተጠናቋል' : 'completed'}
          </span>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-600 before:via-emerald-400 before:to-neutral-200">
          {activeItem.checkpoints.map((checkpoint, idx) => {
            const isCompleted = checkpoint.isCompleted;
            const isCurrent = checkpoint.isCurrent;

            return (
              <div key={checkpoint.id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10 ${
                    isCurrent
                      ? 'bg-amber-500 ring-4 ring-amber-200 shadow-md scale-110'
                      : isCompleted
                      ? 'bg-emerald-700 shadow-xs'
                      : 'bg-neutral-300 border-2 border-white'
                  }`}
                >
                  {getCheckpointIcon(checkpoint.status, isCompleted, isCurrent)}
                </div>

                {/* Checkpoint Details Card */}
                <div
                  className={`rounded-xl p-3.5 transition-all border ${
                    isCurrent
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                      : isCompleted
                      ? 'bg-white border-neutral-200 hover:border-emerald-300 shadow-2xs'
                      : 'bg-neutral-50/70 border-neutral-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900">
                          {isAm ? checkpoint.nameAm : checkpoint.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                            {isAm ? 'አሁን እዚህ አለ' : 'Current Checkpoint'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{isAm ? checkpoint.locationAm : checkpoint.location}</span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                      {checkpoint.timestamp}
                    </span>
                  </div>

                  {/* Notes / Inspector log */}
                  <p className="text-xs text-neutral-600 mt-2 bg-white/80 p-2 rounded-lg border border-neutral-100 leading-relaxed">
                    {isAm ? checkpoint.notesAm : checkpoint.notes}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Terminal Baggage Support Card */}
        <div className="rounded-2xl p-3.5 bg-neutral-100 border border-neutral-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="font-bold text-neutral-900 block leading-tight">
                {isAm ? 'የሻንጣ ጥበቃ እና የይገባኛል ድጋፍ' : 'Luggage Guarantee & Station Assistance'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {isAm
                  ? 'ሻንጣዎን ሲረከቡ ማህተሙ ያልተሰበረ መሆኑን ያረጋግጡ'
                  : 'Verify the tamper-proof seal remains intact upon platform collection.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(12);
              setShowHelpDrawer(!showHelpDrawer);
            }}
            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
          >
            {isAm ? 'እርዳታ / ድጋፍ' : 'Get Help'}
          </button>
        </div>

        {/* Help Drawer info if opened */}
        {showHelpDrawer && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                {isAm ? 'የመናኸሪያው የሻንጣ ክፍል አድራሻዎች' : 'Terminal Baggage Hotlines & Lost Property'}
              </span>
              {onContactDriver && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    onContactDriver(ticket);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                  title={isAm ? 'ስለ ሻንጣዎ ለአሽከርካሪው መልእክት ይላኩ' : 'Chat or SMS Driver about stowed luggage'}
                >
                  <MessageSquare className="w-3 h-3 text-teal-700" />
                  <span>{isAm ? 'አሽከርካሪውን አናግር' : 'Chat / SMS Driver'}</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {isAm
                ? `ለማንኛውም ጥያቄ ወይም የሻንጣ መዘግየት የ${ticket.fromStation.cityAm} መናኸሪያ ስልክ ${ticket.fromStation.phone} ወይም የድንገተኛ ቁጥር ${ticket.fromStation.emergencyPhone} ይደውሉ።`
                : `For inquiries or baggage delay, contact ${ticket.fromStation.city} Baggage Desk at ${ticket.fromStation.phone} or Station Hotline at ${ticket.fromStation.emergencyPhone}.`}
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-amber-950 font-bold">
              <span>{ticket.busCompany} Dispatcher:</span>
              <a href={`tel:${ticket.fromStation.phone}`} className="underline text-emerald-800">
                {ticket.fromStation.phone}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Claim Tag Dialog Modal */}
      {showClaimTagModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto mb-3">
              <QrCode className="w-6 h-6 text-emerald-700" />
            </div>

            <h4 className="text-base font-black text-neutral-900">
              {isAm ? 'ይፋዊ የሻንጣ መረከቢያ ታግ' : 'Official Luggage Claim Pass'}
            </h4>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              {isAm
                ? 'መድረሻ መናኸሪያ ሲደርሱ ሻንጣዎን ለመረከብ ይህንን ኮድ ያሳዩ'
                : 'Present this digital claim receipt to station attendants upon arrival.'}
            </p>

            {/* High contrast barcode card */}
            <div className="bg-neutral-50 border-2 border-dashed border-emerald-600 rounded-2xl p-4 mb-4">
              <span className="font-mono text-xl font-black text-neutral-900 tracking-wider block mb-2">
                {activeItem.tagId}
              </span>

              {/* Barcode visual */}
              <div className="h-14 flex items-stretch justify-center gap-[2.5px] px-2 bg-white p-2 rounded-lg border border-neutral-200">
                {[2, 4, 1, 3, 2, 4, 1, 2, 3, 4, 1, 3, 2, 4, 1, 2, 4, 3, 1, 2, 4, 1, 3, 2, 4, 1].map(
                  (w, i) => (
                    <div
                      key={i}
                      style={{ width: `${w * 1.5}px` }}
                      className="bg-black h-full rounded-[0.5px]"
                    />
                  )
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-600 font-semibold border-t border-neutral-200 pt-2">
                <span>{activeItem.weightKg} kg</span>
                <span>Seal: {activeItem.securitySeal}</span>
                <span>Bay #{ticket.bayNumber}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowClaimTagModal(false);
              }}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              {isAm ? 'እሺ፣ ተረድቻለሁ' : 'Done / Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

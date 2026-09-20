import React, { useState } from 'react';
import {
  Star,
  ArrowLeft,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Clock,
  Bus,
  Luggage,
  UserCheck,
  Send,
  Edit3,
  Award,
} from 'lucide-react';
import { BookingTicket, Language, TripFeedback } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface TripFeedbackViewProps {
  ticket: BookingTicket;
  lang: Language;
  onBack: () => void;
  onSubmitFeedback: (ticketId: string, feedback: TripFeedback) => void;
}

const SERVICE_TAGS_EN = [
  'Punctual Departure',
  'Smooth & Safe Driving',
  'Clean & Fresh Seats',
  'Polite Conductor',
  'Functional AC / Airflow',
  'Careful Luggage Loading',
  'Comfortable Rest Stops',
  'Safe Highway Speeds',
  'Clear Station Announcements',
];

const SERVICE_TAGS_AM = [
  'በሰዓቱ መነሳት',
  'ረጋ ያለና ደህንነቱ የተጠበቀ አነዳድ',
  'ንጹሕና ምቹ ወንበሮች',
  'ትሁት አስተናጋጅ/ረዳት',
  'ጥሩ አየር ማናፈሻ',
  'ሻንጣ በጥንቃቄ መያዝ',
  'ምቹ የመንገድ ላይ እረፍት',
  'ትክክለኛ ፍጥነት',
  'ግልጽ የመናኸሪያ ማሳሰቢያዎች',
];

export const TripFeedbackView: React.FC<TripFeedbackViewProps> = ({
  ticket,
  lang,
  onBack,
  onSubmitFeedback,
}) => {
  const isAm = lang === 'am';
  const existing = ticket.feedback;

  // Form mode: either submitting new or editing existing
  const [isEditing, setIsEditing] = useState<boolean>(!existing);
  
  // Rating states
  const [overallRating, setOverallRating] = useState<number>(existing?.overallRating || 5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [punctualityRating, setPunctualityRating] = useState<number>(existing?.punctualityRating || 5);
  const [driverRating, setDriverRating] = useState<number>(existing?.driverRating || 5);
  const [comfortRating, setComfortRating] = useState<number>(existing?.comfortRating || 5);
  const [luggageCareRating, setLuggageCareRating] = useState<number>(existing?.luggageCareRating || 5);
  
  const [selectedTags, setSelectedTags] = useState<string[]>(
    existing?.serviceTags || (isAm ? ['በሰዓቱ መነሳት', 'ረጋ ያለና ደህንነቱ የተጠበቀ አነዳድ'] : ['Punctual Departure', 'Smooth & Safe Driving'])
  );
  const [comment, setComment] = useState<string>(existing?.comment || '');
  const [recommend, setRecommend] = useState<boolean>(existing?.recommendToOthers ?? true);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    triggerHaptic(8);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRatingLabel = (rating: number) => {
    if (isAm) {
      switch (rating) {
        case 5:
          return 'ምርጥ አገልግሎት (Excellent)';
        case 4:
          return 'በጣም ጥሩ (Very Good)';
        case 3:
          return 'ጥሩ/መካከለኛ (Good)';
        case 2:
          return 'መሻሻል ያለበት (Fair)';
        case 1:
        default:
          return 'ደካማ (Poor)';
      }
    }
    switch (rating) {
      case 5:
        return 'Excellent Experience';
      case 4:
        return 'Very Good';
      case 3:
        return 'Good & Satisfactory';
      case 2:
      case 1:
      default:
        return rating <= 1 ? 'Needs Major Improvement' : 'Fair / Could Be Better';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(20);

    const newFeedback: TripFeedback = {
      id: existing?.id || `fb-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.ticketId,
      overallRating,
      punctualityRating,
      driverRating,
      comfortRating,
      cleanlinessRating: comfortRating,
      luggageCareRating,
      serviceTags: selectedTags,
      comment: comment.trim(),
      recommendToOthers: recommend,
      submittedAt: new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ` at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      driverOrOperatorResponse: existing?.driverOrOperatorResponse || {
        author: `${ticket.busCompany} Customer Care Desk`,
        authorAm: `የ${ticket.busCompany} የደንበኞች እንክብካቤ ክፍል`,
        text: 'Thank you for your valuable feedback! We continuously monitor driver behavior, coach cleanliness, and terminal punctuality across all Amhara regional routes.',
        textAm: 'ስለሰጡን ገንቢ አስተያየት እናመሰግናለን! በሁሉም የአማራ ክልል መስመሮች ላይ የአሽከርካሪዎችን ስነ-ምግባር፣ የአውቶቡስ ንጽሕና እና የሰዓት አከባበርን በቅርበት እንከታተላለን።',
        timestamp: 'Auto-Acknowledged by Dispatch',
      },
    };

    onSubmitFeedback(ticket.ticketId, newFeedback);
    setIsSubmittedSuccess(true);
    setIsEditing(false);
  };

  const currentTagsList = isAm ? SERVICE_TAGS_AM : SERVICE_TAGS_EN;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header with Back button */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onBack();
            }}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
            aria-label="Back to Tickets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-lg font-black text-neutral-900 flex items-center gap-2">
              <span>{isAm ? 'የጉዞ ግብረ-መልስ እና ደረጃ' : 'Post-Trip Journey Feedback'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                {ticket.ticketId}
              </span>
            </h3>
            <p className="text-xs text-neutral-500">
              {ticket.busCompany} • {isAm ? ticket.fromStation.cityAm : ticket.fromStation.city} → {isAm ? ticket.toStation.cityAm : ticket.toStation.city}
            </p>
          </div>
        </div>

        {existing && !isEditing && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isAm ? 'አስተካክል' : 'Edit Review'}</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {isSubmittedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">
              {isAm ? 'አስተያየትዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Thank you! Your feedback has been recorded.'}
            </span>
            <span className="text-emerald-700">
              {isAm
                ? 'የሰጡት ግምገማ የአማራ ክልል የትራንስፖርት አገልግሎት ጥራትን ለማሻሻል ይረዳል'
                : 'Your rating helps other passengers and assists the Amhara Transport Bureau in quality control.'}
            </span>
          </div>
        </div>
      )}

      {/* Read-Only Mode (If feedback exists and not currently editing) */}
      {!isEditing && existing ? (
        <div className="space-y-4 bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200">
          {/* Main Score & Recommendation Banner */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                {isAm ? 'የተጠቃሚ ደረጃ' : 'Overall Passenger Rating'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= existing.overallRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-black font-mono text-neutral-900">
                  {existing.overallRating}.0 / 5.0
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                {getRatingLabel(existing.overallRating)}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200">
              {existing.recommendToOthers ? (
                <>
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">
                    {isAm ? 'ለሌሎች ይመከራል' : 'Recommends this operator'}
                  </span>
                </>
              ) : (
                <>
                  <ThumbsDown className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-rose-800">
                    {isAm ? 'አይመከርም' : 'Would not recommend'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sub-Category Ratings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                {isAm ? 'የሰዓት አከባበር' : 'Punctuality'}
              </span>
              <span className="font-mono font-bold text-amber-500 text-sm mt-0.5 block">
                ★ {existing.punctualityRating || 5}/5
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                {isAm ? 'አሽከርካሪ/አስተናጋጅ' : 'Driver & Staff'}
              </span>
              <span className="font-mono font-bold text-amber-500 text-sm mt-0.5 block">
                ★ {existing.driverRating || 5}/5
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                {isAm ? 'የአውቶቡስ ምቾት' : 'Coach Comfort'}
              </span>
              <span className="font-mono font-bold text-amber-500 text-sm mt-0.5 block">
                ★ {existing.comfortRating || 5}/5
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] text-neutral-400 block font-semibold">
                {isAm ? 'የሻንጣ አያያዝ' : 'Luggage Care'}
              </span>
              <span className="font-mono font-bold text-amber-500 text-sm mt-0.5 block">
                ★ {existing.luggageCareRating || 5}/5
              </span>
            </div>
          </div>

          {/* Highlight Tags */}
          {existing.serviceTags && existing.serviceTags.length > 0 && (
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1.5">
                {isAm ? 'የተመረጡ የአገልግሎት ድምቀቶች' : 'Service Highlights Reported'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {existing.serviceTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold bg-emerald-100/70 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comment Bubble */}
          {existing.comment && (
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                {isAm ? 'የተሳፋሪ አስተያየት' : 'Passenger Review & Observations'}
              </span>
              <p className="text-xs text-neutral-800 italic leading-relaxed">
                "{existing.comment}"
              </p>
              <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-100 pt-1.5">
                <span>Verified Passenger: {ticket.passengerName}</span>
                <span>{existing.submittedAt}</span>
              </div>
            </div>
          )}

          {/* Operator Response Box */}
          {existing.driverOrOperatorResponse && (
            <div className="bg-emerald-900 text-white p-3.5 rounded-xl border border-emerald-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isAm
                      ? existing.driverOrOperatorResponse.authorAm
                      : existing.driverOrOperatorResponse.author}
                  </span>
                </span>
                <span className="text-[10px] text-emerald-200">
                  {existing.driverOrOperatorResponse.timestamp}
                </span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                {isAm
                  ? existing.driverOrOperatorResponse.textAm
                  : existing.driverOrOperatorResponse.text}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Interactive Rating & Comment Submission Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main 5-Star Selector */}
          <div className="bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-neutral-50 p-4 sm:p-5 rounded-2xl border border-amber-200/80 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">
              {isAm ? 'አጠቃላይ የጉዞ ጥራትዎን ደረጃ ይስጡ' : 'Rate Your Overall Journey Quality'}
            </span>

            {/* Stars row */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoveredStar !== null ? hoveredStar : overallRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => {
                      triggerHaptic(12);
                      setOverallRating(star);
                    }}
                    className="p-1 transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                    aria-label={`${star} stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'fill-neutral-200 text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-bold text-neutral-800">
              {getRatingLabel(hoveredStar !== null ? hoveredStar : overallRating)}
            </p>
          </div>

          {/* Sub-Category 4 Aspect Ratings */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 space-y-3">
            <span className="text-xs font-bold text-neutral-900 block">
              {isAm ? 'የተወሰኑ የአገልግሎት መስፈርቶች' : 'Detailed Service Criteria'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Punctuality */}
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-neutral-700">
                    {isAm ? 'የሰዓት አከባበር' : 'Punctuality & Departure'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setPunctualityRating(s);
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= punctualityRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Conduct */}
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-neutral-700">
                    {isAm ? 'አሽከርካሪና ረዳት' : 'Driver Conduct & Safety'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setDriverRating(s);
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= driverRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comfort & Cleanliness */}
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-neutral-700">
                    {isAm ? 'ንጽሕናና ምቾት' : 'Coach Cleanliness & AC'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setComfortRating(s);
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= comfortRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Luggage Care */}
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Luggage className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-neutral-700">
                    {isAm ? 'የሻንጣ አያያዝ' : 'Luggage Care & Security'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setLuggageCareRating(s);
                      }}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= luggageCareRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-neutral-200 text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Highlight Tags Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-800 block">
              {isAm ? 'የአገልግሎቱ ድምቀቶች (ይምረጡ)' : 'What went well? (Select Highlights)'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentTagsList.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Comment / Review Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
              <span>{isAm ? 'አስተያየትዎን ወይም ቅሬታዎን እዚህ ይጻፉ' : 'Your Comments & Service Experience'}</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {comment.length}/500 chars
              </span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                isAm
                  ? 'ስለ ጉዞው፣ ስለ ረዳቱ፣ ስለ ወንበሮቹ ምቾት ወይም ስለ አሽከርካሪው አነዳድ ማንኛውንም አስተያየት እዚህ ይጻፉ...'
                  : 'Describe your journey experience, seating comfort, driver professionalism, or terminal boarding...'
              }
              className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder:text-neutral-400"
            />
          </div>

          {/* Recommendation Toggle */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-800">
              {isAm ? 'ይህን የትራንስፖርት አገልግሎት ለሌሎች ይመክራሉ?' : 'Would you recommend this bus company to others?'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setRecommend(true);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  recommend
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{isAm ? 'አዎ' : 'Yes'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setRecommend(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  !recommend
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>{isAm ? 'አይደለም' : 'No'}</span>
              </button>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-200">
            {existing && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition cursor-pointer"
              >
                {isAm ? 'ሰርዝ' : 'Cancel'}
              </button>
            )}
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAm ? 'አስተያየት አስረክብ' : 'Submit Journey Review'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

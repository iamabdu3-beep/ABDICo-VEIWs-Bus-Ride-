import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  MessageSquare,
  Smartphone,
  CheckCheck,
  Check,
  Star,
  Bus,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  Copy,
  ExternalLink,
  Shield,
  User,
  Radio,
  Luggage,
} from 'lucide-react';
import { Language, ChatMessage, DriverContactContext } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface DriverChatModalProps {
  context: DriverContactContext;
  lang: Language;
  onClose: () => void;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  context,
  lang,
  onClose,
}) => {
  const isAm = lang === 'am';
  const [activeTab, setActiveTab] = useState<'chat' | 'sms'>('chat');
  const [inputText, setInputText] = useState('');
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [senderRole, setSenderRole] = useState<'traveller' | 'driver'>('traveller');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Storage key for keeping trip chat persistent
  const storageKey = `amh_chat_${context.driverPhone.replace(/\D/g, '')}_${context.ticketId || context.vehiclePlate}`;

  const defaultInitialMessages: ChatMessage[] = [
    {
      id: 'sys-1',
      sender: 'system',
      senderName: 'Amhara Transit Dispatch',
      text: isAm
        ? `የተረጋገጠ የተሳፋሪ-አሽከርካሪ መልእክት መረብ። አሽከርካሪ ${context.driverName} (${context.companyOrModel}) መስመር ላይ ናቸው።`
        : `Verified Passenger-Driver Channel. Driver ${context.driverName} (${context.companyOrModel}) is online and monitoring messages.`,
      timestamp: 'Just now',
    },
    {
      id: 'driver-1',
      sender: 'driver',
      senderName: context.driverName,
      text: isAm
        ? `ጤና ይስጥልኝ! አሽከርካሪ ${context.driverName} ነኝ። ወደ ${context.routeTitle} ለሚደረገው ጉዞ በ${context.vehiclePlate} ዝግጁ ነኝ። ጥያቄ ካለዎት እባክዎ ይጠይቁኝ።`
        : `Selam! This is Driver ${context.driverName}. I am stationed with vehicle ${context.vehiclePlate} for our trip along ${context.routeTitle}. Please let me know if you need anything before departure.`,
      timestamp: '2 mins ago',
      isRead: true,
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore fallback
    }
    return defaultInitialMessages;
  });

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages, storageKey]);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Quick chips
  const quickChips = isAm
    ? [
        'መናኸሪያው ፕላትፎርም ላይ ደርሻለሁ',
        'የመንገደኞች መግቢያ ስንት ሰዓት ይጀምራል?',
        'የተመዘገበ ሻንጣ ይዤያለሁ',
        'አውቶቡሱ አሁን የት ነው ያለው?',
        '5 ደቂቃ ዘግይቻለሁ እባክዎ ይጠብቁኝ',
      ]
    : [
        'I am at the terminal platform bay',
        'What time does passenger boarding start?',
        'I have registered luggage pieces',
        'Where is the vehicle right now?',
        'Running 5 minutes late, please hold',
      ];

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    triggerHaptic(12);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: senderRole,
      senderName: senderRole === 'traveller' ? (context.passengerName || 'Traveller') : context.driverName,
      text: content,
      timestamp: timeStr,
      isRead: true,
      channel: 'chat',
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // If traveler sent a message, simulate realistic driver reply after 1.2s
    if (senderRole === 'traveller') {
      setTimeout(() => {
        const driverResponsesEn = [
          `Received! I am right here at Bay #${context.bayNumber || 4}. The passenger doors are open for seating.`,
          `No problem at all! The bus departs promptly at ${context.departureTime || 'scheduled time'}. Luggage hold is active.`,
          `Understood! Take your time approaching the gate safely. We verify all passenger boarding passes carefully.`,
          `Noted! If you need help finding Bay #${context.bayNumber || 4}, ask any terminal security officer in uniform.`,
        ];

        const driverResponsesAm = [
          `መልእክትዎ ደርሶኛል! በፕላትፎርም ቁጥር #${context.bayNumber || 4} ላይ ነኝ፤ በሩ ክፍት ስለሆነ መግባት ይችላሉ።`,
          `ምንም ችግር የለም! አውቶቡሳችን በሰዓቱ ${context.departureTime || 'በተያዘው ሰዓት'} ይነሳል። የሻንጣ ክፍሉ ክፍት ነው።`,
          `ተረድቻለሁ! በመረጋጋት ወደ በሩ ይምጡ። የሁሉንም መንገደኞች ትኬት በማረጋገጥ ላይ ነን።`,
          `መልካም! ፕላትፎርም #${context.bayNumber || 4} ለመድረስ የመናኸሪያው የጸጥታ ሰራተኞችን መጠየቅ ይችላሉ።`,
        ];

        const randomReply = isAm
          ? driverResponsesAm[Math.floor(Math.random() * driverResponsesAm.length)]
          : driverResponsesEn[Math.floor(Math.random() * driverResponsesEn.length)];

        const driverReply: ChatMessage = {
          id: `driver-${Date.now()}`,
          sender: 'driver',
          senderName: context.driverName,
          text: randomReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
          channel: 'chat',
        };

        setMessages((prev) => [...prev, driverReply]);
        triggerHaptic(15);
      }, 1300);
    }
  };

  // Pre-filled SMS Body
  const smsBody = isAm
    ? `ሰላም አሽከርካሪ ${context.driverName}፣ እኔ መንገደኛ ${context.passengerName || 'ተሳፋሪ'} ነኝ። ትኬት ቁጥር፡ ${context.ticketId || 'የጉዞ ትኬት'}። ለ${context.routeTitle} ጉዞ በ${context.departureTime || 'በተያዘው ሰዓት'} ፕላትፎርም #${context.bayNumber || 4} እገኛለሁ። ተሽከርካሪ፡ ${context.vehiclePlate}`
    : `Selam Driver ${context.driverName}, this is passenger ${context.passengerName || 'Traveller'}. Ticket Ref: ${context.ticketId || 'Bus Pass'}. I am booked for ${context.routeTitle} at ${context.departureTime || 'scheduled time'}, Bay #${context.bayNumber || 4}. Plate: ${context.vehiclePlate}.`;

  const [customSMS, setCustomSMS] = useState(smsBody);

  const cleanPhone = context.driverPhone.replace(/\s+/g, '');
  const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(customSMS)}`;
  const telUrl = `tel:${cleanPhone}`;

  const handleCopySMS = () => {
    triggerHaptic(10);
    navigator.clipboard.writeText(customSMS);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Driver Profile */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-neutral-900 text-white p-4 shrink-0 relative">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border-2 border-emerald-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                {context.driverName.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-emerald-950 flex items-center justify-center" title="Online">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-white truncate">
                  {context.driverName}
                </h3>
                {context.driverRating && (
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded border border-amber-300/30">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{context.driverRating}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-200 font-medium truncate mt-0.5">
                {context.companyOrModel} • <span className="font-mono text-amber-300">{context.vehiclePlate}</span>
              </p>

              <div className="flex items-center gap-2 text-[11px] text-emerald-300/90 mt-1 flex-wrap">
                <span>{context.routeTitle}</span>
                {context.bayNumber && (
                  <>
                    <span>•</span>
                    <span className="bg-white/15 px-1.5 py-0.2 rounded font-mono font-bold text-white">
                      Bay #{context.bayNumber}
                    </span>
                  </>
                )}
                {context.departureTime && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{context.departureTime}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Telephone Call / SMS Trigger Strip */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-mono">
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>{context.driverPhone}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={telUrl}
                onClick={() => triggerHaptic(15)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-3 h-3" />
                <span>{isAm ? 'ደውል' : 'Call'}</span>
              </a>

              <a
                href={smsUrl}
                onClick={() => triggerHaptic(15)}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-black transition shadow-xs"
              >
                <Smartphone className="w-3 h-3 text-neutral-950" />
                <span>{isAm ? 'ቀጥታ SMS' : 'Direct SMS'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Live In-App Chat vs Direct SMS Composer */}
        <div className="flex items-center bg-neutral-100 border-b border-neutral-200 p-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('chat');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-900 shadow-xs border border-neutral-200/80'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>{isAm ? 'የቀጥታ ውይይት (Chat)' : 'In-App Live Chat'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('sms');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-white text-emerald-900 shadow-xs border border-neutral-200/80'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>{isAm ? 'ቀጥታ SMS አዘጋጅ' : 'Native SMS Dispatch'}</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'chat' ? (
          <div className="flex flex-col flex-1 min-h-0 bg-neutral-50/70">
            {/* Sender Switcher bar for testing both roles */}
            <div className="bg-neutral-100/90 border-b border-neutral-200/80 px-3 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500 font-medium">
                {isAm ? 'መልእክት የሚልከው አካል፡' : 'Sending message as:'}
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-neutral-200">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setSenderRole('traveller');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    senderRole === 'traveller'
                      ? 'bg-emerald-700 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {isAm ? 'መንገደኛ (Traveller)' : 'Traveller (Me)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(6);
                    setSenderRole('driver');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    senderRole === 'driver'
                      ? 'bg-emerald-700 text-white'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {isAm ? 'አሽከርካሪ (Driver)' : 'Driver'}
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 min-h-[260px] max-h-[380px]">
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center py-1">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-2xs max-w-xs sm:max-w-md mx-auto leading-relaxed">
                        <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{msg.text}</span>
                      </span>
                    </div>
                  );
                }

                const isTraveller = msg.sender === 'traveller';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isTraveller ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-neutral-400 mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                    <div
                      className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                        isTraveller
                          ? 'bg-emerald-700 text-white rounded-tr-xs'
                          : 'bg-white text-neutral-900 border border-neutral-200/90 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                          isTraveller ? 'text-emerald-200' : 'text-neutral-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isTraveller && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Inquiry Chips */}
            <div className="p-2 border-t border-neutral-200 bg-white overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 pl-1">
                {isAm ? 'ፈጣን ጥያቄዎች፡' : 'Quick Inquiries:'}
              </span>
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-emerald-100 hover:text-emerald-900 border border-neutral-200/80 rounded-full text-[11px] font-medium text-neutral-700 whitespace-nowrap transition cursor-pointer shrink-0 active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isAm
                    ? `ለ${context.driverName} መልእክት ይጻፉ...`
                    : `Message ${context.driverName}...`
                }
                className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />

              <button
                type="button"
                disabled={!inputText.trim()}
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition cursor-pointer shadow-xs active:scale-95 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Native SMS Composer View */
          <div className="p-4 sm:p-5 flex flex-col flex-1 overflow-y-auto space-y-4 bg-neutral-50/50">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
              <Smartphone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-amber-900">
                  {isAm ? 'ቀጥታ የሞባይል SMS መላኪያ' : 'Direct Mobile SMS Gateway'}
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {isAm
                    ? 'በተንቀሳቃሽ ስልክዎ ያለ ኢንተርኔት ኮኔክሽን በቀጥታ ለአሽከርካሪው የጽሑፍ መልእክት (SMS) ለመላክ ይህንን አማራጭ ይጠቀሙ።'
                    : 'Send an offline SMS message directly to the driver via your mobile telecom carrier (Ethio Telecom / Safaricom Ethiopia).'}
                </p>
              </div>
            </div>

            {/* Recipient spec */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-500 font-medium">
                  {isAm ? 'ተቀባይ አሽከርካሪ' : 'Recipient Driver'}:
                </span>
                <span className="font-bold text-neutral-900">{context.driverName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-neutral-500 font-medium">
                  {isAm ? 'የስልክ ቁጥር' : 'Phone Number'}:
                </span>
                <span className="font-mono font-black text-emerald-800">{context.driverPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">
                  {isAm ? 'የአውቶቡስ ታርጋ' : 'Vehicle Plate'}:
                </span>
                <span className="font-mono text-neutral-800">{context.vehiclePlate}</span>
              </div>
            </div>

            {/* Editable SMS Body */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-neutral-800">
                  {isAm ? 'የSMS መልእክት ጽሑፍ' : 'SMS Message Draft'}:
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {customSMS.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={customSMS}
                onChange={(e) => setCustomSMS(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-2xl p-3 text-xs text-neutral-900 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed shadow-2xs resize-none"
              />
            </div>

            {/* Big Action Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={smsUrl}
                onClick={() => triggerHaptic(15)}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>{isAm ? 'የስልኬን የSMS መተግበሪያ ክፈት' : 'Open Mobile SMS App'}</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySMS}
                  className="py-2.5 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  {copiedSMS ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isAm ? 'ተቀድቷል!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{isAm ? 'ጽሑፉን ቅዳ' : 'Copy Text'}</span>
                    </>
                  )}
                </button>

                <a
                  href={telUrl}
                  onClick={() => triggerHaptic(12)}
                  className="py-2.5 px-3 bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAm ? 'ቀጥታ ደውል' : 'Direct Call'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

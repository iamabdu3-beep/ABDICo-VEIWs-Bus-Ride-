import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Search,
  X,
  Keyboard,
  Bus,
  QrCode,
  User,
  Building2,
  ShieldCheck,
  Luggage,
  Smartphone,
  ArrowRight,
  Check,
  Clock,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Language } from '../types';
import { triggerHaptic } from '../utils/haptics';

export interface QuickActionItem {
  id: string;
  category: 'booking' | 'ticketing' | 'portal' | 'system';
  categoryLabelEn: string;
  categoryLabelAm: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  shortcutDisplay: string;
  keyChar: string; // Key code (e.g., 'b', 't', '1', '2', '3', '4', 'l', 'a')
  altKeyRequired?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  onExecute: () => void;
  badge?: string;
  disabled?: boolean;
}

interface DashboardQuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  actions: QuickActionItem[];
  announcement: string;
  onAnnounce: (msg: string) => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const DashboardQuickActionsModal: React.FC<DashboardQuickActionsModalProps> = ({
  isOpen,
  onClose,
  lang,
  actions,
  announcement,
  onAnnounce,
  triggerRef,
}) => {
  const isAm = lang === 'am';
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const actionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter actions based on search query
  const filteredActions = actions.filter((act) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      act.titleEn.toLowerCase().includes(q) ||
      act.titleAm.toLowerCase().includes(q) ||
      act.descriptionEn.toLowerCase().includes(q) ||
      act.descriptionAm.toLowerCase().includes(q) ||
      act.shortcutDisplay.toLowerCase().includes(q) ||
      act.category.toLowerCase().includes(q)
    );
  });

  // Reset focus index when search changes or modal opens
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery, isOpen]);

  // Handle modal opening: focus the search input, announce opening to screen readers
  useEffect(() => {
    if (isOpen) {
      triggerHaptic(10);
      onAnnounce(
        isAm
          ? `የፈጣን ትዕዛዞች ዝርዝር ተከፍቷል (${filteredActions.length} ትዕዛዞች አሉ። ለመዝጋት Escape፣ ለትዕዛዞች Alt እና አቋራጭ ቁልፍ ይጠቀሙ)`
          : `Screen-reader Quick Actions menu opened. ${filteredActions.length} actions available. Press Escape to exit, or use Alt shortcut keys directly.`
      );
      // Slight delay to allow DOM mounting
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Return focus to trigger button when closed
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    }
  }, [isOpen]);

  // Keyboard navigation inside modal (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        triggerHaptic(8);
        onAnnounce(isAm ? 'የፈጣን ትዕዛዞች ዝርዝር ተዘግቷል' : 'Quick Actions menu closed.');
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1 >= filteredActions.length ? 0 : prev + 1;
          actionButtonRefs.current[next]?.focus();
          return next;
        });
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1 < 0 ? filteredActions.length - 1 : prev - 1;
          actionButtonRefs.current[next]?.focus();
          return next;
        });
        return;
      }

      // Check if user pressed any direct shortcut key while in the dialog
      // e.g. Alt+B, Alt+T, Alt+1, Alt+2, etc.
      const pressedKey = e.key.toLowerCase();
      const matchedAction = filteredActions.find(
        (a) =>
          a.keyChar.toLowerCase() === pressedKey &&
          (a.altKeyRequired ? e.altKey : true) &&
          !a.disabled
      );

      if (matchedAction && (e.altKey || document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        triggerHaptic(15);
        matchedAction.onExecute();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, onClose, isAm, onAnnounce]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-actions-title"
      aria-describedby="quick-actions-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic(8);
          onAnnounce(isAm ? 'የፈጣን ትዕዛዞች ዝርዝር ተዘግቷል' : 'Quick Actions menu closed.');
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Accessible Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/90 bg-neutral-50/70 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="quick-actions-title"
                  className="text-base sm:text-lg font-black text-neutral-900 tracking-tight"
                >
                  {isAm ? 'ለስክሪን አንባቢ የተመቻቸ ፈጣን ትዕዛዞች' : 'Screen-Reader Quick Actions'}
                </h2>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-800">
                  WCAG AAA
                </span>
              </div>
              <p id="quick-actions-desc" className="text-xs text-neutral-500 mt-0.5">
                {isAm
                  ? 'ትኬት፣ ቦታ ማስያዣና ፖርታል በቁልፍ ሰሌዳ አቋራጭ በፍጥነት ያግኙ'
                  : 'Fast keyboard & screen-reader navigation for bookings, tickets, and portals'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
            aria-label={isAm ? 'ዝርዝሩን ዝጋ (Escape)' : 'Close Quick Actions (Escape)'}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Live Filter Input */}
        <div className="p-3 sm:px-5 border-b border-neutral-100 bg-white">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              role="searchbox"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAm
                  ? 'ትዕዛዝ ወይም አቋራጭ ይፈልጉ (ለምሳሌ፡ ቦታ ያዙ፣ ትኬት፣ ሹፌር)...'
                  : 'Search actions or shortcuts (e.g. book, ticket, driver, manifest)...'
              }
              aria-label={isAm ? 'ትዕዛዞችን ፈልግ' : 'Search Quick Actions'}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 bg-neutral-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 placeholder:text-neutral-400 text-neutral-900 font-medium transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={isAm ? 'ፍለጋ አጽዳ' : 'Clear search query'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Screen reader instructions ribbon */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
              <span>
                {isAm
                  ? 'በቀስት ቁልፎች ይዘዋወሩ ወይም ቀጥታ አቋራጮችን ይጫኑ'
                  : 'Navigate with ↑ / ↓ keys or press shortcuts directly'}
              </span>
            </span>
            <span>
              {filteredActions.length} {isAm ? 'ትዕዛዞች' : 'actions'}
            </span>
          </div>
        </div>

        {/* Action Items List */}
        <div
          role="menu"
          aria-label={isAm ? 'የፈጣን ትዕዛዞች ዝርዝር' : 'Quick Actions Menu List'}
          className="p-3 sm:p-4 overflow-y-auto divide-y divide-neutral-100 space-y-1.5 focus:outline-hidden"
        >
          {filteredActions.length > 0 ? (
            filteredActions.map((action, idx) => {
              const IconComp = action.icon;
              const isItemFocused = focusedIndex === idx;

              return (
                <button
                  key={action.id}
                  ref={(el) => {
                    actionButtonRefs.current[idx] = el;
                  }}
                  role="menuitem"
                  disabled={action.disabled}
                  tabIndex={0}
                  aria-keyshortcuts={action.shortcutDisplay}
                  aria-label={`${isAm ? action.titleAm : action.titleEn}. ${
                    isAm ? action.descriptionAm : action.descriptionEn
                  }. Shortcut: ${action.shortcutDisplay}`}
                  onClick={() => {
                    triggerHaptic(15);
                    action.onExecute();
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl text-left transition cursor-pointer flex items-center justify-between gap-3 group border ${
                    isItemFocused
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-600/30'
                      : 'bg-white border-neutral-200/70 hover:bg-neutral-50 hover:border-neutral-300'
                  } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                        action.category === 'booking'
                          ? 'bg-emerald-100 text-emerald-800'
                          : action.category === 'ticketing'
                          ? 'bg-teal-100 text-teal-800'
                          : action.category === 'portal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-emerald-950 truncate">
                          {isAm ? action.titleAm : action.titleEn}
                        </span>
                        {action.badge && (
                          <span className="text-[10px] font-semibold text-neutral-500">
                            • {action.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 line-clamp-1">
                        {isAm ? action.descriptionAm : action.descriptionEn}
                      </p>
                    </div>
                  </div>

                  {/* Keyboard Shortcut Keycap */}
                  <div className="flex items-center gap-2 shrink-0">
                    <kbd
                      aria-hidden="true"
                      className="inline-flex items-center font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-800 shadow-2xs group-hover:bg-emerald-100 group-hover:border-emerald-300 group-hover:text-emerald-950 transition"
                    >
                      {action.shortcutDisplay}
                    </kbd>
                    <ArrowRight
                      className="w-4 h-4 text-neutral-300 group-hover:text-emerald-700 transition transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-neutral-500 text-xs sm:text-sm">
              <p className="font-semibold text-neutral-700">
                {isAm ? 'ምንም የሚዛመድ ፈጣን ትዕዛዝ አልተገኘም' : 'No matching quick actions found'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {isAm
                  ? 'እባክዎ የተለየ የፍለጋ ቃል ይሞክሩ (ለምሳሌ፡ ትኬት፣ ሹፌር፣ ቦታ ያዙ)'
                  : 'Try searching for "book", "ticket", "manifest", or "portal"'}
              </p>
            </div>
          )}
        </div>

        {/* Footer with AccessKey Roadmap & Help */}
        <div className="p-3.5 sm:px-5 bg-neutral-50 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-700">
              {isAm ? 'ፈጣን ቁልፎች፡' : 'Quick Keys:'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-300 text-neutral-700 shadow-2xs">
                Alt+B
              </kbd>
              <span>{isAm ? 'ቦታ ያዙ' : 'Book'}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-300 text-neutral-700 shadow-2xs">
                Alt+T
              </kbd>
              <span>{isAm ? 'ትኬት' : 'Ticket'}</span>
            </span>
            <span className="flex items-center gap-1 hidden sm:inline-flex">
              <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-300 text-neutral-700 shadow-2xs">
                Alt+1-4
              </kbd>
              <span>{isAm ? 'ፖርታሎች' : 'Portals'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-neutral-500">
            <span>{isAm ? 'ለመውጣት፡' : 'To close:'}</span>
            <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-neutral-300 text-neutral-700 shadow-2xs">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

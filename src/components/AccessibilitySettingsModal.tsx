import React from 'react';
import {
  X,
  SlidersHorizontal,
  Contrast,
  Eye,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Volume2,
  Type,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  highContrastMode: boolean;
  onToggleHighContrast: (enabled: boolean) => void;
  largeTextMode?: boolean;
  onToggleLargeText?: (enabled: boolean) => void;
  audioFeedback?: boolean;
  onToggleAudioFeedback?: (enabled: boolean) => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  highContrastMode,
  onToggleHighContrast,
  largeTextMode = false,
  onToggleLargeText,
  audioFeedback = true,
  onToggleAudioFeedback,
}) => {
  const isAm = lang === 'am';
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-settings-title"
    >
      <div
        className={`w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl transition-all ${
          highContrastMode
            ? 'bg-white text-black border-4 border-black'
            : 'bg-white text-neutral-900 border border-neutral-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                highContrastMode
                  ? 'bg-black text-amber-400 border-2 border-black'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <Contrast className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="accessibility-settings-title"
                className="text-base sm:text-lg font-black tracking-tight"
              >
                {t.modalAccessibilityTitle || t.accessibilitySettings}
              </h2>
              <p className="text-xs font-semibold text-neutral-600">
                {t.modalAccessibilitySub || t.androidAccessibilityLabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className={`p-2 rounded-xl transition cursor-pointer ${
              highContrastMode
                ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="py-4 space-y-5">
          {/* Primary High Contrast Feature Box */}
          <div
            className={`p-4 rounded-xl transition-all ${
              highContrastMode
                ? 'bg-amber-100/60 border-2 border-black'
                : 'bg-emerald-50/70 border border-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Eye
                    className={`w-5 h-5 ${
                      highContrastMode ? 'text-black' : 'text-emerald-700'
                    }`}
                  />
                  <span className="text-sm font-black tracking-tight">
                    {t.highContrastMode}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      highContrastMode
                        ? 'bg-black text-amber-300 border border-black'
                        : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {highContrastMode ? 'WCAG AAA (7:1)' : 'Standard'}
                  </span>
                </div>
                <p className="text-xs mt-1.5 leading-relaxed font-medium text-neutral-700">
                  {t.highContrastDesc}
                </p>
              </div>

              {/* Android Styled Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={highContrastMode}
                onClick={() => {
                  triggerHaptic(25);
                  onToggleHighContrast(!highContrastMode);
                }}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  highContrastMode
                    ? 'bg-emerald-700 border-2 border-black'
                    : 'bg-neutral-300 border border-neutral-400'
                }`}
                title={
                  highContrastMode
                    ? t.highContrastEnabled
                    : t.highContrastDisabled
                }
              >
                <span className="sr-only">{t.highContrastMode}</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    highContrastMode
                      ? 'translate-x-6.5 bg-amber-300'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Live Contrast Spec Badges */}
            <div className="mt-3 pt-3 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    highContrastMode ? 'text-emerald-800' : 'text-neutral-400'
                  }`}
                />
                <span>{isAm ? 'የጠቆረ ጽሑፍ (Pure Black)' : 'Pitch Black Text'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    highContrastMode ? 'text-emerald-800' : 'text-neutral-400'
                  }`}
                />
                <span>{isAm ? '2px ደማቅ ጠርዝ' : '2px Solid Outlines'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold col-span-2 sm:col-span-1">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    highContrastMode ? 'text-emerald-800' : 'text-neutral-400'
                  }`}
                />
                <span>{isAm ? 'ቢጫ/አረንጓዴ ቁልፎች' : 'High-Vis Yellow'}</span>
              </div>
            </div>
          </div>

          {/* Large Text Mode Toggle (Optional complementary accessibility setting) */}
          {onToggleLargeText && (
            <div
              className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border ${
                highContrastMode
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    highContrastMode
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {isAm ? 'ትልቅ የፊደል መጠን (+15%)' : 'Enlarged Text Scaling (+15%)'}
                  </span>
                  <span className="text-[11px] text-neutral-600 block">
                    {isAm
                      ? 'ለማንበብ ምቹ የሆነ ትልቅ የፊደል መጠን'
                      : 'Increases base font size for higher legibility'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={largeTextMode}
                onClick={() => {
                  triggerHaptic(15);
                  onToggleLargeText(!largeTextMode);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  largeTextMode
                    ? 'bg-emerald-700 border border-black'
                    : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    largeTextMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Audio Chime Feedback Toggle */}
          {onToggleAudioFeedback && (
            <div
              className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border ${
                highContrastMode
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    highContrastMode
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">
                    {isAm ? 'የድምፅና ንዝረት ማረጋገጫ' : 'Auditory & Haptic Feedback'}
                  </span>
                  <span className="text-[11px] text-neutral-600 block">
                    {isAm
                      ? 'ሁነታዎችን ሲቀይሩ የድምፅ ምልክት ያሰማል'
                      : 'Plays assistive tone when toggling system controls'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={audioFeedback}
                onClick={() => {
                  triggerHaptic(15);
                  onToggleAudioFeedback(!audioFeedback);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                  audioFeedback
                    ? 'bg-emerald-700 border border-black'
                    : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    audioFeedback ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Android Accessibility Suite Info Note */}
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              highContrastMode
                ? 'bg-black text-white border-2 border-black'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="leading-snug">
              {isAm
                ? 'የአንድሮይድ ቶክባክ (TalkBack) እና የስክሪን አንባቢዎችን ይደግፋል። ምርጫዎ ለቀጣይ ጉብኝትዎ ተቀምጧል።'
                : 'Supports Android TalkBack, Select to Speak & Screen Readers. Preference is auto-saved locally.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onToggleHighContrast(false);
              if (onToggleLargeText) onToggleLargeText(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              highContrastMode
                ? 'bg-white text-black border-2 border-black hover:bg-neutral-100'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAm ? 'ወደ ቀድሞው መልስ' : 'Reset to Default'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onClose();
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition cursor-pointer ${
              highContrastMode
                ? 'bg-black text-amber-300 hover:bg-neutral-800 border-2 border-black'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isAm ? 'ተከናውኗል (Save & Close)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

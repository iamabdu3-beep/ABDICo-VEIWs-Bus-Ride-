import React from 'react';
import { Bus, MapPin, Radio, Building2, Users, Ticket, User, Compass, LayoutDashboard, Phone, Smartphone, MessageSquare, ShieldCheck, Briefcase, Globe } from 'lucide-react';
import { AppCategory, Language, UserProfile } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface AndroidBottomNavProps {
  activeTab: 'booking' | 'planner' | 'map' | 'tracker' | 'directory' | 'carpool' | 'dashboard' | string;
  setActiveTab: (tab: any) => void;
  ticketCount: number;
  onOpenTickets: () => void;
  lang: Language;
  onToggleLang?: () => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onOpenUssdDialer?: () => void;
  onOpenCallCenter?: () => void;
  onOpenSmsBooking?: () => void;
  currentCategory?: AppCategory;
  onSelectCategory?: (category: AppCategory) => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  ticketCount,
  onOpenTickets,
  lang,
  onToggleLang,
  currentUser,
  onOpenLogin,
  onOpenUssdDialer,
  onOpenCallCenter,
  onOpenSmsBooking,
  currentCategory = 'users',
  onSelectCategory,
}) => {
  const isAm = lang === 'am';

  const categoryNavItems: Array<{
    id: AppCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultTab: string;
  }> = [
    {
      id: 'users',
      label: isAm ? 'ተጠቃሚዎች' : 'Users',
      icon: Users,
      defaultTab: 'booking',
    },
    {
      id: 'driver',
      label: isAm ? 'ሹፌር' : 'Driver',
      icon: Bus,
      defaultTab: 'dashboard',
    },
    {
      id: 'administration',
      label: isAm ? 'አስተዳደር' : 'Admin',
      icon: ShieldCheck,
      defaultTab: 'dashboard',
    },
    {
      id: 'business_owners',
      label: isAm ? 'ባለንብረት' : 'Owners',
      icon: Briefcase,
      defaultTab: 'dashboard',
    },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-1 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Mobile Quick Action Strip (USSD, Call Center, Tickets, Language Toggle) */}
      {(onOpenUssdDialer || onOpenCallCenter || onOpenTickets || onToggleLang) && (
        <div className="flex items-center justify-between gap-1.5 px-2.5 py-1 bg-neutral-900 text-white rounded-xl text-[10px] font-mono border border-neutral-700 max-w-md mx-auto mb-1 shadow-xs">
          {onToggleLang && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onToggleLang();
              }}
              className="flex items-center gap-1 text-emerald-200 hover:text-white font-bold bg-neutral-800 hover:bg-neutral-750 px-2 py-0.5 rounded border border-neutral-700 active:scale-95 transition cursor-pointer"
              title={isAm ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
            >
              <Globe className="w-3 h-3 text-amber-300" />
              <span>{isAm ? 'EN' : 'አማርኛ'}</span>
            </button>
          )}

          {onOpenUssdDialer && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onOpenUssdDialer();
              }}
              className="flex items-center gap-1 text-amber-300 font-bold bg-neutral-800 hover:bg-neutral-750 px-2 py-0.5 rounded border border-neutral-700 active:scale-95 transition cursor-pointer"
            >
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>*805#</span>
            </button>
          )}

          {onOpenSmsBooking && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onOpenSmsBooking();
              }}
              className="flex items-center gap-1 text-teal-200 font-bold bg-teal-950 hover:bg-teal-900 px-2 py-0.5 rounded border border-teal-800 active:scale-95 transition cursor-pointer"
              title="SMS Booking Template"
            >
              <MessageSquare className="w-3 h-3 text-teal-400" />
              <span>8050</span>
            </button>
          )}

          {onOpenCallCenter && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onOpenCallCenter();
              }}
              className="flex items-center gap-1 text-neutral-950 font-bold bg-amber-400 hover:bg-amber-300 px-2 py-0.5 rounded active:scale-95 transition cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              <span>994 {isAm ? 'ጥሪ' : 'Call'}</span>
            </button>
          )}

          {onOpenTickets && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onOpenTickets();
              }}
              className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950 hover:bg-emerald-900 px-2 py-0.5 rounded border border-emerald-800 active:scale-95 transition cursor-pointer"
            >
              <Ticket className="w-3 h-3 text-amber-300" />
              <span>{isAm ? 'ትኬቶች' : 'Pass'} {ticketCount > 0 ? `(${ticketCount})` : ''}</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-around max-w-md mx-auto">
        {categoryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentCategory === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                triggerHaptic(12);
                if (onSelectCategory) {
                  onSelectCategory(item.id);
                } else {
                  setActiveTab(item.defaultTab);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? item.id === 'users'
                    ? 'text-emerald-700'
                    : item.id === 'driver'
                    ? 'text-amber-600'
                    : item.id === 'administration'
                    ? 'text-rose-700'
                    : 'text-blue-700'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {/* Material Design 3 Pill Indicator */}
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-all ${
                  isActive
                    ? item.id === 'users'
                      ? 'bg-emerald-100 shadow-2xs scale-105'
                      : item.id === 'driver'
                      ? 'bg-amber-100 shadow-2xs scale-105'
                      : item.id === 'administration'
                      ? 'bg-rose-100 shadow-2xs scale-105'
                      : 'bg-blue-100 shadow-2xs scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-all truncate max-w-[68px] ${
                  isActive ? 'font-black' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* User Account / Login Button */}
        {onOpenLogin && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onOpenLogin();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl text-neutral-600 hover:text-emerald-700 transition cursor-pointer relative"
          >
            <div className="flex items-center justify-center w-11 h-7 rounded-full relative">
              <User
                className={`w-4 h-4 stroke-2 ${
                  currentUser
                    ? currentUser.role === 'admin'
                      ? 'text-rose-600'
                      : currentUser.role === 'driver'
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                    : 'text-neutral-500'
                }`}
              />
              {currentUser && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  ✓
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5 leading-none text-neutral-800 truncate max-w-[62px]">
              {currentUser
                ? currentUser.role === 'admin'
                  ? isAm ? 'አስተዳደር' : 'Admin'
                  : currentUser.role === 'driver'
                  ? isAm ? 'ሹፌር' : 'Driver'
                  : isAm ? 'ተጓዥ' : 'User'
                : isAm ? 'መግቢያ' : 'Login'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};


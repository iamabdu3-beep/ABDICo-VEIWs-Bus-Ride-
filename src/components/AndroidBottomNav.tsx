import React from 'react';
import { Bus, MapPin, Radio, Building2, Users, Ticket, User } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface AndroidBottomNavProps {
  activeTab: 'booking' | 'map' | 'tracker' | 'directory' | 'carpool';
  setActiveTab: (tab: 'booking' | 'map' | 'tracker' | 'directory' | 'carpool') => void;
  ticketCount: number;
  onOpenTickets: () => void;
  lang: Language;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  setActiveTab,
  ticketCount,
  onOpenTickets,
  lang,
  currentUser,
  onOpenLogin,
}) => {
  const isAm = lang === 'am';

  const navItems: Array<{
    id: 'booking' | 'map' | 'tracker' | 'directory' | 'carpool';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'booking',
      label: isAm ? 'ጉዞዎች' : 'Rides',
      icon: Bus,
    },
    {
      id: 'tracker',
      label: isAm ? 'ራዳር' : 'Radar',
      icon: Radio,
    },
    {
      id: 'map',
      label: isAm ? 'ካርታ' : 'Map',
      icon: MapPin,
    },
    {
      id: 'directory',
      label: isAm ? 'ጣቢያዎች' : 'Stations',
      icon: Building2,
    },
    {
      id: 'carpool',
      label: isAm ? 'የጋራ' : 'Carpool',
      icon: Users,
    },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-1 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                triggerHaptic(12);
                setActiveTab(item.id as any);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
                isActive ? 'text-emerald-700' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {/* Material Design 3 Pill Indicator */}
              <div
                className={`flex items-center justify-center w-11 h-7 rounded-full transition-all ${
                  isActive ? 'bg-emerald-100 shadow-2xs scale-105' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-all truncate max-w-[62px] ${
                  isActive ? 'font-black text-emerald-800' : 'font-medium'
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


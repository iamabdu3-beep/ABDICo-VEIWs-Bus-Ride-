import React from 'react';
import {
  User,
  Users,
  Bus,
  ShieldCheck,
  Building2,
  Compass,
  MapPin,
  Radio,
  Ticket,
  Gauge,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  Activity,
  Send,
  PlusCircle,
  TrendingUp,
  FileCheck2,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
  Award,
  ArrowRightLeft,
  CheckCircle2,
  GitMerge,
} from 'lucide-react';
import { AppCategory, AppModule, Language, UserProfile } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';

interface CategoryNavigationProps {
  lang: Language;
  currentCategory: AppCategory;
  onSelectCategory: (category: AppCategory) => void;
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  currentUser: UserProfile | null;
  onSwitchToCategoryPersona?: (category: AppCategory) => void;
  ticketCount?: number;
  activeDisruptionCount?: number;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  lang,
  currentCategory,
  onSelectCategory,
  activeModule,
  onSelectModule,
  currentUser,
  onSwitchToCategoryPersona,
  ticketCount = 0,
  activeDisruptionCount = 0,
}) => {
  const isAm = lang === 'am';
  const t = translations[lang];

  // Category definitions
  const categories = [
    {
      id: 'users' as AppCategory,
      title: isAm ? 'ተጠቃሚዎች (Users)' : 'Users & Commuters',
      shortTitle: isAm ? 'ተጠቃሚዎች' : 'Users & Commuters',
      roleSubtitle: isAm ? 'የሕዝብ ትራንስፖርትና ትኬቶች' : 'Public Intercity Passenger Transit',
      desc: isAm ? 'የአውቶቡስ ቦታ ማስያዣ፣ የጉዞ እቅድ፣ የቀጥታ ራዳርና ዲጂታል ትኬቶች' : 'Bus booking, multi-leg planning, highway radar & digital tickets',
      icon: Users,
      badge: isAm ? '8 ሞጁሎች' : '8 Modules',
      color: 'emerald',
      activeBorder: 'border-emerald-600',
      activeBg: 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30',
      inactiveBg: 'bg-white hover:bg-neutral-50/90 border-neutral-200 text-neutral-800',
      iconBgActive: 'bg-white text-emerald-850 shadow-xs',
      iconBgInactive: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      defaultModule: 'booking' as AppModule,
      matchingPersonaId: 'usr-abebe',
      matchingPersonaRole: 'passenger',
      personaName: 'Abebe Bikila (Passenger)',
      personaNameAm: 'አበበ ቢቂላ (ተሳፋሪ)',
    },
    {
      id: 'driver' as AppCategory,
      title: isAm ? 'አውቶቡስ ሹፌር (Driver)' : 'Commercial Driver',
      shortTitle: isAm ? 'ሹፌር' : 'Commercial Driver',
      roleSubtitle: isAm ? 'የኮክፒት ትዕዛዝና ማኒፌስት' : 'Coach Cockpit & Telemetry Command',
      desc: isAm ? 'የኮክፒት ፍጥነት፣ የተሳፋሪዎች ማኒፌስት፣ የደህንነት ፍተሻና ሜዳሊያዎች' : 'Cockpit speed governor, boarding manifest, safety checks & badges',
      icon: Bus,
      badge: isAm ? '6 ሞጁሎች' : '6 Modules',
      color: 'amber',
      activeBorder: 'border-amber-600',
      activeBg: 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500/30',
      inactiveBg: 'bg-white hover:bg-neutral-50/90 border-neutral-200 text-neutral-800',
      iconBgActive: 'bg-white text-amber-800 shadow-xs',
      iconBgInactive: 'bg-amber-50 text-amber-800 border border-amber-200/60',
      defaultModule: 'cockpit' as AppModule,
      matchingPersonaId: 'drv-kassahun',
      matchingPersonaRole: 'driver',
      personaName: 'Capt. Kassahun (Selam Bus)',
      personaNameAm: 'ካፒቴን ካሳሁን (ሰላም ባስ)',
    },
    {
      id: 'administration' as AppCategory,
      title: isAm ? 'አስተዳደር (Administration)' : 'Regional Administration',
      shortTitle: isAm ? 'አስተዳደር' : 'Regional Administration',
      roleSubtitle: isAm ? 'የክልል ትራንስፖርት ባለስልጣን' : 'Transport Authority & Corridor Safety',
      desc: isAm ? 'የ15 መናኸሪያዎች መጨናነቅ ራዳር፣ የአደጋ መልዕክቶች ስርጭትና ቁጥጥር' : '15-terminal congestion radar, emergency alerts & compliance audit',
      icon: ShieldCheck,
      badge: activeDisruptionCount > 0 ? `${activeDisruptionCount} Alerts` : isAm ? '5 ሞጁሎች' : '5 Modules',
      color: 'rose',
      activeBorder: 'border-rose-600',
      activeBg: 'bg-rose-700 text-white shadow-md ring-2 ring-rose-600/30',
      inactiveBg: 'bg-white hover:bg-neutral-50/90 border-neutral-200 text-neutral-800',
      iconBgActive: 'bg-white text-rose-800 shadow-xs',
      iconBgInactive: 'bg-rose-50 text-rose-800 border border-rose-200/60',
      defaultModule: 'traffic_radar' as AppModule,
      matchingPersonaId: 'adm-yonas',
      matchingPersonaRole: 'admin',
      personaName: 'Director Solomon (Transport Bureau)',
      personaNameAm: 'ዳይሬክተር ሰሎሞን (ትራንስፖርት ቢሮ)',
    },
    {
      id: 'business_owners' as AppCategory,
      title: isAm ? 'የአውቶቡስ ባለቤቶች (Owners)' : 'Fleet Business Owners',
      shortTitle: isAm ? 'ባለንብረቶች' : 'Fleet Business Owners',
      roleSubtitle: isAm ? 'የፍሊት ባለንብረቶችና ማህበራት' : 'Commercial Fleet & Revenue Management',
      desc: isAm ? 'የፍሊት አውቶቡሶች ቁጥጥር፣ አጠቃላይ ገቢ ትንተና፣ የጉዞ መርሐ-ግብርና ፈቃድ' : 'Fleet tracking, gross revenue analytics, trip scheduling & licenses',
      icon: Briefcase,
      badge: isAm ? '5 ሞጁሎች' : '5 Modules',
      color: 'blue',
      activeBorder: 'border-blue-600',
      activeBg: 'bg-blue-700 text-white shadow-md ring-2 ring-blue-600/30',
      inactiveBg: 'bg-white hover:bg-neutral-50/90 border-neutral-200 text-neutral-800',
      iconBgActive: 'bg-white text-blue-800 shadow-xs',
      iconBgInactive: 'bg-blue-50 text-blue-800 border border-blue-200/60',
      defaultModule: 'fleet' as AppModule,
      matchingPersonaId: 'owner-belay',
      matchingPersonaRole: 'bus_owner',
      personaName: 'Ato Belayneh (Fleet Operator)',
      personaNameAm: 'አቶ በላይነህ (የአውቶቡስ ባለንብረት)',
    },
  ];

  // Modules per category
  const modulesByCategory: Record<
    AppCategory,
    Array<{
      id: AppModule;
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }>
  > = {
    users: [
      { id: 'booking', title: t.modBooking, icon: Bus },
      { id: 'planner', title: t.modPlanner, icon: Compass },
      { id: 'interconnect', title: t.modInterconnect, icon: GitMerge },
      { id: 'map', title: t.modMap, icon: MapPin },
      { id: 'tracker', title: t.modTracker, icon: Radio },
      { id: 'directory', title: t.modDirectory, icon: Building2 },
      { id: 'carpool', title: t.modCarpool, icon: Users },
      {
        id: 'tickets',
        title: t.modTickets,
        icon: Ticket,
        badge: ticketCount > 0 ? ticketCount : undefined,
        badgeColor: 'bg-amber-400 text-neutral-950',
      },
    ],
    driver: [
      { id: 'cockpit', title: t.modCockpit, icon: Gauge },
      { id: 'manifest', title: t.modManifest, icon: ClipboardList },
      { id: 'safety_check', title: t.modInspection, icon: ShieldCheck },
      { id: 'incident', title: t.modIncident, icon: AlertTriangle },
      { id: 'comm', title: t.modChat, icon: MessageSquare },
      { id: 'badges', title: t.modBadges || (isAm ? 'የአፈጻጸም ሜዳሊያዎች' : 'Performance Badges'), icon: Award },
    ],
    administration: [
      { id: 'traffic_radar', title: t.modRadar, icon: Activity },
      {
        id: 'alerts_broadcast',
        title: t.modBroadcast,
        icon: Send,
        badge: activeDisruptionCount > 0 ? activeDisruptionCount : undefined,
        badgeColor: 'bg-rose-600 text-white',
      },
      { id: 'bays_control', title: t.modBays, icon: Building2 },
      { id: 'corridors_audit', title: t.modCompliance, icon: ShieldCheck },
      { id: 'weather_monitor', title: t.modWeather, icon: Compass },
    ],
    business_owners: [
      { id: 'fleet', title: t.modFleet, icon: Bus },
      { id: 'financials', title: t.modFinancials, icon: TrendingUp },
      { id: 'dispatch_trip', title: t.modDispatch, icon: PlusCircle },
      { id: 'roster', title: t.modRoster, icon: Users },
      { id: 'company_profile', title: t.modCredentials, icon: FileCheck2 },
    ],
  };

  const currentCategoryData = categories.find((c) => c.id === currentCategory) || categories[0];
  const currentCategoryModules = modulesByCategory[currentCategory];

  // Is persona matching current category?
  const roleMatches =
    (currentCategory === 'users' && currentUser?.role === 'passenger') ||
    (currentCategory === 'driver' && currentUser?.role === 'driver') ||
    (currentCategory === 'administration' && currentUser?.role === 'admin') ||
    (currentCategory === 'business_owners' && currentUser?.role === 'bus_owner');

  return (
    <section aria-label="Portal Categories and Modules Architecture" className="space-y-3 mb-6">
      {/* 1. TOP-TIER: 4 PRIMARY CATEGORIES (STAKEHOLDER ARCHITECTURE) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
                {isAm ? 'የስርዓቱ ዋና ክፍሎች (System Architecture)' : 'System Architecture · 4 Stakeholder Portals'}
              </span>
              <p className="text-xs text-neutral-600 mt-0.5">
                {isAm
                  ? 'የተሳፋሪ፣ የአሽከርካሪ ኮክፒት፣ የክልል አስተዳደርና የባለንብረቶች የተሟላ ኦፕሬሽን'
                  : 'Select an operational portal to access dedicated modules, live telemetry & dispatch tools'}
              </p>
            </div>
          </div>

          {/* Quick Persona Sync Button */}
          {!roleMatches && onSwitchToCategoryPersona && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onSwitchToCategoryPersona(currentCategory);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 text-amber-300 hover:bg-neutral-800 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs self-start sm:self-auto border border-neutral-700"
              title="Activate matching demo profile"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isAm
                  ? `ወደ ${currentCategoryData.personaNameAm} ቀይር`
                  : `Switch persona to ${currentCategoryData.personaName}`}
              </span>
            </button>
          )}
        </div>

        {/* 4 Category Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onSelectCategory(cat.id);
                  onSelectModule(cat.defaultModule);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 relative focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  isActive ? cat.activeBg : cat.inactiveBg
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform ${
                      isActive ? cat.iconBgActive : cat.iconBgInactive
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-black/30 text-white border border-white/20'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {cat.badge}
                  </span>
                </div>

                <div>
                  <span className="font-black text-sm block leading-snug">
                    {cat.shortTitle}
                  </span>
                  <span
                    className={`text-[11px] block mt-0.5 line-clamp-1 ${
                      isActive ? 'text-white/90' : 'text-neutral-500'
                    }`}
                  >
                    {cat.desc}
                  </span>
                </div>

                {isActive && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold pt-1 border-t border-white/20 text-white/90">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>{isAm ? 'ንቁ ፖርታል' : 'Active Portal'}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SECOND-TIER: CONTEXTUAL MODULE COMMAND RIBBON */}
      <div className="bg-white p-2.5 rounded-2xl border border-neutral-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 shrink-0 px-2 py-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
            {currentCategoryData.shortTitle}
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs text-neutral-500 hidden md:inline">
            {isAm ? 'የሞጁሎች ዝርዝር' : 'Operational Modules'}
          </span>
        </div>

        {/* Modules Ribbon Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-0.5">
          {currentCategoryModules.map((mod) => {
            const isModActive = activeModule === mod.id;
            const ModIcon = mod.icon;

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectModule(mod.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 border ${
                  isModActive
                    ? currentCategory === 'users'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : currentCategory === 'driver'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : currentCategory === 'administration'
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-blue-700 text-white border-blue-800 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <ModIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{mod.title}</span>
                {mod.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-black leading-tight ${
                      mod.badgeColor || 'bg-amber-400 text-neutral-950'
                    }`}
                  >
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

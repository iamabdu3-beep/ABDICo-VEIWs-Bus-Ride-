import React, { useState } from 'react';
import { BusStation, Language } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Bus,
  CheckCircle2,
} from 'lucide-react';

interface StationDirectoryProps {
  lang: Language;
  onSelectStationForMap: (station: BusStation) => void;
  onBookFromStation: (stationId: string) => void;
}

export const StationDirectory: React.FC<StationDirectoryProps> = ({
  lang,
  onSelectStationForMap,
  onBookFromStation,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  const zones = [
    { id: 'all', nameEn: 'All Zones', nameAm: 'ሁሉም ዞኖች' },
    { id: 'West Gojjam', nameEn: 'West Gojjam', nameAm: 'ምዕራብ ጎጃም' },
    { id: 'East Gojjam', nameEn: 'East Gojjam', nameAm: 'ምሥራቅ ጎጃም' },
    { id: 'Central Gondar', nameEn: 'Central Gondar', nameAm: 'ማዕከላዊ ጎንደር' },
    { id: 'South Gondar', nameEn: 'South Gondar', nameAm: 'ደቡብ ጎንደር' },
    { id: 'South Wollo', nameEn: 'South Wollo', nameAm: 'ደቡብ ወሎ' },
    { id: 'North Wollo', nameEn: 'North Wollo', nameAm: 'ሰሜን ወሎ' },
    { id: 'North Shewa', nameEn: 'North Shewa', nameAm: 'ሰሜን ሸዋ' },
    { id: 'Awi', nameEn: 'Awi Zone', nameAm: 'አዊ ዞን' },
    { id: 'Wag Hemra', nameEn: 'Wag Hemra', nameAm: 'ዋግ ኽምራ' },
  ];

  const filteredStations = AMHARA_STATIONS.filter((station) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      station.name.toLowerCase().includes(term) ||
      station.nameAm.includes(term) ||
      station.city.toLowerCase().includes(term) ||
      station.cityAm.includes(term) ||
      station.zone.toLowerCase().includes(term);

    const matchesZone = selectedZone === 'all' || station.zone === selectedZone;

    return matchesSearch && matchesZone;
  });

  return (
    <div className="space-y-6">
      {/* Directory Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {lang === 'en'
                  ? 'All 15 Bus Stations & Terminals'
                  : 'የሁሉም 15 መናኸሪያዎች አድራሻ እና ማውጫ'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              {t.stationDirectoryTitle}
            </h2>
            <p className="text-xs text-neutral-500 max-w-2xl">
              {t.stationDirectorySub}
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchStationPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Zone Selector Chips */}
        <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-neutral-100">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${
                selectedZone === z.id
                  ? 'bg-emerald-700 text-white border-emerald-700 font-medium shadow-xs'
                  : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {lang === 'en' ? z.nameEn : z.nameAm}
            </button>
          ))}
        </div>
      </div>

      {/* Stations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map((station) => (
          <div
            key={station.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md transition duration-200 hover:border-emerald-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Zone & Bay Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{lang === 'en' ? station.zone : station.zoneAm}</span>
                </span>

                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {station.baysCount} {lang === 'en' ? 'Bays' : 'በሮች'}
                </span>
              </div>

              {/* Station Titles */}
              <h3 className="text-base font-bold text-neutral-900 leading-snug">
                {lang === 'en' ? station.name : station.nameAm}
              </h3>
              <p className="text-xs font-medium text-emerald-800 mb-2">
                {lang === 'en' ? station.city : station.cityAm} • {station.elevationM}m elevation
              </p>

              {/* Description */}
              <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed mb-4">
                {lang === 'en' ? station.description : station.descriptionAm}
              </p>

              {/* Operational Metadata */}
              <div className="space-y-2 py-3 border-y border-neutral-100 text-xs text-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'en' ? 'Operating Hours:' : 'የስራ ሰዓት:'}</span>
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono text-[11px]">
                    {lang === 'en' ? station.operatingHours : station.operatingHoursAm}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'en' ? 'Office Phone:' : 'የመናኸሪያው ስልክ:'}</span>
                  </span>
                  <a
                    href={`tel:${station.phone}`}
                    className="font-mono font-bold text-emerald-700 hover:underline text-[11px]"
                  >
                    {station.phone}
                  </a>
                </div>
              </div>

              {/* Amenities tags */}
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {station.amenities.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] bg-neutral-100 text-neutral-600 rounded"
                    >
                      {amenity}
                    </span>
                  ))}
                  {station.amenities.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] text-neutral-600 font-mono">
                      +{station.amenities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectStationForMap(station)}
                className="flex-1 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.viewOnMap}</span>
              </button>

              <button
                onClick={() => onBookFromStation(station.id)}
                className="flex-1 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Bus className="w-3.5 h-3.5 text-amber-300" />
                <span>{lang === 'en' ? 'Find Buses' : 'ጉዞ ፈልግ'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

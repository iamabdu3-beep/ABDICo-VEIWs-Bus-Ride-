import React, { useState } from 'react';
import { BusStation, RideTrip, VehicleCategory, Language, DriverContactContext } from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import {
  Search,
  ArrowRightLeft,
  Calendar,
  Bus,
  Filter,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
  Wifi,
  Wind,
  Phone,
  ArrowRight,
  Luggage,
  X,
  Building2,
  Check,
  MessageSquare,
} from 'lucide-react';

interface RideBookingProps {
  lang: Language;
  trips: RideTrip[];
  originStationId: string;
  setOriginStationId: (id: string) => void;
  destStationId: string;
  setDestStationId: (id: string) => void;
  onSelectTripToBook: (trip: RideTrip) => void;
  onViewOnMap: (originId: string, destId: string) => void;
  onContactDriver?: (context: DriverContactContext) => void;
}

export const RideBooking: React.FC<RideBookingProps> = ({
  lang,
  trips,
  originStationId,
  setOriginStationId,
  destStationId,
  setDestStationId,
  onSelectTripToBook,
  onViewOnMap,
  onContactDriver,
}) => {
  const t = translations[lang];
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [travelDate, setTravelDate] = useState<string>('2026-09-15');
  const [filterAvailableOnly, setFilterAvailableOnly] = useState<boolean>(false);
  const [companySearchQuery, setCompanySearchQuery] = useState<string>('');

  const vehicleCategories: { id: string; labelEn: string; labelAm: string }[] = [
    { id: 'all', labelEn: 'All Vehicles', labelAm: 'ሁሉም ተሽከርካሪዎች' },
    { id: 'Luxury Coach', labelEn: 'Luxury Coach (49 Seats)', labelAm: 'የቅንጦት አውቶቡስ' },
    { id: 'Standard Express', labelEn: 'Standard Express (55 Seats)', labelAm: 'መደበኛ አውቶቡስ' },
    { id: 'Minibus Dolphin', labelEn: 'Minibus Dolphin (14 Seats)', labelAm: 'ዶልፊን ሚኒባስ' },
    { id: 'Coaster Bus', labelEn: 'Coaster (24 Seats)', labelAm: 'ኮስተር አውቶቡስ' },
  ];

  const popularCorridors = [
    { from: 'bahir-dar', to: 'gondar', labelEn: 'Bahir Dar ⇄ Gondar (Lake Tana)', labelAm: 'ባሕር ዳር ⇄ ጎንደር' },
    { from: 'dessie', to: 'debre-birhan', labelEn: 'Dessie ⇄ Debre Birhan', labelAm: 'ደሴ ⇄ ደብረ ብርሃን' },
    { from: 'bahir-dar', to: 'debre-markos', labelEn: 'Bahir Dar ⇄ Debre Markos', labelAm: 'ባሕር ዳር ⇄ ደብረ ማርቆስ' },
    { from: 'woldiya', to: 'lalibela', labelEn: 'Woldiya ⇄ Lalibela', labelAm: 'ወልዲያ ⇄ ላሊበላ' },
    { from: 'dessie', to: 'kombolcha', labelEn: 'Dessie ⇄ Kombolcha (Express)', labelAm: 'ደሴ ⇄ ኮምቦልቻ' },
    { from: 'bahir-dar', to: 'debre-tabor', labelEn: 'Bahir Dar ⇄ Debre Tabor', labelAm: 'ባሕር ዳር ⇄ ደብረ ታቦር' },
  ];

  const handleSwapStations = () => {
    const temp = originStationId;
    setOriginStationId(destStationId);
    setDestStationId(temp);
  };

  const getStationById = (id: string) => AMHARA_STATIONS.find((s) => s.id === id);

  // Filtered trips
  const filteredTrips = trips.filter((trip) => {
    const matchesOrigin = !originStationId || trip.fromStationId === originStationId;
    const matchesDest = !destStationId || trip.toStationId === destStationId;
    const matchesVehicle = selectedVehicleType === 'all' || trip.vehicleType === selectedVehicleType;

    // Filter by availability: only show trips with remaining seats
    const remainingSeats = trip.totalSeats - trip.bookedSeats.length;
    const matchesAvailability = !filterAvailableOnly || remainingSeats > 0;

    // Quick search by bus company name (case-insensitive, matches English or Amharic)
    const query = companySearchQuery.trim().toLowerCase();
    const matchesCompany =
      !query ||
      trip.busCompany.toLowerCase().includes(query) ||
      (trip.busCompanyAm && trip.busCompanyAm.toLowerCase().includes(query));

    return matchesOrigin && matchesDest && matchesVehicle && matchesAvailability && matchesCompany;
  });

  // Calculate route availability stats for indicator badges
  const currentRouteTrips = trips.filter((trip) => {
    const matchesOrigin = !originStationId || trip.fromStationId === originStationId;
    const matchesDest = !destStationId || trip.toStationId === destStationId;
    const matchesVehicle = selectedVehicleType === 'all' || trip.vehicleType === selectedVehicleType;
    return matchesOrigin && matchesDest && matchesVehicle;
  });

  const availableRouteTripsCount = currentRouteTrips.filter(
    (t) => t.totalSeats - t.bookedSeats.length > 0
  ).length;
  const soldOutRouteTripsCount = currentRouteTrips.filter(
    (t) => t.totalSeats - t.bookedSeats.length <= 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Search Bar Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-neutral-200 shadow-sm relative overflow-hidden">
        {/* Subtle background graphic */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-emerald-900/15 border border-emerald-600/30 shrink-0 bg-emerald-800 flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="Bus Ride App Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>{lang === 'en' ? 'Bus Ride App • Ethiopian Regional Transit' : 'የአውቶቡስ ጉዞ መተግበሪያ • የክልል ትራንስፖርት'}</span>
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-0.5">
                {t.searchRides}
              </h1>
            </div>
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            {lang === 'en' ? 'Connecting 15 Amhara Terminals' : '15 የአማራ መናኸሪያዎችን በማገናኘት ላይ'}
          </div>
        </div>

        {/* Search Inputs Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin Station */}
          <div className="md:col-span-4">
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">
              {t.fromStation}
            </label>
            <div className="relative">
              <select
                value={originStationId}
                onChange={(e) => setOriginStationId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50/50 appearance-none pr-8 cursor-pointer"
              >
                <option value="">{t.selectStation} (All Origin)</option>
                {AMHARA_STATIONS.map((station) => (
                  <option key={station.id} value={station.id}>
                    {lang === 'en' ? station.name : station.nameAm} ({station.city})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-neutral-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapStations}
              className="w-10 h-10 rounded-full border border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center text-neutral-600 hover:text-emerald-700 transition shadow-xs cursor-pointer"
              title={t.swapStations}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Station */}
          <div className="md:col-span-4">
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">
              {t.toStation}
            </label>
            <div className="relative">
              <select
                value={destStationId}
                onChange={(e) => setDestStationId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50/50 appearance-none pr-8 cursor-pointer"
              >
                <option value="">{t.selectStation} (All Destination)</option>
                {AMHARA_STATIONS.map((station) => (
                  <option key={station.id} value={station.id}>
                    {lang === 'en' ? station.name : station.nameAm} ({station.city})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-neutral-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Travel Date */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-neutral-700 block mb-1.5">
              {t.date}
            </label>
            <div className="relative">
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono font-medium rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-neutral-50/50 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Popular Route Shortcuts */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium">
            {t.popularRoutes}:
          </span>
          {popularCorridors.map((corridor, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOriginStationId(corridor.from);
                setDestStationId(corridor.to);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-700 border border-neutral-200 transition cursor-pointer font-medium text-[11px]"
            >
              {lang === 'en' ? corridor.labelEn : corridor.labelAm}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {vehicleCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedVehicleType(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
              selectedVehicleType === cat.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {lang === 'en' ? cat.labelEn : cat.labelAm}
          </button>
        ))}
      </div>

      {/* Quick Search and Availability Filter Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick-Search Bar by Bus Company Name */}
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={companySearchQuery}
              onChange={(e) => setCompanySearchQuery(e.target.value)}
              placeholder={t.searchCompanyPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-neutral-50/60 placeholder:text-neutral-400 font-medium"
            />
            {companySearchQuery && (
              <button
                onClick={() => setCompanySearchQuery('')}
                aria-label={t.clearCompanySearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 'Filter by Availability' Toggle Button / Switch */}
          <div className="flex items-center gap-2 sm:self-center">
            <button
              type="button"
              role="switch"
              id="filter-by-availability-toggle"
              aria-checked={filterAvailableOnly}
              onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
              className={`group inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border transition cursor-pointer select-none ${
                filterAvailableOnly
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-400/40'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {/* Animated Switch Pill */}
              <span
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition duration-200 ease-in-out ${
                  filterAvailableOnly ? 'bg-emerald-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition duration-200 ease-in-out ${
                    filterAvailableOnly ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </span>

              <span className="text-xs font-bold whitespace-nowrap">
                {t.filterByAvailability}
              </span>

              {filterAvailableOnly ? (
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-emerald-700 text-white rounded-md tracking-wider">
                  {availableRouteTripsCount}
                </span>
              ) : (
                soldOutRouteTripsCount > 0 && (
                  <span className="text-[10px] text-neutral-500 font-medium hidden md:inline">
                    ({soldOutRouteTripsCount} {lang === 'en' ? 'full' : 'ሞልቷል'})
                  </span>
                )
              )}
            </button>
          </div>
        </div>

        {/* Quick Company Shortcuts & Status Line */}
        <div className="pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 font-medium mr-1">
              {lang === 'en' ? 'Operators:' : 'ድርጅቶች፡'}
            </span>
            {['Selam Bus', 'Abay Bus', 'Sky Bus', 'Golden Bus', 'Walya Express', 'Tana Co-op'].map((companyName) => {
              const isActive = companySearchQuery.toLowerCase() === companyName.toLowerCase();
              return (
                <button
                  key={companyName}
                  onClick={() => setCompanySearchQuery(isActive ? '' : companyName)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {companyName}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span>
              {filteredTrips.length}{' '}
              {lang === 'en' ? (filteredTrips.length === 1 ? 'trip showing' : 'trips showing') : 'ጉዞዎች'}
            </span>

            {(companySearchQuery || filterAvailableOnly) && (
              <button
                onClick={() => {
                  setCompanySearchQuery('');
                  setFilterAvailableOnly(false);
                }}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer ml-1"
              >
                {lang === 'en' ? 'Reset Quick Filters' : 'ማጣሪያዎችን ዳግም አስጀምር'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trips Cards List */}
      {filteredTrips.length > 0 ? (
        <div className="space-y-3.5">
          {filteredTrips.map((trip) => {
            const originStation = getStationById(trip.fromStationId);
            const destStation = getStationById(trip.toStationId);
            const availableSeatsCount = trip.totalSeats - trip.bookedSeats.length;
            const isSoldOut = availableSeatsCount <= 0;

            return (
              <div
                key={trip.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition duration-200 ${
                  isSoldOut
                    ? 'border-neutral-200 opacity-90'
                    : 'border-neutral-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Bus Operator & Vehicle Details */}
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-base text-neutral-900">
                        {lang === 'en' ? trip.busCompany : trip.busCompanyAm}
                      </span>
                      {trip.isRideshareCommunity && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {lang === 'en' ? 'Community Pool' : 'የጋራ ጉዞ'}
                        </span>
                      )}
                      {isSoldOut ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          {t.soldOut}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {availableSeatsCount} {t.seatsLeft}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700">
                        {trip.vehicleType}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-neutral-600">
                        {trip.plateNumber}
                      </span>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold">
                        ★ {trip.driverRating}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                      <span>{t.driver}:</span>
                      <span className="font-medium text-neutral-800">
                        {trip.driverName}
                      </span>
                    </div>

                    {onContactDriver && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic(12);
                          onContactDriver({
                            driverName: trip.driverName,
                            driverPhone: trip.driverPhone,
                            driverRating: trip.driverRating,
                            vehiclePlate: trip.plateNumber,
                            vehicleType: trip.vehicleType,
                            companyOrModel: lang === 'en' ? trip.busCompany : trip.busCompanyAm,
                            routeTitle: `${originStation ? (lang === 'en' ? originStation.city : originStation.cityAm) : ''} ➔ ${destStation ? (lang === 'en' ? destStation.city : destStation.cityAm) : ''}`,
                            departureTime: trip.departureTime,
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg border border-teal-200 transition cursor-pointer active:scale-95 shadow-2xs mt-0.5"
                        title={lang === 'en' ? 'Chat or SMS with bus driver' : 'ከአሽከርካሪው ጋር በChat ወይም SMS ተወያይ'}
                      >
                        <MessageSquare className="w-3 h-3 text-teal-700" />
                        <span>{lang === 'en' ? 'Chat / SMS Driver' : 'የአሽከርካሪ ውይይት'}</span>
                      </button>
                    )}
                  </div>

                  {/* Center Column: Route & Schedule */}
                  <div className="flex-1 bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <div className="flex items-center justify-between gap-4">
                      {/* Departure */}
                      <div>
                        <span className="text-xs font-mono font-bold text-neutral-900 block">
                          {trip.departureTime}
                        </span>
                        <span className="text-sm font-bold text-emerald-900 block leading-tight">
                          {originStation ? (lang === 'en' ? originStation.city : originStation.cityAm) : ''}
                        </span>
                        <span className="text-[10px] text-neutral-500 line-clamp-1">
                          {originStation ? (lang === 'en' ? originStation.name : originStation.nameAm) : ''}
                        </span>
                      </div>

                      {/* Travel Duration indicator */}
                      <div className="flex-1 px-3 text-center">
                        <span className="text-[10px] text-neutral-500 font-mono block">
                          {trip.durationFormatted}
                        </span>
                        <div className="relative flex items-center justify-center my-1">
                          <div className="h-0.5 w-full bg-neutral-300" />
                          <Bus className="w-4 h-4 text-emerald-700 absolute bg-neutral-50 px-0.5" />
                        </div>
                        <span className="text-[9px] text-emerald-700 uppercase font-bold tracking-wider">
                          Direct Express
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-neutral-900 block">
                          {trip.arrivalTime}
                        </span>
                        <span className="text-sm font-bold text-emerald-900 block leading-tight">
                          {destStation ? (lang === 'en' ? destStation.city : destStation.cityAm) : ''}
                        </span>
                        <span className="text-[10px] text-neutral-500 line-clamp-1">
                          {destStation ? (lang === 'en' ? destStation.name : destStation.nameAm) : ''}
                        </span>
                      </div>
                    </div>

                    {/* Amenities chips */}
                    <div className="mt-2 pt-2 border-t border-neutral-200/60 flex flex-wrap gap-1">
                      {trip.amenities.map((amenity, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 text-[10px] rounded bg-white text-neutral-600 border border-neutral-200"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Price & Booking Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 min-w-[170px]">
                    <div className="text-left md:text-right">
                      <span className="text-xl font-extrabold text-emerald-800 font-mono">
                        {trip.priceETB} ETB
                      </span>
                      {isSoldOut ? (
                        <span className="text-[11px] font-bold text-rose-600 block">
                          {t.soldOut} (0 / {trip.totalSeats})
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 block">
                          {availableSeatsCount} {t.seatsLeft} (of {trip.totalSeats})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewOnMap(trip.fromStationId, trip.toStationId)}
                        className="p-2 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-neutral-200 transition cursor-pointer"
                        title={lang === 'en' ? 'Inspect Route on Map' : 'በካርታው ላይ መስመሩን እይ'}
                      >
                        <Bus className="w-4 h-4" />
                      </button>

                      {isSoldOut ? (
                        <button
                          disabled
                          className="px-4 py-2.5 bg-neutral-200 text-neutral-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center gap-1.5"
                          title={lang === 'en' ? 'All seats for this trip have been booked' : 'ሁሉም መቀመጫዎች ተይዘዋል'}
                        >
                          <span>{t.soldOut}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectTripToBook(trip)}
                          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{t.selectSeats}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200 shadow-xs">
          <Bus className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-800 mb-1">
            {lang === 'en' ? 'No buses matching your criteria' : 'በተመረጠው መስፈርት ጉዞ አልተገኘም'}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mb-4">
            {companySearchQuery ? (
              <span>
                {lang === 'en'
                  ? `No trips found operated by "${companySearchQuery}".`
                  : `በ"${companySearchQuery}" የተመዘገበ ጉዞ አልተገኘም።`}
              </span>
            ) : filterAvailableOnly ? (
              <span>
                {lang === 'en'
                  ? 'All matching trips are currently sold out on this corridor. Toggle off "Filter by Availability" to view full schedules.'
                  : 'በዚህ መስመር ሁሉም ጉዞዎች መቀመጫቸው አልቋል። ሙሉ መርሃግብሮችን ለማየት "የተገኙ መቀመጫዎች ብቻ" ማጣሪያን ያጥፉ።'}
              </span>
            ) : (
              t.noRidesFound
            )}
          </p>
          <button
            onClick={() => {
              setOriginStationId('');
              setDestStationId('');
              setSelectedVehicleType('all');
              setCompanySearchQuery('');
              setFilterAvailableOnly(false);
            }}
            className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
          >
            {lang === 'en' ? 'Clear All Filters & Reset Search' : 'ሁሉንም ማጣሪያዎች አጽዳ'}
          </button>
        </div>
      )}
    </div>
  );
};

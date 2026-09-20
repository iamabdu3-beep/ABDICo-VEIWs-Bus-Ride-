import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RideTrip, BusStation, Language } from '../types';
import { translations } from '../translations';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  Check,
  ArrowRight,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Info,
  Lock,
  Sparkles,
} from 'lucide-react';

interface SeatPickerModalProps {
  trip: RideTrip;
  fromStation?: BusStation;
  toStation?: BusStation;
  lang: Language;
  onClose: () => void;
  onProceedToCheckout: (selectedSeatNumbers: number[]) => void;
}

interface SeatMeta {
  seatNumber: number;
  row: number;
  colLetter: string;
  isWindow: boolean;
  isAisle: boolean;
  isMiddle: boolean;
  side: 'left' | 'right' | 'back';
}

export const SeatPickerModal: React.FC<SeatPickerModalProps> = ({
  trip,
  fromStation,
  toStation,
  lang,
  onClose,
  onProceedToCheckout,
}) => {
  const t = translations[lang];
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<SeatMeta | null>(null);

  // Zoom & Pan states for small screens & desktop precision
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1.0);
  const hasMovedRef = useRef<boolean>(false);

  const isMinibus = trip.totalSeats <= 16;
  const isCoaster = trip.totalSeats > 16 && trip.totalSeats <= 28;

  // Toggle seat selection
  const toggleSeat = (seatNum: number) => {
    if (trip.bookedSeats.includes(seatNum)) {
      triggerHaptic(30);
      return; // occupied
    }

    triggerHaptic(12);
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
    } else {
      setSelectedSeats([...selectedSeats, seatNum]);
    }
  };

  // Zoom Handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.4, Number((prev + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(0.75, Number((prev - 0.25).toFixed(2)));
      if (next <= 1.0) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Non-passive scroll-to-zoom over the bus floor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((prev) => {
        const next = Math.min(2.4, Math.max(0.75, Number((prev + zoomDelta).toFixed(2))));
        if (next <= 1.0) {
          setPan({ x: 0, y: 0 });
        }
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Pointer & Touch handlers for pinch-to-zoom and drag-to-pan
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // 2-finger Pinch start
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchStartDistRef.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchStartScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // 1-finger Pan start
      hasMovedRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      // Pinch to Zoom
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / pinchStartDistRef.current;
      const newScale = Math.min(2.4, Math.max(0.75, Number((pinchStartScaleRef.current * ratio).toFixed(2))));
      setScale(newScale);
      if (newScale <= 1.0) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging) {
      // Drag to pan when zoomed
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasMovedRef.current = true;
      }
      if (scale > 1.0) {
        setPan({
          x: panStartRef.current.x + dx,
          y: panStartRef.current.y + dy,
        });
      }
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
    }
    if (scale > 1.0) {
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double tap / double click to toggle zoom
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale > 1.1) {
      handleResetZoom();
    } else {
      setScale(1.6);
    }
  };

  // Build architectural seat grid
  // Standard Luxury Coach (4 seats per row: 2 Left, Aisle, 2 Right)
  // Minibus (3 seats per row: 1 Left, Aisle, 2 Right)
  // Coaster (3 seats per row: 2 Left, Aisle, 1 Right)
  const buildSeatGrid = useCallback(() => {
    const rows = [];
    const seatsPerRow = isMinibus ? 3 : isCoaster ? 3 : 4;
    const fullRows = Math.floor(trip.totalSeats / seatsPerRow);
    const remainder = trip.totalSeats % seatsPerRow;
    const totalRows = remainder === 0 ? fullRows : fullRows + 1;

    let currentSeatNumber = 1;

    for (let r = 1; r <= totalRows; r++) {
      const isLastRow = r === totalRows;
      const rowSeats: SeatMeta[] = [];

      if (isLastRow && remainder > 0) {
        // Last row with remainder or full rear bench
        for (let c = 0; c < remainder; c++) {
          const colLetters = ['A', 'B', 'C', 'D', 'E'];
          const colLetter = colLetters[c] || `S${c + 1}`;
          const isWin = c === 0 || c === remainder - 1;
          const isAis = !isWin && (c === 1 || c === remainder - 2);
          const isMid = !isWin && !isAis;

          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter,
            isWindow: isWin,
            isAisle: isAis,
            isMiddle: isMid,
            side: 'back',
          });
        }
      } else {
        // Regular row
        if (isMinibus) {
          // 1 Left (A: Window), Aisle, 2 Right (B: Aisle, C: Window)
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'A',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'left',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'B',
            isWindow: false,
            isAisle: true,
            isMiddle: false,
            side: 'right',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'C',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'right',
          });
        } else if (isCoaster) {
          // 2 Left (A: Window, B: Aisle), Aisle, 1 Right (C: Window)
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'A',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'left',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'B',
            isWindow: false,
            isAisle: true,
            isMiddle: false,
            side: 'left',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'C',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'right',
          });
        } else {
          // Standard 2+2 Coach:
          // Left: A (Window), B (Aisle)
          // Right: C (Aisle), D (Window)
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'A',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'left',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'B',
            isWindow: false,
            isAisle: true,
            isMiddle: false,
            side: 'left',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'C',
            isWindow: false,
            isAisle: true,
            isMiddle: false,
            side: 'right',
          });
          rowSeats.push({
            seatNumber: currentSeatNumber++,
            row: r,
            colLetter: 'D',
            isWindow: true,
            isAisle: false,
            isMiddle: false,
            side: 'right',
          });
        }
      }

      rows.push({ rowNumber: r, seats: rowSeats });
    }

    return rows;
  }, [trip.totalSeats, isMinibus, isCoaster]);

  const seatRows = buildSeatGrid();
  const totalFare = selectedSeats.length * trip.priceETB;

  // Render individual ergonomic bus seat
  const renderSeatGraphic = (meta: SeatMeta) => {
    const isBooked = trip.bookedSeats.includes(meta.seatNumber);
    const isSelected = selectedSeats.includes(meta.seatNumber);

    const positionLabel = meta.isWindow
      ? t.windowSeat
      : meta.isAisle
      ? t.aisleSeat
      : 'Mid';

    return (
      <button
        type="button"
        key={meta.seatNumber}
        disabled={isBooked}
        onClick={(e) => {
          e.stopPropagation();
          if (!hasMovedRef.current) {
            toggleSeat(meta.seatNumber);
          }
        }}
        onMouseEnter={() => setHoveredSeat(meta)}
        onMouseLeave={() => setHoveredSeat(null)}
        title={
          isBooked
            ? `${t.legendOccupied}: #${meta.seatNumber} (${t.rowLabel} ${meta.row}${meta.colLetter} - ${positionLabel})`
            : isSelected
            ? `${t.legendSelected}: #${meta.seatNumber} (${t.rowLabel} ${meta.row}${meta.colLetter} - ${positionLabel})`
            : `${t.legendAvailable}: #${meta.seatNumber} (${t.rowLabel} ${meta.row}${meta.colLetter} - ${positionLabel}) • ${trip.priceETB} ETB`
        }
        className={`group relative flex flex-col items-center justify-between w-11 h-14 sm:w-12 sm:h-15 rounded-xl transition-all select-none cursor-pointer focus:outline-hidden ${
          isBooked
            ? 'bg-neutral-200/90 border border-neutral-300 text-neutral-400 cursor-not-allowed opacity-80'
            : isSelected
            ? 'bg-emerald-600 border-2 border-amber-400 text-white shadow-lg ring-2 ring-emerald-400/50 scale-105 z-10'
            : 'bg-white border-2 border-emerald-600 text-neutral-800 hover:border-emerald-700 hover:bg-emerald-50 hover:shadow-md hover:scale-102'
        }`}
      >
        {/* Contoured Headrest */}
        <div
          className={`w-9/12 h-3.5 mt-1 rounded-md flex items-center justify-center transition-colors ${
            isBooked
              ? 'bg-neutral-300 text-neutral-400'
              : isSelected
              ? 'bg-emerald-700 text-amber-300 font-extrabold'
              : 'bg-emerald-100 text-emerald-800 font-semibold'
          }`}
        >
          {isSelected ? (
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          ) : isBooked ? (
            <Lock className="w-2.5 h-2.5 opacity-60" />
          ) : (
            <span className="text-[8px] font-mono tracking-tighter">
              {meta.colLetter}
            </span>
          )}
        </div>

        {/* Seat Number & Cushion Badge */}
        <div className="flex flex-col items-center justify-center -my-0.5">
          <span
            className={`text-xs sm:text-[13px] font-black leading-tight font-mono ${
              isSelected ? 'text-white' : isBooked ? 'text-neutral-400' : 'text-neutral-900'
            }`}
          >
            {meta.seatNumber}
          </span>
          <span
            className={`text-[7px] font-extrabold uppercase tracking-tighter ${
              isSelected
                ? 'text-emerald-100'
                : isBooked
                ? 'text-neutral-400'
                : meta.isWindow
                ? 'text-sky-600'
                : 'text-amber-700'
            }`}
          >
            {meta.isWindow ? 'WIN' : meta.isAisle ? 'AIS' : 'MID'}
          </span>
        </div>

        {/* Armrest / Bottom Base */}
        <div
          className={`w-full h-2 rounded-b-lg flex items-center justify-between px-1 ${
            isBooked
              ? 'bg-neutral-300'
              : isSelected
              ? 'bg-emerald-800'
              : 'bg-neutral-100 border-t border-neutral-200'
          }`}
        >
          <div className="w-1.5 h-1 rounded-xs bg-black/15" />
          <div className="w-1.5 h-1 rounded-xs bg-black/15" />
        </div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-neutral-200 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[96vh]">
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          aria-label={t.close}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-neutral-200 pb-3.5 mb-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-bold">
              {trip.vehicleType}
            </span>
            <span>•</span>
            <span className="text-neutral-800 font-bold">
              {lang === 'en' ? trip.busCompany : trip.busCompanyAm}
            </span>
            <span>•</span>
            <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700">
              {trip.plateNumber}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
              {t.seatSelectionTitle}
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800">
              {trip.priceETB} ETB / seat
            </span>
          </div>

          <p className="text-xs text-neutral-500 mt-0.5">
            {fromStation ? (lang === 'en' ? fromStation.city : fromStation.cityAm) : ''} ➔{' '}
            {toStation ? (lang === 'en' ? toStation.city : toStation.cityAm) : ''} •{' '}
            {trip.departureTime} • {trip.totalSeats} {lang === 'en' ? 'Seats Capacity' : 'መቀመጫዎች'}
          </p>
        </div>

        {/* Legend Ribbon & Visual Seat Inspector Bar */}
        <div className="shrink-0 flex flex-col gap-2 mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs">
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-white border-2 border-emerald-600 shadow-2xs" />
                <span className="text-neutral-700">{t.legendAvailable}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-amber-400 shadow-2xs" />
                <span className="text-neutral-900 font-bold">{t.legendSelected}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded bg-neutral-200 border border-neutral-300" />
                <span className="text-neutral-500">{t.legendOccupied}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {t.windowSeat} (WIN)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {t.aisleSeat} (AIS)
              </span>
            </div>
          </div>

          {/* Interactive Inspection Tooltip / Active Helper */}
          <div className="flex items-center justify-between text-[11px] px-3 py-1.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-950 font-medium">
            <div className="flex items-center gap-1.5 truncate">
              {hoveredSeat ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    <strong className="font-bold">
                      Seat #{hoveredSeat.seatNumber}
                    </strong>{' '}
                    ({t.rowLabel} {hoveredSeat.row} - Column {hoveredSeat.colLetter}) •{' '}
                    <span className="font-semibold underline">
                      {hoveredSeat.isWindow
                        ? t.windowSeat
                        : hoveredSeat.isAisle
                        ? t.aisleSeat
                        : 'Center'}
                    </span>{' '}
                    • {trip.priceETB} ETB
                  </span>
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="text-neutral-600">
                    {t.tapSeatToSelect} • {t.pinchToZoomHint}
                  </span>
                </>
              )}
            </div>

            {/* Quick Zoom Indicator */}
            <div className="shrink-0 font-mono text-[10px] text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md font-bold">
              {Math.round(scale * 100)}%
            </div>
          </div>
        </div>

        {/* Graphical Bus Interior Container with Pinch & Scroll Zoom */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className="relative flex-1 min-h-[320px] max-h-[460px] bg-neutral-900/5 border-2 border-neutral-300 rounded-3xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing select-none"
        >
          {/* Subtle Flooring Grid Background */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#64748b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          {/* Floating Zoom & Pan Navigation Controls */}
          <div className="absolute top-3 right-3 z-30 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-neutral-200">
            <button
              type="button"
              onClick={handleZoomIn}
              title={t.zoomIn}
              className="p-2 rounded-xl text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              title={t.resetZoom}
              className="px-1.5 py-1 text-[10px] font-mono font-black text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomOut}
              title={t.zoomOut}
              className="p-2 rounded-xl text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="w-full h-px bg-neutral-200 my-0.5" />

            <button
              type="button"
              onClick={handleResetZoom}
              title={t.fitView}
              className="p-2 rounded-xl text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pinch & Pan helper hint pill at bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-1.5 px-3 py-1 bg-neutral-900/80 text-white rounded-full text-[10px] font-medium backdrop-blur-sm shadow-md">
            <Move className="w-3 h-3 text-amber-400" />
            <span>{t.pinchToZoomHint}</span>
          </div>

          {/* Zoomable & Pannable Virtual Bus Blueprint Canvas */}
          <div
            className="w-full h-full overflow-y-auto overflow-x-hidden p-4 flex justify-center items-start transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'top center',
            }}
          >
            {/* The Bus Body Blueprint */}
            <div className="relative w-[340px] sm:w-[380px] bg-slate-100 rounded-t-[54px] rounded-b-[40px] border-4 border-slate-700 shadow-2xl pb-6 my-2">
              {/* External Left & Right Side Mirrors */}
              <div className="absolute -left-3.5 top-12 w-3.5 h-12 bg-slate-800 rounded-l-lg border-l-2 border-slate-400 shadow-md" />
              <div className="absolute -right-3.5 top-12 w-3.5 h-12 bg-slate-800 rounded-r-lg border-r-2 border-slate-400 shadow-md" />

              {/* Front Aerodynamic Windshield & Wipers */}
              <div className="relative rounded-t-[48px] bg-linear-to-b from-sky-800 via-sky-600 to-slate-800 p-4 border-b-4 border-slate-700 text-white shadow-inner overflow-hidden">
                {/* Windshield Glass Reflection Effect */}
                <div className="absolute inset-0 bg-linear-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />

                {/* Headlights & Grille */}
                <div className="flex items-center justify-between px-3 pt-1 pb-2">
                  <div className="w-6 h-3 bg-amber-300 rounded-full shadow-[0_0_8px_#fde047]" />
                  <div className="px-3 py-0.5 rounded-full bg-slate-900/90 text-[9px] font-black tracking-widest uppercase border border-slate-600 text-slate-300">
                    {t.frontWindshield}
                  </div>
                  <div className="w-6 h-3 bg-amber-300 rounded-full shadow-[0_0_8px_#fde047]" />
                </div>

                {/* Driver Cockpit & Boarding Door Row */}
                <div className="mt-2 bg-slate-900/80 rounded-2xl p-2.5 border border-slate-600 flex items-center justify-between text-xs">
                  {/* Left: Driver Cabin with Steering Wheel */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center shadow-xs">
                      {/* Steering Wheel SVG Icon */}
                      <svg
                        className="w-5 h-5 text-amber-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="9" />
                        <line x1="2.5" y1="14.5" x2="9.5" y2="13" />
                        <line x1="21.5" y1="14.5" x2="14.5" y2="13" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-300 uppercase tracking-tight">
                        {t.driverSeat}
                      </div>
                      <div className="text-[9px] text-slate-300 truncate max-w-[100px]">
                        {trip.driverName.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Right: Passenger Boarding Door */}
                  <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/50 px-2.5 py-1.5 rounded-xl">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-5 h-0.5 bg-emerald-400 rounded-full" />
                      <div className="w-5 h-0.5 bg-emerald-400 rounded-full" />
                      <div className="w-5 h-0.5 bg-emerald-400 rounded-full" />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-extrabold text-emerald-300 uppercase">
                        {t.entryDoor}
                      </div>
                      <div className="text-[8px] text-emerald-400 font-mono">
                        ➔ STEP IN
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column Wing Labels: Left Wing | Central Aisle | Right Wing */}
              <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[9px] font-black uppercase text-slate-500 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-center text-sky-700">A (WIN)</span>
                  <span className="w-12 text-center text-amber-700">B (AIS)</span>
                </div>

                <div className="text-emerald-800 font-mono tracking-widest text-[8px] px-1 bg-emerald-50 rounded">
                  AISLE
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-12 text-center text-amber-700">
                    {isMinibus || isCoaster ? 'C (WIN)' : 'C (AIS)'}
                  </span>
                  {!isMinibus && !isCoaster && (
                    <span className="w-12 text-center text-sky-700">D (WIN)</span>
                  )}
                </div>
              </div>

              {/* Passenger Deck: Rows of Seats separated by Central Aisle */}
              <div className="px-3 pt-3 pb-4 space-y-2.5">
                {seatRows.map(({ rowNumber, seats }) => {
                  const isRearRow = rowNumber === seatRows.length;
                  const leftSeats = seats.filter((s) => s.side === 'left');
                  const rightSeats = seats.filter((s) => s.side === 'right');
                  const backSeats = seats.filter((s) => s.side === 'back');

                  return (
                    <div
                      key={rowNumber}
                      className="relative flex items-center justify-between gap-1 group/row"
                    >
                      {/* Left Wall Window Accent */}
                      <div className="w-1 h-12 bg-sky-200/90 rounded-full -ml-1.5 border border-sky-300" />

                      {/* Row Badge on Left Margin */}
                      <div className="w-6 shrink-0 text-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 group-hover/row:text-emerald-700 transition">
                          R{rowNumber}
                        </span>
                      </div>

                      {/* If standard row (Left Wing | Aisle | Right Wing) */}
                      {backSeats.length === 0 ? (
                        <div className="flex-1 flex items-center justify-between gap-1">
                          {/* Left Wing Seats */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {leftSeats.map((s) => renderSeatGraphic(s))}
                          </div>

                          {/* Central Aisle Walkway with Non-slip Carpet Runner */}
                          <div className="flex-1 min-w-[28px] max-w-[40px] h-14 flex flex-col items-center justify-center bg-slate-200/70 rounded-md border-x border-dashed border-slate-300 mx-1">
                            <span className="text-[8px] text-slate-400 font-mono select-none">
                              ↓
                            </span>
                          </div>

                          {/* Right Wing Seats */}
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {rightSeats.map((s) => renderSeatGraphic(s))}
                          </div>
                        </div>
                      ) : (
                        /* Rear Bench 5 Seats across */
                        <div className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 bg-slate-200/50 p-1 rounded-xl border border-slate-300">
                          {backSeats.map((s) => renderSeatGraphic(s))}
                        </div>
                      )}

                      {/* Right Wall Window Accent */}
                      <div className="w-1 h-12 bg-sky-200/90 rounded-full -mr-1.5 border border-sky-300" />
                    </div>
                  );
                })}
              </div>

              {/* Rear Chassis & Emergency Exit Bar */}
              <div className="mt-2 pt-3 border-t-2 border-slate-300 text-center px-4">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                  <span className="flex items-center gap-1 text-rose-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t.emergencyExit}
                  </span>
                  <span className="tracking-widest uppercase text-slate-400 font-mono">
                    — {t.backOfBus} —
                  </span>
                  <span className="text-[9px] text-slate-400">
                    ENGINE BAY
                  </span>
                </div>

                {/* Rear Engine Vent Grills */}
                <div className="flex flex-col gap-1 items-center justify-center pt-1">
                  <div className="w-32 h-1 bg-slate-400 rounded-full" />
                  <div className="w-24 h-1 bg-slate-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Selection Summary & Checkout Trigger */}
        <div className="mt-3 pt-3 border-t border-neutral-200 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[11px] text-neutral-500 flex items-center gap-1">
                <span>{t.selectedSeatsCount}:</span>
                <span className="font-extrabold text-neutral-900">
                  {selectedSeats.length > 0
                    ? selectedSeats.sort((a, b) => a - b).join(', ')
                    : lang === 'en'
                    ? 'None selected'
                    : 'አልተመረጠም'}
                </span>
              </div>

              <div className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                {totalFare} ETB
                {selectedSeats.length > 0 && (
                  <span className="text-[11px] font-normal text-neutral-500 font-sans ml-1.5">
                    ({selectedSeats.length} × {trip.priceETB} ETB)
                  </span>
                )}
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <button
                onClick={() => setSelectedSeats([])}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 underline font-semibold cursor-pointer"
              >
                {lang === 'en' ? 'Clear' : 'አጽዳ'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition cursor-pointer"
            >
              {t.cancel}
            </button>

            <button
              disabled={selectedSeats.length === 0}
              onClick={() => onProceedToCheckout(selectedSeats)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${
                selectedSeats.length > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20 active:scale-98'
                  : 'bg-neutral-300 cursor-not-allowed text-neutral-500'
              }`}
            >
              <span>{t.proceedToPassengerInfo}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

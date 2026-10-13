import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  Users,
  Bus,
  MapPin,
  Loader2,
  X,
  AlertCircle,
  Database,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Language, BookingTicket, LiveMovingBus, BusStation } from '../types';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  initAuth,
} from '../lib/firebase';
import {
  exportTicketsToGoogleSheets,
  exportFleetTelemetryToGoogleSheets,
  exportStationsDirectoryToGoogleSheets,
  SheetExportResult,
} from '../services/googleSheetsService';
import { triggerHaptic } from '../utils/haptics';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  tickets: BookingTicket[];
  buses: LiveMovingBus[];
  stations: BusStation[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  lang,
  tickets,
  buses,
  stations,
}) => {
  const isAm = lang === 'am';

  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<SheetExportResult | null>(null);
  const [exportHistory, setExportHistory] = useState<SheetExportResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation state for destructive/mutating operation
  const [confirmingAction, setConfirmingAction] = useState<{
    type: 'tickets' | 'fleet' | 'stations';
    title: string;
    description: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, cachedToken) => {
        setGoogleUser(user);
        setToken(cachedToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    triggerHaptic(12);
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setToken(res.accessToken);
        triggerHaptic(15);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setErrorMsg(err.message || (isAm ? 'የጉግል መግቢያ አልተሳካም' : 'Google sign-in failed'));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic(10);
    await logoutGoogle();
    setGoogleUser(null);
    setToken(null);
  };

  const promptExport = (type: 'tickets' | 'fleet' | 'stations') => {
    triggerHaptic(8);
    setErrorMsg(null);

    let title = '';
    let description = '';
    let count = 0;

    if (type === 'tickets') {
      title = isAm ? 'የተሳፋሪዎችን ማኒፌስት ወደ Google Sheets መላክ' : 'Export Passenger Manifest to Google Sheets';
      description = isAm
        ? `አጠቃላይ ${tickets.length} የተያዙ ትኬቶች እና የተሳፋሪዎች ዝርዝር በጉግል ድራይቭዎ ውስጥ አዲስ ስፕረድሺት ተፈጥሮ ይቀመጣል።`
        : `This will create a new Google Spreadsheet in your Google Drive with ${tickets.length} booked passenger ticket records and payment details.`;
      count = tickets.length;
    } else if (type === 'fleet') {
      title = isAm ? 'የአውቶቡሶች የቀጥታ ራዳር ቴሌሜትሪ መላክ' : 'Export Live Fleet Telemetry to Google Sheets';
      description = isAm
        ? `በመንገድ ላይ ያሉ ${buses.length} አውቶቡሶች ፍጥነት፣ ከፍታ፣ እና የመድረሻ ሰዓት በGoogle Sheets ይቀመጣል።`
        : `This will create a new Google Spreadsheet with live speed, altitude, waypoints, and ETA for ${buses.length} en-route coaches.`;
      count = buses.length;
    } else {
      title = isAm ? 'የመናኸሪያዎችን ዝርዝር ወደ Google Sheets መላክ' : 'Export Stations Directory to Google Sheets';
      description = isAm
        ? `${stations.length} የኢትዮጵያ አውቶቡስ መናኸሪያዎችና መረጃቸው በGoogle Sheets ይቀመጣል።`
        : `This will create a new Google Spreadsheet containing ${stations.length} Ethiopian transit terminals and administrative hub details.`;
      count = stations.length;
    }

    setConfirmingAction({ type, title, description, count });
  };

  const executeConfirmedExport = async () => {
    if (!confirmingAction) return;
    const actionType = confirmingAction.type;
    setConfirmingAction(null);

    let activeToken = token;
    if (!activeToken) {
      activeToken = await getAccessToken();
    }

    if (!activeToken) {
      // Need user to sign in
      await handleSignIn();
      activeToken = await getAccessToken();
      if (!activeToken) {
        setErrorMsg(isAm ? 'እባክዎ መጀመሪያ በGoogle ይግቡ' : 'Please sign in with Google to allow spreadsheet creation.');
        return;
      }
    }

    setIsExporting(actionType);
    setErrorMsg(null);
    triggerHaptic(12);

    try {
      let result: SheetExportResult;
      if (actionType === 'tickets') {
        result = await exportTicketsToGoogleSheets(tickets, activeToken, googleUser?.uid);
      } else if (actionType === 'fleet') {
        result = await exportFleetTelemetryToGoogleSheets(buses, activeToken, googleUser?.uid);
      } else {
        result = await exportStationsDirectoryToGoogleSheets(stations, activeToken, googleUser?.uid);
      }

      setLastExport(result);
      setExportHistory((prev) => [result, ...prev]);
      triggerHaptic(20);
    } catch (err: any) {
      console.error('Export failed:', err);
      setErrorMsg(
        err.message ||
          (isAm ? 'ወደ Google Sheets መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to export to Google Sheets.')
      );
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 sm:p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Google Workspace
                </span>
                <span className="text-xs text-emerald-200 font-mono">Sheets API v4</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {isAm ? 'Google Sheets የትራንስፖርት መረጃ ማመሳሰያ' : 'Google Sheets Transit Sync & Export'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Cloud Backend Architecture Status Badge */}
        <div className="bg-neutral-900 px-5 py-2.5 text-xs text-neutral-300 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-3.5 h-3.5" />
              <span>Cloud SQL (PostgreSQL europe-west2)</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Firebase Firestore</span>
            </span>
          </div>
          <span className="text-neutral-400 text-[11px]">project: yttriferous-outcome-4lkcn</span>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-neutral-800 text-sm">
          {/* Google Auth Status Bar */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
            {googleUser ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {googleUser.displayName?.charAt(0) || googleUser.email?.charAt(0) || 'G'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                      {googleUser.displayName || 'Google Account'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs text-neutral-500 font-mono block">{googleUser.email}</span>
                </div>
              </div>
            ) : (
              <div>
                <strong className="text-xs sm:text-sm text-neutral-900 block">
                  {isAm ? 'የጉግል አካውንትዎን ያገናኙ' : 'Connect Your Google Account'}
                </strong>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isAm
                    ? 'ስፕረድሺቶችን በGoogle Driveዎ ውስጥ ለመፍጠርና ለማመሳሰል'
                    : 'Required to create and export live spreadsheets directly to your Google Drive.'}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {googleUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAm ? 'ውጣ' : 'Sign Out'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  {isSigningIn ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{isAm ? 'በGoogle ይግቡ' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Export Actions Cards */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
              {isAm ? 'የትራንስፖርት መረጃዎችን ወደ Google Sheets ይላኩ' : 'Available Export Datasets'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Passenger Manifest */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 hover:border-emerald-500 transition shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-neutral-900">
                    {isAm ? 'የተሳፋሪዎች ማኒፌስት' : 'Passenger Manifest'}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {isAm
                      ? `${tickets.length} የተያዙ ትኬቶች፣ የመቀመጫ ቁጥር እና ክፍያዎች`
                      : `${tickets.length} confirmed passenger tickets, seat allocations, and Telebirr/CBE references.`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => promptExport('tickets')}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isExporting === 'tickets' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isAm ? 'ወደ Sheets ላክ' : 'Export to Sheets'}</span>
                </button>
              </div>

              {/* Option 2: Fleet Telemetry */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 hover:border-emerald-500 transition shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Bus className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-neutral-900">
                    {isAm ? 'የአውቶቡሶች ቴሌሜትሪ' : 'Live Fleet Telemetry'}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {isAm
                      ? `${buses.length} አውቶቡሶች ፍጥነት፣ ከፍታ፣ እና የመድረሻ ሰዓት`
                      : `${buses.length} en-route coaches with real-time speed, mountain altitude, and ETA.`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => promptExport('fleet')}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isExporting === 'fleet' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isAm ? 'ወደ Sheets ላክ' : 'Export to Sheets'}</span>
                </button>
              </div>

              {/* Option 3: Station Hubs Directory */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 hover:border-emerald-500 transition shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-neutral-900">
                    {isAm ? 'የመናኸሪያዎች ማውጫ' : 'Station Directory'}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {isAm
                      ? `${stations.length} የኢትዮጵያ መናኸሪያዎችና ደረጃቸው`
                      : `${stations.length} Federal, Regional, Zonal & Woreda bus station hubs with GPS coordinates.`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isExporting !== null}
                  onClick={() => promptExport('stations')}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isExporting === 'stations' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{isAm ? 'ወደ Sheets ላክ' : 'Export to Sheets'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Last Export Banner */}
          {lastExport && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-xs sm:text-sm text-emerald-950 block">
                    {isAm ? 'ስፕረድሺቱ በተሳካ ሁኔታ ተፈጥሯል!' : 'Spreadsheet Created Successfully!'}
                  </strong>
                  <span className="text-xs text-emerald-800 font-medium">
                    {lastExport.title} ({lastExport.recordsCount} {isAm ? 'መረጃዎች' : 'records'})
                  </span>
                </div>
              </div>

              <a
                href={lastExport.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <span>{isAm ? 'በGoogle Sheets ክፈት' : 'Open in Google Sheets'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Export History */}
          {exportHistory.length > 1 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                {isAm ? 'የቀደምት መላኮች ታሪክ' : 'Session Export History'}
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {exportHistory.slice(1).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 text-xs border border-neutral-200"
                  >
                    <span className="font-medium text-neutral-800 truncate max-w-xs">{item.title}</span>
                    <a
                      href={item.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>{isAm ? 'ክፈት' : 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-50 px-5 sm:px-6 py-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>
              {isAm
                ? 'በደመናው ላይ በPostgreSQL፣ Firestore እና Google Sheets የተሳሰረ'
                : 'Backed by Cloud SQL PostgreSQL, Firestore & Google Sheets API'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold rounded-xl transition cursor-pointer"
          >
            {isAm ? 'ዝጋ' : 'Close'}
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Workspace API Mutation */}
      {confirmingAction && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-300 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-900">
                  {confirmingAction.title}
                </h3>
                <span className="text-xs text-neutral-500">
                  {isAm ? 'ፈቃድ ማረጋገጫ' : 'User Permission Required'}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
              {confirmingAction.description}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setConfirmingAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 transition cursor-pointer"
              >
                {isAm ? 'ይቅር' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeConfirmedExport}
                className="flex-1 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{isAm ? 'አረጋግጥና ፍጠር' : 'Confirm & Create Sheet'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

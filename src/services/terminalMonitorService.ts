/**
 * Local Mock Service Monitor for Amhara Regional Bus Terminals
 * Proactively checks for unexpected delays and terminal-wide cancellations
 * and broadcasts alerts to subscribed listeners and users.
 */

import {
  TerminalDisruptionAlert,
  TerminalDisruptionType,
  TerminalOperationalStatus,
  PreferredTerminalSettings,
} from '../types';
import { AMHARA_STATIONS } from '../data/amharaStations';
import { triggerHaptic } from '../utils/haptics';
import { playTransitChime } from '../utils/departureScheduler';

const SETTINGS_STORAGE_KEY = 'bus_ride_preferred_terminal_settings';
const ALERTS_STORAGE_KEY = 'bus_ride_terminal_disruptions';

export const DEFAULT_PREFERRED_SETTINGS: PreferredTerminalSettings = {
  preferredTerminalId: 'bahir-dar',
  notifyOnDelays: true,
  notifyOnCancellations: true,
  soundEnabled: true,
  browserNotificationsEnabled: true,
};

// Initial Realistic Terminal Disruption Data
export const INITIAL_DISRUPTION_ALERTS: Record<string, TerminalDisruptionAlert> = {
  'debre-birhan': {
    id: 'disrupt-db-01',
    terminalId: 'debre-birhan',
    terminalName: 'Debre Birhan Terminal',
    terminalNameAm: 'ደብረ ብርሃን መናኸሪያ',
    city: 'Debre Birhan',
    cityAm: 'ደብረ ብርሃን',
    type: 'UNEXPECTED_DELAY',
    severity: 'major',
    status: 'delayed',
    headlineEn: 'Severe Termaber Mountain Pass Fog: Unexpected +55m Departure Delay',
    headlineAm: 'በተርማበር ተራራ መተላለፊያ ከባድ ጉም ምክንያት የ+55 ደቂቃ ያልተጠበቀ መዘግየት',
    detailEn:
      'Heavy mountain fog and frost at Termaber Tunnel have reduced visibility to under 15 meters. Regional Highway Patrol has mandated slow-speed convoys for all outgoing buses.',
    detailAm:
      'በተርማበር ዋሻ አካባቢ በከባድ ጉምና ውርጭ ሳቢያ ታይነት ከ15 ሜትር በታች ወርዷል። የትራፊክ ፖሊስ ሁሉም አውቶቡሶች በዝቅተኛ ፍጥነት እንዲጓዙ አዟል።',
    expectedDelayMinutes: 55,
    estimatedResolutionTime: '10:30 AM',
    affectedCorridors: ['Debre Birhan ➔ Dessie', 'Debre Birhan ➔ Addis Ababa', 'Debre Birhan ➔ Shewa Robit'],
    recommendedActionEn:
      'Passengers should remain in the indoor terminal lounge. Early departures are queued with fog escort vehicles.',
    recommendedActionAm:
      'ተሳፋሪዎች በመናኸሪያው የመጠባበቂያ አዳራሽ እንዲቆዩ ይመከራል። አውቶቡሶች በተራ አስከባሪ መኪኖች እየታጀቡ ይወጣሉ።',
    isTerminalWide: false,
    reportedAt: '06:15 AM',
    updatedAt: '06:45 AM',
    isActive: true,
    issuedByAuthority: 'North Shewa Regional Transport Command',
  },
  'lalibela': {
    id: 'disrupt-lali-01',
    terminalId: 'lalibela',
    terminalName: 'Lalibela Terminal',
    terminalNameAm: 'ላሊበላ መናኸሪያ',
    city: 'Lalibela',
    cityAm: 'ላሊበላ',
    type: 'TERMINAL_CANCELLATION',
    severity: 'critical',
    status: 'cancelled',
    headlineEn: 'Terminal Operations Suspended: High-Altitude Debris & Landslide Risk',
    headlineAm: 'የመናኸሪያው አገልግሎት ለጊዜው ተቋርጧል፡ በተራራማው መስመር የመሬት መንሸራተት ስጋት',
    detailEn:
      'Torrential rains on the high-elevation ridge between Gashena and Lalibela have caused rockfall debris blocking Route 22. All intercity departures from Lalibela Terminal are suspended until safety clearance.',
    detailAm:
      'በጋሸና እና ላሊበላ መካከል ባለው ከፍታማ ተራራ በጣለው ከባድ ዝናብ ምክንያት ድንጋይ ተንከባሎ መንገዱ ተዘግቷል። ከመናኸሪያው የሚነሱ ሁሉም ጉዞዎች ለደህንነት ሲባል ለጊዜው ተሰርዘዋል።',
    expectedDelayMinutes: undefined,
    estimatedResolutionTime: '01:00 PM',
    affectedCorridors: ['Lalibela ➔ Woldiya', 'Lalibela ➔ Bahir Dar', 'Lalibela ➔ Gondar'],
    recommendedActionEn:
      'All ticket holders are advised to seek station master re-booking vouchers. Do not board unlicensed private vehicles.',
    recommendedActionAm:
      'ትኬት የቆረጡ ተሳፋሪዎች ከመናኸሪያው አስተዳደር ነፃ የጉዞ ማስተካከያ ቫውቸር እንዲወስዱ ይጠየቃል። ካልተፈቀደላቸው መኪኖች ጋር አይጓዙ።',
    isTerminalWide: true,
    reportedAt: '05:40 AM',
    updatedAt: '06:30 AM',
    isActive: true,
    issuedByAuthority: 'Wag Hemra & North Wollo Joint Dispatch Safety Directorate',
  },
};

type AlertChangeListener = (alerts: Record<string, TerminalDisruptionAlert>) => void;
type ProactiveDisruptionListener = (alert: TerminalDisruptionAlert) => void;

class TerminalMonitorService {
  private alerts: Record<string, TerminalDisruptionAlert> = { ...INITIAL_DISRUPTION_ALERTS };
  private settings: PreferredTerminalSettings = { ...DEFAULT_PREFERRED_SETTINGS };
  private changeListeners: Set<AlertChangeListener> = new Set();
  private proactiveListeners: Set<ProactiveDisruptionListener> = new Set();
  private isPollingActive = false;
  private pollIntervalId: NodeJS.Timeout | null = null;
  private notifiedAlertIds: Set<string> = new Set();

  constructor() {
    this.loadFromStorage();
    this.startBackgroundMonitor();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined') {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          this.settings = { ...DEFAULT_PREFERRED_SETTINGS, ...JSON.parse(storedSettings) };
        }
        const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
        if (storedAlerts) {
          this.alerts = { ...INITIAL_DISRUPTION_ALERTS, ...JSON.parse(storedAlerts) };
        }
      }
    } catch {
      // fallback to defaults
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(this.alerts));
      }
    } catch {
      // storage unavailable
    }
  }

  /**
   * Start mock background service checking terminal statuses
   */
  public startBackgroundMonitor() {
    if (this.isPollingActive) return;
    this.isPollingActive = true;

    // Simulate periodic checks every 20 seconds
    this.pollIntervalId = setInterval(() => {
      this.checkPreferredTerminalStatus();
    }, 20000);
  }

  public stopBackgroundMonitor() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
    this.isPollingActive = false;
  }

  public getSettings(): PreferredTerminalSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<PreferredTerminalSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.saveToStorage();
    // Re-check preferred terminal if setting or terminal changed
    this.checkPreferredTerminalStatus();
  }

  public setPreferredTerminal(terminalId: string) {
    this.updateSettings({ preferredTerminalId: terminalId });
  }

  public getAlerts(): Record<string, TerminalDisruptionAlert> {
    return { ...this.alerts };
  }

  public getDisruptionForTerminal(terminalId: string): TerminalDisruptionAlert | null {
    const alert = this.alerts[terminalId];
    return alert && alert.isActive ? alert : null;
  }

  public getPreferredTerminalDisruption(): TerminalDisruptionAlert | null {
    return this.getDisruptionForTerminal(this.settings.preferredTerminalId);
  }

  /**
   * Subscriptions
   */
  public subscribeToAlerts(listener: AlertChangeListener): () => void {
    this.changeListeners.add(listener);
    listener({ ...this.alerts });
    return () => this.changeListeners.delete(listener);
  }

  public subscribeToProactiveNotifications(listener: ProactiveDisruptionListener): () => void {
    this.proactiveListeners.add(listener);
    return () => this.proactiveListeners.delete(listener);
  }

  private notifyChangeListeners() {
    const copy = { ...this.alerts };
    this.changeListeners.forEach((l) => l(copy));
    this.saveToStorage();
  }

  /**
   * Checks if the user's preferred terminal has an active disruption that needs proactive notification
   */
  public checkPreferredTerminalStatus() {
    const currentPreferredId = this.settings.preferredTerminalId;
    const alert = this.getDisruptionForTerminal(currentPreferredId);

    if (!alert) return;

    const isDelay = alert.type === 'UNEXPECTED_DELAY' || alert.status === 'delayed';
    const isCancel = alert.type === 'TERMINAL_CANCELLATION' || alert.status === 'cancelled';

    const shouldNotify =
      (isDelay && this.settings.notifyOnDelays) ||
      (isCancel && this.settings.notifyOnCancellations);

    if (shouldNotify && !this.notifiedAlertIds.has(alert.id)) {
      this.dispatchProactivePush(alert);
    }
  }

  /**
   * Dispatches proactive push alert across sound, haptics, native OS notification, and in-app banner
   */
  public dispatchProactivePush(alert: TerminalDisruptionAlert) {
    this.notifiedAlertIds.add(alert.id);

    // Audio chime if enabled
    if (this.settings.soundEnabled) {
      playTransitChime();
    }

    // Haptic vibration
    triggerHaptic([40, 60, 40, 80]);

    // Native browser push notification if permitted
    if (this.settings.browserNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(
            alert.type === 'TERMINAL_CANCELLATION'
              ? `🚨 TERMINAL CANCELLED: ${alert.terminalName}`
              : `⚠️ UNEXPECTED DELAY: ${alert.terminalName} (+${alert.expectedDelayMinutes || 45}m)`,
            {
              body: `${alert.headlineEn}\n${alert.detailEn}`,
              icon: '/app-logo.png',
              tag: `terminal-disrupt-${alert.terminalId}`,
            }
          );
        } catch {
          // Native notification failed silently
        }
      }
    }

    // Broadcast to proactive in-app listeners
    this.proactiveListeners.forEach((listener) => {
      listener(alert);
    });
  }

  /**
   * Test / Simulation Methods
   */
  public triggerUnexpectedDelay(
    terminalId: string,
    delayMinutes = 45,
    customHeadline?: string,
    customHeadlineAm?: string
  ): TerminalDisruptionAlert {
    const station = AMHARA_STATIONS.find((s) => s.id === terminalId) || {
      id: terminalId,
      name: `${terminalId} Terminal`,
      nameAm: `${terminalId} መናኸሪያ`,
      city: terminalId,
      cityAm: terminalId,
    };

    const newAlert: TerminalDisruptionAlert = {
      id: `disrupt-delay-${terminalId}-${Date.now()}`,
      terminalId,
      terminalName: station.name,
      terminalNameAm: station.nameAm,
      city: station.city,
      cityAm: station.cityAm,
      type: 'UNEXPECTED_DELAY',
      severity: 'major',
      status: 'delayed',
      headlineEn:
        customHeadline ||
        `Highway Incline Gridlock: Unexpected +${delayMinutes}m Departure Delay at ${station.name}`,
      headlineAm:
        customHeadlineAm ||
        `የመንገድ መጨናነቅ ምክንያት በ${station.nameAm} የ+${delayMinutes} ደቂቃ ያልተጠበቀ መዘግየት ተከስቷል`,
      detailEn: `Regional Traffic Operations reported severe queueing and heavy vehicle breakdowns impacting express departures from ${station.name}. Estimated delay is +${delayMinutes} minutes.`,
      detailAm: `በክልሉ የትራንስፖርት ቁጥጥር ማዕከል እንደተገለጸው በ${station.nameAm} የሚነሱ አውቶቡሶች በከባድ መኪኖች ብልሽት ሳቢያ የ+${delayMinutes} ደቂቃ መዘግየት ገጥሟቸዋል።`,
      expectedDelayMinutes: delayMinutes,
      estimatedResolutionTime: 'Within 90 mins',
      affectedCorridors: [`${station.city} ➔ Intercity Corridors`],
      recommendedActionEn:
        'Verify your boarding gate with station staff. Drivers are maintaining vehicle climate control.',
      recommendedActionAm: 'የመጫኛ በርዎን ከመናኸሪያው ተረኞች ጋር ያረጋግጡ።',
      isTerminalWide: false,
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      issuedByAuthority: 'Amhara Regional Transport Dispatch Command',
    };

    this.alerts[terminalId] = newAlert;
    this.notifyChangeListeners();

    // If this terminal is preferred, push proactive notification immediately!
    if (this.settings.preferredTerminalId === terminalId && this.settings.notifyOnDelays) {
      this.dispatchProactivePush(newAlert);
    }

    return newAlert;
  }

  public triggerTerminalCancellation(
    terminalId: string,
    customHeadline?: string,
    customHeadlineAm?: string
  ): TerminalDisruptionAlert {
    const station = AMHARA_STATIONS.find((s) => s.id === terminalId) || {
      id: terminalId,
      name: `${terminalId} Terminal`,
      nameAm: `${terminalId} መናኸሪያ`,
      city: terminalId,
      cityAm: terminalId,
    };

    const newAlert: TerminalDisruptionAlert = {
      id: `disrupt-cancel-${terminalId}-${Date.now()}`,
      terminalId,
      terminalName: station.name,
      terminalNameAm: station.nameAm,
      city: station.city,
      cityAm: station.cityAm,
      type: 'TERMINAL_CANCELLATION',
      severity: 'critical',
      status: 'cancelled',
      headlineEn:
        customHeadline ||
        `TERMINAL-WIDE CANCELLATION: All Departures Suspended at ${station.name}`,
      headlineAm:
        customHeadlineAm ||
        `መናኸሪያው ለጊዜው ተዘግቷል፡ በ${station.nameAm} ሁሉም ጉዞዎች ተሰርዘዋል`,
      detailEn: `Emergency directive from Amhara Regional Transport Authority: All bus bay gates at ${station.name} are closed temporarily due to severe road washouts and safety hazards. No vehicles will dispatch until further notice.`,
      detailAm: `ከአማራ ክልል ትራንስፖርት ባለስልጣን የወጣ አስቸኳይ ትዕዛዝ፡ በ${station.nameAm} ያሉ የመነሻ በሮች በሙሉ በጎርፍና የመንገድ ብልሽት ሳቢያ ተዘግተዋል። ቀጣይ መመሪያ እስኪሰጥ ድረስ ምንም አይነት አውቶቡስ አይነሳም።`,
      expectedDelayMinutes: undefined,
      estimatedResolutionTime: 'Suspended until safety clearance',
      affectedCorridors: [`All departures from ${station.city}`],
      recommendedActionEn:
        'Do not travel to the terminal. Full refunds and reschedule vouchers are automatically authorized in the app.',
      recommendedActionAm:
        'ወደ መናኸሪያው አይሂዱ። ሙሉ ገንዘብ ተመላሽ እና የጉዞ ማስተካከያ በመተግበሪያው በኩል ተፈቅዷል።',
      isTerminalWide: true,
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isActive: true,
      issuedByAuthority: 'Amhara Regional Public Safety & Transport Executive Committee',
    };

    this.alerts[terminalId] = newAlert;
    this.notifyChangeListeners();

    // If this terminal is preferred, push proactive notification immediately!
    if (this.settings.preferredTerminalId === terminalId && this.settings.notifyOnCancellations) {
      this.dispatchProactivePush(newAlert);
    }

    return newAlert;
  }

  public clearTerminalDisruption(terminalId: string) {
    if (this.alerts[terminalId]) {
      delete this.alerts[terminalId];
      this.notifyChangeListeners();
    }
  }

  public resetToDefaultDisruptions() {
    this.alerts = { ...INITIAL_DISRUPTION_ALERTS };
    this.notifiedAlertIds.clear();
    this.notifyChangeListeners();
    this.checkPreferredTerminalStatus();
  }

  /**
   * Request native browser push notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      this.updateSettings({ browserNotificationsEnabled: granted });
      return granted;
    } catch {
      return false;
    }
  }
}

export const terminalMonitorService = new TerminalMonitorService();

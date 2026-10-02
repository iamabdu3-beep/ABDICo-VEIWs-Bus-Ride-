import { WeatherAlert, WeatherAlertSeverity } from '../types';

export const INITIAL_WEATHER_ALERTS: Record<string, WeatherAlert> = {
  'debre-birhan': {
    id: 'alert-db-001',
    stationId: 'debre-birhan',
    stationName: 'Debre Birhan Selassie Terminal',
    stationNameAm: 'ደብረ ብርሃን - ሥላሴ ማዕከላዊ መናኸሪያ',
    regionZone: 'North Shewa',
    regionZoneAm: 'ሰሜን ሸዋ',
    severity: 'Severe',
    eventType: 'DENSE_MOUNTAIN_FOG',
    eventTitle: 'Dense Mountain Fog & Highland Frost Advisory',
    eventTitleAm: 'ጥቅጥቅ ያለ የተራራ ጭጋግ እና የበረዶ ንክኪ ማስጠንቀቂያ',
    description:
      'Sub-zero highland condensation and dense mountain fog observed across the Termaber Mountain Pass tunnel corridor (Elevation 2,840m). Highway visibility severely reduced below 15 meters with slippery asphalt.',
    descriptionAm:
      'በተርማበር የተራራ ዋሻ መተላለፊያ (ከፍታ 2,840 ሜትር) ላይ ከፍተኛ ጭጋግ እና ቅዝቃዜ ተከስቷል። በአውራ ጎዳናው ላይ የማየት ርቀት ከ15 ሜትር በታች ዝቅ ብሏል፤ መንገዱ የሚያዳልጥ ነው።',
    safetyRecommendations: [
      'Buses must operate in supervised convoys with low-beam & fog lamps engaged.',
      'Corridor speed limit strictly restricted to 30 km/h along mountain switchbacks.',
      'Scheduled departures may hold up to 30–45 minutes for optimal escort clearance.',
      'Keep warm clothing inside cabin baggage for highland altitude drops.',
    ],
    safetyRecommendationsAm: [
      'አውቶቡሶች የጭጋግ መብራቶችን (fog lamps) አብርተው በጥንቃቄ እንዲጓዙ ተደንግጓል።',
      'በተራራማው መታጠፊያ ከፍተኛው ፍጥነት በሰዓት 30 ኪ.ሜ ብቻ የተገደበ ነው።',
      'የአየር ሁኔታው እስኪሻሻል ድረስ መነሻዎች ከ30-45 ደቂቃ ሊዘገዩ ይችላሉ።',
      'ለከፍተኛው ቅዝቃዜ የሚሆኑ ሞቃት ልብሶችን ይዘው ይጓዙ።',
    ],
    expectedDelayMin: 45,
    corridorHighway: 'Route 2 (Termaber Mountain Pass & Tunnel)',
    dataSource: {
      name: 'Ethiopian Meteorological Institute (EMI)',
      authorityUri: 'https://www.ethiomet.gov.et',
    },
    startTime: '2026-09-23T06:00:00Z',
    expirationTime: '2026-09-23T20:00:00Z',
    isActive: true,
    affectedRole: 'origin',
  },
  'lalibela': {
    id: 'alert-lali-002',
    stationId: 'lalibela',
    stationName: 'Lalibela Roha Gate Terminal',
    stationNameAm: 'ላሊበላ - ሮሃ መግቢያ መናኸሪያ',
    regionZone: 'North Wollo',
    regionZoneAm: 'ሰሜን ወሎ',
    severity: 'Extreme',
    eventType: 'TORRENTIAL_RAIN',
    eventTitle: 'Torrential Highland Rain & Escarpment Mudslide Warning',
    eventTitleAm: 'ከባድ የተራራ ዝናብ እና የመሬት መንሸራተት አደጋ ማስጠንቀቂያ',
    description:
      'Intense orographic torrential downpour (52mm precipitation) affecting the steep mountain ascents and escarpments between Gashena junction and Lalibela terminal. Rockfall danger on switchbacks.',
    descriptionAm:
      'ከጋሸና መጋጠሚያ እስከ ላሊበላ መናኸሪያ ባለው ገደላማ አቀበት ላይ 52 ሚ.ሜ ከባድ ዝናብ እየጣለ ይገኛል። በተራራው መታጠፊያዎች ላይ የድንጋይና አፈር መውረድ ስጋት አለ።',
    safetyRecommendations: [
      'Terminal dispatch temporarily holding large 55-seat coaches pending clearance.',
      'Drivers instructed not to overtake and strictly maintain 50-meter vehicle spacing.',
      'Passenger luggage hatches must be water-sealed and strapped with tarpaulins.',
      'Night departures suspended on precipitous cliff sectors.',
    ],
    safetyRecommendationsAm: [
      'የመናኸሪያው ስምሪት ትልልቅ አውቶቡሶችን መንገድ እስኪጣራ ድረስ ለጊዜው አዘግይቷል።',
      'አሽከርካሪዎች መቅደም እንዳይሞክሩ እና 50 ሜትር የርቀት ልዩነት እንዲጠብቁ ታዝዘዋል።',
      'የተሳፋሪዎች ሻንጣዎች በውሃ እንዳይበላሹ በሸራ እንዲሸፈኑ ተደርጓል።',
      'በገደላማ መንገዶች የሌሊት ጉዞ እንዳይደረግ ተከልክሏል።',
    ],
    expectedDelayMin: 60,
    corridorHighway: 'Route 22 (Lalibela Mountain Escarpment)',
    dataSource: {
      name: 'Amhara Disaster Risk Management Commission & EMI',
      authorityUri: 'https://www.ethiomet.gov.et',
    },
    startTime: '2026-09-23T08:30:00Z',
    expirationTime: '2026-09-23T22:00:00Z',
    isActive: true,
    affectedRole: 'destination',
  },
  'wag-hemra': {
    id: 'alert-wag-003',
    stationId: 'wag-hemra',
    stationName: 'Sekota Wag Hemra Terminal',
    stationNameAm: 'ሰቆጣ - ዋግ ህምራ ማዕከላዊ መናኸሪያ',
    regionZone: 'Wag Hemra',
    regionZoneAm: 'ዋግ ኽምራ',
    severity: 'Moderate',
    eventType: 'FLASH_FLOOD_WATCH',
    eventTitle: 'Seasonal River Basin Flash Runoff Watch',
    eventTitleAm: 'የወንዝ ሙላት እና ድንገተኛ ፍሳሽ ማስጠንቀቂያ',
    description:
      'Fast riverbed runoff from surrounding highlands crossing dry-river ford crossings towards Sekota. Moderate delays expected at bridge choke points.',
    descriptionAm:
      'ከተራሮች የሚወርደው የዝናብ ውሃ ወደ ሰቆጣ በሚወስዱ ድልድዮች ላይ ፍሰት ጨምሯል። በአቋራጭ መንገዶች ላይ መካከለኛ መዘግየት ይጠበቃል።',
    safetyRecommendations: [
      'Vehicles must wait for water level gauge verification before traversing low bridges.',
      'Terminal staff providing live status checks every 30 minutes.',
    ],
    safetyRecommendationsAm: [
      'ተሽከርካሪዎች በዝቅተኛ ድልድዮች ከማለፋቸው በፊት የውሃውን መጠን እንዲያረጋግጡ ታዝዘዋል።',
      'የመናኸሪያው ሠራተኞች በየ30 ደቂቃው የመንገዱን ሁኔታ ያረጋግጣሉ።',
    ],
    expectedDelayMin: 25,
    corridorHighway: 'Route 22 (Tekeze Valley Approach)',
    dataSource: {
      name: 'Ethiopian Meteorological Institute (EMI)',
      authorityUri: 'https://www.ethiomet.gov.et',
    },
    startTime: '2026-09-23T09:00:00Z',
    expirationTime: '2026-09-23T18:00:00Z',
    isActive: true,
    affectedRole: 'origin',
  },
};

/**
 * Returns active severe weather alert for a specific station, or null if calm/normal.
 */
export function getStationSevereAlert(
  stationId: string,
  alertsState: Record<string, WeatherAlert> = INITIAL_WEATHER_ALERTS
): WeatherAlert | null {
  if (!stationId) return null;
  const alert = alertsState[stationId];
  if (alert && alert.isActive) {
    return alert;
  }
  return null;
}

/**
 * Analyzes whether the chosen travel corridor (origin and/or destination)
 * has severe weather reported.
 */
export function checkCorridorSevereWeather(
  originStationId: string,
  destStationId: string,
  alertsState: Record<string, WeatherAlert> = INITIAL_WEATHER_ALERTS
): {
  hasSevereWeather: boolean;
  originAlert: WeatherAlert | null;
  destAlert: WeatherAlert | null;
  affectedRole: 'origin' | 'destination' | 'both' | 'none';
  highestSeverity: WeatherAlertSeverity | null;
  maxExpectedDelayMin: number;
} {
  const originAlert = getStationSevereAlert(originStationId, alertsState);
  const destAlert = getStationSevereAlert(destStationId, alertsState);

  const hasSevereWeather = Boolean(originAlert || destAlert);

  let affectedRole: 'origin' | 'destination' | 'both' | 'none' = 'none';
  if (originAlert && destAlert) {
    affectedRole = 'both';
  } else if (originAlert) {
    affectedRole = 'origin';
  } else if (destAlert) {
    affectedRole = 'destination';
  }

  // Calculate highest severity
  let highestSeverity: WeatherAlertSeverity | null = null;
  if (originAlert?.severity === 'Extreme' || destAlert?.severity === 'Extreme') {
    highestSeverity = 'Extreme';
  } else if (originAlert?.severity === 'Severe' || destAlert?.severity === 'Severe') {
    highestSeverity = 'Severe';
  } else if (originAlert?.severity === 'Moderate' || destAlert?.severity === 'Moderate') {
    highestSeverity = 'Moderate';
  }

  const maxExpectedDelayMin = Math.max(
    originAlert?.expectedDelayMin || 0,
    destAlert?.expectedDelayMin || 0
  );

  return {
    hasSevereWeather,
    originAlert,
    destAlert,
    affectedRole,
    highestSeverity,
    maxExpectedDelayMin,
  };
}

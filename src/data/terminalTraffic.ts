import { TerminalTrafficStatus, CongestionLevel } from '../types';

export const BASE_TERMINAL_TRAFFIC: Record<string, TerminalTrafficStatus> = {
  'bahir-dar': {
    stationId: 'bahir-dar',
    congestionLevel: 'heavy',
    congestionScore: 78,
    averageDelayMin: 14,
    approachSpeedKmH: 14,
    queueLengthVehicles: 26,
    bayOccupancyRate: 88,
    statusHeadlineEn: 'Heavy Terminal Inflow & Departure Queues',
    statusHeadlineAm: 'ከፍተኛ የመናኸሪያ መግቢያና መውጫ መጨናነቅ',
    statusDescriptionEn:
      'High vehicle density around Lake Tana avenue and Kebele 04 roundabout. Intercity coach departures to Addis Ababa and Gondar are experiencing 12-16 minute gate clearance delays. Terminal bays 1 to 14 are operating near maximum capacity.',
    statusDescriptionAm:
      'በጣና ጎዳና እና ቀበሌ 04 አደባባይ ዙሪያ ከፍተኛ የተሸከርካሪ መጨናነቅ አለ። ወደ አዲስ አበባ እና ጎንደር የሚወጡ ረጅም ርቀት አውቶቡሶች ከ12-16 ደቂቃ የመግቢያና መውጫ መዘግየት እያጋጠማቸው ነው። የመናኸሪያው በሮች ከ1-14 በሙሉ አቅም በመስራት ላይ ናቸው።',
    gateAccessStatusEn: 'Gate 2 (Route 3 Inbound) Slow moving; Gate 1 Express Priority Clear',
    gateAccessStatusAm: 'በር 2 (ከመንገድ 3 መግቢያ) ዝግ ያለ እንቅስቃሴ፤ በር 1 ፈጣን መተላለፊያ ክፍት',
    lastUpdated: 'Live feed updated 1m ago',
    congestionTrend: 'worsening',
    corridorsAffected: ['Route 3 Bahir Dar Inbound', 'Kebele 04 Ring Road', 'Lake Tana Shore Access'],
  },
  gondar: {
    stationId: 'gondar',
    congestionLevel: 'moderate',
    congestionScore: 54,
    averageDelayMin: 7,
    approachSpeedKmH: 26,
    queueLengthVehicles: 12,
    bayOccupancyRate: 68,
    statusHeadlineEn: 'Moderate Flow with Mountain Route Staging',
    statusHeadlineAm: 'መካከለኛ እንቅስቃሴና የተራራ መንገድ ዝግጅት',
    statusDescriptionEn:
      'Steady passenger and minibus transit through Azezo intersection. Minor queue accumulation at northern Simien Mountain shuttle bay. Approach from Bahir Dar highway is moving smoothly at 25-30 km/h.',
    statusDescriptionAm:
      'በአዘዞ መገናኛ በኩል የተረጋጋ የተሳፋሪና ሚኒባስ ፍሰት አለ። በሰሜን ተራሮች አቅጣጫ መጫኛ በሮች ላይ መጠነኛ ወረፋ ይታያል። ከባሕር ዳር አውራ ጎዳና መግቢያው በሰዓት 25-30 ኪ.ሜ ያለ እክል በመንቀሳቀስ ላይ ነው።',
    gateAccessStatusEn: 'Azezo South Gate Normal; Piazza Shuttles Flowing',
    gateAccessStatusAm: 'የአዘዞ ደቡብ በር መደበኛ፤ የፒያሳ ማመላለሻዎች በሰላም እየሰሩ ነው',
    lastUpdated: 'Live feed updated 2m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Azezo-Gondar Highway', 'Piazza Transit Link'],
  },
  dessie: {
    stationId: 'dessie',
    congestionLevel: 'severe',
    congestionScore: 92,
    averageDelayMin: 24,
    approachSpeedKmH: 8,
    queueLengthVehicles: 38,
    bayOccupancyRate: 95,
    statusHeadlineEn: 'Severe Congestion Around Mountain Passes & Boru Gate',
    statusHeadlineAm: 'በተራራማው መተላለፊያና ቦሩ በር ዙሪያ እጅግ የበዛ መዘጋጋት',
    statusDescriptionEn:
      'Steep mountain gradient bottlenecks and heavy multi-directional transit through Boru Meda entrance. Freight trucks merging with intercity buses from Kombolcha have caused a 20-25 minute gate bottleneck. Passenger baggage checks are experiencing long queues.',
    statusDescriptionAm:
      'በቦሩ ሜዳ መግቢያ በኩል ባለው ዳገታማ ቦታ እና ከኮምቦልቻ በሚመጡ ከባድ ተሽከርካሪዎች ምክንያት ከ20-25 ደቂቃ የመዘግየት አደጋ ተከስቷል። የሻንጣ መፈተሻ እና የመጫኛ በሮች እጅግ ተጨናንቀዋል።',
    gateAccessStatusEn: 'Boru Gate 1 Restricted to Scheduled Buses; Gate 3 Congested',
    gateAccessStatusAm: 'ቦሩ በር 1 ለታቀዱ አውቶቡሶች ብቻ ተለይቷል፤ በር 3 ተዘግቷል',
    lastUpdated: 'Live feed updated just now',
    congestionTrend: 'worsening',
    corridorsAffected: ['Route 2 A2 Highway', 'Boru Meda Gorge Corridor', 'Kombolcha-Dessie Link'],
  },
  'debre-markos': {
    stationId: 'debre-markos',
    congestionLevel: 'moderate',
    congestionScore: 48,
    averageDelayMin: 6,
    approachSpeedKmH: 32,
    queueLengthVehicles: 9,
    bayOccupancyRate: 62,
    statusHeadlineEn: 'Normal Transit with Steady Gojjam Corridor Flow',
    statusHeadlineAm: 'መደበኛ የመጓጓዣ ፍሰት በጎጃም መስመር',
    statusDescriptionEn:
      'Smooth circulation through the main terminal square. Moderate minibus queuing for Dembecha and Finote Selam connections. Abay Gorge transit coaches are arriving on schedule without major hold-ups.',
    statusDescriptionAm:
      'በዋናው መናኸሪያ አደባባይ ዙሪያ የተስተካከለ እንቅስቃሴ አለ። ወደ ደንበጫና ፍኖተ ሰላም በሚሄዱ ሚኒባሶች ላይ አነስተኛ ወረፋ አለ። ከአባይ በረሃ የሚመጡ አውቶቡሶች በሰዓታቸው እየገቡ ነው።',
    gateAccessStatusEn: 'All Terminal Gates Fully Operational',
    gateAccessStatusAm: 'ሁሉም የመናኸሪያው በሮች ክፍት ሆነው አገልግሎት እየሰጡ ነው',
    lastUpdated: 'Live feed updated 3m ago',
    congestionTrend: 'improving',
    corridorsAffected: ['Route 3 Main Spine', 'Choke Foothill Bypass'],
  },
  'debre-birhan': {
    stationId: 'debre-birhan',
    congestionLevel: 'heavy',
    congestionScore: 82,
    averageDelayMin: 18,
    approachSpeedKmH: 12,
    queueLengthVehicles: 31,
    bayOccupancyRate: 90,
    statusHeadlineEn: 'Heavy Inflow at Capital Gateway Corridor',
    statusHeadlineAm: 'በአዲስ አበባ መግቢያ አውራ ጎዳና ከፍተኛ ጭንቅንቅ',
    statusDescriptionEn:
      'Peak morning rush at the southern gateway into Addis Ababa. Extensive checkpoint clearances and commercial logistics traffic creating bottlenecking along Route 2. Allow 15-20 extra minutes for boarding pass inspection.',
    statusDescriptionAm:
      'ወደ አዲስ አበባ በሚወስደው ደቡባዊ መተላለፊያ ከፍተኛ የጠዋት መጨናነቅ ይታያል። የፍተሻ ጣቢያዎችና የንግድ ተሽከርካሪዎች መብዛት በመንገድ 2 ላይ መዘግየት ፈጥሯል። ለመሳፈር ተጨማሪ 15-20 ደቂቃ ይያዙ።',
    gateAccessStatusEn: 'South Ring Entrance Backed Up 400m; North Gate Flowing',
    gateAccessStatusAm: 'ደቡብ መግቢያ 400 ሜትር ተሰልፏል፤ የሰሜን በር በተሻለ እየሰራ ነው',
    lastUpdated: 'Live feed updated 1m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Route 2 Capital Expressway', 'Industrial Park Feeder Road'],
  },
  kombolcha: {
    stationId: 'kombolcha',
    congestionLevel: 'heavy',
    congestionScore: 74,
    averageDelayMin: 13,
    approachSpeedKmH: 18,
    queueLengthVehicles: 22,
    bayOccupancyRate: 84,
    statusHeadlineEn: 'Multi-Modal Logistics & Junction Queue',
    statusHeadlineAm: 'የኢንዱስትሪና የመንገድ መገናኛ ከፍተኛ ፍሰት',
    statusDescriptionEn:
      'High cross-traffic between dry port freight carriers and intercity passenger buses heading to Afar, Dessie, and Addis Ababa. Gate approach requires cautious slow-speed navigation.',
    statusDescriptionAm:
      'ከደረቅ ወደብ በሚወጡ የጭነት መኪኖችና ወደ አፋር፣ ደሴ እና አዲስ አበባ በሚያቀኑ አውቶቡሶች መገናኛ ላይ የትራፊክ ጥግግት አለ። መናኸሪያው መግቢያ በዝግታ ይንቀሳቀሳል።',
    gateAccessStatusEn: 'Terminal Bay Entrance 4 Active; Commercial Freight Dedicated Lane Open',
    gateAccessStatusAm: 'የመናኸሪያ በር 4 ንቁ ነው፤ ለጭነት ተሽከርካሪዎች የተለየ መስመር ተከፍቷል',
    lastUpdated: 'Live feed updated 2m ago',
    congestionTrend: 'worsening',
    corridorsAffected: ['A2 Highway Junction', 'Dry Port Corridor', 'Mille-Afar Route Link'],
  },
  woldiya: {
    stationId: 'woldiya',
    congestionLevel: 'moderate',
    congestionScore: 58,
    averageDelayMin: 8,
    approachSpeedKmH: 24,
    queueLengthVehicles: 14,
    bayOccupancyRate: 70,
    statusHeadlineEn: 'Active Crossroads Routing to Tigray & Wollo',
    statusHeadlineAm: 'በሰሜን ወሎ መስመር ንቁ የመንገዶች መገናኛ',
    statusDescriptionEn:
      'Steady interchange traffic between the northern highway and the Lalibela mountain route. Minibuses staging smoothly along Bay 3 and 5 with minor delays for passenger baggage verification.',
    statusDescriptionAm:
      'በሰሜኑ አውራ ጎዳና እና ወደ ላሊበላ በሚወስደው የተራራ መንገድ መካከል የተረጋጋ ልውውጥ አለ። ሚኒባሶች በበር 3 እና 5 በሰላም እየተስተናገዱ ሲሆን መጠነኛ የሻንጣ ፍተሻ ጊዜ ይወስዳል።',
    gateAccessStatusEn: 'Crossroads Bay Open; Northern Bypass Moving Steadily',
    gateAccessStatusAm: 'የመስቀለኛ መንገድ በር ክፍት ነው፤ የሰሜን ማለፊያ በመደበኛ ፍጥነት ላይ ነው',
    lastUpdated: 'Live feed updated 4m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Route 2 Highway', 'Route 22 Junction'],
  },
  'finote-selam': {
    stationId: 'finote-selam',
    congestionLevel: 'low',
    congestionScore: 24,
    averageDelayMin: 2,
    approachSpeedKmH: 48,
    queueLengthVehicles: 3,
    bayOccupancyRate: 40,
    statusHeadlineEn: 'Free Flowing Highway & Rapid Gate Entry',
    statusHeadlineAm: 'ነጻ የአውራ ጎዳና እንቅስቃሴና ፈጣን መግቢያ',
    statusDescriptionEn:
      'Clear approaches with zero delays entering the terminal. Transit buses between Bahir Dar and Debre Markos are docking and boarding without congestion.',
    statusDescriptionAm:
      'ወደ መናኸሪያው የሚገቡ መንገዶች ሙሉ በሙሉ ነጻ ናቸው። በባሕር ዳር እና ደብረ ማርቆስ መካከል የሚመላለሱ አውቶቡሶች ያለ ምንም መዘግየት እየገቡና እየወጡ ነው።',
    gateAccessStatusEn: 'All Gates Clear - 0 min wait time',
    gateAccessStatusAm: 'ሁሉም በሮች ነጻ ናቸው - የጥበቃ ጊዜ የለም',
    lastUpdated: 'Live feed updated 5m ago',
    congestionTrend: 'improving',
    corridorsAffected: ['Route 3 Main Expressway'],
  },
  'debre-tabor': {
    stationId: 'debre-tabor',
    congestionLevel: 'low',
    congestionScore: 32,
    averageDelayMin: 4,
    approachSpeedKmH: 40,
    queueLengthVehicles: 5,
    bayOccupancyRate: 52,
    statusHeadlineEn: 'Smooth Highland Circulation',
    statusHeadlineAm: 'ቀለል ያለ የደጋማው ክፍል የትራፊክ ፍሰት',
    statusDescriptionEn:
      'Smooth traffic flow along Gafat access road. Local market minibuses moving efficiently into assigned bays 1 through 6 with under 4 minutes terminal queueing.',
    statusDescriptionAm:
      'በጋፋት መግቢያ መንገድ ላይ የተረጋጋ ፍሰት አለ። የአካባቢው የገበያ ሚኒባሶች በበር 1 እስከ 6 ያለምንም መጨናነቅ በመግባት ላይ ይገኛሉ።',
    gateAccessStatusEn: 'Main Gate Normal Operations',
    gateAccessStatusAm: 'ዋናው የመግቢያ በር በመደበኛ ሁኔታ ላይ ነው',
    lastUpdated: 'Live feed updated 3m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Gafat Mountain Pass', 'Gashena Link'],
  },
  lalibela: {
    stationId: 'lalibela',
    congestionLevel: 'low',
    congestionScore: 28,
    averageDelayMin: 3,
    approachSpeedKmH: 36,
    queueLengthVehicles: 4,
    bayOccupancyRate: 45,
    statusHeadlineEn: 'Clear Mountain Air Terminal Flow',
    statusHeadlineAm: 'የተረጋጋ የተራራማው ከተማ የመናኸሪያ ፍሰት',
    statusDescriptionEn:
      'Light vehicular volume with tourist coaches and local community shuttles boarding on schedule. Winding mountain approaches are dry and free-flowing.',
    statusDescriptionAm:
      'ቀለል ያለ የተሽከርካሪ ብዛት፤ የቱሪስት አውቶቡሶችና የአካባቢው ማመላለሻዎች በሰዓታቸው እየተስተናገዱ ነው። ወደ ተራራው የሚወጡ መንገዶች ክፍት ናቸው።',
    gateAccessStatusEn: 'Mountain Access Gate Completely Clear',
    gateAccessStatusAm: 'የተራራው መግቢያ በር ሙሉ በሙሉ ክፍት ነው',
    lastUpdated: 'Live feed updated 4m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Lalibela-Woldiya Mountain Road'],
  },
  injibara: {
    stationId: 'injibara',
    congestionLevel: 'low',
    congestionScore: 26,
    averageDelayMin: 3,
    approachSpeedKmH: 45,
    queueLengthVehicles: 4,
    bayOccupancyRate: 48,
    statusHeadlineEn: 'Fluid Awi Zone Transit Corridor',
    statusHeadlineAm: 'ቀልጣፋ የአዊ ዞን የመጓጓዣ መተላለፊያ',
    statusDescriptionEn:
      'Smooth, uninterrupted highway access along Route 3 connecting to Chagni and the Grand Renaissance Dam road. No bottlenecks observed at platform gates.',
    statusDescriptionAm:
      'በመንገድ 3 ላይ ወደ ቻግኒ እና ህዳሴ ግድብ የሚወስደው አውራ ጎዳና ክፍት ነው። በመናኸሪያው በሮች ላይ ምንም አይነት መጨናነቅ የለም።',
    gateAccessStatusEn: 'Awi Highland Gateway Clear',
    gateAccessStatusAm: 'የአዊ ደጋማ መተላለፊያ በር ክፍት ነው',
    lastUpdated: 'Live feed updated 2m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Route 3 South Spine', 'Chagni Road'],
  },
  'shewa-robit': {
    stationId: 'shewa-robit',
    congestionLevel: 'moderate',
    congestionScore: 52,
    averageDelayMin: 7,
    approachSpeedKmH: 28,
    queueLengthVehicles: 11,
    bayOccupancyRate: 64,
    statusHeadlineEn: 'Moderate Transit at Rift Valley Edge',
    statusHeadlineAm: 'በስምጥ ሸለቆው ጠርዝ መካከለኛ የመኪና እንቅስቃሴ',
    statusDescriptionEn:
      'Transit stops along the Route 2 highway showing moderate queuing for seasonal produce transport and regional minibuses. Expected terminal turnaround under 10 minutes.',
    statusDescriptionAm:
      'በመንገድ 2 አውራ ጎዳና ላይ የፍራፍሬና የንግድ እቃዎች ጭነት በሚያካሂዱ ሚኒባሶች ምክንያት መጠነኛ ወረፋ ይታያል። አማካይ የጥበቃ ጊዜ ከ10 ደቂቃ በታች ነው።',
    gateAccessStatusEn: 'Highway Docking Bays Active',
    gateAccessStatusAm: 'የአውራ ጎዳናው መጫኛ በሮች ክፍት ናቸው',
    lastUpdated: 'Live feed updated 3m ago',
    congestionTrend: 'improving',
    corridorsAffected: ['Route 2 Shewa Corridor'],
  },
  mota: {
    stationId: 'mota',
    congestionLevel: 'low',
    congestionScore: 22,
    averageDelayMin: 2,
    approachSpeedKmH: 42,
    queueLengthVehicles: 3,
    bayOccupancyRate: 38,
    statusHeadlineEn: 'Free Flowing Ridge Terminal',
    statusHeadlineAm: 'ነጻና ሰላማዊ የተራራ መናኸሪያ',
    statusDescriptionEn:
      'Calm transit conditions with swift docking for Choke ridge rural feeder buses. Passenger boarding proceed smoothly with no delays.',
    statusDescriptionAm:
      'ሰላማዊና ፈጣን እንቅስቃሴ፤ በጮቄ ተራራ ዙሪያ የሚመላለሱ አነስተኛ አውቶቡሶች ያለምንም መዘግየት መንገደኞችን እያሳፈሩ ይገኛሉ።',
    gateAccessStatusEn: 'Ridge Gate Clear',
    gateAccessStatusAm: 'የተራራው በር ክፍት ነው',
    lastUpdated: 'Live feed updated 6m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Choke North Ridge Bypass'],
  },
  sekota: {
    stationId: 'sekota',
    congestionLevel: 'low',
    congestionScore: 18,
    averageDelayMin: 2,
    approachSpeedKmH: 40,
    queueLengthVehicles: 2,
    bayOccupancyRate: 35,
    statusHeadlineEn: 'Calm Northern Gateway Flow',
    statusHeadlineAm: 'የተረጋጋ የሰሜኑ ጫፍ የመናኸሪያ ሁኔታ',
    statusDescriptionEn:
      'Minimal waiting times. Regional 4x4s and light coaster buses departing on schedule with quick security sign-off.',
    statusDescriptionAm:
      'ፈጣን አገልግሎትና እጅግ አነስተኛ የጥበቃ ጊዜ። ኮስተር አውቶቡሶችና ባለአራት ጎማ መኪኖች ያለ መዘግየት እየወጡ ነው።',
    gateAccessStatusEn: 'Wag Hemra Gate Uncongested',
    gateAccessStatusAm: 'የዋግ ኽምራ መግቢያ በር ነጻ ነው',
    lastUpdated: 'Live feed updated 5m ago',
    congestionTrend: 'stable',
    corridorsAffected: ['Sekota Mountain Route'],
  },
  woreta: {
    stationId: 'woreta',
    congestionLevel: 'moderate',
    congestionScore: 60,
    averageDelayMin: 9,
    approachSpeedKmH: 22,
    queueLengthVehicles: 15,
    bayOccupancyRate: 72,
    statusHeadlineEn: 'Crossroads Junction Convergence',
    statusHeadlineAm: 'የመንገዶች መገናኛ መስቀለኛ ጥግግት',
    statusDescriptionEn:
      'Intermittent bottlenecks where the Debre Tabor highland route intersects the Bahir Dar-Gondar transit artery. Grain market transport adds brief 8-10 minute staging delays.',
    statusDescriptionAm:
      'ከደብረ ታቦር ወደ ባሕር ዳር-ጎንደር ዋና መስመር በሚቀላቀሉ ተሽከርካሪዎች እና የእህል ጭነት መኪኖች ምክንያት አልፎ አልፎ ከ8-10 ደቂቃ የሚቆይ መዘጋጋት ይከሰታል።',
    gateAccessStatusEn: 'Junction Gate 2 Regulated by Traffic Control',
    gateAccessStatusAm: 'በር 2 በትራፊክ ፖሊስ ቁጥጥር እየተመራ ነው',
    lastUpdated: 'Live feed updated 1m ago',
    congestionTrend: 'worsening',
    corridorsAffected: ['Route 22 Junction', 'Bahir Dar-Gondar Highway Link'],
  },
};

/**
 * Returns color configurations for a given congestion level
 */
export const getCongestionConfig = (level: CongestionLevel) => {
  switch (level) {
    case 'severe':
      return {
        labelEn: 'Severe Congestion',
        labelAm: 'እጅግ የበዛ መዘጋጋት',
        colorHex: '#e11d48', // rose-600
        glowHex: '#f43f5e',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dotColor: 'bg-rose-500',
        ringClass: 'stroke-rose-500',
        pulseClass: 'fill-rose-500',
        textClass: 'text-rose-600',
        bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
        trafficIcon: '🔴',
      };
    case 'heavy':
      return {
        labelEn: 'Heavy Congestion',
        labelAm: 'ከፍተኛ ጭንቅንቅ',
        colorHex: '#ea580c', // orange-600
        glowHex: '#fb923c',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        dotColor: 'bg-orange-500',
        ringClass: 'stroke-orange-500',
        pulseClass: 'fill-orange-500',
        textClass: 'text-orange-600',
        bgLight: 'bg-orange-50 border-orange-200 text-orange-900',
        trafficIcon: '🟠',
      };
    case 'moderate':
      return {
        labelEn: 'Moderate Delay',
        labelAm: 'መካከለኛ መዘግየት',
        colorHex: '#f59e0b', // amber-500
        glowHex: '#fbbf24',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dotColor: 'bg-amber-400',
        ringClass: 'stroke-amber-400',
        pulseClass: 'fill-amber-400',
        textClass: 'text-amber-600',
        bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
        trafficIcon: '🟡',
      };
    case 'low':
    default:
      return {
        labelEn: 'Smooth Flow',
        labelAm: 'ነጻ / ፈጣን ፍሰት',
        colorHex: '#10b981', // emerald-500
        glowHex: '#34d399',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dotColor: 'bg-emerald-400',
        ringClass: 'stroke-emerald-400',
        pulseClass: 'fill-emerald-400',
        textClass: 'text-emerald-600',
        bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        trafficIcon: '🟢',
      };
  }
};

/**
 * Helper to get traffic status with optional slight simulated fluctuation
 */
export const getTerminalTraffic = (stationId: string): TerminalTrafficStatus => {
  const base = BASE_TERMINAL_TRAFFIC[stationId];
  if (base) return base;

  // Fallback default
  return {
    stationId,
    congestionLevel: 'low',
    congestionScore: 25,
    averageDelayMin: 3,
    approachSpeedKmH: 45,
    queueLengthVehicles: 4,
    bayOccupancyRate: 50,
    statusHeadlineEn: 'Normal Terminal Operations',
    statusHeadlineAm: 'መደበኛ የመናኸሪያ አገልግሎት',
    statusDescriptionEn: 'Smooth vehicle circulation with standard clearance at platform bays.',
    statusDescriptionAm: 'የተረጋጋ የተሽከርካሪ ፍሰት እና መደበኛ የመሳፈሪያ አገልግሎት።',
    gateAccessStatusEn: 'All gates open and moving normally',
    gateAccessStatusAm: 'ሁሉም በሮች ክፍት ሆነው በመደበኛነት እየሰሩ ነው',
    lastUpdated: 'Live feed active',
    congestionTrend: 'stable',
    corridorsAffected: ['Local Terminal Access Road'],
  };
};

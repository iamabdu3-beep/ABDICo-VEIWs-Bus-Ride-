export interface CityBusStop {
  id: string;
  name: string;
  nameAm: string;
  city: string;
  cityAm: string;
  parentStationId: string;
  lat: number;
  lng: number;
  stopType: 'bus_terminal' | 'feeder_stop' | 'taxi_rank' | 'campus_bay';
  connectingRoutes: string[];
  linesCount: number;
}

export const CITY_BUS_STOPS: CityBusStop[] = [
  // Bahir Dar City Terminals
  {
    id: 'bd-kebele4',
    name: 'Kebele 4 City Bus Terminal',
    nameAm: 'ቀበሌ 4 የከተማ አውቶቡስ ፌርማታ',
    city: 'Bahir Dar',
    cityAm: 'ባሕር ዳር',
    parentStationId: 'bahir-dar',
    lat: 11.5850,
    lng: 37.3820,
    stopType: 'bus_terminal',
    connectingRoutes: ['Line 1 (Tana - Poly)', 'Line 4 (Airport)'],
    linesCount: 4,
  },
  {
    id: 'bd-felege',
    name: 'Felege Hiwot Hospital Stop',
    nameAm: 'ፈlege ሕይወት ሆስፒታል ፌርማታ',
    city: 'Bahir Dar',
    cityAm: 'ባሕር ዳር',
    parentStationId: 'bahir-dar',
    lat: 11.6010,
    lng: 37.3950,
    stopType: 'feeder_stop',
    connectingRoutes: ['Line 2 (Central Loop)', 'Line 6 (Diaspora Village)'],
    linesCount: 3,
  },
  {
    id: 'bd-poly',
    name: 'Bahir Dar Poly Campus Bay',
    nameAm: 'ፖሊ ዩኒቨርሲቲ ግቢ መናኸሪያ',
    city: 'Bahir Dar',
    cityAm: 'ባሕር ዳር',
    parentStationId: 'bahir-dar',
    lat: 11.5720,
    lng: 37.3680,
    stopType: 'campus_bay',
    connectingRoutes: ['Line 1 (Tana - Poly)', 'Line 8 (Shimbit)'],
    linesCount: 5,
  },

  // Gondar City Terminals
  {
    id: 'gon-piazza',
    name: 'Gondar Piazza / Arada City Stop',
    nameAm: 'ጎንደር ፒያሳ / አራዳ የከተማ ፌርማታ',
    city: 'Gondar',
    cityAm: 'ጎንደር',
    parentStationId: 'gondar',
    lat: 12.6080,
    lng: 37.4670,
    stopType: 'bus_terminal',
    connectingRoutes: ['Line 1 (Azezo - Arada)', 'Line 3 (Maraki)'],
    linesCount: 6,
  },
  {
    id: 'gon-maraki',
    name: 'Maraki University Campus Gate',
    nameAm: 'ማራኪ ዩኒቨርሲቲ በር ፌርማታ',
    city: 'Gondar',
    cityAm: 'ጎንደር',
    parentStationId: 'gondar',
    lat: 12.6180,
    lng: 37.4520,
    stopType: 'campus_bay',
    connectingRoutes: ['Line 3 (Maraki Express)', 'Line 5 (Chechela)'],
    linesCount: 4,
  },
  {
    id: 'gon-azezo',
    name: 'Azezo Airport Junction Terminal',
    nameAm: 'አዘዞ ኤርፖርት መገንጠያ ፌርማታ',
    city: 'Gondar',
    cityAm: 'ጎንደር',
    parentStationId: 'gondar',
    lat: 12.5350,
    lng: 37.4320,
    stopType: 'bus_terminal',
    connectingRoutes: ['Line 1 (Azezo - Arada)', 'Line 7 (Kola Diba)'],
    linesCount: 5,
  },

  // Dessie City Terminals
  {
    id: 'des-menafesha',
    name: 'Dessie Menafesha City Terminal',
    nameAm: 'ደሴ መናፈሻ የከተማ ፌርማታ',
    city: 'Dessie',
    cityAm: 'ደሴ',
    parentStationId: 'dessie',
    lat: 11.1350,
    lng: 39.6380,
    stopType: 'bus_terminal',
    connectingRoutes: ['Line 1 (Piazza - Boru)', 'Line 3 (Segno Gebeya)'],
    linesCount: 5,
  },
  {
    id: 'des-wollo-uni',
    name: 'Wollo University Campus Bay',
    nameAm: 'ወሎ ዩኒቨርሲቲ ግቢ ፌርማታ',
    city: 'Dessie',
    cityAm: 'ደሴ',
    parentStationId: 'dessie',
    lat: 11.1210,
    lng: 39.6450,
    stopType: 'campus_bay',
    connectingRoutes: ['Line 2 (Campus Shuttle)', 'Line 4 (Bete Amhara)'],
    linesCount: 4,
  },

  // Debre Markos City Terminals
  {
    id: 'dm-hidase',
    name: 'Hidase Square Minibus Rank',
    nameAm: 'ሕዳሴ አደባባይ ሚኒባስ ፌርማታ',
    city: 'Debre Markos',
    cityAm: 'ደብረ ማርቆስ',
    parentStationId: 'debre-markos',
    lat: 10.3380,
    lng: 37.7280,
    stopType: 'taxi_rank',
    connectingRoutes: ['Line 1 (Teklehaimanot - Campus)', 'Line 3 (Shegaw)'],
    linesCount: 4,
  },
  {
    id: 'dm-dmu',
    name: 'DMU University Gate Terminal',
    nameAm: 'ደብረ ማርቆስ ዩኒቨርሲቲ በር ፌርማታ',
    city: 'Debre Markos',
    cityAm: 'ደብረ ማርቆስ',
    parentStationId: 'debre-markos',
    lat: 10.3210,
    lng: 37.7420,
    stopType: 'campus_bay',
    connectingRoutes: ['Line 1 (Teklehaimanot - Campus)', 'Line 2 (Abima)'],
    linesCount: 3,
  },

  // Debre Birhan City Terminals
  {
    id: 'db-industry',
    name: 'Industrial Park Gate Terminal',
    nameAm: 'ኢንዱስትሪ ፓርክ በር ፌርማታ',
    city: 'Debre Birhan',
    cityAm: 'ደብረ ብርሃን',
    parentStationId: 'debre-birhan',
    lat: 9.6910,
    lng: 39.5250,
    stopType: 'bus_terminal',
    connectingRoutes: ['Line 1 (City Center - Industry)', 'Line 4 (Factory Express)'],
    linesCount: 6,
  },
  {
    id: 'db-stadium',
    name: 'Debre Birhan Stadium Bay',
    nameAm: 'ደብረ ብርሃን ስታዲየም ፌርማታ',
    city: 'Debre Birhan',
    cityAm: 'ደብረ ብርሃን',
    parentStationId: 'debre-birhan',
    lat: 9.6780,
    lng: 39.5390,
    stopType: 'feeder_stop',
    connectingRoutes: ['Line 2 (DBU - Stadium)', 'Line 5 (Basha)'],
    linesCount: 3,
  },
];

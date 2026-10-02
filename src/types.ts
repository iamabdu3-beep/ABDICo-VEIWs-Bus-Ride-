export type Language = 'en' | 'am';

export type StationHierarchyTier = 'federal' | 'regional' | 'zonal' | 'woreda';

export type InterconnectCorridorType =
  | 'Federal-to-Regional'
  | 'Regional-to-Zonal'
  | 'Zonal-to-Woreda'
  | 'Inter-Regional'
  | 'Inter-Zonal'
  | 'Woreda-Local';

export type ZoneName =
  | 'West Gojjam'
  | 'East Gojjam'
  | 'Central Gondar'
  | 'South Gondar'
  | 'North Gondar'
  | 'South Wollo'
  | 'North Wollo'
  | 'North Shewa'
  | 'Awi'
  | 'Wag Hemra'
  | 'Addis Ababa Gateway'
  | 'Federal Capital'
  | 'East Shewa'
  | 'West Shewa'
  | 'Jimma Zone'
  | 'West Arsi'
  | 'Arsi'
  | 'East Wollega'
  | 'North Western Tigray'
  | 'Eastern Tigray'
  | 'Sidama Central'
  | 'Gedeo'
  | 'Wolaita'
  | 'Hadiya'
  | 'Harari Zone'
  | 'Dire Dawa Administrative'
  | 'Awsi Rasu (Zone 1)'
  | 'Fafan Zone'
  | 'Assosa Zone'
  | 'Gamo Zone'
  | 'Gambela Zone'
  | 'Gurage Zone'
  | string;

export interface BusStation {
  id: string;
  name: string;
  nameAm: string;
  city: string;
  cityAm: string;
  zone: ZoneName;
  zoneAm: string;
  hierarchyTier?: StationHierarchyTier;
  regionName?: string;
  regionNameAm?: string;
  woredaName?: string;
  woredaNameAm?: string;
  parentHubId?: string; // e.g. Woreda -> Zonal Hub, Zonal -> Regional Capital, Regional -> Federal Hub
  parentHubName?: string;
  parentHubNameAm?: string;
  connectedStationIds?: string[];
  interconnectType?: InterconnectCorridorType;
  transferLinesCount?: number;
  x: number; // Percentage coordinate on regional map 0-100
  y: number; // Percentage coordinate on regional map 0-100
  lat: number; // Real GPS Latitude
  lng: number; // Real GPS Longitude
  elevationM: number;
  baysCount: number;
  phone: string;
  emergencyPhone: string;
  operatingHours: string;
  operatingHoursAm: string;
  amenities: string[];
  description: string;
  descriptionAm: string;
  busCompanies: string[];
  connectionsCount: number;
}

export interface RouteConnection {
  id: string;
  fromStationId: string;
  toStationId: string;
  distanceKm: number;
  durationHrs: number;
  highwayCode: string;
  terrain: string;
  terrainAm: string;
  scenicPoints: string[];
}

export type VehicleCategory =
  | 'Luxury Coach'
  | 'Standard Express'
  | 'Minibus Dolphin'
  | 'Coaster Bus'
  | 'Carpool Shared';

export interface RideTrip {
  id: string;
  busCompany: string;
  busCompanyAm: string;
  vehicleType: VehicleCategory;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  fromStationId: string;
  toStationId: string;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  priceETB: number;
  totalSeats: number;
  bookedSeats: number[];
  amenities: string[];
  status: 'scheduled' | 'boarding' | 'in_transit' | 'arrived';
  isRideshareCommunity?: boolean;
  notes?: string;
  routeStops: string[];
  // For live simulator
  currentProgress?: number; // 0 to 100
  currentSpeedKmH?: number;
  lastPassedStation?: string;
}

export type LuggageStatus =
  | 'checked_in'
  | 'security_cleared'
  | 'loaded'
  | 'in_transit'
  | 'arrived_at_terminal'
  | 'claimed';

export interface LuggageCheckpoint {
  id: string;
  name: string;
  nameAm: string;
  location: string;
  locationAm: string;
  timestamp: string;
  status: LuggageStatus;
  notes: string;
  notesAm: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface LuggageItem {
  tagId: string;
  pieceNumber: number;
  weightKg: number;
  type: string;
  typeAm: string;
  securitySeal: string;
  cargoBayCompartment: string;
  cargoBayCompartmentAm: string;
  status: LuggageStatus;
  currentLocation: string;
  currentLocationAm: string;
  lastUpdated: string;
  checkpoints: LuggageCheckpoint[];
}

export interface TripFeedback {
  id: string;
  ticketId: string;
  overallRating: number; // 1 to 5
  punctualityRating: number; // 1 to 5
  driverRating: number; // 1 to 5
  comfortRating: number; // 1 to 5
  cleanlinessRating: number; // 1 to 5
  luggageCareRating: number; // 1 to 5
  serviceTags: string[];
  comment: string;
  recommendToOthers: boolean;
  submittedAt: string;
  driverOrOperatorResponse?: {
    author: string;
    authorAm: string;
    text: string;
    textAm: string;
    timestamp: string;
  };
}

export interface BookingTicket {
  ticketId: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  nationalIdOrPassport?: string;
  fromStation: BusStation;
  toStation: BusStation;
  departureTime: string;
  departureDate: string;
  seatNumbers: number[];
  totalFareETB: number;
  vehicleType: VehicleCategory;
  busCompany: string;
  plateNumber: string;
  bayNumber: number;
  paymentMethod: 'Telebirr' | 'CBE Birr' | 'Awash Birr' | 'Cash at Station';
  paymentRef: string;
  bookingTimestamp: string;
  luggagePieces: number;
  luggageItems?: LuggageItem[];
  driverName?: string;
  driverPhone?: string;
  qrPayload: string;
  status: 'confirmed' | 'boarded' | 'completed' | 'cancelled';
  feedback?: TripFeedback;
  ussdCode?: string;
  callCenterNumber?: string;
  callCenterHours?: string;
  callCenterDispatch?: string;
  multiLegGroupId?: string;
  legIndex?: number;
  totalLegs?: number;
  transferStationName?: string;
  transferStationNameAm?: string;
  layoverDurationMinutes?: number;
  connectingTicketId?: string;
  masterTransactionRef?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'traveller' | 'driver' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
  channel?: 'chat' | 'sms';
}

export interface DriverContactContext {
  driverName: string;
  driverPhone: string;
  driverRating?: number;
  vehiclePlate: string;
  vehicleType?: string;
  companyOrModel: string;
  routeTitle: string;
  departureTime?: string;
  bayNumber?: number;
  ticketId?: string;
  passengerName?: string;
}

export interface RideShareOffer {
  id: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  plateNumber: string;
  fromStationId: string;
  toStationId: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeatETB: number;
  luggageSpace: 'Small' | 'Medium' | 'Large';
  notes: string;
  acAvailable: boolean;
  postedAt: string;
}

export type CongestionLevel = 'low' | 'moderate' | 'heavy' | 'severe';

export interface TerminalTrafficStatus {
  stationId: string;
  congestionLevel: CongestionLevel;
  congestionScore: number; // 0-100
  averageDelayMin: number; // delay in minutes
  approachSpeedKmH: number; // approach speed
  queueLengthVehicles: number; // waiting vehicles
  bayOccupancyRate: number; // percentage
  statusHeadlineEn: string;
  statusHeadlineAm: string;
  statusDescriptionEn: string;
  statusDescriptionAm: string;
  gateAccessStatusEn: string;
  gateAccessStatusAm: string;
  lastUpdated: string;
  congestionTrend: 'improving' | 'stable' | 'worsening';
  corridorsAffected: string[];
}

export type UserRole = 'passenger' | 'driver' | 'bus_owner' | 'admin';

export interface FleetVehicle {
  plateNumber: string;
  model: string;
  category: VehicleCategory;
  year: number;
  totalSeats: number;
  activeDriverName: string;
  activeDriverPhone: string;
  currentRoute: string;
  status: 'on_route' | 'boarding' | 'maintenance' | 'idle';
  occupancyPercent: number;
  fuelLevelPercent: number;
  odometerKm: number;
  nextInspectionDate: string;
  insurancePolicy: string;
  revenueTodayETB: number;
}

export interface OperatorFinancialSummary {
  todayGrossETB: number;
  weeklyGrossETB: number;
  monthlyGrossETB: number;
  fuelExpenseETB: number;
  driverAllowancesETB: number;
  terminalTariffETB: number;
  netProfitETB: number;
  ticketsSoldToday: number;
  avgTicketPriceETB: number;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  fullNameAm: string;
  phoneNumber: string;
  email?: string;
  avatarBadge?: string;
  nationalId?: string; // Fayda / Kebele
  // Driver specific properties
  driverLicenseNumber?: string;
  companyName?: string;
  assignedPlateNumber?: string;
  assignedTripId?: string;
  rating?: number;
  terminalBase?: string;
  terminalBaseAm?: string;
  totalTripsCompleted?: number;
  safetyScorePercent?: number;
  // Bus Owner specific properties
  busOwnerCompanyName?: string;
  busOwnerCompanyNameAm?: string;
  fleetSize?: number;
  operatorLicenseNumber?: string;
  registeredVehicles?: string[];
  businessRegistrationNo?: string;
  totalRevenueETB?: number;
  bankAccountPayoutRef?: string;
  // Administration specific properties
  adminStaffId?: string;
  adminDepartment?: string;
  adminDepartmentAm?: string;
  adminStationId?: string;
  assignedOffice?: string;
  assignedOfficeAm?: string;
  accessTier?: 'Station Master' | 'Regional Director' | 'Traffic Supervisor';
  clearanceLevel?: string;
}

export interface PassengerManifestItem {
  ticketId: string;
  passengerName: string;
  passengerPhone: string;
  nationalIdOrPassport: string;
  seatNumbers: number[];
  luggageCount: number;
  paymentStatus: 'paid' | 'pending';
  boarded: boolean;
  boardedAt?: string;
  emergencyContact?: string;
}

export interface VehicleReadinessChecklist {
  tiresInspection: boolean;
  brakesAndFluid: boolean;
  engineAndCoolant: boolean;
  emergencyKitAndExtinguisher: boolean;
  gpsTransponderOnline: boolean;
  terminalSecurityPermitSigned: boolean;
}

export interface AdminAlertNotice {
  id: string;
  severity: 'info' | 'advisory' | 'warning' | 'emergency';
  titleEn: string;
  titleAm: string;
  messageEn: string;
  messageAm: string;
  issuedByStaffId: string;
  issuedAt: string;
  targetStations: string[]; // station IDs or 'all'
  isActive: boolean;
}

export type WeatherAlertSeverity = 'Extreme' | 'Severe' | 'Moderate';

export interface WeatherAlert {
  id: string;
  stationId: string;
  stationName: string;
  stationNameAm: string;
  regionZone: string;
  regionZoneAm: string;
  severity: WeatherAlertSeverity;
  eventType: 'DENSE_MOUNTAIN_FOG' | 'TORRENTIAL_RAIN' | 'FLASH_FLOOD_WATCH' | 'HIGH_ALTITUDE_FROST' | 'SEVERE_THUNDERSTORM' | 'LANDSLIDE_RISK';
  eventTitle: string;
  eventTitleAm: string;
  description: string;
  descriptionAm: string;
  safetyRecommendations: string[];
  safetyRecommendationsAm: string[];
  expectedDelayMin: number;
  corridorHighway: string;
  dataSource: {
    name: string;
    authorityUri: string;
  };
  startTime: string;
  expirationTime: string;
  isActive: boolean;
  affectedRole: 'origin' | 'destination' | 'both';
}

export type TerminalDisruptionType =
  | 'UNEXPECTED_DELAY'
  | 'TERMINAL_CANCELLATION'
  | 'WEATHER_HOLD'
  | 'ROAD_CLOSURE'
  | 'SECURITY_RESTRICTION';

export type TerminalOperationalStatus = 'normal' | 'delayed' | 'cancelled' | 'restricted';

export interface TerminalDisruptionAlert {
  id: string;
  terminalId: string;
  terminalName: string;
  terminalNameAm: string;
  city: string;
  cityAm: string;
  type: TerminalDisruptionType;
  severity: 'critical' | 'major' | 'moderate';
  status: TerminalOperationalStatus;
  headlineEn: string;
  headlineAm: string;
  detailEn: string;
  detailAm: string;
  expectedDelayMinutes?: number;
  estimatedResolutionTime?: string;
  affectedCorridors: string[];
  recommendedActionEn: string;
  recommendedActionAm: string;
  isTerminalWide: boolean;
  reportedAt: string;
  updatedAt: string;
  isActive: boolean;
  issuedByAuthority: string;
}

export interface PreferredTerminalSettings {
  preferredTerminalId: string;
  notifyOnDelays: boolean;
  notifyOnCancellations: boolean;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

export type TripPlanSortOption = 'fastest' | 'cheapest' | 'fewest_transfers' | 'scenic';

export interface PlannedTripLeg {
  id: string;
  fromStation: BusStation;
  toStation: BusStation;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  durationMinutes: number;
  distanceKm: number;
  priceETB: number;
  vehicleType: VehicleCategory;
  operatorName: string;
  operatorNameAm: string;
  highwayCode: string;
  terrain: string;
  terrainAm: string;
  scenicPoints: string[];
  matchedTripId?: string;
  matchedOfferId?: string;
  bayNumber?: number;
  layoverAfterMinutes?: number;
  layoverStation?: BusStation;
}

export interface PlannedTripItinerary {
  id: string;
  title: string;
  titleAm: string;
  originStation: BusStation;
  destStation: BusStation;
  viaStation?: BusStation;
  legs: PlannedTripLeg[];
  totalDurationMinutes: number;
  totalDurationFormatted: string;
  totalDistanceKm: number;
  totalFareETB: number;
  transferCount: number;
  departureTime: string;
  arrivalTime: string;
  categoryTag: 'fastest' | 'cheapest' | 'scenic' | 'comfort' | 'early_bird';
  scenicHighlights: string[];
  elevationMinM: number;
  elevationMaxM: number;
  co2EstimateKg: number;
  routeRoadTypes: string[];
  weatherWarningCount?: number;
}

export interface SavedTripPlan {
  id: string;
  savedAt: string;
  travelDate: string;
  passengerCount: number;
  itinerary: PlannedTripItinerary;
  customNotes?: string;
}

export type AppCategory = 'users' | 'driver' | 'administration' | 'business_owners';

export type UserModule = 'booking' | 'planner' | 'interconnect' | 'map' | 'tracker' | 'directory' | 'carpool' | 'tickets';
export type DriverModule = 'cockpit' | 'manifest' | 'safety_check' | 'incident' | 'comm' | 'badges';
export type AdminModule = 'traffic_radar' | 'alerts_broadcast' | 'bays_control' | 'corridors_audit' | 'weather_monitor';
export type OwnerModule = 'fleet' | 'financials' | 'dispatch_trip' | 'roster' | 'company_profile';

export type AppModule = UserModule | DriverModule | AdminModule | OwnerModule;



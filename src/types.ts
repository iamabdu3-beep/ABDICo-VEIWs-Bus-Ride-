export type Language = 'en' | 'am';

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
  | 'Addis Ababa Gateway';

export interface BusStation {
  id: string;
  name: string;
  nameAm: string;
  city: string;
  cityAm: string;
  zone: ZoneName;
  zoneAm: string;
  x: number; // Percentage coordinate on regional map 0-100
  y: number; // Percentage coordinate on regional map 0-100
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

export type UserRole = 'passenger' | 'driver' | 'admin';

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


import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table linked with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('passenger').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Intercity Bookings and Tickets
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketId: text('ticket_id').notNull().unique(),
  userUid: text('user_uid'),
  passengerName: text('passenger_name').notNull(),
  passengerPhone: text('passenger_phone').notNull(),
  fromStationId: text('from_station_id').notNull(),
  fromCity: text('from_city').notNull(),
  toStationId: text('to_station_id').notNull(),
  toCity: text('to_city').notNull(),
  departureTime: text('departure_time').notNull(),
  departureDate: text('departure_date').notNull(),
  seatNumbers: text('seat_numbers').notNull(),
  totalFareEtb: integer('total_fare_etb').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  busCompany: text('bus_company').notNull(),
  plateNumber: text('plate_number').notNull(),
  status: text('status').default('confirmed').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentRef: text('payment_ref').notNull(),
  qrPayload: text('qr_payload').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fleet Vehicles
export const fleetBuses = pgTable('fleet_buses', {
  id: serial('id').primaryKey(),
  busId: text('bus_id').notNull().unique(),
  companyName: text('company_name').notNull(),
  plateNumber: text('plate_number').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  driverName: text('driver_name'),
  driverPhone: text('driver_phone'),
  totalSeats: integer('total_seats').notNull(),
  currentSpeedKmH: integer('current_speed_kmh').default(0),
  lastCheckpoint: text('last_checkpoint'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Google Sheets Sync & Export History Log
export const sheetsExports = pgTable('sheets_exports', {
  id: serial('id').primaryKey(),
  spreadsheetId: text('spreadsheet_id').notNull(),
  spreadsheetUrl: text('spreadsheet_url').notNull(),
  title: text('title').notNull(),
  exportedByUid: text('exported_by_uid'),
  recordsCount: integer('records_count').notNull(),
  exportType: text('export_type').notNull(), // 'tickets' | 'fleet' | 'stations'
  exportedAt: timestamp('exported_at').defaultNow(),
});

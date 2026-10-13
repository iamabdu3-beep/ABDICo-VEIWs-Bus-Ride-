import { db } from './index.ts';
import { users, tickets, fleetBuses, sheetsExports } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export interface TicketInsertData {
  ticketId: string;
  userUid?: string;
  passengerName: string;
  passengerPhone: string;
  fromStationId: string;
  fromCity: string;
  toStationId: string;
  toCity: string;
  departureTime: string;
  departureDate: string;
  seatNumbers: string;
  totalFareEtb: number;
  vehicleType: string;
  busCompany: string;
  plateNumber: string;
  status: string;
  paymentMethod: string;
  paymentRef: string;
  qrPayload: string;
}

export async function upsertUser(uid: string, email: string, displayName?: string, role: string = 'passenger') {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || undefined,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Database user upsert failed', { cause: error });
  }
}

export async function saveTicketRecord(data: TicketInsertData) {
  try {
    const result = await db.insert(tickets)
      .values(data)
      .onConflictDoUpdate({
        target: tickets.ticketId,
        set: {
          status: data.status,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to save ticket to Cloud SQL:', error);
    throw new Error('Database ticket insertion failed', { cause: error });
  }
}

export async function getAllTicketsFromDb() {
  try {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  } catch (error) {
    console.error('Failed to query tickets from Cloud SQL:', error);
    throw new Error('Database query for tickets failed', { cause: error });
  }
}

export async function logSheetsExport(data: {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  exportedByUid?: string;
  recordsCount: number;
  exportType: string;
}) {
  try {
    const result = await db.insert(sheetsExports)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to log Sheets export to Cloud SQL:', error);
    throw new Error('Database export logging failed', { cause: error });
  }
}

export async function getSheetsExportHistory() {
  try {
    return await db.select().from(sheetsExports).orderBy(desc(sheetsExports.exportedAt));
  } catch (error) {
    console.error('Failed to query export history from Cloud SQL:', error);
    throw new Error('Database query for export history failed', { cause: error });
  }
}

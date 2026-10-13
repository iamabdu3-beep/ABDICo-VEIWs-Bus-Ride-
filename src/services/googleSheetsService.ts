import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BookingTicket, LiveMovingBus, BusStation } from '../types';

export interface SheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  recordsCount: number;
}

/**
 * Creates a formatted Google Spreadsheet via the Google Sheets API v4
 */
export async function createGoogleSheet(
  title: string,
  sheets: Array<{
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }>,
  accessToken: string
): Promise<SheetExportResult> {
  const sheetsPayload = sheets.map((s) => ({
    properties: {
      title: s.title,
      gridProperties: {
        rowCount: Math.max(50, s.rows.length + 10),
        columnCount: Math.max(15, s.headers.length + 2),
      },
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData: [
          // Header row with basic styling
          {
            values: s.headers.map((h) => ({
              userEnteredValue: { stringValue: h },
              userEnteredFormat: {
                backgroundColor: { red: 0.02, green: 0.47, blue: 0.34 }, // Emerald #047857
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER',
              },
            })),
          },
          // Data rows
          ...s.rows.map((row) => ({
            values: row.map((cell) => {
              if (typeof cell === 'number') {
                return {
                  userEnteredValue: { numberValue: cell },
                };
              }
              return {
                userEnteredValue: { stringValue: String(cell) },
              };
            }),
          })),
        ],
      },
    ],
  }));

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: sheetsPayload,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Failed to create Google Sheet: HTTP ${response.status} ${response.statusText}`
    );
  }

  const created = await response.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    recordsCount: sheets.reduce((acc, curr) => acc + curr.rows.length, 0),
  };
}

/**
 * Exports passenger tickets manifest to Google Sheets
 */
export async function exportTicketsToGoogleSheets(
  tickets: BookingTicket[],
  accessToken: string,
  userUid?: string
): Promise<SheetExportResult> {
  const timestamp = new Date().toISOString().split('T')[0];
  const title = `Amhara Bus Transit - Passenger Manifest (${timestamp})`;

  const headers = [
    'Ticket ID',
    'Passenger Name',
    'Phone Number',
    'Origin Station',
    'Origin City',
    'Destination Station',
    'Destination City',
    'Departure Date',
    'Departure Time',
    'Seat Numbers',
    'Fare (ETB)',
    'Bus Company',
    'Plate Number',
    'Vehicle Type',
    'Payment Method',
    'Payment Ref',
    'Booking Status',
  ];

  const rows = tickets.map((t) => [
    t.ticketId,
    t.passengerName,
    t.passengerPhone,
    t.fromStation.name,
    t.fromStation.city,
    t.toStation.name,
    t.toStation.city,
    t.departureDate,
    t.departureTime,
    t.seatNumbers.join(', '),
    t.totalFareETB,
    t.busCompany,
    t.plateNumber,
    t.vehicleType,
    t.paymentMethod,
    t.paymentRef,
    t.status,
  ]);

  const result = await createGoogleSheet(
    title,
    [
      {
        title: 'Passenger Manifest',
        headers,
        rows,
      },
    ],
    accessToken
  );

  // Record in Firestore sync logs
  try {
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'sheets_sync_logs', logId), {
      logId,
      userUid: userUid || 'anonymous',
      spreadsheetId: result.spreadsheetId,
      spreadsheetUrl: result.spreadsheetUrl,
      title: result.title,
      recordsCount: result.recordsCount,
      exportType: 'manifest',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not record sync log in Firestore:', err);
  }

  return result;
}

/**
 * Exports live fleet bus telemetry to Google Sheets
 */
export async function exportFleetTelemetryToGoogleSheets(
  buses: LiveMovingBus[],
  accessToken: string,
  userUid?: string
): Promise<SheetExportResult> {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `Amhara Transit Fleet Telemetry - ${dateStr} ${timestamp}`;

  const headers = [
    'Bus ID',
    'Company (English)',
    'Company (Amharic)',
    'Plate Number',
    'Vehicle Category',
    'Highway Code',
    'Current Speed (km/h)',
    'Altitude (m)',
    'Heading (°)',
    'Occupied Seats',
    'Total Seats',
    'Load Factor (%)',
    'Last Checkpoint',
    'Approaching Checkpoint',
    'ETA (Minutes)',
    'Status Label',
    'Captain Name',
    'Captain Phone',
  ];

  const rows = buses.map((b) => [
    b.id,
    b.busCompany,
    b.busCompanyAm,
    b.plateNumber,
    b.vehicleType,
    b.highwayCode,
    b.currentSpeedKmH,
    b.currentAltitudeM,
    b.headingDegrees,
    b.occupiedSeats,
    b.totalSeats,
    Math.round((b.occupiedSeats / b.totalSeats) * 100),
    b.lastCheckpoint,
    b.nextCheckpoint,
    b.estimatedArrivalMin,
    b.statusLabelEn,
    b.driverName,
    b.driverPhone,
  ]);

  const result = await createGoogleSheet(
    title,
    [
      {
        title: 'Fleet Telemetry Radar',
        headers,
        rows,
      },
    ],
    accessToken
  );

  try {
    const logId = `log-${Date.now()}`;
    await setDoc(doc(db, 'sheets_sync_logs', logId), {
      logId,
      userUid: userUid || 'anonymous',
      spreadsheetId: result.spreadsheetId,
      spreadsheetUrl: result.spreadsheetUrl,
      title: result.title,
      recordsCount: result.recordsCount,
      exportType: 'telemetry',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not record sync log in Firestore:', err);
  }

  return result;
}

/**
 * Exports Ethiopian bus station network directory to Google Sheets
 */
export async function exportStationsDirectoryToGoogleSheets(
  stations: BusStation[],
  accessToken: string,
  userUid?: string
): Promise<SheetExportResult> {
  const dateStr = new Date().toISOString().split('T')[0];
  const title = `Ethiopia Bus Terminals & Stations Directory (${dateStr})`;

  const headers = [
    'Station ID',
    'Name (English)',
    'Name (Amharic)',
    'City',
    'City (Amharic)',
    'Region',
    'Zone / Woreda',
    'Hierarchy Tier',
    'Latitude',
    'Longitude',
    'Elevation (m)',
    'Capacity (Bays)',
    'Operating Hours',
    'Contact Phone',
    'Status',
  ];

  const rows = stations.map((s) => [
    s.id,
    s.name,
    s.nameAm,
    s.city,
    s.cityAm,
    s.regionName || (s as any).region || 'Amhara',
    s.zone || 'Central',
    s.hierarchyTier || 'regional',
    s.lat,
    s.lng,
    s.elevationM || 1800,
    (s as any).capacity ?? s.baysCount ?? 20,
    s.operatingHours || '05:00 - 21:00',
    (s as any).contactPhone ?? s.phone ?? '+251 58 220 0000',
    (s as any).status ?? 'Active',
  ]);

  const result = await createGoogleSheet(
    title,
    [
      {
        title: 'Transit Stations',
        headers,
        rows,
      },
    ],
    accessToken
  );

  return result;
}

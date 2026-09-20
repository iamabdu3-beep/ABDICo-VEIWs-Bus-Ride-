import { BookingTicket, LuggageItem, LuggageCheckpoint, LuggageStatus } from '../types';

/**
 * Generates realistic luggage items and checkpoint timelines for an Amhara bus trip.
 */
export function getOrGenerateLuggageItems(ticket: BookingTicket): LuggageItem[] {
  if (ticket.luggageItems && ticket.luggageItems.length > 0) {
    return ticket.luggageItems;
  }

  const pieceCount = Math.max(1, ticket.luggagePieces || 1);
  const items: LuggageItem[] = [];

  const types = [
    { en: 'Hard-Shell Suitcase', am: 'ጠንካራ ሳጥን ሻንጣ' },
    { en: 'Travel Duffel Bag', am: 'የጉዞ ቦርሳ' },
    { en: 'Cardboard Cargo Box', am: 'የካርቶን ጭነት' },
    { en: 'Reinforced Backpack', am: 'ትልቅ የጀርባ ቦርሳ' },
  ];

  const compartments = [
    { en: 'Lower Cargo Bay - Section A', am: 'የታችኛው የጭነት ክፍል - ክፍል ሀ' },
    { en: 'Lower Cargo Bay - Section B', am: 'የታችኛው የጭነት ክፍል - ክፍል ለ' },
    { en: 'Rear Luggage Compartment', am: 'የኋላ የሻንጣ ክፍል' },
  ];

  // Route intermediate highway checkpoint
  const originCity = ticket.fromStation.city;
  const originCityAm = ticket.fromStation.cityAm;
  const destCity = ticket.toStation.city;
  const destCityAm = ticket.toStation.cityAm;

  let intermediateStop = 'Wereta Highway Checkpoint';
  let intermediateStopAm = 'የወረታ አውራ ጎዳና ፍተሻ ኬላ';

  if (originCity.includes('Bahir Dar') && destCity.includes('Debre Markos')) {
    intermediateStop = 'Finote Selam Highway Weighbridge';
    intermediateStopAm = 'የፍኖተ ሰላም የክብደት መቆጣጠሪያ ኬላ';
  } else if (originCity.includes('Gondar') && destCity.includes('Dessie')) {
    intermediateStop = 'Debre Tabor Mountain Pass';
    intermediateStopAm = 'የደብረ ታቦር የተራራ ማለፊያ ኬላ';
  } else if (destCity.includes('Addis Ababa') || originCity.includes('Addis Ababa')) {
    intermediateStop = 'Blue Nile Gorge Tollgate Checkpoint';
    intermediateStopAm = 'የዓባይ በረሃ መቆጣጠሪያ ኬላ';
  } else if (destCity.includes('Lalibela') || originCity.includes('Lalibela')) {
    intermediateStop = 'Gashena Junction Inspection Station';
    intermediateStopAm = 'የጋሸና መገናኛ ፍተሻ ጣቢያ';
  }

  const statusOrder: Record<LuggageStatus, number> = {
    checked_in: 1,
    security_cleared: 2,
    loaded: 3,
    in_transit: 4,
    arrived_at_terminal: 5,
    claimed: 6,
  };

  const isStatusMatch = (current: LuggageStatus, target: LuggageStatus): boolean => {
    return current === target;
  };

  for (let i = 0; i < pieceCount; i++) {
    const pieceNum = i + 1;
    const tagSuffix = pieceNum < 10 ? `0${pieceNum}` : `${pieceNum}`;
    const cleanTicketId = ticket.ticketId.replace(/[^A-Z0-9]/gi, '').slice(-6);
    const tagId = `BAG-${cleanTicketId}-${tagSuffix}`;
    const securitySeal = `SEAL-${cleanTicketId.slice(0, 4)}-${String.fromCharCode(65 + i)}`;

    const typeObj = types[i % types.length];
    const compObj = compartments[i % compartments.length];
    const weightKg = Number((14.5 + (i * 4.2) + ((ticket.totalFareETB % 5) * 0.4)).toFixed(1));

    // Determine current progression based on ticket status
    let currentStatus: LuggageStatus = 'in_transit';
    if (ticket.status === 'boarded') {
      currentStatus = 'in_transit';
    } else if (ticket.status === 'cancelled') {
      currentStatus = 'checked_in';
    } else {
      // Confirmed ticket: Piece 1 is usually in_transit or loaded
      currentStatus = i === 0 ? 'in_transit' : 'loaded';
    }

    const currentRank = statusOrder[currentStatus];

    const checkpoints: LuggageCheckpoint[] = [
      {
        id: `cp-1-${tagId}`,
        name: 'Luggage Intake & Weigh-in Desk',
        nameAm: 'የሻንጣ ተቀባይ እና ሚዛን ዴስክ',
        location: `${originCity} Bus Terminal - Counter #${(ticket.bayNumber % 4) + 1}`,
        locationAm: `${originCityAm} አውቶቡስ መናኸሪያ - ዴስክ #${(ticket.bayNumber % 4) + 1}`,
        timestamp: '05:40 AM',
        status: 'checked_in',
        notes: `Weighed: ${weightKg} kg. Tag barcode affixed. Fee validated.`,
        notesAm: `ክብደት፡ ${weightKg} ኪ.ግ ተመዝኗል። የባርኮድ ታግ ተለጥፏል።`,
        isCompleted: currentRank >= statusOrder['checked_in'],
        isCurrent: isStatusMatch(currentStatus, 'checked_in'),
      },
      {
        id: `cp-2-${tagId}`,
        name: 'Terminal Security & Police Screening',
        nameAm: 'የመናኸሪያው የጸጥታ እና ፖሊስ ፍተሻ',
        location: `${originCity} Terminal Security Gate B`,
        locationAm: `${originCityAm} የመናኸሪያው የፍተሻ በር ለ`,
        timestamp: '05:55 AM',
        status: 'security_cleared',
        notes: `Security X-ray scan cleared. Official tamper-proof seal ${securitySeal} applied.`,
        notesAm: `የኤክስሬይ ፍተሻ አልፏል። ይፋዊ የደህንነት ማህተም ${securitySeal} ተያይዟል።`,
        isCompleted: currentRank >= statusOrder['security_cleared'],
        isCurrent: isStatusMatch(currentStatus, 'security_cleared'),
      },
      {
        id: `cp-3-${tagId}`,
        name: 'Bus Cargo Hold Stowing',
        nameAm: 'በአውቶቡስ የጭነት ክፍል ውስጥ መጫን',
        location: `${originCity} Terminal Platform Bay #${ticket.bayNumber}`,
        locationAm: `${originCityAm} የመናኸሪያው መነሻ ፕላትፎርም ቁጥር #${ticket.bayNumber}`,
        timestamp: '06:15 AM',
        status: 'loaded',
        notes: `Loaded into ${compObj.en} of bus ${ticket.plateNumber}. Captain verified.`,
        notesAm: `በአውቶቡስ ${ticket.plateNumber} ${compObj.am} ውስጥ ተጭኗል። በሹፌሩ ተረጋግጧል።`,
        isCompleted: currentRank >= statusOrder['loaded'],
        isCurrent: isStatusMatch(currentStatus, 'loaded'),
      },
      {
        id: `cp-4-${tagId}`,
        name: 'Highway Transit Telemetry Scan',
        nameAm: 'የአውራ ጎዳና ጉዞ መቆጣጠሪያ ፍተሻ',
        location: intermediateStop,
        locationAm: intermediateStopAm,
        timestamp: '07:25 AM',
        status: 'in_transit',
        notes: `RFID highway waypoint beacon confirmed cargo presence inside bus. Speed 64 km/h.`,
        notesAm: `የአርኤፍአይዲ መቆጣጠሪያ ሻንጣው በአውቶቡሱ ውስጥ በሰላም እየተጓዘ መሆኑን አረጋግጧል።`,
        isCompleted: currentRank >= statusOrder['in_transit'],
        isCurrent: isStatusMatch(currentStatus, 'in_transit'),
      },
      {
        id: `cp-5-${tagId}`,
        name: 'Destination Station Platform Arrival',
        nameAm: 'የመዳረሻ ከተማ መናኸሪያ ፕላትፎርም መድረስ',
        location: `${destCity} Central Bus Station`,
        locationAm: `${destCityAm} ዋና አውቶቡስ መናኸሪያ`,
        timestamp: '09:40 AM (Est.)',
        status: 'arrived_at_terminal',
        notes: `Scheduled arrival at ${destCity} platform. Cargo bay unlocked by driver.`,
        notesAm: `ወደ ${destCityAm} መናኸሪያ የሚደረግ መድረሻ። በሹፌሩ ተከፍቶ ለተሳፋሪዎች ይሰጣል።`,
        isCompleted: currentRank >= statusOrder['arrived_at_terminal'],
        isCurrent: isStatusMatch(currentStatus, 'arrived_at_terminal'),
      },
      {
        id: `cp-6-${tagId}`,
        name: 'Passenger Claim & Barcode Verification',
        nameAm: 'ሻንጣ ርክክብ እና የባርኮድ ማረጋገጫ',
        location: `${destCity} Terminal Baggage Collection Counter`,
        locationAm: `${destCityAm} የሻንጣ መረከቢያ ቆጣሪ`,
        timestamp: '10:00 AM (Est.)',
        status: 'claimed',
        notes: `Present digital claim tag to station luggage attendant to claim piece.`,
        notesAm: `ይህንን ዲጂታል ታግ ለመናኸሪያው ሰራተኛ በማሳየት ሻንጣዎን ይረከቡ።`,
        isCompleted: currentRank >= statusOrder['claimed'],
        isCurrent: isStatusMatch(currentStatus, 'claimed'),
      },
    ];

    items.push({
      tagId,
      pieceNumber: pieceNum,
      weightKg,
      type: typeObj.en,
      typeAm: typeObj.am,
      securitySeal,
      cargoBayCompartment: compObj.en,
      cargoBayCompartmentAm: compObj.am,
      status: currentStatus,
      currentLocation: currentStatus === 'in_transit' ? intermediateStop : `${originCity} Bus Terminal`,
      currentLocationAm: currentStatus === 'in_transit' ? intermediateStopAm : `${originCityAm} አውቶቡስ መናኸሪያ`,
      lastUpdated: '15 mins ago',
      checkpoints,
    });
  }

  return items;
}

export function getStatusBadgeConfig(status: LuggageStatus, lang: 'en' | 'am') {
  const isAm = lang === 'am';
  switch (status) {
    case 'checked_in':
      return {
        label: isAm ? 'ተመዝግቧል' : 'Checked In',
        bgColor: 'bg-slate-100 text-slate-800 border-slate-300',
        dotColor: 'bg-slate-500',
      };
    case 'security_cleared':
      return {
        label: isAm ? 'ፍተሻ አልፏል' : 'Security Cleared',
        bgColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        dotColor: 'bg-indigo-600',
      };
    case 'loaded':
      return {
        label: isAm ? 'በአውቶቡስ ተጭኗል' : 'Loaded in Cargo Bay',
        bgColor: 'bg-blue-100 text-blue-800 border-blue-300',
        dotColor: 'bg-blue-600',
      };
    case 'in_transit':
      return {
        label: isAm ? 'በጉዞ ላይ' : 'In Transit on Highway',
        bgColor: 'bg-amber-100 text-amber-900 border-amber-300',
        dotColor: 'bg-amber-600 animate-pulse',
      };
    case 'arrived_at_terminal':
      return {
        label: isAm ? 'መናኸሪያ ደርሷል' : 'Arrived at Terminal',
        bgColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        dotColor: 'bg-emerald-600',
      };
    case 'claimed':
      return {
        label: isAm ? 'ተረክበዋል' : 'Claimed & Verified',
        bgColor: 'bg-green-100 text-green-900 border-green-300',
        dotColor: 'bg-green-600',
      };
  }
}

import { db } from "@/db";
import { EnrichedPayment, PaymentsResponse } from "./types";

export const ALLOWED_EVENT_IDS = [
  "cmk00z5yy001f11hx2zy2f0b4",
  "cmk00vh53001d11hxj4w6yfct",
  "cmk00klfv001911hxi0vvpgsi",
  "cmk00hkxn001311hxh3qkl5bo",
  "cmk00eke8001011hxav2iryjn",
  "cmk00aeqo000s11hxh8gka0pn",
  "cmk006rg0000q11hxyagxkhi8",
];

export async function searchPayments(
  searchQuery: string,
  eventFilter: string,
  page: number,
  pageSize: number,
): Promise<PaymentsResponse> {
  const lowerQuery = searchQuery.toLowerCase().trim();

  // Get ALL payments (offline data)
  const allPayments = await db.payments.toArray();

  // Filter by eventId
  const filteredByEvent = allPayments.filter((p) => {
    if (eventFilter === "all") return true;
    const pEventId = p.event_id || p.eventId;
    return pEventId === eventFilter;
  });

  // Enrich only the filtered data for searching
  const enrichedPayments = await Promise.all(
    filteredByEvent.map(async (payment) => {
      const userId = payment.user_id || payment.userId;
      const evId = payment.event_id || payment.eventId;

      const [user, event] = await Promise.all([
        userId ? db.users.get(userId) : Promise.resolve(undefined),
        evId ? db.events.get(evId) : Promise.resolve(undefined),
      ]);

      return { ...payment, user, event } as EnrichedPayment;
    }),
  );

  // Final filter with searches
  const finalResults = enrichedPayments.filter((p: any) => {
    if (!lowerQuery) return true;

    const userName = p.user?.name || p.user?.userName || "";
    const userEmail = p.user?.email || "";
    const userCode = p.user?.unique_code || "";
    const eventName =
      p.event?.name || p.event?.event_name || p.event?.title || "";
    const paymentId = p.payment_id || p.paymentId || "";

    const searchStr =
      `${userName} ${userEmail} ${userCode} ${eventName} ${paymentId}`.toLowerCase();
    return searchStr.includes(lowerQuery);
  });

  // Pagination
  const totalCount = finalResults.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = finalResults.slice(
    startIndex,
    startIndex + pageSize,
  );

  return {
    payments: paginatedResults,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function fetchEventsFilter() {
  // Collect events from the events table
  const baseEvents = await db.events.toArray();
  const eventMap = new Map();

  // Populate map with known events IF they are in the allowed list
  baseEvents.forEach((e) => {
    const id = e.event_id || e.id;
    if (id && ALLOWED_EVENT_IDS.includes(id)) {
      eventMap.set(id, e);
    }
  });

  // Ensure all IDs requested by user are present, even if not in events table
  ALLOWED_EVENT_IDS.forEach((id) => {
    if (!eventMap.has(id)) {
      eventMap.set(id, { event_id: id, name: `Event (${id.slice(-6)})` });
    }
  });

  return Array.from(eventMap.values());
}
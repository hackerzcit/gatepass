import { db, Winner } from "@/db";
import {
  EnrichedWinner,
  WinnersSearchFilters,
  BulkWinnerDeclaration,
} from "./types";
import { ALLOWED_EVENT_IDS as PAYMENTS_EVENT_IDS } from "../payments/api";

export async function searchWinners(
  filters: WinnersSearchFilters,
): Promise<EnrichedWinner[]> {
  const { searchQuery, eventFilter } = filters;
  const lowerQuery = searchQuery.toLowerCase().trim();

  // Get all winners
  let allWinners = await db.winners.toArray();

  // Filter by event
  if (eventFilter !== "all") {
    allWinners = allWinners.filter((w) => w.event_id === eventFilter);
  }

  // Enrich with user and event data
  const enriched = await Promise.all(
    allWinners.map(async (winner) => {
      const userId = winner.user_id || (winner as any).userId;
      const evId = winner.event_id || (winner as any).eventId;

      const [user, event] = await Promise.all([
        userId ? db.users.get(userId) : Promise.resolve(undefined),
        evId
          ? db.events.get(evId) ||
            (db as any).events.where("id").equals(evId).first() ||
            (db as any).events.filter((e: any) => e.event_id === evId).first()
          : Promise.resolve(undefined),
      ]);

      // If event name is missing, try to use a placeholder
      const enrichedEvent: any = event ? { ...event } : { event_id: evId };
      if (
        !enrichedEvent.name &&
        !enrichedEvent.event_name &&
        !enrichedEvent.title
      ) {
        // Try to find name in events table if we used id instead of event_id
        enrichedEvent.name = `Event (${evId?.slice(-6) || "Unknown"})`;
      }

      return { ...winner, user, event: enrichedEvent };
    }),
  );

  // Filter by search query (user name, email, code, or event name)
  if (!lowerQuery) return enriched;

  return enriched.filter((w) => {
    const userName = w.user?.name || (w.user as any)?.userName || "";
    const userEmail = w.user?.email || "";
    const userCode = w.user?.unique_code || "";
    const eventName =
      (w.event as any)?.name ||
      (w.event as any)?.event_name ||
      (w.event as any)?.title ||
      "";

    return (
      userName.toLowerCase().includes(lowerQuery) ||
      userEmail.toLowerCase().includes(lowerQuery) ||
      userCode.toLowerCase().includes(lowerQuery) ||
      eventName.toLowerCase().includes(lowerQuery)
    );
  });
}

export async function getWinnersByEvent(eventId: string): Promise<Winner[]> {
  return await db.winners.where("event_id").equals(eventId).toArray();
}

export async function getEnrichedWinnersByEvent(
  eventId: string,
): Promise<EnrichedWinner[]> {
  const winners = await getWinnersByEvent(eventId);
  return await Promise.all(
    winners.map(async (winner) => {
      const userId = winner.user_id || (winner as any).userId;
      const user = userId ? await db.users.get(userId) : undefined;
      return { ...winner, user };
    }),
  );
}

export async function addWinner(data: {
  event_id: string;
  user_id: string;
  rank: number;
}): Promise<Winner> {
  const winner: Winner = {
    winner_id: crypto.randomUUID(),
    event_id: data.event_id,
    user_id: data.user_id,
    rank: data.rank,
    created_at: new Date().toISOString(),
    _sync_status: "pending",
  };

  await db.winners.put(winner);
  return winner;
}

export async function bulkAddWinners(
  data: BulkWinnerDeclaration,
): Promise<void> {
  const newWinners: Winner[] = data.winners.map((w) => ({
    winner_id: crypto.randomUUID(),
    event_id: data.event_id,
    user_id: w.user_id,
    rank: w.rank,
    created_at: new Date().toISOString(),
    _sync_status: "pending",
  }));

  // Delete existing winners for this event before adding new ones
  await db.winners.where("event_id").equals(data.event_id).delete();

  await db.winners.bulkPut(newWinners);
}

export async function removeWinner(winnerId: string): Promise<void> {
  await db.winners.delete(winnerId);
}

export async function fetchWinnersEventsFilter() {
  // Collect events from the events table
  const baseEvents = await db.events.toArray();

  // Also discover events from other tables if needed
  const [enrollments, attendance] = await Promise.all([
    db.enrollments.toArray(),
    db.attendance.toArray(),
  ]);

  const eventIds = new Set<string>();
  enrollments.forEach((e) => {
    if (e.event_id || (e as any).eventId)
      eventIds.add(e.event_id || (e as any).eventId);
  });
  attendance.forEach((a) => {
    if (a.event_id || (a as any).eventId)
      eventIds.add(a.event_id || (a as any).eventId);
  });

  const eventMap = new Map();

  // Filter out events that ARE in the payments page filter
  baseEvents.forEach((e) => {
    const id = e.event_id || (e as any).id;
    if (id && !PAYMENTS_EVENT_IDS.includes(id)) {
      eventMap.set(id, e);
    }
  });

  // Add discovered IDs that are NOT in payments list
  eventIds.forEach((id) => {
    if (!PAYMENTS_EVENT_IDS.includes(id) && !eventMap.has(id)) {
      eventMap.set(id, {
        event_id: id,
        name: `Event (${id.slice(-6)})`,
      });
    }
  });

  return Array.from(eventMap.values());
}
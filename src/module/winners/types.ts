import { Winner, User, Event } from "@/db";

export interface EnrichedWinner extends Winner {
  user?: User;
  event?: Event;
}

export interface WinnersSearchFilters {
  searchQuery: string;
  eventFilter: string;
}

export interface WinnerFormData {
  event_id: string;
  user_id: string;
  rank: number;
}

export interface BulkWinnerDeclaration {
  event_id: string;
  winners: {
    user_id: string;
    rank: number;
  }[];
}
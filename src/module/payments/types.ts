import { Payment, User, Event } from "@/db";

export interface EnrichedPayment extends Payment {
  user?: User;
  event?: Event;
}

export interface PaymentsResponse {
  payments: EnrichedPayment[];
  totalCount: number;
  totalPages: number;
}
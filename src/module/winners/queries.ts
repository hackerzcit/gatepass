import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  searchWinners,
  fetchWinnersEventsFilter,
  getEnrichedWinnersByEvent,
} from "./api";

const EMPTY_ARRAY: any[] = [];

export function useWinnersSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const query = useQuery({
    queryKey: ["winners", searchQuery, eventFilter],
    queryFn: () => searchWinners({ searchQuery, eventFilter }),
  });

  return {
    winners: query.data || EMPTY_ARRAY,
    loading: query.isLoading,
    searchQuery,
    setSearchQuery,
    eventFilter,
    setEventFilter,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useWinnersEvents() {
  const query = useQuery({
    queryKey: ["winners-events-filter"],
    queryFn: fetchWinnersEventsFilter,
  });

  return {
    events: query.data || EMPTY_ARRAY,
    loading: query.isLoading,
  };
}

export function useWinnersForEvent(eventId: string | null) {
  const query = useQuery({
    queryKey: ["winners", eventId],
    queryFn: () =>
      eventId ? getEnrichedWinnersByEvent(eventId) : Promise.resolve(EMPTY_ARRAY),
    enabled: !!eventId,
  });

  return {
    winners: query.data || EMPTY_ARRAY,
    loading: query.isLoading,
  };
}
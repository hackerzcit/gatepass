import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { searchPayments, fetchEventsFilter } from "./api";

export function usePaymentsSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const query = useQuery({
    queryKey: ["payments", searchQuery, eventFilter, page, pageSize],
    queryFn: () => searchPayments(searchQuery, eventFilter, page, pageSize),
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, eventFilter]);

  return {
    payments: query.data?.payments || [],
    loading: query.isLoading,
    searchQuery,
    setSearchQuery,
    eventFilter,
    setEventFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount: query.data?.totalCount || 0,
    totalPages: query.data?.totalPages || 0,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEvents() {
  const query = useQuery({
    queryKey: ["events-filter"],
    queryFn: fetchEventsFilter,
  });

  return {
    events: query.data || [],
    loading: query.isLoading,
  };
}
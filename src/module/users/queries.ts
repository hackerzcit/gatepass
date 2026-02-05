import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { searchUsers } from "./api";

export function useUsersSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  const query = useQuery({
    queryKey: ["users-search", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    users: query.data || [],
    loading: query.isLoading,
    searchQuery,
    setSearchQuery,
    error: query.error,
  };
}
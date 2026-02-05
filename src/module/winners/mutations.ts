import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addWinner, removeWinner, bulkAddWinners } from "./api";
import { toast } from "sonner";

export function useAddWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWinner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winners"] });
      toast.success("Winner added successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to add winner: " + error.message);
    },
  });
}

export function useBulkAddWinners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAddWinners,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winners"] });
      toast.success("Winners declared successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to declare winners: " + error.message);
    },
  });
}

export function useRemoveWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWinner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winners"] });
      toast.success("Winner removed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to remove winner: " + error.message);
    },
  });
}
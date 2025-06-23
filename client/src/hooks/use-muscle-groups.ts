import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export function useMuscleGroups(exerciseName: string | null) {
  return useQuery({
    queryKey: ['/api/exercises/muscle-groups', exerciseName],
    queryFn: () => exerciseName ? 
      fetch(`/api/exercises/${encodeURIComponent(exerciseName)}/muscle-groups`, { credentials: "include" }).then(res => res.json()) : 
      null,
    enabled: !!exerciseName,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since muscle groups rarely change
  });
}
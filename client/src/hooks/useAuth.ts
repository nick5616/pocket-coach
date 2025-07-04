import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  try {
    const { data: user, isLoading, error } = useQuery({
      queryKey: ["/api/auth/user"],
      queryFn: async () => {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        return response.json();
      },
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
      user,
      isLoading,
      isAuthenticated: !!user && !error,
      error
    };
  } catch (err) {
    // Fallback if React Query context is not available
    console.error("useAuth hook error:", err);
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: err as Error
    };
  }
}
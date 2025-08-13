import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, EffortTrackingPreference } from "@shared/schema";

type UserPreferencesContextType = {
  effortTrackingPreference: EffortTrackingPreference;
  setEffortTrackingPreference: (preference: EffortTrackingPreference) => Promise<void>;
  isLoading: boolean;
  isUpdating: boolean;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [effortTrackingPreference, setLocalEffortTracking] = useState<EffortTrackingPreference>("rpe");
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  // Get current user data to extract preferences
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: { effortTrackingPreference: EffortTrackingPreference }): Promise<User> => {
      const response = await apiRequest("PATCH", "/api/auth/user/preferences", preferences);
      const data = await response.json();
      return data as User;
    },
    onSuccess: (updatedUser: User) => {
      // Update local state
      const preference = updatedUser.effortTrackingPreference || "rpe";
      setLocalEffortTracking(preference as EffortTrackingPreference);
      // Invalidate user query to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Store in localStorage as backup
      localStorage.setItem("effortTrackingPreference", preference);
    },
    onError: (error) => {
      console.error("Failed to update user preferences:", error);
      // Revert to previous state on error
      if (user?.effortTrackingPreference) {
        setLocalEffortTracking(user.effortTrackingPreference as EffortTrackingPreference);
      }
    },
  });

  // Initialize preferences from user data or localStorage
  useEffect(() => {
    if (user && !isInitialized) {
      const userPreference = user.effortTrackingPreference || "rpe";
      setLocalEffortTracking(userPreference as EffortTrackingPreference);
      localStorage.setItem("effortTrackingPreference", userPreference);
      setIsInitialized(true);
    } else if (!user && !userLoading && !isInitialized) {
      // Fallback to localStorage if user data isn't available
      const savedPreference = localStorage.getItem("effortTrackingPreference");
      if (savedPreference && ["rpe", "rir", "none"].includes(savedPreference)) {
        setLocalEffortTracking(savedPreference as EffortTrackingPreference);
      }
      setIsInitialized(true);
    }
  }, [user, userLoading, isInitialized]);

  const setEffortTrackingPreference = async (preference: EffortTrackingPreference) => {
    // Optimistically update local state
    setLocalEffortTracking(preference);
    localStorage.setItem("effortTrackingPreference", preference);
    
    // Update on server
    await updatePreferencesMutation.mutateAsync({ effortTrackingPreference: preference });
  };

  const value = {
    effortTrackingPreference,
    setEffortTrackingPreference,
    isLoading: userLoading || !isInitialized,
    isUpdating: updatePreferencesMutation.isPending,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};

// Helper functions to get effort tracking display info
export const getEffortTrackingInfo = (preference: EffortTrackingPreference) => {
  switch (preference) {
    case "rpe":
      return {
        label: "RPE",
        fullName: "Rate of Perceived Exertion",
        description: "Scale of 1-10 indicating how hard the set felt",
        placeholder: "RPE (1-10)",
        min: 1,
        max: 10,
      };
    case "rir":
      return {
        label: "RIR",
        fullName: "Reps in Reserve",
        description: "How many more reps you could have done",
        placeholder: "RIR (0-10+)",
        min: 0,
        max: 15,
      };
    case "none":
      return {
        label: "None",
        fullName: "No Effort Tracking",
        description: "Track weight and reps only",
        placeholder: "",
        min: 0,
        max: 0,
      };
  }
};
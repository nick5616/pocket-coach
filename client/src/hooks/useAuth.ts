export function useAuth() {
  return { 
    user: null as any, 
    isLoading: false, 
    isAuthenticated: false 
  };
}
import { queryClient } from './queryClient';

export const handleLogout = async () => {
  try {
    // Clear all query caches to prevent stale data issues
    queryClient.clear();
    
    // Remove any local storage items that might cause issues
    localStorage.removeItem('auth-user');
    sessionStorage.removeItem('user-session');
    
    // Call the logout endpoint (which will redirect to demo)
    window.location.href = '/api/logout';
  } catch (error) {
    console.error('Logout error:', error);
    // Fallback: clear cache and go to demo directly
    queryClient.clear();
    window.location.href = '/demo';
  }
};

export const clearAppCache = () => {
  // Clear React Query cache
  queryClient.clear();
  
  // Clear relevant localStorage/sessionStorage
  localStorage.removeItem('auth-user');
  sessionStorage.removeItem('user-session');
  sessionStorage.removeItem('iframe-redirected');
};
import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  enabled?: boolean;
  interval?: number; // milliseconds
  onSave?: () => void;
  onRestore?: (data: any) => void;
}

export function useAutoSave({
  key,
  data,
  enabled = true,
  interval = 10000, // 10 seconds
  onSave,
  onRestore
}: UseAutoSaveOptions) {
  const { toast } = useToast();
  const lastSavedRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Save to localStorage
  const saveData = useCallback(() => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedRef.current) return; // No changes
    
    try {
      localStorage.setItem(`autosave_${key}`, dataString);
      localStorage.setItem(`autosave_${key}_timestamp`, Date.now().toString());
      lastSavedRef.current = dataString;
      onSave?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save Warning",
        description: "Unable to save your progress locally. Your data may be lost if you leave the page.",
        variant: "destructive",
      });
    }
  }, [key, data, enabled, onSave, toast]);

  // Load from localStorage
  const restoreData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`autosave_${key}`);
      const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
      
      if (savedData && timestamp) {
        const parsedData = JSON.parse(savedData);
        const saveTime = parseInt(timestamp);
        const hoursOld = (Date.now() - saveTime) / (1000 * 60 * 60);
        
        // Only restore if less than 24 hours old
        if (hoursOld < 24) {
          onRestore?.(parsedData);
          return { data: parsedData, timestamp: saveTime };
        } else {
          // Clean up old data
          clearSavedData();
        }
      }
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
    }
    return null;
  }, [key, onRestore]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    localStorage.removeItem(`autosave_${key}_timestamp`);
    lastSavedRef.current = '';
  }, [key]);

  // Check if there's saved data available
  const hasSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(`autosave_${key}`);
      const timestamp = localStorage.getItem(`autosave_${key}_timestamp`);
      
      if (savedData && timestamp) {
        const saveTime = parseInt(timestamp);
        const hoursOld = (Date.now() - saveTime) / (1000 * 60 * 60);
        return hoursOld < 24;
      }
    } catch {
      return false;
    }
    return false;
  }, [key]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Schedule save
    saveTimeoutRef.current = setTimeout(saveData, interval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, interval, saveData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveData,
    restoreData,
    clearSavedData,
    hasSavedData
  };
}

// Offline detection hook
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "Back Online",
        description: "Your connection has been restored.",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "Connection Lost",
        description: "You're now offline. Your changes will be saved locally.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOffline;
}
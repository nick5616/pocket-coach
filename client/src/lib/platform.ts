// Platform detection utilities for web vs native app
declare global {
  interface Window {
    Capacitor?: {
      getPlatform(): 'web' | 'ios' | 'android';
      isNativePlatform(): boolean;
    };
  }
}

export const getPlatform = (): 'web' | 'ios' | 'android' => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor.getPlatform();
  }
  return 'web';
};

export const isNativeApp = (): boolean => {
  return getPlatform() !== 'web';
};

export const isWebBrowser = (): boolean => {
  return getPlatform() === 'web';
};

export const isIOS = (): boolean => {
  return getPlatform() === 'ios';
};

export const isAndroid = (): boolean => {
  return getPlatform() === 'android';
};

// Feature detection for native capabilities
export const hasNativeFeatures = (): boolean => {
  return isNativeApp();
};

// Safe native feature wrapper
export const whenNative = <T>(callback: () => T): T | null => {
  return isNativeApp() ? callback() : null;
};
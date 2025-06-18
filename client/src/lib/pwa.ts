export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

export function setupPWAInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or banner
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
      installBanner.style.display = 'block';
    }
  });

  return {
    promptInstall: () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      }
    }
  };
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
}

export function addToHomeScreen() {
  // iOS specific add to home screen guidance
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return {
      isIOS: true,
      message: 'To add this app to your home screen: tap the Share button and then "Add to Home Screen"'
    };
  }
  
  return {
    isIOS: false,
    message: 'This app can be installed on your device for a better experience'
  };
}

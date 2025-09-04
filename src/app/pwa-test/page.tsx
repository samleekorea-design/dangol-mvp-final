'use client';
import { useEffect, useState } from 'react';

export default function PWATest() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PWA Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {isInstalled ? '✅ Installed as PWA' : '❌ Not installed'}
        </div>
        
        <div>
          <strong>Service Worker:</strong> {
            'serviceWorker' in navigator ? '✅ Supported' : '❌ Not supported'
          }
        </div>

        {deferredPrompt && (
          <button 
            onClick={handleInstall}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}

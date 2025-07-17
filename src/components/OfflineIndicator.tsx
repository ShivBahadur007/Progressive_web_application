import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4">
      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <WifiOff className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">
          You're offline. Some features may be limited.
        </span>
      </div>
    </div>
  );
}
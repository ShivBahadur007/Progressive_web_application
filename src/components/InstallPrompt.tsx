import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function InstallPrompt() {
  const { showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Install ShopFlow</h3>
              <p className="text-sm text-gray-600">Get the app experience</p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Install ShopFlow for faster access, offline browsing, and push notifications about your orders.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={installApp}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Install
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
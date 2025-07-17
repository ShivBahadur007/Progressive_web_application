import React, { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import CartSidebar from './components/CartSidebar';
import InstallPrompt from './components/InstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { ShoppingCart } from 'lucide-react';

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <InstallPrompt />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CategoryFilter />
        <ProductGrid />
      </main>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <ShoppingCart className="w-6 h-6" />
      </button>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Update document title
    document.title = 'ShopFlow - E-commerce PWA';
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
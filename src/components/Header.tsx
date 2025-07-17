import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Bell, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';

export default function Header() {
  const { state, setSearchQuery } = useApp();
  const { requestPermission, permission } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleNotificationToggle = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ShopFlow</h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleNotificationToggle}
              className={`p-2 rounded-lg transition-colors ${
                permission === 'granted' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <button
              onClick={handleNotificationToggle}
              className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifications
            </button>
            
            <button className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="w-5 h-5 mr-3" />
              Profile
            </button>
            
            <button className="flex items-center w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 mr-3" />
              Cart ({cartItemCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
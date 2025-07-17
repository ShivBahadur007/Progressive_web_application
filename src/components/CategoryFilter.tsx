import React from 'react';
import { useApp } from '../context/AppContext';

const categories = [
  { id: 'all', name: 'All Products', icon: '🏪' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'home', name: 'Home & Garden', icon: '🏠' },
  { id: 'accessories', name: 'Accessories', icon: '🎒' },
  { id: 'sports', name: 'Sports', icon: '⚽' }
];

export default function CategoryFilter() {
  const { state, setSelectedCategory } = useApp();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              state.selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-2xl mb-1">{category.icon}</div>
            <div className="text-xs font-medium">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
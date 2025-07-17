import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Product, CartItem, User, Order } from '../types';
import { localStorage, cacheManager } from '../utils/storage';
import { usePWA } from '../hooks/usePWA';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_ORDERS'; payload: Order[] };

const initialState: AppState = {
  products: [],
  cart: [],
  user: null,
  orders: [],
  isLoading: false,
  isOnline: navigator.onLine,
  searchQuery: '',
  selectedCategory: 'all',
  notifications: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_CART':
      return { ...state, cart: action.payload };
    
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.product.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.product.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, {
          id: action.payload.product.id,
          product: action.payload.product,
          quantity: action.payload.quantity,
          addedAt: Date.now()
        }]
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { isOnline } = usePWA();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync online status
  useEffect(() => {
    dispatch({ type: 'SET_ONLINE', payload: isOnline });
  }, [isOnline]);

  // Persist cart changes
  useEffect(() => {
    localStorage.set('cart', state.cart);
    cacheManager.set('cart', state.cart);
  }, [state.cart]);

  const loadInitialData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Load cart from storage
      const savedCart = localStorage.get<CartItem[]>('cart') || [];
      dispatch({ type: 'SET_CART', payload: savedCart });

      // Load products
      const products = await loadProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });

      // Load user data
      const user = localStorage.get<User>('user');
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadProducts = async (): Promise<Product[]> => {
    try {
      // Try to fetch from network first
      if (navigator.onLine) {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        // Cache products for offline use
        cacheManager.set('products', products);
        return products;
      }
      
      // Fall back to cached data
      const cachedProducts = await cacheManager.get('products', 'all');
      return cachedProducts || getMockProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
      return getMockProducts();
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSelectedCategory = (category: string) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setSearchQuery,
    setSelectedCategory
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Mock data for development and offline fallback
function getMockProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 99.99,
      originalPrice: 129.99,
      description: 'High-quality wireless headphones with noise cancellation',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'electronics',
      rating: 4.5,
      reviews: 234,
      inStock: true,
      featured: true,
      tags: ['wireless', 'audio', 'bluetooth']
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: 299.99,
      description: 'Advanced fitness tracking and smart notifications',
      image: 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'electronics',
      rating: 4.7,
      reviews: 567,
      inStock: true,
      featured: true,
      tags: ['smartwatch', 'fitness', 'health']
    },
    {
      id: '3',
      name: 'Laptop Backpack',
      price: 59.99,
      description: 'Durable laptop backpack with multiple compartments',
      image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'accessories',
      rating: 4.3,
      reviews: 123,
      inStock: true,
      tags: ['backpack', 'laptop', 'travel']
    },
    {
      id: '4',
      name: 'Smartphone',
      price: 699.99,
      originalPrice: 799.99,
      description: 'Latest smartphone with advanced camera system',
      image: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'electronics',
      rating: 4.6,
      reviews: 892,
      inStock: true,
      featured: true,
      tags: ['smartphone', 'camera', 'mobile']
    },
    {
      id: '5',
      name: 'Running Shoes',
      price: 119.99,
      description: 'Comfortable running shoes for all terrains',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'fashion',
      rating: 4.4,
      reviews: 345,
      inStock: true,
      tags: ['shoes', 'running', 'sports']
    },
    {
      id: '6',
      name: 'Coffee Maker',
      price: 79.99,
      description: 'Programmable coffee maker with thermal carafe',
      image: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=500',
      category: 'home',
      rating: 4.2,
      reviews: 156,
      inStock: true,
      tags: ['coffee', 'appliance', 'kitchen']
    }
  ];
}
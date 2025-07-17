export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: number;
  estimatedDelivery?: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  isLoading: boolean;
  isOnline: boolean;
  searchQuery: string;
  selectedCategory: string;
  notifications: NotificationPayload[];
}
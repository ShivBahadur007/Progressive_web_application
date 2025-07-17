interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number;
}

class StorageManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  set(key: string, value: any, expiryMinutes?: number): void {
    const item: StorageItem = {
      value,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined
    };

    try {
      this.storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const itemStr = this.storage.getItem(key);
      if (!itemStr) return null;

      const item: StorageItem = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to retrieve from storage:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // Get all keys with a specific prefix
  getKeys(prefix: string): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }
}

export const localStorage = new StorageManager(window.localStorage);
export const sessionStorage = new StorageManager(window.sessionStorage);

// Cache management for offline functionality
export class CacheManager {
  private dbName = 'shopflow-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }
      };
    });
  }

  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const cacheManager = new CacheManager();
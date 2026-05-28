const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Für Development: Redis optional
      // In Production würde echtes Redis laufen
      console.log('🔌 Cache Service initialized (Mock Mode)');
      this.isConnected = true;
    } catch (error) {
      console.warn('⚠️  Redis nicht verfügbar, nutze In-Memory Cache');
      this.cache = new Map();
    }
  }

  async get(key) {
    try {
      if (!this.cache) this.cache = new Map();
      
      const value = this.cache.get(key);
      if (value) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(value);
      }
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache GET Error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (!this.cache) this.cache = new Map();
      
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      this.cache.set(key, JSON.stringify(value));
      
      // Auto-delete nach TTL (Time To Live)
      setTimeout(() => {
        this.cache.delete(key);
        console.log(`🗑️  Cache EXPIRED: ${key}`);
      }, ttl * 1000);
      
      return true;
    } catch (error) {
      console.error('Cache SET Error:', error.message);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.cache) this.cache = new Map();
      
      const deleted = this.cache.delete(key);
      console.log(`❌ Cache DELETE: ${key}`);
      return deleted;
    } catch (error) {
      console.error('Cache DEL Error:', error.message);
      return false;
    }
  }

  async clear() {
    try {
      if (!this.cache) this.cache = new Map();
      this.cache.clear();
      console.log('🗑️  Cache CLEARED');
      return true;
    } catch (error) {
      console.error('Cache CLEAR Error:', error.message);
      return false;
    }
  }
}

module.exports = new CacheService();

// In-Memory-Cache (Map mit TTL). Bewusst kein Redis: der Proxy ist zustandslos genug,
// und der Free-Tier-Betrieb soll ohne zusätzlichen Dienst auskommen.
class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map(); // key -> Timeout, damit wir beim Überschreiben aufräumen können
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
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      this.cache.set(key, JSON.stringify(value));

      // Vorherigen Ablauf-Timer dieses Keys löschen, sonst würde er den frischen Wert killen.
      if (this.timers.has(key)) clearTimeout(this.timers.get(key));

      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
        console.log(`🗑️  Cache EXPIRED: ${key}`);
      }, ttl * 1000);
      if (typeof timer.unref === 'function') timer.unref(); // Cache soll den Prozess nicht am Leben halten
      this.timers.set(key, timer);

      return true;
    } catch (error) {
      console.error('Cache SET Error:', error.message);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.timers.has(key)) { clearTimeout(this.timers.get(key)); this.timers.delete(key); }
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
      for (const timer of this.timers.values()) clearTimeout(timer);
      this.timers.clear();
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

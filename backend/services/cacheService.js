const NodeCache = require('node-cache');

/**
 * Cache Service for API responses
 * 
 * Provides in-memory caching with TTL (Time To Live) support
 * to improve API performance and reduce database queries.
 */
class CacheService {
  constructor() {
    // Initialize cache with default TTL of 5 minutes (300 seconds)
    // checkperiod: 60 seconds - automatically delete expired keys
    this.cache = new NodeCache({
      stdTTL: 300,
      checkperiod: 60,
      useClones: false // Better performance, but be careful with object mutations
    });

    // Track cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };

    // Log cache events in development
    if (process.env.NODE_ENV === 'development') {
      this.cache.on('set', (key) => {
        console.log(`[Cache] Set: ${key}`);
      });
      
      this.cache.on('expired', (key) => {
        console.log(`[Cache] Expired: ${key}`);
      });
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {boolean} Success status
   */
  set(key, value, ttl) {
    this.stats.sets++;
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {number} Number of deleted entries
   */
  del(key) {
    return this.cache.del(key);
  }

  /**
   * Delete multiple keys from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {number} Number of deleted entries
   */
  delMultiple(keys) {
    return this.cache.del(keys);
  }

  /**
   * Clear all cache entries
   */
  flush() {
    this.cache.flushAll();
    console.log('[Cache] Flushed all entries');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const cacheStats = this.cache.getStats();
    return {
      ...this.stats,
      keys: cacheStats.keys,
      hits_ratio: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  /**
   * Generate cache key for product catalog queries
   * @param {object} query - Query parameters
   * @returns {string} Cache key
   */
  generateProductCatalogKey(query) {
    const {
      resolution_category,
      sensor_type,
      availability,
      sort = 'order',
      order = 'asc',
      page = 1,
      limit = 20
    } = query;

    return `products:${resolution_category || 'all'}:${sensor_type || 'all'}:${availability || 'all'}:${sort}:${order}:${page}:${limit}`;
  }

  /**
   * Invalidate all product catalog cache entries
   */
  invalidateProductCatalog() {
    const keys = this.cache.keys();
    const productKeys = keys.filter(key => key.startsWith('products:'));
    if (productKeys.length > 0) {
      this.delMultiple(productKeys);
      console.log(`[Cache] Invalidated ${productKeys.length} product catalog entries`);
    }
  }

  /**
   * Invalidate specific product cache entry
   * @param {string} productId - Product ID
   */
  invalidateProduct(productId) {
    const key = `product:${productId}`;
    this.del(key);
    // Also invalidate catalog since it contains this product
    this.invalidateProductCatalog();
  }
}

// Export singleton instance
module.exports = new CacheService();

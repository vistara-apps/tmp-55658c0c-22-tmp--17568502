/**
 * Cache Service
 * Handles caching of API responses and data
 */

// In-memory cache for development
const memoryCache = new Map();

// Cache expiration times (in milliseconds)
const EXPIRATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Set a cache item
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} expiration - Expiration time in milliseconds
 * @returns {Promise<boolean>} - Success status
 */
export const setCacheItem = async (key, value, expiration = EXPIRATION.MEDIUM) => {
  try {
    // In a real implementation, this would use a proper caching solution
    // For now, we'll use a simple in-memory cache
    memoryCache.set(key, {
      value,
      expiration: Date.now() + expiration,
    });
    
    return true;
  } catch (error) {
    console.error('Cache error:', error);
    return false;
  }
};

/**
 * Get a cache item
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null if not found or expired
 */
export const getCacheItem = async (key) => {
  try {
    // In a real implementation, this would use a proper caching solution
    // For now, we'll use a simple in-memory cache
    const item = memoryCache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (item.expiration < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
};

/**
 * Delete a cache item
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCacheItem = async (key) => {
  try {
    // In a real implementation, this would use a proper caching solution
    // For now, we'll use a simple in-memory cache
    memoryCache.delete(key);
    
    return true;
  } catch (error) {
    console.error('Cache error:', error);
    return false;
  }
};

/**
 * Clear all cache items
 * @returns {Promise<boolean>} - Success status
 */
export const clearCache = async () => {
  try {
    // In a real implementation, this would use a proper caching solution
    // For now, we'll use a simple in-memory cache
    memoryCache.clear();
    
    return true;
  } catch (error) {
    console.error('Cache error:', error);
    return false;
  }
};

/**
 * Wrap an async function with caching
 * @param {Function} fn - Async function to wrap
 * @param {string} key - Cache key
 * @param {number} expiration - Expiration time in milliseconds
 * @returns {Promise<any>} - Function result (from cache or fresh)
 */
export const withCache = async (fn, key, expiration = EXPIRATION.MEDIUM) => {
  try {
    // Check cache first
    const cachedValue = await getCacheItem(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // If not in cache, call the function
    const result = await fn();
    
    // Cache the result
    await setCacheItem(key, result, expiration);
    
    return result;
  } catch (error) {
    console.error('Cache error:', error);
    // If caching fails, just return the function result
    return fn();
  }
};

export default {
  setCacheItem,
  getCacheItem,
  deleteCacheItem,
  clearCache,
  withCache,
  EXPIRATION,
};


import { supabase, executeQuery } from '../supabase';
import cacheService from '../services/cache';

/**
 * Venue Model
 * Handles venue data operations
 */
const VenueModel = {
  /**
   * Get venue by ID
   * @param {string} venueId - Venue ID
   * @returns {Promise<Object>} - { data, error }
   */
  getById: async (venueId) => {
    const cacheKey = `venue:${venueId}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // If not in cache, fetch from database
    const result = await executeQuery(() => 
      supabase
        .from('venues')
        .select('*')
        .eq('venueId', venueId)
        .single()
    );
    
    // Cache the result if successful
    if (result.data && !result.error) {
      await cacheService.setCacheItem(cacheKey, result.data, cacheService.EXPIRATION.MEDIUM);
    }
    
    return result;
  },
  
  /**
   * Search venues by query
   * @param {string} query - Search query
   * @returns {Promise<Object>} - { data, error }
   */
  search: async (query) => {
    if (!query) {
      return { data: [], error: null };
    }
    
    return executeQuery(() => 
      supabase
        .from('venues')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name')
    );
  },
  
  /**
   * Get venues by category
   * @param {string} category - Category
   * @returns {Promise<Object>} - { data, error }
   */
  getByCategory: async (category) => {
    if (!category) {
      return { data: [], error: null };
    }
    
    return executeQuery(() => 
      supabase
        .from('venues')
        .select('*')
        .contains('categories', [category])
        .order('name')
    );
  },
  
  /**
   * Get venues near a location
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Radius in kilometers
   * @returns {Promise<Object>} - { data, error }
   */
  getNearby: async (latitude, longitude, radius = 5) => {
    // Convert radius from kilometers to meters
    const radiusInMeters = radius * 1000;
    
    return executeQuery(() => 
      supabase
        .rpc('venues_within_radius', {
          lat: latitude,
          lng: longitude,
          radius_meters: radiusInMeters,
        })
    );
  },
  
  /**
   * Create or update a venue
   * @param {Object} data - Venue data
   * @returns {Promise<Object>} - { data, error }
   */
  createOrUpdate: async (data) => {
    // Set timestamps if not provided
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }
    
    data.updated_at = new Date().toISOString();
    
    const result = await executeQuery(() => 
      supabase
        .from('venues')
        .upsert(data)
        .select()
        .single()
    );
    
    // Clear cache for this venue
    if (result.data && !result.error) {
      const venueId = result.data.venueId;
      await cacheService.deleteCacheItem(`venue:${venueId}`);
      await cacheService.deleteCacheItem(`venue:${venueId}:recommendations`);
    }
    
    return result;
  },
  
  /**
   * Generate mock venues
   * @param {number} count - Number of venues to generate
   * @param {Object} location - Location to center venues around
   * @returns {Promise<Object>} - { data, error }
   */
  generateMock: async (count = 10, location = { latitude: 37.7749, lng: -122.4194 }) => {
    const categories = [
      'restaurant', 'bar', 'cafe', 'club', 'music', 'art',
      'outdoor', 'fitness', 'shopping', 'entertainment'
    ];
    
    const venues = [
      'Blue Note Jazz Club', 'The Rustic Spoon', 'Skyline Lounge',
      'Harbor Brewing Co.', 'Green Garden Cafe', 'The Velvet Room',
      'Sunset Beach Bar', 'Mountain View Restaurant', 'Urban Eats',
      'The Cozy Corner', 'Riverside Grill', 'The Art Gallery Cafe'
    ];
    
    const mockVenues = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random coordinates within ~5km of the center
      const lat = location.latitude + (Math.random() - 0.5) * 0.1;
      const lng = location.longitude + (Math.random() - 0.5) * 0.1;
      
      // Generate random categories (1-3)
      const categoryCount = Math.floor(Math.random() * 3) + 1;
      const venueCats = [];
      for (let j = 0; j < categoryCount; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        if (!venueCats.includes(category)) {
          venueCats.push(category);
        }
      }
      
      // Generate random venue
      const venue = venues[Math.floor(Math.random() * venues.length)];
      
      mockVenues.push({
        venueId: `venue-${i}`,
        name: venue,
        address: `${Math.floor(Math.random() * 1000) + 100} Main St, San Francisco, CA`,
        latitude: lat,
        longitude: lng,
        categories: venueCats,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // Insert mock venues
    const result = await executeQuery(() => 
      supabase
        .from('venues')
        .upsert(mockVenues)
        .select()
    );
    
    return result;
  },
};

export default VenueModel;


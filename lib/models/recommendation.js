import { supabase, executeQuery } from '../supabase';
import cacheService from '../services/cache';

/**
 * Recommendation Model
 * Handles recommendation data operations
 */
const RecommendationModel = {
  /**
   * Get recommendation by ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<Object>} - { data, error }
   */
  getById: async (recommendationId) => {
    const cacheKey = `recommendation:${recommendationId}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // If not in cache, fetch from database
    const result = await executeQuery(() => 
      supabase
        .from('recommendations')
        .select('*')
        .eq('recommendationId', recommendationId)
        .single()
    );
    
    // Cache the result if successful
    if (result.data && !result.error) {
      await cacheService.setCacheItem(cacheKey, result.data, cacheService.EXPIRATION.MEDIUM);
    }
    
    return result;
  },
  
  /**
   * Get recommendations by IDs
   * @param {string[]} ids - Recommendation IDs
   * @returns {Promise<Object>} - { data, error }
   */
  getByIds: async (ids) => {
    if (!ids || ids.length === 0) {
      return { data: [], error: null };
    }
    
    return executeQuery(() => 
      supabase
        .from('recommendations')
        .select('*')
        .in('recommendationId', ids)
    );
  },
  
  /**
   * Get recommendations by venue ID
   * @param {string} venueId - Venue ID
   * @returns {Promise<Object>} - { data, error }
   */
  getByVenueId: async (venueId) => {
    const cacheKey = `venue:${venueId}:recommendations`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // If not in cache, fetch from database
    const result = await executeQuery(() => 
      supabase
        .from('recommendations')
        .select('*')
        .eq('venueId', venueId)
        .order('trend_score', { ascending: false })
    );
    
    // Cache the result if successful
    if (result.data && !result.error) {
      await cacheService.setCacheItem(cacheKey, result.data, cacheService.EXPIRATION.MEDIUM);
    }
    
    return result;
  },
  
  /**
   * Get recommendations saved by a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - { data, error }
   */
  getSavedByUser: async (userId) => {
    // Get user's saved locations
    const { data: userData, error: userError } = await executeQuery(() => 
      supabase
        .from('users')
        .select('saved_locations')
        .eq('userId', userId)
        .single()
    );
    
    if (userError || !userData) {
      return { data: [], error: userError || new Error('User not found') };
    }
    
    const savedLocations = userData.saved_locations || [];
    
    if (savedLocations.length === 0) {
      return { data: [], error: null };
    }
    
    // Get recommendations by IDs
    return RecommendationModel.getByIds(savedLocations);
  },
  
  /**
   * Get recommendations by location
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Radius in kilometers
   * @returns {Promise<Object>} - { data, error }
   */
  getByLocation: async (latitude, longitude, radius = 5) => {
    // Convert radius from kilometers to meters
    const radiusInMeters = radius * 1000;
    
    return executeQuery(() => 
      supabase
        .rpc('recommendations_within_radius', {
          lat: latitude,
          lng: longitude,
          radius_meters: radiusInMeters,
        })
    );
  },
  
  /**
   * Get recommendations by vibe tags
   * @param {string[]} vibeTags - Vibe tags
   * @returns {Promise<Object>} - { data, error }
   */
  getByVibeTags: async (vibeTags) => {
    if (!vibeTags || vibeTags.length === 0) {
      return { data: [], error: null };
    }
    
    return executeQuery(() => 
      supabase
        .from('recommendations')
        .select('*')
        .overlaps('vibe_tags', vibeTags)
        .order('trend_score', { ascending: false })
    );
  },
  
  /**
   * Get recommendations with filters
   * @param {Object} filters - Filters
   * @param {string[]} filters.vibeTags - Vibe tags
   * @param {number} filters.latitude - Latitude
   * @param {number} filters.longitude - Longitude
   * @param {number} filters.radius - Radius in kilometers
   * @param {number} filters.minTrendScore - Minimum trend score
   * @param {string} filters.userId - User ID for personalization
   * @param {number} filters.limit - Maximum number of results
   * @returns {Promise<Object>} - { data, error }
   */
  getWithFilters: async (filters) => {
    let query = supabase.from('recommendations').select('*');
    
    // Filter by vibe tags
    if (filters.vibeTags && filters.vibeTags.length > 0) {
      query = query.overlaps('vibe_tags', filters.vibeTags);
    }
    
    // Filter by minimum trend score
    if (filters.minTrendScore && filters.minTrendScore > 0) {
      query = query.gte('trend_score', filters.minTrendScore);
    }
    
    // Filter by location
    if (filters.latitude && filters.longitude) {
      // For simplicity, we'll use a separate function for location filtering
      const { data: locationData, error: locationError } = await RecommendationModel.getByLocation(
        filters.latitude,
        filters.longitude,
        filters.radius || 5
      );
      
      if (locationError) {
        return { data: [], error: locationError };
      }
      
      // Get IDs of recommendations within radius
      const locationIds = locationData.map(rec => rec.recommendationId);
      
      if (locationIds.length === 0) {
        return { data: [], error: null };
      }
      
      query = query.in('recommendationId', locationIds);
    }
    
    // Order by trend score
    query = query.order('trend_score', { ascending: false });
    
    // Limit results
    if (filters.limit && filters.limit > 0) {
      query = query.limit(filters.limit);
    }
    
    return executeQuery(() => query);
  },
  
  /**
   * Create or update a recommendation
   * @param {Object} data - Recommendation data
   * @returns {Promise<Object>} - { data, error }
   */
  createOrUpdate: async (data) => {
    // Generate a trend score if not provided
    if (!data.trend_score) {
      data.trend_score = Math.floor(Math.random() * 30) + 70; // 70-100
    }
    
    // Set timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    const result = await executeQuery(() => 
      supabase
        .from('recommendations')
        .upsert(data)
        .select()
        .single()
    );
    
    // Clear cache for this recommendation
    if (result.data && !result.error) {
      const recId = result.data.recommendationId;
      await cacheService.deleteCacheItem(`recommendation:${recId}`);
      
      // Clear venue recommendations cache if venueId is provided
      if (result.data.venueId) {
        await cacheService.deleteCacheItem(`venue:${result.data.venueId}:recommendations`);
      }
    }
    
    return result;
  },
  
  /**
   * Generate mock recommendations
   * @param {number} count - Number of recommendations to generate
   * @param {Object} location - Location to center recommendations around
   * @returns {Promise<Object>} - { data, error }
   */
  generateMock: async (count = 10, location = { latitude: 37.7749, lng: -122.4194 }) => {
    const vibeTags = [
      'chill', 'lively', 'upscale', 'casual', 'romantic', 'family-friendly',
      'trendy', 'nostalgic', 'artsy', 'energetic', 'intimate', 'social',
      'quiet', 'loud', 'outdoor', 'cozy'
    ];
    
    const venues = [
      'Blue Note Jazz Club', 'The Rustic Spoon', 'Skyline Lounge',
      'Harbor Brewing Co.', 'Green Garden Cafe', 'The Velvet Room',
      'Sunset Beach Bar', 'Mountain View Restaurant', 'Urban Eats',
      'The Cozy Corner', 'Riverside Grill', 'The Art Gallery Cafe'
    ];
    
    const activities = [
      'Live Jazz Night', 'Craft Cocktail Tasting', 'Rooftop Party',
      'Local Beer Festival', 'Farm-to-Table Dinner', 'Poetry Slam',
      'Beach Volleyball Tournament', 'Sunset Yoga Session', 'Food Truck Rally',
      'Vintage Movie Night', 'Riverside Picnic', 'Art Exhibition Opening'
    ];
    
    const mockRecommendations = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random coordinates within ~5km of the center
      const lat = location.latitude + (Math.random() - 0.5) * 0.1;
      const lng = location.longitude + (Math.random() - 0.5) * 0.1;
      
      // Generate random vibe tags (2-4)
      const tagCount = Math.floor(Math.random() * 3) + 2;
      const tags = [];
      for (let j = 0; j < tagCount; j++) {
        const tag = vibeTags[Math.floor(Math.random() * vibeTags.length)];
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }
      
      // Generate random venue and activity
      const venue = venues[Math.floor(Math.random() * venues.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      // Generate random trend score (70-100)
      const trendScore = Math.floor(Math.random() * 30) + 70;
      
      // Generate random timestamp within the last week
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      
      mockRecommendations.push({
        title: `${activity} at ${venue}`,
        description: `Join us for a ${tags.join(', ')} experience at ${venue}. This event is trending with locals and visitors alike.`,
        venue_name: venue,
        location: `Downtown, San Francisco`,
        social_media_url: `https://example.com/social/${i}`,
        trend_score: trendScore,
        vibe_tags: tags,
        image_url: `https://picsum.photos/seed/${i}/400/300`,
        video_url: i % 3 === 0 ? `https://example.com/video/${i}` : null,
        latitude: lat,
        longitude: lng,
        timestamp: timestamp,
        venueId: `venue-${i}`,
      });
    }
    
    // Insert mock recommendations
    const result = await executeQuery(() => 
      supabase
        .from('recommendations')
        .upsert(mockRecommendations)
        .select()
    );
    
    return result;
  },
};

export default RecommendationModel;


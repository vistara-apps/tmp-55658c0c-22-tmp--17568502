import cacheService from './cache';

/**
 * Google Maps Service
 * Handles integration with Google Maps API for location services
 */

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} - { data, error }
 */
export const geocodeAddress = async (address) => {
  try {
    const cacheKey = `googlemaps:geocode:${address}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Generate random coordinates in San Francisco
      const mockData = {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        formatted_address: address,
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status !== 'OK') {
      throw new Error(`Google Maps API error: ${responseData.status}`);
    }
    
    const result = responseData.results[0];
    
    const data = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('Google Maps error:', error);
    return { data: null, error };
  }
};

/**
 * Reverse geocode coordinates to an address
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} - { data, error }
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const cacheKey = `googlemaps:reverse:${latitude},${longitude}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        address: `${Math.floor(Math.random() * 1000) + 100} Main St, San Francisco, CA 94105`,
        neighborhood: 'Downtown',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status !== 'OK') {
      throw new Error(`Google Maps API error: ${responseData.status}`);
    }
    
    const result = responseData.results[0];
    
    // Extract address components
    const addressComponents = {};
    result.address_components.forEach(component => {
      component.types.forEach(type => {
        addressComponents[type] = component.long_name;
      });
    });
    
    const data = {
      address: result.formatted_address,
      neighborhood: addressComponents.neighborhood || addressComponents.sublocality || '',
      city: addressComponents.locality || '',
      state: addressComponents.administrative_area_level_1 || '',
      country: addressComponents.country || '',
    };
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('Google Maps error:', error);
    return { data: null, error };
  }
};

/**
 * Get place details
 * @param {string} placeId - Google Maps place ID
 * @returns {Promise<Object>} - { data, error }
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const cacheKey = `googlemaps:place:${placeId}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        name: 'Sample Venue',
        address: '123 Main St, San Francisco, CA 94105',
        phone: '(415) 555-1234',
        website: 'https://example.com',
        rating: 4.5,
        reviews: [
          {
            author_name: 'John Doe',
            rating: 5,
            text: 'Great place! Highly recommend.',
            time: Date.now() - 86400000, // 1 day ago
          },
          {
            author_name: 'Jane Smith',
            rating: 4,
            text: 'Good atmosphere and service.',
            time: Date.now() - 172800000, // 2 days ago
          },
        ],
        photos: [
          'https://picsum.photos/seed/place1/400/300',
          'https://picsum.photos/seed/place2/400/300',
        ],
        opening_hours: {
          open_now: Math.random() > 0.5,
          weekday_text: [
            'Monday: 9:00 AM – 10:00 PM',
            'Tuesday: 9:00 AM – 10:00 PM',
            'Wednesday: 9:00 AM – 10:00 PM',
            'Thursday: 9:00 AM – 10:00 PM',
            'Friday: 9:00 AM – 11:00 PM',
            'Saturday: 10:00 AM – 11:00 PM',
            'Sunday: 10:00 AM – 9:00 PM',
          ],
        },
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,reviews,photos,opening_hours&key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status !== 'OK') {
      throw new Error(`Google Maps API error: ${responseData.status}`);
    }
    
    const result = responseData.result;
    
    const data = {
      name: result.name,
      address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      rating: result.rating,
      reviews: result.reviews,
      photos: result.photos ? result.photos.map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`
      ) : [],
      opening_hours: result.opening_hours,
    };
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('Google Maps error:', error);
    return { data: null, error };
  }
};

/**
 * Search for places by text query
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const searchPlaces = async (query, options = {}) => {
  try {
    const cacheKey = `googlemaps:search:${query}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = [];
      
      for (let i = 0; i < 5; i++) {
        mockData.push({
          place_id: `place-${i}`,
          name: `${query} Place ${i}`,
          address: `${Math.floor(Math.random() * 1000) + 100} Main St, San Francisco, CA 94105`,
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
          rating: Math.floor(Math.random() * 5) + 1,
          types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
        });
      }
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      query,
      key: API_KEY,
      ...options,
    });
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status !== 'OK' && responseData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${responseData.status}`);
    }
    
    const results = responseData.results || [];
    
    const data = results.map(result => ({
      place_id: result.place_id,
      name: result.name,
      address: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      rating: result.rating,
      types: result.types,
    }));
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('Google Maps error:', error);
    return { data: null, error };
  }
};

/**
 * Get places near a location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radius - Radius in meters
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const getNearbyPlaces = async (latitude, longitude, radius = 1000, options = {}) => {
  try {
    const cacheKey = `googlemaps:nearby:${latitude},${longitude}:${radius}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = [];
      
      for (let i = 0; i < 10; i++) {
        // Generate random coordinates within the radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const earthRadius = 6371000; // Earth radius in meters
        
        const lat = latitude + (distance / earthRadius) * (180 / Math.PI);
        const lng = longitude + (distance / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);
        
        mockData.push({
          place_id: `place-${i}`,
          name: `Nearby Place ${i}`,
          address: `${Math.floor(Math.random() * 1000) + 100} Main St, San Francisco, CA 94105`,
          latitude: lat,
          longitude: lng,
          rating: Math.floor(Math.random() * 5) + 1,
          types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
          distance: distance,
        });
      }
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: radius.toString(),
      key: API_KEY,
      ...options,
    });
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status !== 'OK' && responseData.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${responseData.status}`);
    }
    
    const results = responseData.results || [];
    
    const data = results.map(result => {
      // Calculate distance from center
      const lat1 = latitude * Math.PI / 180;
      const lng1 = longitude * Math.PI / 180;
      const lat2 = result.geometry.location.lat * Math.PI / 180;
      const lng2 = result.geometry.location.lng * Math.PI / 180;
      
      const earthRadius = 6371000; // Earth radius in meters
      const dLat = lat2 - lat1;
      const dLng = lng2 - lng1;
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = earthRadius * c;
      
      return {
        place_id: result.place_id,
        name: result.name,
        address: result.vicinity,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        rating: result.rating,
        types: result.types,
        distance: distance,
      };
    });
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('Google Maps error:', error);
    return { data: null, error };
  }
};

export default {
  geocodeAddress,
  reverseGeocode,
  getPlaceDetails,
  searchPlaces,
  getNearbyPlaces,
};


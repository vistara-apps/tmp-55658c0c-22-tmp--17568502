import cacheService from './cache';

/**
 * EnsembleData Service
 * Handles integration with EnsembleData API for social media content scraping
 */

const API_URL = process.env.ENSEMBLE_DATA_API_URL || 'https://api.ensembledata.com';
const API_TOKEN = process.env.ENSEMBLE_DATA_API_TOKEN;

/**
 * Search TikTok by hashtag
 * @param {string} hashtag - Hashtag to search for
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const searchTikTokByHashtag = async (hashtag, options = {}) => {
  try {
    const cacheKey = `ensembledata:tiktok:hashtag:${hashtag}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockTikTokData(hashtag, options.limit || 10);
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      hashtag,
      token: API_TOKEN,
      ...options,
    });
    
    const response = await fetch(`${API_URL}/apis/tt/hashtag_search?${params}`);
    
    if (!response.ok) {
      throw new Error(`EnsembleData API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('EnsembleData error:', error);
    return { data: null, error };
  }
};

/**
 * Search Instagram by hashtag
 * @param {string} hashtag - Hashtag to search for
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const searchInstagramByHashtag = async (hashtag, options = {}) => {
  try {
    const cacheKey = `ensembledata:instagram:hashtag:${hashtag}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockInstagramData(hashtag, options.limit || 10);
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      hashtag,
      token: API_TOKEN,
      ...options,
    });
    
    const response = await fetch(`${API_URL}/apis/ig/hashtag_search?${params}`);
    
    if (!response.ok) {
      throw new Error(`EnsembleData API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('EnsembleData error:', error);
    return { data: null, error };
  }
};

/**
 * Search by location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radius - Radius in kilometers
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const searchByLocation = async (latitude, longitude, radius = 5, options = {}) => {
  try {
    const cacheKey = `ensembledata:location:${latitude},${longitude}:${radius}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockLocationData(latitude, longitude, radius, options.limit || 10);
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      token: API_TOKEN,
      ...options,
    });
    
    const response = await fetch(`${API_URL}/apis/location_search?${params}`);
    
    if (!response.ok) {
      throw new Error(`EnsembleData API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('EnsembleData error:', error);
    return { data: null, error };
  }
};

/**
 * Get trending hashtags by location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - { data, error }
 */
export const getTrendingHashtags = async (latitude, longitude, options = {}) => {
  try {
    const cacheKey = `ensembledata:trending:${latitude},${longitude}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockTrendingHashtags(options.limit || 10);
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      token: API_TOKEN,
      ...options,
    });
    
    const response = await fetch(`${API_URL}/apis/trending_hashtags?${params}`);
    
    if (!response.ok) {
      throw new Error(`EnsembleData API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('EnsembleData error:', error);
    return { data: null, error };
  }
};

/**
 * Get video details
 * @param {string} videoId - Video ID
 * @param {string} platform - Platform (tiktok or instagram)
 * @returns {Promise<Object>} - { data, error }
 */
export const getVideoDetails = async (videoId, platform = 'tiktok') => {
  try {
    const cacheKey = `ensembledata:video:${platform}:${videoId}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = generateMockVideoDetails(videoId, platform);
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const params = new URLSearchParams({
      videoId,
      platform,
      token: API_TOKEN,
    });
    
    const response = await fetch(`${API_URL}/apis/video_details?${params}`);
    
    if (!response.ok) {
      throw new Error(`EnsembleData API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('EnsembleData error:', error);
    return { data: null, error };
  }
};

// Helper functions for generating mock data

function generateMockTikTokData(hashtag, limit) {
  const mockData = [];
  
  for (let i = 0; i < limit; i++) {
    mockData.push({
      id: `tiktok-${hashtag}-${i}`,
      url: `https://tiktok.com/video/${hashtag}-${i}`,
      caption: `#${hashtag} Check out this amazing place! #trending #vibes`,
      likes: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500),
      views: Math.floor(Math.random() * 100000),
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail_url: `https://picsum.photos/seed/tiktok-${hashtag}-${i}/400/300`,
      video_url: `https://example.com/video/tiktok-${hashtag}-${i}`,
      author: {
        id: `user-${i}`,
        username: `user_${i}`,
        avatar_url: `https://picsum.photos/seed/user-${i}/100/100`,
      },
    });
  }
  
  return mockData;
}

function generateMockInstagramData(hashtag, limit) {
  const mockData = [];
  
  for (let i = 0; i < limit; i++) {
    mockData.push({
      id: `instagram-${hashtag}-${i}`,
      url: `https://instagram.com/p/${hashtag}-${i}`,
      caption: `#${hashtag} Enjoying the vibes at this place! #trending #local`,
      likes: Math.floor(Math.random() * 5000),
      comments: Math.floor(Math.random() * 500),
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail_url: `https://picsum.photos/seed/instagram-${hashtag}-${i}/400/300`,
      media_url: `https://example.com/media/instagram-${hashtag}-${i}`,
      author: {
        id: `user-${i}`,
        username: `user_${i}`,
        avatar_url: `https://picsum.photos/seed/user-${i}/100/100`,
      },
    });
  }
  
  return mockData;
}

function generateMockLocationData(latitude, longitude, radius, limit) {
  const mockData = [];
  
  for (let i = 0; i < limit; i++) {
    // Generate random coordinates within the radius
    const lat = latitude + (Math.random() - 0.5) * (radius / 50);
    const lng = longitude + (Math.random() - 0.5) * (radius / 50);
    
    mockData.push({
      id: `location-${i}`,
      name: `Location ${i}`,
      address: `${Math.floor(Math.random() * 1000) + 100} Main St, San Francisco, CA`,
      latitude: lat,
      longitude: lng,
      distance: Math.random() * radius,
      post_count: Math.floor(Math.random() * 1000),
      trending_score: Math.floor(Math.random() * 100),
      recent_posts: generateMockPosts(3),
    });
  }
  
  return mockData;
}

function generateMockPosts(count) {
  const posts = [];
  
  for (let i = 0; i < count; i++) {
    posts.push({
      id: `post-${i}`,
      platform: Math.random() > 0.5 ? 'tiktok' : 'instagram',
      url: `https://example.com/post/${i}`,
      thumbnail_url: `https://picsum.photos/seed/post-${i}/400/300`,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return posts;
}

function generateMockTrendingHashtags(limit) {
  const hashtags = [
    'sanfrancisco', 'sf', 'bayarea', 'foodie', 'nightlife',
    'livemusic', 'art', 'coffee', 'brunch', 'sunset',
    'beach', 'hiking', 'fitness', 'shopping', 'festival',
    'concert', 'museum', 'park', 'restaurant', 'bar'
  ];
  
  const mockData = [];
  
  for (let i = 0; i < limit; i++) {
    const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
    
    mockData.push({
      hashtag,
      post_count: Math.floor(Math.random() * 100000),
      trending_score: Math.floor(Math.random() * 100),
    });
  }
  
  return mockData;
}

function generateMockVideoDetails(videoId, platform) {
  return {
    id: videoId,
    platform,
    url: `https://example.com/${platform}/video/${videoId}`,
    caption: 'Check out this amazing place! #trending #vibes',
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 500),
    views: Math.floor(Math.random() * 100000),
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail_url: `https://picsum.photos/seed/${platform}-${videoId}/400/300`,
    video_url: `https://example.com/video/${platform}-${videoId}`,
    author: {
      id: `user-${videoId}`,
      username: `user_${videoId}`,
      avatar_url: `https://picsum.photos/seed/user-${videoId}/100/100`,
    },
    location: {
      name: 'Sample Location',
      address: '123 Main St, San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    hashtags: ['trending', 'vibes', 'sanfrancisco', 'nightlife'],
    mentions: ['@user1', '@user2'],
    audio: {
      id: `audio-${videoId}`,
      name: 'Popular Song',
      artist: 'Famous Artist',
      url: `https://example.com/audio/${videoId}`,
    },
  };
}

export default {
  searchTikTokByHashtag,
  searchInstagramByHashtag,
  searchByLocation,
  getTrendingHashtags,
  getVideoDetails,
};


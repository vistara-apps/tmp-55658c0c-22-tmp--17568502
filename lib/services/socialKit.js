import cacheService from './cache';

/**
 * SocialKit Service
 * Handles integration with SocialKit API for video content analysis
 */

const API_URL = process.env.SOCIALKIT_API_URL || 'https://api.socialkit.dev';
const API_KEY = process.env.SOCIALKIT_API_KEY;

/**
 * Get video summary
 * @param {string} videoUrl - URL of the video
 * @returns {Promise<Object>} - { data, error }
 */
export const getVideoSummary = async (videoUrl) => {
  try {
    const cacheKey = `socialkit:summary:${videoUrl}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        summary: 'This video shows a lively jazz performance at Blue Note Jazz Club. The atmosphere is intimate and energetic, with a talented band playing to an enthusiastic crowd. The venue appears to be trendy and upscale, with dim lighting and a sophisticated ambiance.',
        keywords: ['jazz', 'music', 'performance', 'nightlife', 'entertainment'],
        sentiment: 'positive',
        confidence: 0.92,
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const response = await fetch(`${API_URL}/video/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ videoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`SocialKit API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('SocialKit error:', error);
    return { data: null, error };
  }
};

/**
 * Get video transcript
 * @param {string} videoUrl - URL of the video
 * @returns {Promise<Object>} - { data, error }
 */
export const getVideoTranscript = async (videoUrl) => {
  try {
    const cacheKey = `socialkit:transcript:${videoUrl}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        transcript: 'Hey everyone! I\'m here at the Blue Note Jazz Club and the vibe is amazing. The band is killing it tonight. If you\'re in town, you definitely need to check this place out. The crowd is loving it and the drinks are fantastic. #jazznight #livemusic',
        language: 'en',
        confidence: 0.88,
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const response = await fetch(`${API_URL}/video/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ videoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`SocialKit API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('SocialKit error:', error);
    return { data: null, error };
  }
};

/**
 * Get video analytics
 * @param {string} videoUrl - URL of the video
 * @returns {Promise<Object>} - { data, error }
 */
export const getVideoAnalytics = async (videoUrl) => {
  try {
    const cacheKey = `socialkit:analytics:${videoUrl}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockData = {
        engagement: {
          likes: Math.floor(Math.random() * 10000),
          comments: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 500),
          views: Math.floor(Math.random() * 100000),
        },
        sentiment: {
          positive: 0.75,
          neutral: 0.20,
          negative: 0.05,
        },
        demographics: {
          age: {
            '18-24': 0.35,
            '25-34': 0.40,
            '35-44': 0.15,
            '45+': 0.10,
          },
          gender: {
            male: 0.55,
            female: 0.45,
          },
        },
        trending_score: Math.floor(Math.random() * 30) + 70, // 70-100
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.MEDIUM);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const response = await fetch(`${API_URL}/video/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ videoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`SocialKit API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.MEDIUM);
    
    return { data, error: null };
  } catch (error) {
    console.error('SocialKit error:', error);
    return { data: null, error };
  }
};

/**
 * Extract vibe tags from video
 * @param {string} videoUrl - URL of the video
 * @returns {Promise<Object>} - { data, error }
 */
export const extractVibeTags = async (videoUrl) => {
  try {
    const cacheKey = `socialkit:vibe_tags:${videoUrl}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const vibeTags = [
        'chill', 'lively', 'upscale', 'casual', 'romantic', 'family-friendly',
        'trendy', 'nostalgic', 'artsy', 'energetic', 'intimate', 'social',
        'quiet', 'loud', 'outdoor', 'cozy'
      ];
      
      // Generate random vibe tags (2-4)
      const tagCount = Math.floor(Math.random() * 3) + 2;
      const tags = [];
      for (let i = 0; i < tagCount; i++) {
        const tag = vibeTags[Math.floor(Math.random() * vibeTags.length)];
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }
      
      const mockData = {
        vibe_tags: tags,
        confidence: 0.85,
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // In production, call the API
    const response = await fetch(`${API_URL}/video/vibe_tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ videoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`SocialKit API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('SocialKit error:', error);
    return { data: null, error };
  }
};

export default {
  getVideoSummary,
  getVideoTranscript,
  getVideoAnalytics,
  extractVibeTags,
};


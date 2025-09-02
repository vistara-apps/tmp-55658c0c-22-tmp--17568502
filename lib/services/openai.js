import cacheService from './cache';

/**
 * OpenAI Service
 * Handles integration with OpenAI API for natural language processing
 */

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Use OpenRouter as an alternative to OpenAI if configured
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const USE_OPENROUTER = !!OPENROUTER_API_KEY;

/**
 * Generate text using OpenAI API
 * @param {string} prompt - Prompt for text generation
 * @param {Object} options - Options for text generation
 * @returns {Promise<Object>} - { data, error }
 */
export const generateText = async (prompt, options = {}) => {
  try {
    const cacheKey = `openai:${prompt}:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedData = await cacheService.getCacheItem(cacheKey);
    
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Simple mock response based on prompt
      let mockResponse = 'This is a mock response from OpenAI.';
      
      if (prompt.includes('description')) {
        mockResponse = 'Experience the vibrant atmosphere of this trending local spot. The perfect place to unwind and enjoy good company with great music and delicious food.';
      } else if (prompt.includes('vibe')) {
        mockResponse = 'trendy, lively, social';
      } else if (prompt.includes('summary')) {
        mockResponse = 'This venue offers a unique blend of entertainment and relaxation, making it a popular choice among locals and visitors alike.';
      }
      
      const mockData = {
        text: mockResponse,
        usage: {
          prompt_tokens: prompt.length / 4,
          completion_tokens: mockResponse.length / 4,
          total_tokens: (prompt.length + mockResponse.length) / 4,
        },
      };
      
      // Cache the mock data
      await cacheService.setCacheItem(cacheKey, mockData, cacheService.EXPIRATION.LONG);
      
      return { data: mockData, error: null };
    }
    
    // Prepare request body
    const body = {
      model: options.model || MODEL,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500,
    };
    
    // Determine API endpoint and headers
    let apiUrl, headers;
    
    if (USE_OPENROUTER) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'VibeFinder',
      };
    } else {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      };
    }
    
    // Call the API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract text from response
    const text = responseData.choices[0].message.content;
    
    const data = {
      text,
      usage: responseData.usage,
    };
    
    // Cache the result
    await cacheService.setCacheItem(cacheKey, data, cacheService.EXPIRATION.LONG);
    
    return { data, error: null };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { data: null, error };
  }
};

/**
 * Generate a recommendation description
 * @param {Object} venue - Venue data
 * @param {Object} videoData - Video data
 * @returns {Promise<Object>} - { data, error }
 */
export const generateRecommendationDescription = async (venue, videoData) => {
  const prompt = `
    Generate a concise, engaging description for a local venue recommendation based on the following information:
    
    Venue: ${venue.name}
    Location: ${venue.address}
    Categories: ${venue.categories.join(', ')}
    
    Video Content:
    ${videoData.summary || ''}
    ${videoData.transcript || ''}
    
    The description should be 1-2 sentences, highlight what makes this place special, and why it's trending.
  `;
  
  const systemPrompt = `
    You are an AI that creates compelling, concise venue descriptions for a local recommendation app.
    Your descriptions should be engaging, authentic, and highlight what makes a place special.
    Focus on the atmosphere, experience, and unique aspects that would appeal to users.
    Keep descriptions short (1-2 sentences) but impactful.
  `;
  
  return generateText(prompt, { systemPrompt, temperature: 0.7, maxTokens: 100 });
};

/**
 * Categorize venue by vibe
 * @param {Object} venue - Venue data
 * @param {Object} videoData - Video data
 * @returns {Promise<Object>} - { data, error }
 */
export const categorizeVenueVibe = async (venue, videoData) => {
  const prompt = `
    Based on the following information about a venue and video content, identify the top 2-4 "vibe tags" that best describe this place.
    
    Venue: ${venue.name}
    Location: ${venue.address}
    Categories: ${venue.categories.join(', ')}
    
    Video Content:
    ${videoData.summary || ''}
    ${videoData.transcript || ''}
    
    Choose from these vibe tags:
    chill, lively, upscale, casual, romantic, family-friendly, trendy, nostalgic, artsy, energetic, intimate, social, quiet, loud, outdoor, cozy
    
    Return only the selected tags as a comma-separated list.
  `;
  
  const systemPrompt = `
    You are an AI that categorizes venues by their "vibe" based on video content and venue information.
    You should select 2-4 tags that best represent the atmosphere and experience of the venue.
    Return only the selected tags as a comma-separated list, nothing else.
  `;
  
  const { data, error } = await generateText(prompt, { systemPrompt, temperature: 0.3, maxTokens: 50 });
  
  if (error || !data) {
    return { data: null, error: error || new Error('Failed to categorize venue vibe') };
  }
  
  // Parse the comma-separated list into an array
  const vibeTags = data.text.split(',').map(tag => tag.trim().toLowerCase());
  
  return { data: { vibe_tags: vibeTags }, error: null };
};

/**
 * Generate mock recommendations
 * @param {number} count - Number of recommendations to generate
 * @param {Object} location - Location to center recommendations around
 * @returns {Promise<Object>} - { data, error }
 */
export const generateMockRecommendations = async (count = 10, location = { latitude: 37.7749, longitude: -122.4194 }) => {
  const prompt = `
    Generate ${count} mock recommendations for trending local spots in San Francisco.
    For each recommendation, include:
    1. A catchy title
    2. A brief description (1-2 sentences)
    3. A venue name
    4. A location within San Francisco
    5. 2-4 vibe tags from this list: chill, lively, upscale, casual, romantic, family-friendly, trendy, nostalgic, artsy, energetic, intimate, social, quiet, loud, outdoor, cozy
    
    Format the response as a JSON array of objects.
  `;
  
  const systemPrompt = `
    You are an AI that generates realistic mock data for a local recommendation app.
    Your recommendations should feel authentic and diverse, covering different types of venues and experiences.
    Return the data as a valid JSON array of objects with the following structure:
    [
      {
        "title": "string",
        "description": "string",
        "venue_name": "string",
        "location": "string",
        "vibe_tags": ["string", "string"]
      }
    ]
  `;
  
  const { data, error } = await generateText(prompt, { systemPrompt, temperature: 0.8, maxTokens: 1000 });
  
  if (error || !data) {
    return { data: null, error: error || new Error('Failed to generate mock recommendations') };
  }
  
  try {
    // Parse the JSON response
    const recommendations = JSON.parse(data.text);
    
    // Add additional fields to each recommendation
    const enhancedRecommendations = recommendations.map((rec, index) => {
      // Generate random coordinates within ~5km of the center
      const lat = location.latitude + (Math.random() - 0.5) * 0.1;
      const lng = location.longitude + (Math.random() - 0.5) * 0.1;
      
      // Generate random trend score (70-100)
      const trendScore = Math.floor(Math.random() * 30) + 70;
      
      // Generate random timestamp within the last week
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        ...rec,
        recommendationId: `mock-${index}`,
        social_media_url: `https://example.com/social/${index}`,
        trend_score: trendScore,
        image_url: `https://picsum.photos/seed/${index}/400/300`,
        video_url: index % 3 === 0 ? `https://example.com/video/${index}` : null,
        latitude: lat,
        longitude: lng,
        timestamp: timestamp,
        venueId: `venue-${index}`,
      };
    });
    
    return { data: enhancedRecommendations, error: null };
  } catch (error) {
    console.error('Error parsing mock recommendations:', error);
    return { data: null, error };
  }
};

/**
 * Match user preferences to venue recommendations
 * @param {string[]} userPreferences - User's vibe preferences
 * @param {Object[]} recommendations - Available recommendations
 * @returns {Promise<Object>} - { data, error }
 */
export const matchUserPreferencesToVenues = async (userPreferences, recommendations) => {
  if (!userPreferences || userPreferences.length === 0) {
    return { data: recommendations, error: null };
  }
  
  try {
    // Simple matching algorithm - no need for OpenAI API call
    const scoredRecommendations = recommendations.map(rec => {
      // Calculate match score based on overlap between user preferences and recommendation vibe tags
      const vibeTags = rec.vibe_tags || [];
      const matchCount = userPreferences.filter(pref => vibeTags.includes(pref)).length;
      const matchScore = matchCount / Math.max(userPreferences.length, 1);
      
      // Combine match score with trend score for final ranking
      // Weight: 70% match score, 30% trend score
      const finalScore = (matchScore * 0.7) + ((rec.trend_score / 100) * 0.3);
      
      return {
        ...rec,
        matchScore: finalScore,
      };
    });
    
    // Sort by final score (descending)
    const sortedRecommendations = scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    return { data: sortedRecommendations, error: null };
  } catch (error) {
    console.error('Error matching preferences to venues:', error);
    return { data: recommendations, error };
  }
};

export default {
  generateText,
  generateRecommendationDescription,
  categorizeVenueVibe,
  generateMockRecommendations,
  matchUserPreferencesToVenues,
};


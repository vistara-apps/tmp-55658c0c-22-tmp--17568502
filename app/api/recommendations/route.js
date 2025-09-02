import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import RecommendationModel from '@/lib/models/recommendation';
import UserModel from '@/lib/models/user';
import VenueModel from '@/lib/models/venue';
import openaiService from '@/lib/services/openai';
import ensembleDataService from '@/lib/services/ensembleData';
import socialKitService from '@/lib/services/socialKit';
import googleMapsService from '@/lib/services/googleMaps';

/**
 * GET /api/recommendations
 * Get recommendations with optional filtering
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');
    const vibeTags = searchParams.get('vibeTags')?.split(',');
    const minTrendScore = searchParams.get('minTrendScore');
    const limit = searchParams.get('limit');
    const userId = searchParams.get('userId');
    
    // Build filters object
    const filters = {};
    
    if (latitude && longitude) {
      filters.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: radius ? parseFloat(radius) : 5, // Default 5km radius
      };
    }
    
    if (vibeTags && vibeTags.length > 0) {
      filters.vibe_tags = vibeTags;
    }
    
    if (minTrendScore) {
      filters.min_trend_score = parseFloat(minTrendScore);
    }
    
    if (limit) {
      filters.limit = parseInt(limit);
    }
    
    // Get recommendations from database
    const { data, error } = await RecommendationModel.getAll(filters);
    
    if (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }
    
    // If user ID is provided, personalize recommendations
    if (userId && data.length > 0) {
      // Get user preferences
      const { data: userData, error: userError } = await UserModel.getById(userId);
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return NextResponse.json(data);
      }
      
      if (userData && userData.preferences && userData.preferences.length > 0) {
        // Check if user has premium subscription for personalized matching
        const isPremium = await UserModel.isPremium(userId);
        
        if (isPremium) {
          // Use OpenAI to match user preferences to recommendations
          const { data: personalizedRecs, error: matchError } = await openaiService.matchUserPreferencesToVenues(
            userData.preferences,
            data
          );
          
          if (!matchError && personalizedRecs) {
            return NextResponse.json(personalizedRecs);
          }
        } else {
          // Basic filtering for non-premium users
          const filteredRecs = data.filter(rec =>
            userData.preferences.some(pref => rec.vibe_tags.includes(pref))
          );
          
          if (filteredRecs.length > 0) {
            return NextResponse.json(filteredRecs);
          }
        }
      }
    }
    
    // If no personalization or it failed, return all recommendations
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/recommendations
 * Create a new recommendation
 */
export async function POST(request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.venue_name || !body.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If coordinates not provided, geocode the address
    if (!body.latitude || !body.longitude) {
      const { data: geoData, error: geoError } = await googleMapsService.geocodeAddress(
        `${body.venue_name}, ${body.location}`
      );
      
      if (geoError) {
        return NextResponse.json({ error: 'Failed to geocode address' }, { status: 400 });
      }
      
      body.latitude = geoData.latitude;
      body.longitude = geoData.longitude;
    }
    
    // Create or update venue
    const { data: venueData, error: venueError } = await VenueModel.createOrUpdate({
      name: body.venue_name,
      address: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      categories: body.categories || [],
    });
    
    if (venueError) {
      return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
    }
    
    // Create recommendation
    const { data: recData, error: recError } = await RecommendationModel.create({
      ...body,
      venueId: venueData.venueId,
      trend_score: body.trend_score || 70, // Default trend score
      timestamp: new Date().toISOString(),
    });
    
    if (recError) {
      return NextResponse.json({ error: 'Failed to create recommendation' }, { status: 500 });
    }
    
    return NextResponse.json(recData, { status: 201 });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * For development/demo purposes only
 * Generate mock recommendations
 */
export async function PUT(request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    const count = body.count || 5;
    const location = body.location || { latitude: 37.7749, longitude: -122.4194 }; // Default to SF
    
    // Generate mock recommendations
    const { data: mockRecs, error: mockError } = await openaiService.generateMockRecommendations(count, location);
    
    if (mockError) {
      return NextResponse.json({ error: 'Failed to generate mock recommendations' }, { status: 500 });
    }
    
    // Save mock recommendations to database
    const savedRecs = [];
    
    for (const rec of mockRecs) {
      // Create or update venue
      const { data: venueData } = await VenueModel.createOrUpdate({
        name: rec.venue_name,
        address: rec.location,
        latitude: rec.latitude,
        longitude: rec.longitude,
        categories: [],
      });
      
      if (venueData) {
        // Create recommendation
        const { data: recData } = await RecommendationModel.create({
          ...rec,
          venueId: venueData.venueId,
        });
        
        if (recData) {
          savedRecs.push(recData);
        }
      }
    }
    
    return NextResponse.json(savedRecs);
  } catch (error) {
    console.error('Error generating mock recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

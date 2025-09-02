import { NextResponse } from 'next/server';
import VenueModel from '@/lib/models/venue';
import RecommendationModel from '@/lib/models/recommendation';

/**
 * GET /api/venues/[id]
 * Get venue by ID
 */
export async function GET(request, { params }) {
  try {
    // Get venue data from database
    const { data, error } = await VenueModel.getById(params.id);
    
    if (error) {
      console.error('Error fetching venue data:', error);
      return NextResponse.json({ error: 'Failed to fetch venue data' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    
    // Get recommendations for this venue
    const { data: recommendations, error: recError } = await RecommendationModel.getByVenueId(params.id);
    
    if (recError) {
      console.error('Error fetching venue recommendations:', recError);
      // Continue with venue data only
    } else {
      // Add recommendations to venue data
      data.recommendations = recommendations || [];
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in venues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


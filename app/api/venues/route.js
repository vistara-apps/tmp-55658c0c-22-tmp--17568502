import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import VenueModel from '@/lib/models/venue';
import googleMapsService from '@/lib/services/googleMaps';

/**
 * GET /api/venues
 * Search venues by query or get venues by category
 */
export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const radius = searchParams.get('radius');
    
    // Search by query
    if (query) {
      const { data, error } = await VenueModel.search(query);
      
      if (error) {
        console.error('Error searching venues:', error);
        return NextResponse.json({ error: 'Failed to search venues' }, { status: 500 });
      }
      
      return NextResponse.json(data);
    }
    
    // Get venues by category
    if (category) {
      const { data, error } = await VenueModel.getByCategory(category);
      
      if (error) {
        console.error('Error fetching venues by category:', error);
        return NextResponse.json({ error: 'Failed to fetch venues by category' }, { status: 500 });
      }
      
      return NextResponse.json(data);
    }
    
    // Get venues near location
    if (latitude && longitude) {
      const { data, error } = await VenueModel.getNearby(
        parseFloat(latitude),
        parseFloat(longitude),
        radius ? parseFloat(radius) : 5 // Default 5km radius
      );
      
      if (error) {
        console.error('Error fetching nearby venues:', error);
        return NextResponse.json({ error: 'Failed to fetch nearby venues' }, { status: 500 });
      }
      
      return NextResponse.json(data);
    }
    
    // If no parameters provided, return error
    return NextResponse.json({ error: 'Missing search parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in venues API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/venues
 * Create a new venue
 */
export async function POST(request) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // If coordinates not provided, geocode the address
    if (!body.latitude || !body.longitude) {
      const { data: geoData, error: geoError } = await googleMapsService.geocodeAddress(
        `${body.name}, ${body.address}`
      );
      
      if (geoError) {
        return NextResponse.json({ error: 'Failed to geocode address' }, { status: 400 });
      }
      
      body.latitude = geoData.latitude;
      body.longitude = geoData.longitude;
    }
    
    // Create or update venue
    const { data, error } = await VenueModel.createOrUpdate({
      name: body.name,
      address: body.address,
      latitude: body.latitude,
      longitude: body.longitude,
      categories: body.categories || [],
    });
    
    if (error) {
      console.error('Error creating venue:', error);
      return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


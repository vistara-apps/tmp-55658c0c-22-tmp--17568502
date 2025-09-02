import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import UserModel from '@/lib/models/user';
import RecommendationModel from '@/lib/models/recommendation';

/**
 * GET /api/users/[id]/saved-locations
 * Get user's saved locations
 */
export async function GET(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to view their own saved locations
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get saved recommendations
    const { data, error } = await RecommendationModel.getSavedByUser(params.id);
    
    if (error) {
      console.error('Error fetching saved locations:', error);
      return NextResponse.json({ error: 'Failed to fetch saved locations' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in saved locations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/users/[id]/saved-locations
 * Save a location
 */
export async function POST(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to save to their own saved locations
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get request body
    const body = await request.json();
    
    if (!body.recommendationId) {
      return NextResponse.json({ error: 'Missing recommendationId' }, { status: 400 });
    }
    
    // Check if recommendation exists
    const { data: recData, error: recError } = await RecommendationModel.getById(body.recommendationId);
    
    if (recError || !recData) {
      console.error('Error fetching recommendation:', recError);
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }
    
    // Save location
    const { data, error } = await UserModel.saveLocation(params.id, body.recommendationId);
    
    if (error) {
      console.error('Error saving location:', error);
      return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]/saved-locations
 * Remove a saved location
 */
export async function DELETE(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to remove from their own saved locations
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('recommendationId');
    
    if (!recommendationId) {
      return NextResponse.json({ error: 'Missing recommendationId' }, { status: 400 });
    }
    
    // Remove saved location
    const { data, error } = await UserModel.removeSavedLocation(params.id, recommendationId);
    
    if (error) {
      console.error('Error removing saved location:', error);
      return NextResponse.json({ error: 'Failed to remove saved location' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error removing saved location:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


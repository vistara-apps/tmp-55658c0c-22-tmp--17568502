import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import RecommendationModel from '@/lib/models/recommendation';
import analyticsService from '@/lib/services/analytics';

/**
 * GET /api/recommendations/[id]
 * Get recommendation by ID
 */
export async function GET(request, { params }) {
  try {
    // Get recommendation data from database
    const { data, error } = await RecommendationModel.getById(params.id);
    
    if (error) {
      console.error('Error fetching recommendation data:', error);
      return NextResponse.json({ error: 'Failed to fetch recommendation data' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }
    
    // Track recommendation view
    await analyticsService.trackRecommendationView(params.id);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/recommendations/[id]
 * Update recommendation
 */
export async function PATCH(request, { params }) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get request body
    const body = await request.json();
    
    // Get existing recommendation
    const { data: existingRec, error: getError } = await RecommendationModel.getById(params.id);
    
    if (getError || !existingRec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }
    
    // Update recommendation
    const { data, error } = await RecommendationModel.createOrUpdate({
      ...existingRec,
      ...body,
      recommendationId: params.id,
    });
    
    if (error) {
      console.error('Error updating recommendation:', error);
      return NextResponse.json({ error: 'Failed to update recommendation' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/recommendations/[id]
 * Delete recommendation
 */
export async function DELETE(request, { params }) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Delete recommendation
    const { data, error } = await RecommendationModel.delete(params.id);
    
    if (error) {
      console.error('Error deleting recommendation:', error);
      return NextResponse.json({ error: 'Failed to delete recommendation' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


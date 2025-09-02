import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import UserModel from '@/lib/models/user';

/**
 * GET /api/users/[id]
 * Get user data by ID
 */
export async function GET(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user data from database
    const { data, error } = await UserModel.getById(params.id);
    
    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Remove sensitive data if not the current user
    if (currentUser.id !== params.id) {
      // Only return public data
      const publicData = {
        userId: data.userId,
        preferences: data.preferences,
      };
      
      return NextResponse.json(publicData);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/users/[id]/preferences
 * Update user preferences
 */
export async function PATCH(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to update their own preferences
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get request body
    const body = await request.json();
    
    if (!body.preferences || !Array.isArray(body.preferences)) {
      return NextResponse.json({ error: 'Invalid preferences format' }, { status: 400 });
    }
    
    // Update user preferences
    const { data, error } = await UserModel.updatePreferences(params.id, body.preferences);
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return NextResponse.json({ error: 'Failed to update user preferences' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/users/[id]/onboarding
 * Complete user onboarding
 */
export async function POST(request, { params }) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow users to update their own onboarding status
    if (currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Complete user onboarding
    const { data, error } = await UserModel.completeOnboarding(params.id);
    
    if (error) {
      console.error('Error completing user onboarding:', error);
      return NextResponse.json({ error: 'Failed to complete user onboarding' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error completing user onboarding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


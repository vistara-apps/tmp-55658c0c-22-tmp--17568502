import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import UserModel from '@/lib/models/user';

/**
 * GET /api/users
 * Get current user data
 */
export async function GET() {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user data from database
    const { data, error } = await UserModel.getById(user.id);
    
    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
    
    if (!data) {
      // User exists in auth but not in database, create a new user record
      const { data: newUser, error: createError } = await UserModel.createOrUpdate(user.id);
      
      if (createError) {
        console.error('Error creating user data:', createError);
        return NextResponse.json({ error: 'Failed to create user data' }, { status: 500 });
      }
      
      return NextResponse.json(newUser);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/users
 * Update user data
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
    
    // Update user data
    const { data, error } = await UserModel.createOrUpdate(user.id, body);
    
    if (error) {
      console.error('Error updating user data:', error);
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


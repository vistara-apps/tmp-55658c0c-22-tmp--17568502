import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import UserModel from '@/lib/models/user';

/**
 * GET /api/subscriptions
 * Get current user's subscription status
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if subscription is active
    const isPremium = await UserModel.isPremium(user.id);
    
    // Return subscription data
    const subscriptionData = {
      tier: data.subscription_tier || 'free',
      expiry: data.subscription_expiry,
      isActive: isPremium,
      features: isPremium ? [
        'Advanced filtering',
        'Personalized vibe matching',
        'Unlimited saved locations',
        'Ad-free experience',
        'Priority recommendations'
      ] : [
        'Basic filtering',
        'Limited saved locations',
        'Standard recommendations'
      ]
    };
    
    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Error in subscriptions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/subscriptions
 * Create or update user subscription
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
    if (!body.tier || !['free', 'premium'].includes(body.tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }
    
    // Calculate expiry date (1 month from now for premium)
    const expiryDate = body.tier === 'premium' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
      : null;
    
    // Update user subscription
    const { data, error } = await UserModel.updateSubscription(user.id, body.tier, expiryDate);
    
    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
    
    // Return updated subscription data
    const subscriptionData = {
      tier: data.subscription_tier,
      expiry: data.subscription_expiry,
      isActive: data.subscription_tier === 'premium' && new Date(data.subscription_expiry) > new Date(),
      features: data.subscription_tier === 'premium' ? [
        'Advanced filtering',
        'Personalized vibe matching',
        'Unlimited saved locations',
        'Ad-free experience',
        'Priority recommendations'
      ] : [
        'Basic filtering',
        'Limited saved locations',
        'Standard recommendations'
      ]
    };
    
    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


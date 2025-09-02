import { NextResponse } from 'next/server';
import { getCurrentUser } from './supabase';

/**
 * Authentication middleware
 * Checks if user is authenticated and adds user to request
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} - Next.js response object
 */
export async function authMiddleware(request) {
  try {
    // Get current authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add user to request
    request.user = user;
    
    // Continue to handler
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}

/**
 * Error handling middleware
 * Catches errors and returns appropriate response
 * @param {Function} handler - Route handler function
 * @returns {Function} - Wrapped handler function
 */
export function withErrorHandling(handler) {
  return async (request, ...args) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Combine authentication and error handling middleware
 * @param {Function} handler - Route handler function
 * @returns {Function} - Wrapped handler function
 */
export function withAuth(handler) {
  return withErrorHandling(async (request, ...args) => {
    const authResponse = await authMiddleware(request);
    
    if (authResponse) {
      return authResponse;
    }
    
    return await handler(request, ...args);
  });
}

export default {
  authMiddleware,
  withErrorHandling,
  withAuth,
};


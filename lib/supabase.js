import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} - User object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Sign in with wallet
 * @param {string} address - Wallet address
 * @returns {Promise<Object>} - Auth response
 */
export const signInWithWallet = async (address) => {
  try {
    // In a real implementation, this would use Supabase Auth with wallet providers
    // For now, we'll simulate it for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth] Sign in with wallet: ${address}`);
      
      // Simulate a successful sign-in
      return {
        data: {
          user: {
            id: address,
            wallet_address: address,
          },
          session: {
            access_token: 'simulated_token',
          },
        },
        error: null,
      };
    }
    
    // In production, use Supabase Auth
    const { data, error } = await supabase.auth.signInWithWallet({
      address,
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in with wallet:', error);
    return { data: null, error };
  }
};

/**
 * Sign out
 * @returns {Promise<Object>} - Auth response
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    return { error };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Function that executes a Supabase query
 * @returns {Promise<Object>} - { data, error }
 */
export const executeQuery = async (queryFn) => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      console.error('Supabase query error:', result.error);
      return { data: null, error: result.error };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    console.error('Supabase query execution error:', error);
    return { data: null, error };
  }
};

export default {
  supabase,
  getCurrentUser,
  signInWithWallet,
  signOut,
  executeQuery,
};


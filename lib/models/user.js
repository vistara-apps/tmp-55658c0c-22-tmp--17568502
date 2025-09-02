import { supabase, executeQuery } from '../supabase';

/**
 * User Model
 * Handles user data operations
 */
const UserModel = {
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - { data, error }
   */
  getById: async (userId) => {
    return executeQuery(() => 
      supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single()
    );
  },
  
  /**
   * Create or update user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - { data, error }
   */
  createOrUpdate: async (userId, userData = {}) => {
    const defaults = {
      preferences: [],
      saved_locations: [],
      onboarding_complete: false,
      subscription_tier: 'free',
      subscription_expiry: null,
    };
    
    const data = {
      userId,
      ...defaults,
      ...userData,
      updated_at: new Date().toISOString(),
    };
    
    return executeQuery(() => 
      supabase
        .from('users')
        .upsert(data)
        .select()
        .single()
    );
  },
  
  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {string[]} preferences - User preferences
   * @returns {Promise<Object>} - { data, error }
   */
  updatePreferences: async (userId, preferences) => {
    return executeQuery(() => 
      supabase
        .from('users')
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('userId', userId)
        .select()
        .single()
    );
  },
  
  /**
   * Complete user onboarding
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - { data, error }
   */
  completeOnboarding: async (userId) => {
    return executeQuery(() => 
      supabase
        .from('users')
        .update({
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('userId', userId)
        .select()
        .single()
    );
  },
  
  /**
   * Update user subscription
   * @param {string} userId - User ID
   * @param {string} tier - Subscription tier
   * @param {string} expiry - Subscription expiry date
   * @returns {Promise<Object>} - { data, error }
   */
  updateSubscription: async (userId, tier, expiry) => {
    return executeQuery(() => 
      supabase
        .from('users')
        .update({
          subscription_tier: tier,
          subscription_expiry: expiry,
          updated_at: new Date().toISOString(),
        })
        .eq('userId', userId)
        .select()
        .single()
    );
  },
  
  /**
   * Check if user has premium subscription
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if premium
   */
  isPremium: async (userId) => {
    const { data, error } = await executeQuery(() => 
      supabase
        .from('users')
        .select('subscription_tier, subscription_expiry')
        .eq('userId', userId)
        .single()
    );
    
    if (error || !data) {
      return false;
    }
    
    return (
      data.subscription_tier === 'premium' &&
      data.subscription_expiry &&
      new Date(data.subscription_expiry) > new Date()
    );
  },
  
  /**
   * Save a location to user's saved locations
   * @param {string} userId - User ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<Object>} - { data, error }
   */
  saveLocation: async (userId, recommendationId) => {
    // Get current saved locations
    const { data: userData, error: userError } = await UserModel.getById(userId);
    
    if (userError || !userData) {
      return { data: null, error: userError || new Error('User not found') };
    }
    
    // Check if location is already saved
    const savedLocations = userData.saved_locations || [];
    
    if (savedLocations.includes(recommendationId)) {
      return { data: userData, error: null };
    }
    
    // Add location to saved locations
    const updatedLocations = [...savedLocations, recommendationId];
    
    return executeQuery(() => 
      supabase
        .from('users')
        .update({
          saved_locations: updatedLocations,
          updated_at: new Date().toISOString(),
        })
        .eq('userId', userId)
        .select()
        .single()
    );
  },
  
  /**
   * Remove a location from user's saved locations
   * @param {string} userId - User ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<Object>} - { data, error }
   */
  removeSavedLocation: async (userId, recommendationId) => {
    // Get current saved locations
    const { data: userData, error: userError } = await UserModel.getById(userId);
    
    if (userError || !userData) {
      return { data: null, error: userError || new Error('User not found') };
    }
    
    // Remove location from saved locations
    const savedLocations = userData.saved_locations || [];
    const updatedLocations = savedLocations.filter(id => id !== recommendationId);
    
    return executeQuery(() => 
      supabase
        .from('users')
        .update({
          saved_locations: updatedLocations,
          updated_at: new Date().toISOString(),
        })
        .eq('userId', userId)
        .select()
        .single()
    );
  },
};

export default UserModel;


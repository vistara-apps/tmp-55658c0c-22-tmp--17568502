'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling async operations with loading and error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {boolean} immediate - Whether to execute the function immediately
 * @param {Array} deps - Dependencies array for useEffect
 * @returns {Object} - { execute, loading, error, value, reset }
 */
export default function useAsync(asyncFunction, immediate = false, deps = []) {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(null);
  
  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await asyncFunction(...params);
      setValue(result);
      
      return result;
    } catch (error) {
      setError(error);
      console.error('Error in useAsync:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);
  
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setValue(null);
  }, []);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...deps]);
  
  return { execute, loading, error, value, reset };
}


'use client';

import { useState } from 'react';

export default function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  if (hasError) {
    return fallback ? (
      fallback(error)
    ) : (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold mb-2">Something went wrong</h3>
        <p className="text-red-600">{error?.message || 'An unexpected error occurred'}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          onClick={() => setHasError(false)}
        >
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <div
      onError={(error) => {
        console.error('Error caught by ErrorBoundary:', error);
        setError(error);
        setHasError(true);
      }}
    >
      {children}
    </div>
  );
}


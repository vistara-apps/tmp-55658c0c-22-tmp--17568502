'use client';

import { useState, useEffect } from 'react';
import VibeTag from './VibeTag';

export default function VenueDetails({ venueId, onClose }) {
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);
  
  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/venues/${venueId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch venue details');
      }
      
      const data = await response.json();
      setVenue(data);
    } catch (error) {
      console.error('Error fetching venue details:', error);
      setError('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-surface p-6 rounded-lg shadow-modal max-w-md w-full">
          <p className="text-center">Loading venue details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-surface p-6 rounded-lg shadow-modal max-w-md w-full">
          <p className="text-center text-red-500">{error}</p>
          <div className="flex justify-center mt-4">
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!venue) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface p-6 rounded-lg shadow-modal max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="heading">{venue.name}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <p className="mb-4">{venue.address}</p>
        
        {venue.categories && venue.categories.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap">
              {venue.categories.map((category) => (
                <span
                  key={category}
                  className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md mr-2 mb-2 text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {venue.recommendations && venue.recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Trending Recommendations</h3>
            <div className="space-y-4">
              {venue.recommendations.map((rec) => (
                <div key={rec.recommendationId} className="border rounded-md p-3">
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm mb-2">{rec.description}</p>
                  <div className="flex flex-wrap">
                    {rec.vibe_tags.map((tag) => (
                      <VibeTag key={tag} tag={tag} />
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Trend score: {rec.trend_score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            className="bg-primary text-white px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


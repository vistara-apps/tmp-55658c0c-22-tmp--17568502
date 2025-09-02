'use client';

import { useState } from 'react';
import VibeTag from './VibeTag';

export default function RecommendationCard({ rec, onSave, onViewOnMap }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleSave = async (e) => {
    e.stopPropagation(); // Prevent card expansion toggle
    
    if (saved) return; // Already saved
    
    setSaving(true);
    
    try {
      await onSave(rec.recommendationId);
      setSaved(true);
    } catch (error) {
      console.error('Error saving recommendation:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleViewOnMap = (e) => {
    e.stopPropagation(); // Prevent card expansion toggle
    if (onViewOnMap) {
      onViewOnMap(rec);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="surface rounded-lg shadow-card p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-start">
        <h3 className="heading">{rec.title}</h3>
        <div className="flex items-center">
          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {rec.trend_score}% trending
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-2">
        {rec.venue_name} • {formatDate(rec.timestamp)}
      </p>
      
      <p className="mb-2">{rec.description}</p>
      
      <div className="flex flex-wrap mb-2">
        {rec.vibe_tags.slice(0, 3).map((tag) => (
          <VibeTag key={tag} tag={tag} />
        ))}
        {rec.vibe_tags.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md mr-2 mb-2">
            +{rec.vibe_tags.length - 3} more
          </span>
        )}
      </div>
      
      <div className="flex justify-between mt-2">
        <button
          onClick={handleViewOnMap}
          className="text-primary hover:underline text-sm flex items-center"
        >
          <span className="mr-1">📍</span> View on map
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className={`text-sm px-3 py-1 rounded-md ${
            saved
              ? 'bg-green-100 text-green-800'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t pt-4">
          {rec.video_url ? (
            <video src={rec.video_url} controls className="w-full rounded-md mb-3" />
          ) : rec.image_url ? (
            <img src={rec.image_url} alt={rec.title} className="w-full rounded-md mb-3" />
          ) : null}
          
          <div className="text-sm">
            <p className="font-medium">Location:</p>
            <p className="mb-2">{rec.location}</p>
            
            {rec.social_media_url && (
              <a
                href={rec.social_media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block mb-2"
                onClick={(e) => e.stopPropagation()}
              >
                View original social media post
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

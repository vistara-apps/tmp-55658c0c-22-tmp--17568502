'use client';

import { useState } from 'react';

const VIBE_OPTIONS = [
  'chill',
  'lively',
  'upscale',
  'casual',
  'romantic',
  'family-friendly',
  'trendy',
  'nostalgic',
  'artsy',
  'energetic',
  'intimate',
  'social',
  'quiet',
  'loud',
  'outdoor',
  'cozy',
];

export default function FilterPanel({ onFilter, isPremium = false }) {
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [radius, setRadius] = useState(5);
  const [minTrendScore, setMinTrendScore] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleVibeSelect = (vibe) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      // Limit non-premium users to 2 vibe filters
      if (!isPremium && selectedVibes.length >= 2) {
        alert('Upgrade to premium to select more vibe filters');
        return;
      }
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };
  
  const handleApplyFilters = () => {
    onFilter({
      vibes: selectedVibes,
      radius,
      minTrendScore: isPremium ? minTrendScore : 0,
    });
    setIsOpen(false);
  };
  
  const handleClearFilters = () => {
    setSelectedVibes([]);
    setRadius(5);
    setMinTrendScore(0);
    onFilter({
      vibes: [],
      radius: 5,
      minTrendScore: 0,
    });
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button
          className="flex items-center text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="mr-1">{isOpen ? '▼' : '▶'}</span>
          Filters {selectedVibes.length > 0 && `(${selectedVibes.length})`}
        </button>
        
        {selectedVibes.length > 0 && (
          <button
            className="text-sm text-gray-500"
            onClick={handleClearFilters}
          >
            Clear all
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="bg-surface p-4 rounded-lg shadow-card mb-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Vibe</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIBE_OPTIONS.map((vibe) => (
                <button
                  key={vibe}
                  className={`p-2 text-sm rounded-md border ${
                    selectedVibes.includes(vibe)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-black border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => handleVibeSelect(vibe)}
                >
                  {vibe}
                </button>
              ))}
            </div>
            {!isPremium && (
              <p className="text-xs text-gray-500 mt-2">
                Upgrade to premium for more filter options
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Distance (km)</h3>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>{radius} km</span>
              <span>20 km</span>
            </div>
          </div>
          
          {isPremium && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Trending Score</h3>
              <input
                type="range"
                min="0"
                max="100"
                value={minTrendScore}
                onChange={(e) => setMinTrendScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Any</span>
                <span>{minTrendScore > 0 ? `${minTrendScore}+` : 'Any'}</span>
                <span>100</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              className="bg-primary text-white px-4 py-2 rounded-md"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


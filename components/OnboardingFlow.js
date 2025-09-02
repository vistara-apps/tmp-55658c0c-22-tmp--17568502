'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

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

export default function OnboardingFlow({ onComplete }) {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleVibeSelect = (vibe) => {
    if (preferences.includes(vibe)) {
      setPreferences(preferences.filter(p => p !== vibe));
    } else {
      if (preferences.length < 5) {
        setPreferences([...preferences, vibe]);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (preferences.length === 0) {
      setError('Please select at least one vibe preference');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update user preferences
      const response = await fetch(`/api/users/${address}/preferences`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      // Complete onboarding
      const completeResponse = await fetch(`/api/users/${address}/onboarding`, {
        method: 'POST',
      });
      
      if (!completeResponse.ok) {
        throw new Error('Failed to complete onboarding');
      }
      
      // Call onComplete callback
      if (onComplete) {
        onComplete(preferences);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-surface p-6 rounded-lg shadow-card max-w-md mx-auto">
      <h2 className="heading text-center mb-4">Personalize Your Experience</h2>
      
      {step === 1 && (
        <>
          <p className="body text-center mb-6">
            Select up to 5 vibes that match your preferences to get personalized recommendations.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {VIBE_OPTIONS.map((vibe) => (
              <button
                key={vibe}
                className={`p-2 rounded-md border ${
                  preferences.includes(vibe)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-black border-gray-200 hover:border-primary'
                }`}
                onClick={() => handleVibeSelect(vibe)}
              >
                {vibe}
              </button>
            ))}
          </div>
          
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          
          <div className="flex justify-center">
            <button
              className="bg-primary text-white px-6 py-2 rounded-md disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}


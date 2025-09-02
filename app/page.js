    'use client';

    import { useState, useEffect } from 'react';
    import { useAccount } from 'wagmi';
    import { ConnectWallet } from '@coinbase/onchainkit/wallet';
    import AppHeader from '../components/AppHeader';
    import RecommendationCard from '../components/RecommendationCard';
    import VibeTag from '../components/VibeTag';
    import Map from '../components/Map';

    export const dynamic = 'force-dynamic';

    export default function Home() {
      const { address, isConnected } = useAccount();
      const [recommendations, setRecommendations] = useState([]);
      const [userPreferences, setUserPreferences] = useState([]);
      const [onboardingComplete, setOnboardingComplete] = useState(false);
      const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to SF
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (isConnected && address) {
          fetchUserData(address);
          fetchRecommendations();
        }
      }, [isConnected, address]);

      const fetchUserData = async (userId) => {
        // In real app, fetch from Supabase
        // For demo, mock
        const mockUser = {
          preferences: ['chill', 'lively'],
          saved_locations: [],
          onboarding_complete: false,
        };
        setUserPreferences(mockUser.preferences);
        setOnboardingComplete(mockUser.onboarding_complete);
        if (!mockUser.onboarding_complete) {
          // Prompt for preferences
          const prefs = prompt('Enter your vibe preferences (comma-separated):');
          if (prefs) {
            setUserPreferences(prefs.split(','));
            // Save to Supabase
            setOnboardingComplete(true);
          }
        }
      };

      const fetchRecommendations = async () => {
        setLoading(true);
        // In real app, call API route to get curated recommendations
        const res = await fetch('/api/recommendations');
        const data = await res.json();
        setRecommendations(data);
        setLoading(false);
      };

      const handleSave = (recId) => {
        // Save to user's saved_locations in Supabase
        console.log(`Saved recommendation ${recId}`);
      };

      const filteredRecs = recommendations.filter(rec =>
        userPreferences.some(pref => rec.vibe_tags.includes(pref))
      );

      return (
        <div className="container">
          <AppHeader />
          {!isConnected ? (
            <div className="flex justify-center mt-8">
              <ConnectWallet />
            </div>
          ) : (
            <>
              {!onboardingComplete && <p className="text-center">Complete onboarding to personalize</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="heading">Trending Spots</h2>
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    filteredRecs.map((rec) => (
                      <RecommendationCard
                        key={rec.recommendationId}
                        rec={rec}
                        onSave={handleSave}
                      />
                    ))
                  )}
                </div>
                <div className="h-96">
                  <Map center={center} recommendations={filteredRecs} />
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
  
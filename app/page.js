'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import AppHeader from '../components/AppHeader';
import RecommendationCard from '../components/RecommendationCard';
import Map from '../components/Map';
import OnboardingFlow from '../components/OnboardingFlow';
import UserProfile from '../components/UserProfile';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import ErrorBoundary from '../components/ErrorBoundary';
import Notification from '../components/Notification';
import useAsync from '../lib/hooks/useAsync';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [recommendations, setRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to SF
  const [filters, setFilters] = useState({ vibes: [], radius: 5, minTrendScore: 0 });
  const [isPremium, setIsPremium] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);
  
  // Use custom hook for async operations
  const { 
    loading: userLoading, 
    error: userError,
    execute: fetchUserData 
  } = useAsync(async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserPreferences(data.preferences || []);
      setOnboardingComplete(data.onboarding_complete || false);
      
      // Check subscription status
      const subResponse = await fetch('/api/subscriptions');
      
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setIsPremium(subData.isActive);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  });
  
  const { 
    loading: recsLoading, 
    error: recsError,
    execute: fetchRecommendations 
  } = useAsync(async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (address) {
        params.append('userId', address);
      }
      
      if (filters.vibes.length > 0) {
        params.append('vibeTags', filters.vibes.join(','));
      }
      
      if (center.lat && center.lng) {
        params.append('latitude', center.lat);
        params.append('longitude', center.lng);
        params.append('radius', filters.radius);
      }
      
      if (isPremium && filters.minTrendScore > 0) {
        params.append('minTrendScore', filters.minTrendScore);
      }
      
      // Fetch recommendations
      const response = await fetch(`/api/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setRecommendations(data);
      
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  });
  
  // Fetch user data and recommendations when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchUserData(address);
      fetchRecommendations();
      
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }
  }, [isConnected, address]);
  
  // Refetch recommendations when filters change
  useEffect(() => {
    if (isConnected) {
      fetchRecommendations();
    }
  }, [filters, center]);
  
  const handleSave = useCallback(async (recId) => {
    try {
      if (!isConnected || !address) {
        setNotification({
          message: 'Please connect your wallet to save recommendations',
          type: 'warning',
        });
        return;
      }
      
      const response = await fetch(`/api/users/${address}/saved-locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendationId: recId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save recommendation');
      }
      
      setNotification({
        message: 'Recommendation saved successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving recommendation:', error);
      setNotification({
        message: 'Failed to save recommendation',
        type: 'error',
      });
    }
  }, [isConnected, address]);
  
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  const handleViewOnMap = useCallback((rec) => {
    setSelectedRec(rec);
    setCenter({
      lat: parseFloat(rec.latitude),
      lng: parseFloat(rec.longitude),
    });
  }, []);
  
  const handleOnboardingComplete = useCallback((preferences) => {
    setUserPreferences(preferences);
    setOnboardingComplete(true);
    fetchRecommendations();
    
    setNotification({
      message: 'Onboarding completed! Your recommendations are now personalized.',
      type: 'success',
    });
  }, []);
  
  const toggleProfile = useCallback(() => {
    setShowProfile(!showProfile);
  }, [showProfile]);
  
  const loading = userLoading || recsLoading;
  const error = userError || recsError;
  
  return (
    <ErrorBoundary>
      <div className="container pb-8">
        <AppHeader onProfileClick={toggleProfile} />
        
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center mt-16">
            <h1 className="display mb-4">Welcome to VibeFinder</h1>
            <p className="body text-center max-w-md mb-8">
              Stop doomscrolling, start discovering: Your AI guide to trending local spots.
            </p>
            <ConnectWallet />
          </div>
        ) : (
          <>
            {!onboardingComplete ? (
              <div className="mt-8">
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              </div>
            ) : (
              <div className="mt-4">
                {showProfile ? (
                  <UserProfile />
                ) : (
                  <>
                    <FilterPanel
                      onFilter={handleFilterChange}
                      isPremium={isPremium}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h2 className="heading mb-4">Trending Spots</h2>
                        {loading ? (
                          <LoadingState message="Finding the best spots for you..." />
                        ) : error ? (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600">Failed to load recommendations</p>
                            <button
                              className="mt-2 text-primary"
                              onClick={() => fetchRecommendations()}
                            >
                              Try again
                            </button>
                          </div>
                        ) : recommendations.length === 0 ? (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                            <p>No recommendations found with the current filters.</p>
                            <button
                              className="mt-2 text-primary"
                              onClick={() => setFilters({ vibes: [], radius: 5, minTrendScore: 0 })}
                            >
                              Clear filters
                            </button>
                          </div>
                        ) : (
                          recommendations.map((rec) => (
                            <RecommendationCard
                              key={rec.recommendationId}
                              rec={rec}
                              onSave={handleSave}
                              onViewOnMap={handleViewOnMap}
                            />
                          ))
                        )}
                      </div>
                      <div className="h-[600px] sticky top-4">
                        <Map
                          center={center}
                          recommendations={recommendations}
                          onMarkerClick={setSelectedRec}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
        
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

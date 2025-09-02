'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import VibeTag from './VibeTag';

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
      fetchSubscription();
    }
  }, [isConnected, address]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const response = await fetch(`/api/users/${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data);
      
      // Fetch saved locations
      if (data.saved_locations && data.saved_locations.length > 0) {
        const savedResponse = await fetch(`/api/recommendations?ids=${data.saved_locations.join(',')}`);
        
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          setSavedLocations(savedData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };
  
  const handleUpgradeSubscription = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: 'premium' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to upgrade subscription');
      }
      
      const data = await response.json();
      setSubscription(data);
      
      alert('Subscription upgraded to premium!');
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setError('Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center p-4">Loading profile...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }
  
  if (!userData) {
    return <div className="text-center p-4">No user data found</div>;
  }
  
  return (
    <div className="bg-surface p-6 rounded-lg shadow-card">
      <h2 className="heading mb-4">Your Profile</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Your Vibe Preferences</h3>
        <div className="flex flex-wrap">
          {userData.preferences && userData.preferences.length > 0 ? (
            userData.preferences.map((tag) => (
              <VibeTag key={tag} tag={tag} />
            ))
          ) : (
            <p>No preferences set</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Subscription</h3>
        {subscription ? (
          <div>
            <p>Current tier: <span className="font-bold">{subscription.tier}</span></p>
            {subscription.tier === 'premium' && (
              <p>Expires: {new Date(subscription.expiry).toLocaleDateString()}</p>
            )}
            <div className="mt-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="list-disc pl-5">
                {subscription.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            {subscription.tier === 'free' && (
              <button
                className="bg-primary text-white px-4 py-2 rounded-md mt-4"
                onClick={handleUpgradeSubscription}
                disabled={loading}
              >
                Upgrade to Premium
              </button>
            )}
          </div>
        ) : (
          <p>Loading subscription information...</p>
        )}
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Saved Locations</h3>
        {savedLocations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {savedLocations.map((location) => (
              <div key={location.recommendationId} className="border rounded-md p-3">
                <h4 className="font-medium">{location.title}</h4>
                <p className="text-sm">{location.venue_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved locations</p>
        )}
      </div>
    </div>
  );
}


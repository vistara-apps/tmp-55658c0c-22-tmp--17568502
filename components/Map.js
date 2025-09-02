'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import MapPin from './MapPin';
import VenueDetails from './VenueDetails';

const mapStyles = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export default function Map({ center, recommendations, onMarkerClick }) {
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showVenueDetails, setShowVenueDetails] = useState(false);
  const mapRef = useRef(null);
  
  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);
  
  const handleMarkerClick = (recommendation) => {
    if (onMarkerClick) {
      onMarkerClick(recommendation);
    }
    
    // Pan to the marker
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(recommendation.latitude),
        lng: parseFloat(recommendation.longitude),
      });
    }
    
    setSelectedVenue(recommendation.venueId);
    setShowVenueDetails(true);
  };
  
  const closeVenueDetails = () => {
    setShowVenueDetails(false);
  };
  
  return (
    <>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={13}
          center={center}
          options={mapOptions}
          onLoad={onLoad}
        >
          {recommendations.map((rec) => (
            <OverlayView
              key={rec.recommendationId}
              position={{ lat: parseFloat(rec.latitude), lng: parseFloat(rec.longitude) }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <MapPin
                active={selectedVenue === rec.venueId}
                onClick={() => handleMarkerClick(rec)}
                label={rec.trend_score >= 90 ? '🔥 Trending' : null}
              />
            </OverlayView>
          ))}
        </GoogleMap>
      </LoadScript>
      
      {showVenueDetails && selectedVenue && (
        <VenueDetails
          venueId={selectedVenue}
          onClose={closeVenueDetails}
        />
      )}
    </>
  );
}

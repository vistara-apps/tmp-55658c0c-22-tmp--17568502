    'use client';

    import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

    const mapStyles = { width: '100%', height: '100%' };

    export default function Map({ center, recommendations }) {
      return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={center}>
            {recommendations.map((rec) => (
              <Marker
                key={rec.recommendationId}
                position={{ lat: parseFloat(rec.latitude), lng: parseFloat(rec.longitude) }}
                title={rec.title}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      );
    }
  
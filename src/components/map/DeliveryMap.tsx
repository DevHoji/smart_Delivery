import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194, // San Francisco default
};

interface LocationPoint {
  lat: number;
  lng: number;
}

interface AgentLocationPoint extends LocationPoint {
  agentId: string;
  timestamp: Date;
}

interface DeliveryMapProps {
  pickupLocation?: LocationPoint;
  deliveryLocation?: LocationPoint;
  agentLocations?: AgentLocationPoint[];
  className?: string;
  origin?: string; // For backward compatibility
  destination?: string; // For backward compatibility
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  pickupLocation,
  deliveryLocation,
  agentLocations = [],
  className,
  origin,
  destination,
}) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const onMapLoad = useCallback(() => {
    // Map is loaded and available for manipulation if needed
  }, []);

  // If we have direct coordinates, use them instead of geocoding
  useEffect(() => {
    if (pickupLocation?.lat && pickupLocation.lng) {
      setOriginCoords({ lat: pickupLocation.lat, lng: pickupLocation.lng });
    }
    
    if (deliveryLocation?.lat && deliveryLocation.lng) {
      setDestinationCoords({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });
    }
  }, [pickupLocation, deliveryLocation]);

  // Geocode addresses if direct coordinates aren't provided
  useEffect(() => {
    if (isLoaded && origin && destination && !pickupLocation && !deliveryLocation) {
      const geocoder = new google.maps.Geocoder();
      
      // Geocode origin
      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setOriginCoords({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocode origin was not successful:', status);
        }
      });
      
      // Geocode destination
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setDestinationCoords({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocode destination was not successful:', status);
        }
      });
    }
  }, [isLoaded, origin, destination, pickupLocation, deliveryLocation]);

  // Calculate and display the route when origin and destination coordinates are available
  useEffect(() => {
    if (isLoaded && originCoords && destinationCoords) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: originCoords,
          destination: destinationCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }
  }, [isLoaded, originCoords, destinationCoords]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  // Get latest agent location for centering if available
  const latestAgentLocation = agentLocations.length > 0 
    ? { lat: agentLocations[0].lat, lng: agentLocations[0].lng } 
    : null;

  // Determine map center (preference order: agent location, pickup location, delivery location, default)
  const mapCenter = latestAgentLocation || originCoords || destinationCoords || defaultCenter;

  return (
    <div className={`rounded-lg overflow-hidden ${className || ''}`} style={{ height: "100%" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onMapLoad}
      >
        {directions && <DirectionsRenderer directions={directions} />}
        
        {/* Origin/Pickup Marker */}
        {originCoords && (
          <Marker
            position={originCoords}
            icon={{
              url: '/images/pickup-marker.svg',
              scaledSize: new google.maps.Size(30, 30),
            }}
          />
        )}
        
        {/* Destination/Delivery Marker */}
        {destinationCoords && (
          <Marker
            position={destinationCoords}
            icon={{
              url: '/images/delivery-marker.svg',
              scaledSize: new google.maps.Size(30, 30),
            }}
          />
        )}
        
        {/* Agent Location Markers */}
        {agentLocations.map((location, index) => (
          <Marker
            key={`agent-${location.agentId}-${index}`}
            position={{ lat: location.lat, lng: location.lng }}
            icon={{
              url: '/images/agent-marker.svg',
              scaledSize: new google.maps.Size(30, 30),
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default DeliveryMap;

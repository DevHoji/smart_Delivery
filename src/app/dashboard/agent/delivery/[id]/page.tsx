'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import DeliveryMap from '@/components/map/DeliveryMap';
import ChatInterface from '@/components/chat/ChatInterface';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import { useSession } from 'next-auth/react';
import { Delivery, Message, Location, DeliveryStatus } from '@/types';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  Calendar, 
  Clock,
  QrCode,
  CheckCircle,
  PackageCheck,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import QRCode from 'qrcode';

export default function AgentDeliveryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState('');
  const [qrScanning, setQrScanning] = useState(false);
  
  // Fetch delivery details
  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        // Fetch delivery
        const deliveryResponse = await fetch(`/api/deliveries/${id}`);
        if (!deliveryResponse.ok) {
          throw new Error('Failed to fetch delivery details');
        }
        const deliveryData = await deliveryResponse.json();
        setDelivery(deliveryData);
        
        // Fetch messages
        const messagesResponse = await fetch(`/api/chat?deliveryId=${id}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData);
        }
        
        // Fetch locations
        const locationsResponse = await fetch(`/api/locations?deliveryId=${id}`);
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData);
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching delivery details:', error);
        setError(error.message || 'An unexpected error occurred');
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDeliveryDetails();
    }
  }, [id]);
  
  // Get agent's current location for tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
        },
        (error) => {
          setLocationError(
            'Error getting your location. Please enable location services to update delivery locations.'
          );
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported in your browser');
    }
  }, []);
  
  // Update delivery status
  const handleUpdateStatus = async (newStatus: DeliveryStatus) => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: delivery?.id,
          status: newStatus
        }),
      });
      
      if (response.ok) {
        // Update the delivery status
        const updatedDelivery = await response.json();
        setDelivery(updatedDelivery);
        
        // If the status is updated to IN_PROGRESS, also update location
        if (newStatus === 'IN_PROGRESS' && currentLocation) {
          await updateDeliveryLocation();
        }
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };
  
  // Accept delivery
  const handleAcceptDelivery = async () => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: delivery?.id,
          agentId: session?.user.id,
          status: 'ACCEPTED'
        }),
      });
      
      if (response.ok) {
        // Update the delivery
        const updatedDelivery = await response.json();
        setDelivery(updatedDelivery);
      } else {
        console.error('Failed to accept delivery');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };
  
  // Update delivery location
  const updateDeliveryLocation = async () => {
    if (!currentLocation || !delivery) {
      console.error('Cannot update location: current location not available');
      return;
    }
    
    try {
      const { latitude, longitude } = currentLocation.coords;
      
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveryId: delivery.id,
          latitude,
          longitude,
        }),
      });
      
      if (response.ok) {
        // Fetch updated locations
        const locationsResponse = await fetch(`/api/locations?deliveryId=${delivery.id}`);
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData);
        }
      } else {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };
  
  // Start QR code scanner
  const startQRScanner = () => {
    setQrScanning(true);
    
    // In a real app, this would initialize a camera feed and QR scanner
    // For now, we'll simulate it by checking if the delivery has a QR code
    if (delivery?.qrCode) {
      // Simulate a successful scan after 2 seconds
      setTimeout(() => {
        handleUpdateStatus('DELIVERED');
        setQrScanning(false);
      }, 2000);
    } else {
      alert('QR code not available for this delivery.');
      setQrScanning(false);
    }
  };
  
  // Status badge color mapping
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    PICKED_UP: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !delivery) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700">Error</h2>
        <p className="text-red-600 mt-2">{error || 'Delivery not found'}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  // Get latest location
  const latestLocation = locations.length > 0 ? locations[0] : null;
  
  // Determine available actions based on delivery status
  const isMyDelivery = delivery.agentId === session?.user.id;
  const canAccept = delivery.status === 'PENDING' && !delivery.agentId;
  const canPickUp = isMyDelivery && delivery.status === 'ACCEPTED';
  const canStartDelivery = isMyDelivery && delivery.status === 'PICKED_UP';
  const canMarkDelivered = isMyDelivery && delivery.status === 'IN_PROGRESS';
  const canUpdateLocation = isMyDelivery && delivery.status === 'IN_PROGRESS' && !!currentLocation;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
        </Button>
        <h1 className="text-3xl font-bold">Delivery Details</h1>
      </div>
      
      {locationError && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Location Services Issue</p>
          <p>{locationError}</p>
        </div>
      )}
      
      {/* Status and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[delivery.status]}`}>
            {delivery.status.replace('_', ' ')}
          </span>
          <span className="ml-4 text-gray-500">
            ID: {delivery.id.slice(0, 8)}...
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canAccept && (
            <Button
              variant="default"
              onClick={handleAcceptDelivery}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Accept Delivery
            </Button>
          )}
          
          {canPickUp && (
            <Button
              variant="default"
              onClick={() => handleUpdateStatus('PICKED_UP')}
              className="flex items-center"
            >
              <PackageCheck className="h-4 w-4 mr-1" /> Mark as Picked Up
            </Button>
          )}
          
          {canStartDelivery && (
            <Button
              variant="default"
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              className="flex items-center"
            >
              <Truck className="h-4 w-4 mr-1" /> Start Delivery
            </Button>
          )}
          
          {canMarkDelivered && (
            <Button
              variant="default"
              onClick={startQRScanner}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              <QrCode className="h-4 w-4 mr-1" /> 
              {qrScanning ? 'Scanning...' : 'Scan QR & Complete'}
            </Button>
          )}
          
          {canUpdateLocation && (
            <Button
              variant="outline"
              onClick={updateDeliveryLocation}
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1" /> Update Location
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Delivery Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryMap 
                origin={delivery.origin}
                destination={delivery.destination}
                agentLocation={latestLocation ? {
                  id: latestLocation.id,
                  latitude: latestLocation.latitude,
                  longitude: latestLocation.longitude,
                  agentId: latestLocation.agentId,
                  deliveryId: latestLocation.deliveryId,
                  timestamp: latestLocation.timestamp,
                } : undefined}
                className="h-96"
              />
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Pickup Location</p>
                    <p className="text-gray-600">{delivery.origin}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Delivery Location</p>
                    <p className="text-gray-600">{delivery.destination}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Package Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Package Details</h3>
                  <p className="mt-1">{delivery.packageInfo || 'No package details provided'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Additional Instructions</h3>
                  <p className="mt-1">{delivery.description || 'None'}</p>
                </div>
                
                {delivery.imageUrl && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Package Image</h3>
                    <img 
                      src={delivery.imageUrl} 
                      alt="Package" 
                      className="mt-2 max-h-60 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Customer Name</p>
                    <p className="text-gray-600">{delivery.sender?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Contact Email</p>
                    <p className="text-gray-600">{delivery.sender?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Location History */}
          {locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Location History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                        <MapPin className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          Location Updated
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(location.timestamp), 'PPpp')}
                          {' '}({formatDistanceToNow(new Date(location.timestamp), { addSuffix: true })})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <QrCode className="h-5 w-5 mr-2 text-primary" />
                Delivery QR Code
              </CardTitle>
              <CardDescription>
                Scan to complete delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              {delivery.qrCode ? (
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <img 
                    src={delivery.qrCode} 
                    alt="Delivery QR Code" 
                    className="h-48 w-48"
                  />
                  <p className="text-center mt-2 text-sm text-gray-500">
                    Delivery ID: {delivery.id.slice(0, 8)}...
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">QR code not available</p>
              )}
            </CardContent>
          </Card>
          
          {/* Chat with Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Chat with Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChatInterface
                deliveryId={delivery.id}
                currentUser={session?.user as any}
                initialMessages={messages}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

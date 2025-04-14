'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import DeliveryMap from '@/components/map/DeliveryMap';
import ChatInterface from '@/components/chat/ChatInterface';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import { useSession } from 'next-auth/react';
import { Delivery, Message, Location } from '@/types';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Truck, 
  Calendar, 
  Clock,
  QrCode,
  FileText
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import jsPDF from 'jspdf';

export default function DeliveryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
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
  
  // Handle generating a delivery receipt PDF
  const generateDeliveryReceipt = () => {
    if (!delivery) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Delivery Receipt', 105, 20, { align: 'center' });
    
    // Add delivery details
    doc.setFontSize(12);
    doc.text(`Delivery ID: ${delivery.id}`, 20, 40);
    doc.text(`Status: ${delivery.status}`, 20, 50);
    doc.text(`Origin: ${delivery.origin}`, 20, 60);
    doc.text(`Destination: ${delivery.destination}`, 20, 70);
    
    if (delivery.packageInfo) {
      doc.text(`Package Info: ${delivery.packageInfo}`, 20, 80);
    }
    
    if (delivery.description) {
      doc.text(`Additional Instructions: ${delivery.description}`, 20, 90);
    }
    
    doc.text(`Created: ${format(new Date(delivery.createdAt), 'PPP')}`, 20, 100);
    
    if (delivery.agentId) {
      doc.text(`Delivery Agent: ${delivery.agent?.name}`, 20, 110);
    }
    
    // Add QR code if available
    if (delivery.qrCode) {
      const img = new Image();
      img.src = delivery.qrCode;
      doc.addImage(img, 'PNG', 70, 120, 70, 70);
    }
    
    // Add footer
    doc.setFontSize(10);
    const today = format(new Date(), 'PPP');
    doc.text(`Generated on ${today}`, 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`delivery-receipt-${delivery.id.slice(0, 8)}.pdf`);
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateDeliveryReceipt}
            className="flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" /> Export Receipt
          </Button>
          
          {delivery.status === 'PENDING' && (
            <Button
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={async () => {
                if (!confirm('Are you sure you want to cancel this delivery?')) {
                  return;
                }
                
                try {
                  const response = await fetch('/api/deliveries', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id: delivery.id,
                      status: 'CANCELLED',
                    }),
                  });
                  
                  if (response.ok) {
                    setDelivery({ ...delivery, status: 'CANCELLED' });
                  } else {
                    console.error('Failed to cancel delivery');
                  }
                } catch (error) {
                  console.error('Error cancelling delivery:', error);
                }
              }}
            >
              Cancel Delivery
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
          
          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-gray-600">
                      {format(new Date(delivery.createdAt), 'PPpp')}
                      {' '}({formatDistanceToNow(new Date(delivery.createdAt), { addSuffix: true })})
                    </p>
                  </div>
                </div>
                
                {delivery.status !== 'PENDING' && delivery.agentId && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-purple-100 p-2 rounded-full">
                      <Truck className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Assigned to Agent</p>
                      <p className="text-gray-600">
                        {delivery.agent?.name || 'Unknown Agent'}
                      </p>
                    </div>
                  </div>
                )}
                
                {latestLocation && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">Last Updated Location</p>
                      <p className="text-gray-600">
                        {formatDistanceToNow(new Date(latestLocation.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
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
                For verification at delivery
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
          
          {/* Chat with Agent */}
          {delivery.agentId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  Chat with Agent
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
          )}
        </div>
      </div>
    </div>
  );
}

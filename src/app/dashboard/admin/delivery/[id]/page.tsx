'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import DeliveryMap from '@/components/map/DeliveryMap';
import Image from 'next/image';
import { Delivery, Message, Location, User, DeliveryStatus } from '@/types';
import { 
  ArrowLeft, 
  MapPin, 
  Package,  
  Clock,
  QrCode,
  User as UserIcon, 
  FileText,
  Edit,
  Trash
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function AdminDeliveryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  
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
        
        // Fetch agents (for reassignment)
        const agentsResponse = await fetch('/api/users?role=AGENT');
        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json();
          setAgents(agentsData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching delivery details:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchDeliveryDetails();
    }
  }, [id]);
  
  // Handle assigning the delivery to an agent
  const handleAssignDelivery = async () => {
    if (!selectedAgent || !delivery) {
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
          agentId: selectedAgent,
          status: 'ACCEPTED',
        }),
      });
      
      if (response.ok) {
        const updatedDelivery = await response.json();
        setDelivery(updatedDelivery);
        setSelectedAgent('');
      } else {
        console.error('Failed to assign delivery');
      }
    } catch (error) {
      console.error('Error assigning delivery:', error);
    }
  };
  
  // Handle updating delivery status
  const handleUpdateStatus = async (newStatus: DeliveryStatus) => {
    if (!delivery) return;
    
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: delivery.id,
          status: newStatus
        }),
      });
      
      if (response.ok) {
        const updatedDelivery = await response.json();
        setDelivery(updatedDelivery);
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };
  
  // Handle deleting the delivery
  const handleDeleteDelivery = async () => {
    if (!delivery) return;
    
    if (window.confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/deliveries/${delivery.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/dashboard/admin');
        } else {
          console.error('Failed to delete delivery');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
      }
    }
  };
  
  // Handle generating a delivery receipt PDF
  const generateDeliveryReceipt = async () => {
    // Implementation for generating PDF receipt
    // This would typically use a library like jsPDF or react-pdf
    console.log('Generating receipt for delivery', delivery?.id);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }
  
  if (error || !delivery) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <p className="text-xl font-semibold text-destructive">
          {error || 'Delivery not found'}
        </p>
        <Button 
          onClick={() => router.push('/dashboard/admin')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Delivery Details</h1>
            <p className="text-gray-500">
              Tracking ID: {delivery.trackingId || delivery.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => generateDeliveryReceipt()}
            className="flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" /> Generate Receipt
          </Button>
          
          <Button
            onClick={() => router.push(`/dashboard/admin/delivery/${delivery.id}/edit`)}
            className="flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          
          <Button
            onClick={handleDeleteDelivery}
            className="flex items-center bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
        ${delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${delivery.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : ''}
        ${delivery.status === 'IN_TRANSIT' ? 'bg-indigo-100 text-indigo-800' : ''}
        ${delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
        ${delivery.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
        `}>
          {delivery.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div className="flex">
                  <div className="mr-3 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                    <p className="font-medium">{delivery.pickupAddress || delivery.origin}</p>
                  </div>
                </div>
                
                {/* Delivery Location */}
                <div className="flex">
                  <div className="mr-3 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Delivery Location</p>
                    <p className="font-medium">{delivery.deliveryAddress || delivery.destination}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
                {/* Package Details */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Package Details</p>
                  <p className="font-medium">{delivery.packageDescription || delivery.packageInfo || 'No description available'}</p>
                  {(delivery.weight || delivery.dimensions) && (
                    <p className="text-sm">
                      {delivery.weight && `Weight: ${delivery.weight} kg`} 
                      {delivery.weight && delivery.dimensions && ' • '} 
                      {delivery.dimensions && `Size: ${delivery.dimensions}`}
                    </p>
                  )}
                </div>
                
                {/* Delivery Time */}
                <div>
                  <p className="text-sm font-medium text-gray-500">Delivery Timeline</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <p>
                      Created: {format(new Date(delivery.createdAt), 'PPp')}
                    </p>
                  </div>
                  {delivery.estimatedDelivery && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      <p>
                        Expected: {format(new Date(delivery.estimatedDelivery), 'PPp')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              {delivery.notes && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500">Delivery Notes</p>
                  <p>{delivery.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Map Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Delivery Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] rounded-md overflow-hidden border">
                {locations.length > 0 ? (
                  <DeliveryMap 
                    pickupLocation={delivery.pickupLat && delivery.pickupLng ? {
                      lat: delivery.pickupLat,
                      lng: delivery.pickupLng,
                    } : undefined}
                    deliveryLocation={delivery.deliveryLat && delivery.deliveryLng ? {
                      lat: delivery.deliveryLat,
                      lng: delivery.deliveryLng,
                    } : undefined}
                    agentLocations={locations.map(loc => ({
                      lat: loc.latitude,
                      lng: loc.longitude,
                      agentId: loc.agentId,
                      timestamp: loc.timestamp,
                    }))}
                    origin={delivery.origin}
                    destination={delivery.destination}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center flex-col">
                    <p className="text-gray-500">No location data available</p>
                    <p className="text-sm text-gray-400">Location tracking will be available once an agent accepts the delivery</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Agent Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Agent Assignment
              </CardTitle>
              <CardDescription>
                {delivery.agent 
                  ? `Currently assigned to ${delivery.agent.name}`
                  : "Not assigned to any agent yet"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {delivery.agent ? (
                <div className="flex items-center">
                  {delivery.agent.image ? (
                    <div className="relative h-10 w-10 rounded-full mr-3 overflow-hidden">
                      <Image
                        src={delivery.agent.image}
                        alt={delivery.agent.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{delivery.agent.name}</p>
                    <p className="text-sm text-gray-500">{delivery.agent.email}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Agent
                    </label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="border rounded-md px-3 py-2 w-full"
                    >
                      <option value="">-- Select an agent --</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    onClick={handleAssignDelivery}
                    disabled={!selectedAgent}
                    className="w-full"
                  >
                    Assign Agent
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Update Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Button
                  onClick={() => handleUpdateStatus('PENDING')}
                  className="bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Pending
                </Button>
                
                <Button
                  onClick={() => handleUpdateStatus('ACCEPTED')}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Accepted
                </Button>
                
                <Button
                  onClick={() => handleUpdateStatus('IN_TRANSIT')}
                  className="bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  In Transit
                </Button>
                
                <Button
                  onClick={() => handleUpdateStatus('DELIVERED')}
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Delivered
                </Button>
                
                <Button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  Cancelled
                </Button>
                
                <Button
                  onClick={() => handleUpdateStatus('RETURNED')}
                  className="bg-gray-500 text-white hover:bg-gray-600"
                >
                  Returned
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {delivery.statusUpdates && delivery.statusUpdates.length > 0 ? (
                  delivery.statusUpdates.map((update, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-foreground border-2 border-primary flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        {index < (delivery.statusUpdates?.length || 0) - 1 && (
                          <div className="h-full w-0.5 bg-gray-200 my-1"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{update.status.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(update.timestamp), 'PPp')}
                        </p>
                        {update.notes && (
                          <p className="text-sm mt-1">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No status updates recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserIcon className="h-5 w-5 mr-2 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  {delivery.sender?.image ? (
                    <div className="relative h-10 w-10 rounded-full mr-3 overflow-hidden">
                      <Image
                        src={delivery.sender.image}
                        alt={delivery.sender.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{delivery.sender?.name}</p>
                    <p className="text-sm text-gray-500">{delivery.sender?.email}</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">
                    Account created {formatDistanceToNow(new Date(delivery.sender?.createdAt || new Date()), { addSuffix: true })}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total deliveries: {/* This would be calculated from the backend */}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                  <div className="relative h-48 w-48">
                    <Image 
                      src={delivery.qrCode} 
                      alt="Delivery QR Code"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-center mt-2 text-sm text-gray-500">
                    Delivery ID: {delivery.id.slice(0, 8)}...
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">QR code not available</p>
              )}
            </CardContent>
          </Card>
          
          {/* Communication History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No messages exchanged yet</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">{message.sender?.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm mt-1">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Truck,
  CheckCircle,
  Clock,
  Search,
  PackageCheck,
  PackageX,
  Eye,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Delivery, DeliveryStatus } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgentDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL');
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState('');
  
  // Fetch deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/deliveries');
        if (response.ok) {
          const data = await response.json();
          setDeliveries(data);
        } else {
          console.error('Failed to fetch deliveries');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        setIsLoading(false);
      }
    };
    
    fetchDeliveries();
  }, []);
  
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
  
  // Filter deliveries based on search term and status filter
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Group deliveries by status
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING' && !d.agentId);
  const myAssignedDeliveries = deliveries.filter(d => 
    d.agentId === session?.user.id && 
    ['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'].includes(d.status)
  );
  const completedDeliveries = deliveries.filter(d => 
    d.agentId === session?.user.id && 
    ['DELIVERED', 'CANCELLED'].includes(d.status)
  );
  
  // Stats for the dashboard
  const stats = {
    total: myAssignedDeliveries.length + completedDeliveries.length,
    pending: pendingDeliveries.length,
    inProgress: myAssignedDeliveries.length,
    completed: completedDeliveries.filter(d => d.status === 'DELIVERED').length,
  };
  
  // Handle accepting a delivery
  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deliveryId,
          agentId: session?.user.id,
          status: 'ACCEPTED'
        }),
      });
      
      if (response.ok) {
        // Update the deliveries list
        const updatedDelivery = await response.json();
        setDeliveries(deliveries.map(d => 
          d.id === deliveryId ? updatedDelivery : d
        ));
      } else {
        console.error('Failed to accept delivery');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };
  
  // Handle updating delivery status
  const handleUpdateStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deliveryId,
          status: newStatus
        }),
      });
      
      if (response.ok) {
        // Update the deliveries list
        const updatedDelivery = await response.json();
        setDeliveries(deliveries.map(d => 
          d.id === deliveryId ? updatedDelivery : d
        ));
        
        // If the status is updated to IN_PROGRESS, also update location
        if (newStatus === 'IN_PROGRESS' && currentLocation) {
          await updateDeliveryLocation(deliveryId);
        }
      } else {
        console.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };
  
  // Update delivery location
  const updateDeliveryLocation = async (deliveryId: string) => {
    if (!currentLocation) {
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
          deliveryId,
          latitude,
          longitude,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };
  
  // Status badge color mapping
  const statusColors: Record<DeliveryStatus, string> = {
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
      </div>
      
      {locationError && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Location Services Issue</p>
          <p>{locationError}</p>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center py-4">
            <Truck className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-gray-500">My Deliveries</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <Clock className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <Truck className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Available Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Available Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDeliveries.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No available deliveries</h3>
              <p className="mt-1 text-gray-500">
                Check back later for new delivery requests.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From / To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="font-medium">{delivery.origin}</div>
                        <div className="text-gray-400">→ {delivery.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/dashboard/agent/delivery/${delivery.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAcceptDelivery(delivery.id)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* My Active Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Truck className="h-5 w-5 mr-2 text-blue-500" />
            My Active Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myAssignedDeliveries.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Truck className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No active deliveries</h3>
              <p className="mt-1 text-gray-500">
                Accept deliveries from the available list to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From / To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myAssignedDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="font-medium">{delivery.origin}</div>
                        <div className="text-gray-400">→ {delivery.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/dashboard/agent/delivery/${delivery.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </Link>
                          
                          {delivery.status === 'ACCEPTED' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(delivery.id, 'PICKED_UP')}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            >
                              <PackageCheck className="h-4 w-4 mr-1" /> Picked Up
                            </Button>
                          )}
                          
                          {delivery.status === 'PICKED_UP' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(delivery.id, 'IN_PROGRESS')}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Truck className="h-4 w-4 mr-1" /> Start Delivery
                            </Button>
                          )}
                          
                          {delivery.status === 'IN_PROGRESS' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleUpdateStatus(delivery.id, 'DELIVERED')}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Mark Delivered
                            </Button>
                          )}
                          
                          {currentLocation && delivery.status === 'IN_PROGRESS' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateDeliveryLocation(delivery.id)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <MapPin className="h-4 w-4 mr-1" /> Update Location
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recently Completed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Recently Completed Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedDeliveries.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No completed deliveries yet</h3>
              <p className="mt-1 text-gray-500">
                Completed deliveries will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From / To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completedDeliveries.slice(0, 5).map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="font-medium">{delivery.origin}</div>
                        <div className="text-gray-400">→ {delivery.destination}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[delivery.status]}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/agent/delivery/${delivery.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

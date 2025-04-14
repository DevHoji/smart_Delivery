'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Package, 
  Plus, 
  Search,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Delivery, DeliveryStatus } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL');
  
  // Fetch user's deliveries
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
  
  // Filter deliveries based on search term and status filter
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'ALL' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Stats for the dashboard
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'PENDING').length,
    inProgress: deliveries.filter(d => ['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'DELIVERED').length,
    cancelled: deliveries.filter(d => d.status === 'CANCELLED').length,
  };
  
  // Handle creating a new delivery
  const handleNewDelivery = () => {
    router.push('/dashboard/user/create');
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
  
  // Handle delivery cancellation
  const handleCancelDelivery = async (deliveryId: string) => {
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
          id: deliveryId,
          status: 'CANCELLED',
        }),
      });
      
      if (response.ok) {
        // Update the deliveries list
        setDeliveries(deliveries.map(d => 
          d.id === deliveryId ? { ...d, status: 'CANCELLED' } : d
        ));
      } else {
        console.error('Failed to cancel delivery');
      }
    } catch (error) {
      console.error('Error cancelling delivery:', error);
    }
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
        <h1 className="text-3xl font-bold">My Deliveries</h1>
        <Button onClick={handleNewDelivery} className="flex items-center">
          <Plus className="h-5 w-5 mr-1" /> New Delivery
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center py-4">
            <Package className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <Clock className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Pending</p>
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
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by origin, destination, or ID..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | 'ALL')}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      
      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-xl font-medium">No deliveries found</h3>
          <p className="mt-1 text-gray-500">
            {deliveries.length === 0
              ? "You haven't created any deliveries yet."
              : "No deliveries match your current filters."}
          </p>
          {deliveries.length === 0 && (
            <Button onClick={handleNewDelivery} className="mt-4">
              Create Your First Delivery
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
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
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.agent ? delivery.agent.name : 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/dashboard/user/delivery/${delivery.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
                        
                        {delivery.status === 'PENDING' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCancelDelivery(delivery.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

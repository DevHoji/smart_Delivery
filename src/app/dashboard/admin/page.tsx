'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  BarChart4,
  User,
  MapPin,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Delivery, User as UserType, DeliveryStatus } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [agents, setAgents] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'deliveries'>('deliveries');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all deliveries
        const deliveriesResponse = await fetch('/api/deliveries');
        if (deliveriesResponse.ok) {
          const deliveriesData = await deliveriesResponse.json();
          setDeliveries(deliveriesData);
        }
        
        // Fetch all users
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Separate users and agents
          setUsers(usersData.filter((user: UserType) => user.role === 'USER'));
          setAgents(usersData.filter((user: UserType) => user.role === 'AGENT'));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter deliveries based on search term
  const filteredDeliveries = deliveries.filter(delivery => {
    return (
      delivery.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.sender?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => {
    return (
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Stats for the dashboard
  const stats = {
    totalUsers: users.length,
    totalAgents: agents.length,
    totalDeliveries: deliveries.length,
    pendingDeliveries: deliveries.filter(d => d.status === 'PENDING').length,
    activeDeliveries: deliveries.filter(d => ['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'].includes(d.status)).length,
    completedDeliveries: deliveries.filter(d => d.status === 'DELIVERED').length,
    cancelledDeliveries: deliveries.filter(d => d.status === 'CANCELLED').length,
  };
  
  // Function to handle delivery assignment to agent
  const handleAssignDelivery = async (deliveryId: string, agentId: string) => {
    try {
      const response = await fetch('/api/deliveries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deliveryId,
          agentId,
          status: 'ACCEPTED',
        }),
      });
      
      if (response.ok) {
        // Update the deliveries list
        const updatedDelivery = await response.json();
        setDeliveries(deliveries.map(d => 
          d.id === deliveryId ? updatedDelivery : d
        ));
      } else {
        console.error('Failed to assign delivery');
      }
    } catch (error) {
      console.error('Error assigning delivery:', error);
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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center py-4">
            <Users className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <Truck className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold">{stats.totalAgents}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <Package className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart4 className="h-5 w-5 mr-2 text-primary" />
            Delivery Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Pending</p>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round((stats.pendingDeliveries / stats.totalDeliveries) * 100)}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.pendingDeliveries}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.pendingDeliveries / stats.totalDeliveries) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Active</p>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round((stats.activeDeliveries / stats.totalDeliveries) * 100)}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.activeDeliveries}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.activeDeliveries / stats.totalDeliveries) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Completed</p>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round((stats.completedDeliveries / stats.totalDeliveries) * 100)}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.completedDeliveries}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.completedDeliveries / stats.totalDeliveries) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Cancelled</p>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  {Math.round((stats.cancelledDeliveries / stats.totalDeliveries) * 100)}%
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.cancelledDeliveries}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.cancelledDeliveries / stats.totalDeliveries) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'deliveries'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('deliveries')}
        >
          <Package className="h-4 w-4 inline-block mr-1" />
          Deliveries
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'users'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <User className="h-4 w-4 inline-block mr-1" />
          Users
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'agents'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('agents')}
        >
          <Truck className="h-4 w-4 inline-block mr-1" />
          Agents
        </button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={`Search ${activeTab}...`}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'deliveries' && (
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
                    User
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
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No deliveries found
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
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
                        {delivery.sender?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {delivery.agent ? delivery.agent.name : 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {delivery.status === 'PENDING' && !delivery.agentId && (
                            <select
                              className="text-sm border rounded p-1"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignDelivery(delivery.id, e.target.value);
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Assign agent</option>
                              {agents.map((agent) => (
                                <option key={agent.id} value={agent.id}>
                                  {agent.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <Link href={`/dashboard/admin/delivery/${delivery.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deliveries.filter(d => d.senderId === user.id).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'agents' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const agentDeliveries = deliveries.filter(d => d.agentId === agent.id);
                    const activeDeliveries = agentDeliveries.filter(d => 
                      ['ACCEPTED', 'PICKED_UP', 'IN_PROGRESS'].includes(d.status)
                    );
                    const completedDeliveries = agentDeliveries.filter(d => d.status === 'DELIVERED');
                    
                    return (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {agent.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {agent.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeDeliveries.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {completedDeliveries.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

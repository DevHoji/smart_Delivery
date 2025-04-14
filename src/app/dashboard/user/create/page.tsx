'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MapPin, Package, Info, Image, ArrowLeft } from 'lucide-react';

export default function CreateDeliveryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    packageInfo: '',
    description: '',
    imageUrl: '',
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!formData.origin || !formData.destination) {
        throw new Error('Origin and destination are required');
      }
      
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create delivery');
      }
      
      // Success - redirect to user dashboard
      router.push('/dashboard/user');
      router.refresh();
      
    } catch (error: any) {
      console.error('Error creating delivery:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
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
        <h1 className="text-3xl font-bold">Create New Delivery</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Delivery Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline-block mr-1" />
                  Origin (Pickup Location) *
                </label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline-block mr-1" />
                  Destination (Delivery Location) *
                </label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="packageInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  <Package className="h-4 w-4 inline-block mr-1" />
                  Package Information
                </label>
                <Input
                  id="packageInfo"
                  name="packageInfo"
                  value={formData.packageInfo}
                  onChange={handleChange}
                  placeholder="Size, weight, type of package"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  <Info className="h-4 w-4 inline-block mr-1" />
                  Additional Instructions
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Special handling instructions, delivery notes, etc."
                />
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  <Image className="h-4 w-4 inline-block mr-1" />
                  Package Image URL (Optional)
                </label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.origin || !formData.destination}
              >
                {isLoading ? 'Creating...' : 'Create Delivery'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

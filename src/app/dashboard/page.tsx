'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Package, Truck, PieChart } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to role-specific dashboard if appropriate
  useEffect(() => {
    if (status === 'authenticated') {
      if (
        (session.user.role === 'ADMIN' && window.location.pathname === '/dashboard') ||
        (session.user.role === 'AGENT' && window.location.pathname === '/dashboard') ||
        (session.user.role === 'USER' && window.location.pathname === '/dashboard')
      ) {
        // Only redirect if they're on the main dashboard
        router.push(`/dashboard/${session.user.role.toLowerCase()}`);
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Smart Delivery Tracker</h1>
      <p className="text-gray-600">
        Select a dashboard to manage your deliveries and track your packages in real-time.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {session?.user.role === 'USER' || session?.user.role === 'ADMIN' ? (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => router.push('/dashboard/user')}>
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="flex items-center text-blue-600">
                <Package className="h-5 w-5 mr-2" />
                User Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Create and track your delivery requests.
              </p>
            </CardContent>
          </Card>
        ) : null}
        
        {session?.user.role === 'AGENT' || session?.user.role === 'ADMIN' ? (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => router.push('/dashboard/agent')}>
            <CardHeader className="bg-green-50 pb-2">
              <CardTitle className="flex items-center text-green-600">
                <Truck className="h-5 w-5 mr-2" />
                Agent Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Manage and fulfill delivery assignments.
              </p>
            </CardContent>
          </Card>
        ) : null}
        
        {session?.user.role === 'ADMIN' ? (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" 
            onClick={() => router.push('/dashboard/admin')}>
            <CardHeader className="bg-purple-50 pb-2">
              <CardTitle className="flex items-center text-purple-600">
                <PieChart className="h-5 w-5 mr-2" />
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600">
                Oversee all platform activities and analytics.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

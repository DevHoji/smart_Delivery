import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';

import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  if (session) {
    // Redirect to appropriate dashboard based on role
    if (session.user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    } else if (session.user.role === 'AGENT') {
      redirect('/dashboard/agent');
    } else {
      redirect('/dashboard/user');
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-10 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your Smart Delivery Tracker account
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-4 text-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

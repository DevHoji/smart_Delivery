import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';

import RegisterForm from '@/components/auth/RegisterForm';

export default async function RegisterPage() {
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
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600">
            Join Smart Delivery Tracker to manage your deliveries
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-4 text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

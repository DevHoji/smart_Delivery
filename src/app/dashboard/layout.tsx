'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  Package, 
  Truck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  BarChart4,
  MessageSquare,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const userRole = session?.user?.role || 'USER';
  
  // Navigation links based on user role
  const navLinks = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      roles: ['USER', 'AGENT', 'ADMIN'],
    },
    {
      label: 'My Deliveries',
      href: '/dashboard/user',
      icon: <Package className="h-5 w-5" />,
      roles: ['USER', 'ADMIN'],
    },
    {
      label: 'Agent Dashboard',
      href: '/dashboard/agent',
      icon: <Truck className="h-5 w-5" />,
      roles: ['AGENT', 'ADMIN'],
    },
    {
      label: 'Admin Panel',
      href: '/dashboard/admin',
      icon: <BarChart4 className="h-5 w-5" />,
      roles: ['ADMIN'],
    },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ['USER', 'AGENT', 'ADMIN'],
    },
    {
      label: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
      roles: ['USER', 'AGENT', 'ADMIN'],
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
      roles: ['USER', 'AGENT', 'ADMIN'],
    },
  ];
  
  // Filter nav links based on user role
  const filteredNavLinks = navLinks.filter(link => 
    link.roles.includes(userRole)
  );
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className={`bg-white shadow-md w-64 fixed inset-y-0 left-0 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b">
            <h2 className="text-2xl font-bold text-primary">Smart Delivery</h2>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Top header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:justify-end">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 md:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">
              {session?.user?.name}
            </span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

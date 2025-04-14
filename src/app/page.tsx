import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Package, Truck, CheckCircle, MapPin, Clock, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">Smart Delivery</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-primary">Features</Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-primary">How It Works</Link>
            <Link href="#contact" className="text-gray-600 hover:text-primary">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
            <div className="md:w-1/2 pt-10 md:pt-0 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Real-time Delivery Tracking Platform
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Track your deliveries in real-time, communicate with drivers, and receive instant updates with our modern delivery management system.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-96">
                <div className="absolute top-0 right-0 w-4/5 h-full bg-white rounded-lg shadow-xl overflow-hidden">
                  <Image
                    src="/images/delivery-map.png"
                    alt="Delivery Map"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </div>
                <div className="absolute bottom-10 left-0 w-3/5 bg-white rounded-lg shadow-lg p-4 z-10">
                  <div className="flex items-center">
                    <div className="rounded-full bg-primary/10 p-3 mr-4">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Package #12345</h3>
                      <p className="text-sm text-green-600">Out for delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Powerful Delivery Features</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform provides everything you need to manage and track deliveries efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
                <p className="text-gray-600">
                  Track your deliveries in real-time with precise location updates on an interactive map
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">QR Verification</h3>
                <p className="text-gray-600">
                  Secure delivery verification with QR code scanning for proof of delivery
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-purple-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Status Updates</h3>
                <p className="text-gray-600">
                  Receive instant notifications and status updates throughout the delivery process
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-yellow-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Agent Dashboard</h3>
                <p className="text-gray-600">
                  Dedicated dashboard for delivery agents to manage and update their assignments
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-indigo-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
                <p className="text-gray-600">
                  Secure role-based access control for customers, agents, and administrators
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <div className="rounded-full bg-red-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Package Info</h3>
                <p className="text-gray-600">
                  Detailed package information and delivery instructions for smooth fulfillment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Our delivery tracking platform is easy to use for both customers and delivery agents
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10">1</div>
                <div className="border border-gray-200 rounded-lg p-6 pl-8 bg-white shadow-sm ml-5">
                  <h3 className="text-xl font-semibold mb-2">Create a Delivery Request</h3>
                  <p className="text-gray-600">
                    Specify pickup and dropoff locations, package details, and any special instructions.
                  </p>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10">2</div>
                <div className="border border-gray-200 rounded-lg p-6 pl-8 bg-white shadow-sm ml-5">
                  <h3 className="text-xl font-semibold mb-2">Agent Assignment</h3>
                  <p className="text-gray-600">
                    Delivery agents accept and manage deliveries through their dedicated dashboard.
                  </p>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10">3</div>
                <div className="border border-gray-200 rounded-lg p-6 pl-8 bg-white shadow-sm ml-5">
                  <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
                  <p className="text-gray-600">
                    Track the delivery in real-time and communicate with the agent via in-app chat.
                  </p>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold z-10">4</div>
                <div className="border border-gray-200 rounded-lg p-6 pl-8 bg-white shadow-sm ml-5">
                  <h3 className="text-xl font-semibold mb-2">Delivery Confirmation</h3>
                  <p className="text-gray-600">
                    QR code verification ensures secure and confirmed delivery at the destination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto">
              Join thousands of users who are already enjoying efficient and transparent delivery tracking
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">Smart Delivery</span>
              </div>
              <p className="text-gray-400">
                Modern delivery tracking platform with real-time updates and secure verification.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Real-time Tracking</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">QR Verification</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Agent Dashboard</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Status Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>123 Street Name, City</li>
                <li>contact@smartdelivery.com</li>
                <li>(123) 456-7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Smart Delivery Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

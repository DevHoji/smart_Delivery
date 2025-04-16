"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Package, Truck, CheckCircle, MapPin, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const featuresRef = useRef(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Package className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Smart Delivery
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center space-x-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Features</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">How It Works</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="#contact" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Contact</Link>
            </motion.div>
          </nav>
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/login">
              <Button variant="outline" className="hover:scale-105 transition-transform">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-105 transition-all duration-300">Sign Up</Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-100 via-blue-50 to-indigo-50 py-20">
          <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 pt-10 md:pt-0 md:pr-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Real-time Delivery
                </span>{" "}
                Tracking Platform
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Track your deliveries in real-time, communicate with drivers, and receive instant updates with our modern delivery management system.
              </p>
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-200">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:scale-105 transition-all duration-300">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-md h-96">
                <motion.div 
                  className="absolute top-0 right-0 w-4/5 h-full bg-white rounded-lg shadow-2xl overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src="/images/delivery-map.png"
                    alt="Delivery Map"
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
                <motion.div 
                  className="absolute bottom-10 left-0 w-3/5 bg-white rounded-lg shadow-xl p-4 z-10"
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center">
                    <div className="rounded-full bg-indigo-100 p-3 mr-4">
                      <Truck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Package #12345</h3>
                      <p className="text-sm text-green-600">Out for delivery</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white" ref={featuresRef}>
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Powerful Delivery Features</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage and track your deliveries with ease
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div 
                className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-8 shadow-lg border border-indigo-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-indigo-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <MapPin className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Real-time Tracking</h3>
                <p className="text-gray-600">
                  Track your deliveries in real-time with precise location updates and estimated arrival times.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 shadow-lg border border-blue-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <CheckCircle className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Verification</h3>
                <p className="text-gray-600">
                  QR code verification ensures secure delivery confirmation with real-time status updates.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-lg border border-purple-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Instant Updates</h3>
                <p className="text-gray-600">
                  Receive instant notifications and status updates at every stage of the delivery process.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-8 shadow-lg border border-emerald-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-emerald-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Payments</h3>
                <p className="text-gray-600">
                  Integrated payment system with secure checkout options and transaction tracking.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-8 shadow-lg border border-amber-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <div className="bg-amber-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Truck className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Agent Dashboard</h3>
                <p className="text-gray-600">
                  Powerful dashboard for delivery agents to manage routes, track deliveries, and communicate.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-white to-rose-50 rounded-xl p-8 shadow-lg border border-rose-100 transform transition duration-500 hover:scale-105 hover:shadow-xl"
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-rose-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Package className="h-7 w-7 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Package Management</h3>
                <p className="text-gray-600">
                  Comprehensive package details, dimensions, weight tracking, and delivery instructions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-indigo-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">How It Works</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Simple, efficient delivery tracking in 4 easy steps
              </p>
            </motion.div>

            <motion.div
              className="space-y-12 md:space-y-0 md:grid md:grid-cols-4 md:gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeInUp} className="relative">
                <motion.div 
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  1
                </motion.div>
                <motion.div 
                  className="border border-indigo-200 rounded-lg p-6 pl-8 bg-white shadow-lg ml-5 hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Create Request</h3>
                  <p className="text-gray-600">
                    Submit your delivery details including pickup and destination locations.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative">
                <motion.div 
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  2
                </motion.div>
                <motion.div 
                  className="border border-indigo-200 rounded-lg p-6 pl-8 bg-white shadow-lg ml-5 hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Agent Assignment</h3>
                  <p className="text-gray-600">
                    An agent is assigned to your delivery and will pick up your package.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative">
                <motion.div 
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  3
                </motion.div>
                <motion.div 
                  className="border border-indigo-200 rounded-lg p-6 pl-8 bg-white shadow-lg ml-5 hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Track Progress</h3>
                  <p className="text-gray-600">
                    Track the delivery in real-time and communicate with the agent via in-app chat.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative">
                <motion.div 
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold z-10"
                  whileHover={{ scale: 1.1 }}
                >
                  4
                </motion.div>
                <motion.div 
                  className="border border-indigo-200 rounded-lg p-6 pl-8 bg-white shadow-lg ml-5 hover:shadow-xl transition-shadow duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Delivery Confirmation</h3>
                  <p className="text-gray-600">
                    QR code verification ensures secure and confirmed delivery at the destination.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="mt-4 text-lg max-w-2xl mx-auto">
                Join thousands of users who are already enjoying efficient and transparent delivery tracking
              </p>
              <motion.div 
                className="mt-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/register">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-indigo-800/30 transition-all duration-300">
                    Create Your Account
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-indigo-400 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Smart Delivery
                </span>
              </div>
              <p className="text-gray-400">
                Modern delivery tracking platform with real-time updates and secure verification.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-indigo-300">Features</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Real-time Tracking</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">QR Verification</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Agent Dashboard</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Status Updates</Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-indigo-300">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">About Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Careers</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Contact Us</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-indigo-300 transition-colors duration-300">Privacy Policy</Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-indigo-300">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-indigo-300 transition-colors duration-300">123 Street Name, City</li>
                <li className="hover:text-indigo-300 transition-colors duration-300">contact@smartdelivery.com</li>
                <li className="hover:text-indigo-300 transition-colors duration-300">(123) 456-7890</li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p>&copy; {new Date().getFullYear()} Smart Delivery Tracker. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

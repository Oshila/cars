'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useEffect } from 'react';

// Sample data for cars and reviews
const featuredCars = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2023, price: 25000, image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80' },
  { id: '2', make: 'BMW', model: 'X5', year: 2022, price: 55000, image: 'https://images.unsplash.com/photo-1617977301313-002b5d4e83a3?auto=format&fit=crop&w=800&q=80' },
  { id: '3', make: 'Mercedes', model: 'C-Class', year: 2023, price: 42000, image: 'https://images.unsplash.com/photo-1618335583500-4bb8c3d7faba?auto=format&fit=crop&w=800&q=80' },
  { id: '4', make: 'Truck', model: 'D-Class', year: 2019, price: 32000, image: 'https://images.unsplash.com/photo-1618335583500-4bb8c3d7faba?auto=format&fit=crop&w=800&q=80' },
];

const reviews = [
  { id: 1, name: 'Jane Doe', text: 'Amazing service and fast delivery! Highly recommend AutoElite.' },
  { id: 2, name: 'John Smith', text: 'Found my dream car here, excellent support from the team.' },
  { id: 3, name: 'Emily Rose', text: 'Great experience, smooth transactions, and very reliable.' },
];

export default function Home() {
  const [user, loading] = useAuthState(auth);

  // Auto logout after 1 hour
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        auth.signOut();
        alert('Session expired. Please log in again.');
      }, 5 * 60 * 1000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-blue-600">AutoElite</h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    Register
                  </Link>
                  <Link href="/admin-login" className="text-red-500 hover:text-red-600 px-3 py-2 rounded-md">
                    Admin
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gray-900">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1974&q=80"
            alt="Car dealership"
          />
          <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Dream Car
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Browse our extensive collection of premium vehicles and drive away with the car of your dreams.
          </p>
          <div className="mt-10">
            <Link href="/cars" className="inline-block bg-blue-500 py-3 px-6 rounded-md text-base font-medium text-white hover:bg-blue-600">
              Browse Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Featured Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <img src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{car.make} {car.model}</h3>
                  <p className="text-gray-600">{car.year}</p>
                  <p className="text-blue-600 font-bold mt-2">${car.price.toLocaleString()}</p>
                  <Link href="/cars" className="mt-3 inline-block text-blue-500 hover:underline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <p className="text-gray-700 italic">"{review.text}"</p>
                <p className="mt-4 font-semibold text-gray-900">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Why Choose AutoElite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Features Items */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-500 p-3 rounded-md text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Secure Transactions</h3>
                <p className="mt-1 text-gray-600">All purchases are protected with our secure payment system.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-500 p-3 rounded-md text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Nationwide Shipping</h3>
                <p className="mt-1 text-gray-600">We deliver to any location with full insurance and tracking.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-500 p-3 rounded-md text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Account Management</h3>
                <p className="mt-1 text-gray-600">Track purchases, balance, and shipping in one place.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-blue-500 p-3 rounded-md text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Fast Support</h3>
                <p className="mt-1 text-gray-600">Support team available 24/7 for all inquiries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">© 2023 AutoElite. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gray-300">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-gray-300">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import Link from 'next/link'

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<number>(0)
  const [successfulPayments, setSuccessfulPayments] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const usersSnapshot = await getDocs(collection(firestore, 'users'))
        setTotalUsers(usersSnapshot.size)

        const paymentsSnapshot = await getDocs(collection(firestore, 'payments'))
        setTotalPayments(paymentsSnapshot.size)

        const successQuery = query(
          collection(firestore, 'payments'),
          where('status', '==', 'success')
        )
        const successSnapshot = await getDocs(successQuery)
        setSuccessfulPayments(successSnapshot.size)
      } catch (err) {
        console.error(err)
        setError('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-gray-500 text-lg animate-pulse text-center">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-red-600 font-semibold text-lg text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-8 max-w-7xl mx-auto py-10">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-10 text-center text-gray-900">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard Cards */}
        {[ 
          {
            count: totalUsers,
            title: 'Total Users',
            href: '/admin/users',
            color: 'blue',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A9.004 9.004 0 0112 15a9.004 9.004 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            )
          },
          {
            count: totalPayments,
            title: 'Total Payments',
            href: '/admin/payments',
            color: 'green',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 9V7a4 4 0 00-8 0v2M5 13h14l-1 7H6l-1-7z"
              />
            )
          },
          {
            count: successfulPayments,
            title: 'Successful Payments',
            href: '/admin/payments?filter=success',
            color: 'purple',
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            )
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 p-6 flex flex-col items-center text-center"
          >
            <div className={`bg-${card.color}-100 p-4 rounded-full mb-4`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-10 w-10 text-${card.color}-600`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {card.icon}
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
            <p className={`text-3xl font-bold text-${card.color}-600 mt-2`}>{card.count}</p>
            <Link
              href={card.href}
              className={`mt-5 inline-block px-5 py-2 rounded-full bg-${card.color}-600 text-white hover:bg-${card.color}-700 transition`}
            >
              {card.title.includes('Payments') ? 'Manage Payments' : 'Manage Users'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}



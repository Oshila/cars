'use client'

import { useEffect, useState, useCallback } from 'react'
import { auth, firestore } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { addDays, addMonths, format } from 'date-fns'
import Navbar from '@/components/Navbar'

interface SubscriptionPlan {
  planName: string
  amount: number
  duration: string
  paidAt: { toDate: () => Date }
  status: string
  uid: string
  [key: string]: unknown
}

export default function MySubscription() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userUid, setUserUid] = useState<string | null>(null)

  const fetchCurrentPlan = useCallback(async (uid: string) => {
    setLoading(true)
    setError(null)
    try {
      const paymentsRef = collection(firestore, 'payments')
      const q = query(
        paymentsRef,
        where('uid', '==', uid),
        where('status', 'in', ['success', 'assigned-manually']),
        orderBy('paidAt', 'desc'),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const plan = doc.data() as SubscriptionPlan
        setCurrentPlan(plan)

        const startDate = plan.paidAt?.toDate?.() ?? new Date()
        const duration = plan.duration?.toLowerCase() ?? ''

        let calculatedEnd: Date | null = null
        const match = duration.match(/\d+/)
        const count = match ? parseInt(match[0]) : 1

        if (duration.includes('month')) {
          calculatedEnd = addMonths(startDate, count)
        } else if (duration.includes('week')) {
          calculatedEnd = addDays(startDate, count * 7)
        } else if (duration.includes('day')) {
          calculatedEnd = addDays(startDate, count)
        }

        if (calculatedEnd) {
          setEndDate(format(calculatedEnd, 'PPP'))
          setIsActive(calculatedEnd > new Date())
        } else {
          setEndDate('Invalid duration')
          setIsActive(false)
        }
      } else {
        setCurrentPlan(null)
        setIsActive(false)
        setEndDate(null)
      }
    } catch (err) {
      console.error('Error fetching plan:', err)
      setError('Failed to fetch subscription plan. Please try again.')
      setCurrentPlan(null)
      setIsActive(false)
      setEndDate(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        setUserUid(null)
        setCurrentPlan(null)
        setIsActive(false)
        setLoading(false)
        setEndDate(null)
        setError(null)
      } else {
        setUserUid(user.uid)
        fetchCurrentPlan(user.uid)
      }
    })

    return () => unsubscribe()
  }, [fetchCurrentPlan])

  if (loading) {
    return (
      <>
        <Navbar hasPlan={isActive} />
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-gray-500 text-lg font-medium">Loading your subscription...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar hasPlan={isActive} />
        <div className="flex flex-col justify-center items-center min-h-[200px] space-y-4">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          {userUid && (
            <button
              onClick={() => fetchCurrentPlan(userUid)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
      </>
    )
  }

  if (!currentPlan) {
    return (
      <>
        <Navbar hasPlan={isActive} />
        <div className="flex justify-center items-center min-h-[200px]">
          <p className="text-red-600 text-lg font-semibold">
            You don&apos;t have an active subscription plan yet.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar hasPlan={isActive} />

      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Your Current Subscription
        </h1>

        <dl className="divide-y divide-gray-200">
          <div className="py-4 flex justify-between">
            <dt className="text-gray-600 font-medium">Plan</dt>
            <dd className="text-gray-900 font-semibold">{currentPlan.planName}</dd>
          </div>

          <div className="py-4 flex justify-between">
            <dt className="text-gray-600 font-medium">Amount Paid</dt>
            <dd className="text-gray-900 font-semibold">
              {(currentPlan.amount / 100).toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN'
              })}
            </dd>
          </div>

          <div className="py-4 flex justify-between">
            <dt className="text-gray-600 font-medium">Duration</dt>
            <dd className="text-gray-900 font-semibold">{currentPlan.duration}</dd>
          </div>

          <div className="py-4 flex justify-between">
            <dt className="text-gray-600 font-medium">Paid On</dt>
            <dd className="text-gray-900 font-semibold">
              {currentPlan.paidAt?.toDate
                ? format(currentPlan.paidAt.toDate(), 'PPP')
                : 'N/A'}
            </dd>
          </div>

          <div className="py-4 flex justify-between">
            <dt className="text-gray-600 font-medium">Ends On</dt>
            <dd className="text-gray-900 font-semibold">{endDate ?? 'Calculating...'}</dd>
          </div>

          <div className="pt-6 text-center">
            {isActive ? (
              <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-800 font-semibold tracking-wide">
                Active
              </span>
            ) : (
              <span className="inline-block px-4 py-1 rounded-full bg-red-100 text-red-800 font-semibold tracking-wide">
                Expired
              </span>
            )}
          </div>
        </dl>
      </div>
    </>
  )
}






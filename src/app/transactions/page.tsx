'use client'

import { useEffect, useState } from 'react'
import { auth, firestore } from '../../lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp // ✅ Import Timestamp
} from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'

type Payment = {
  id: string
  planName: string
  amount: number
  duration: string
  paidAt: Timestamp // ✅ Correct type here
  status: string
  reference: string
}


export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribeAuth()
  }, [])

  useEffect(() => {
    if (!user) {
      setPayments([])
      setLoading(false)
      return
    }

    setLoading(true)

    const paymentsRef = collection(firestore, 'payments')
const q = query(
  paymentsRef,
  where('uid', '==', user.uid),
  where('status', 'in', ['success', 'assigned-manually']),
  orderBy('paidAt', 'desc')
)


    const unsubscribePayments = onSnapshot(
      q,
      (snapshot) => {
        const paymentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Payment, 'id'>),
        }))
        setPayments(paymentsData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching payments:', error)
        setLoading(false)
      }
    )

    return () => unsubscribePayments()
  }, [user])

  if (loading) return <p className="text-center mt-10">Loading payment history...</p>
  if (!user) return <p className="text-center mt-10 text-red-600">Please log in to view payment history.</p>
  if (payments.length === 0)
    return <p className="text-center mt-10 text-gray-500">No payment history found.</p>

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
        Payment History
      </h2>

      <ul className="space-y-4">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="border rounded-lg p-4 flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex-1 space-y-1">
              <p className="text-lg font-semibold text-gray-900">{payment.planName}</p>
              <p className="text-sm text-gray-600">
                Duration: <span className="font-medium">{payment.duration}</span>
              </p>
              <p className="text-sm text-gray-600">
                Reference: <span className="font-mono text-xs">{payment.reference}</span>
              </p>
            </div>

            <div className="mt-3 md:mt-0 text-right min-w-[140px]">
              <p
                className={`text-lg font-semibold ${
                  payment.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ₦{(payment.amount / 100).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {payment.paidAt?.toDate
                  ? payment.paidAt.toDate().toLocaleString()
                  : 'Date unavailable'}
              </p>
              <p
                className={`mt-1 font-semibold ${
                  payment.status === 'success' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {payment.status.toUpperCase()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

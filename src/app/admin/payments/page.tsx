'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'

interface Payment {
  id: string
  uid: string
  planName: string
  amount: number
  status: string
  paidAt: Timestamp | null
  approved?: boolean
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'success' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch payments from Firestore
  const fetchPayments = async () => {
    try {
      const paymentsRef = collection(firestore, 'payments')
      const paymentsQuery = query(paymentsRef, orderBy('paidAt', 'desc'))
      const paymentsSnapshot = await getDocs(paymentsQuery)
      const paymentsData: Payment[] = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Payment, 'id'>),
      }))
      setPayments(paymentsData)
      setFilteredPayments(paymentsData)
    } catch (err) {
      console.error(err)
      setError('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Filter payments by status and search term
  useEffect(() => {
    let filtered = [...payments]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.uid.toLowerCase().includes(lowerSearch) ||
          p.planName.toLowerCase().includes(lowerSearch)
      )
    }

    setFilteredPayments(filtered)
  }, [filterStatus, searchTerm, payments])

  // Approve payment
  const approvePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return
    try {
      const paymentDocRef = doc(firestore, 'payments', paymentId)
      await updateDoc(paymentDocRef, { status: 'success', approved: true })
      setPayments(prev =>
        prev.map(p => (p.id === paymentId ? { ...p, status: 'success', approved: true } : p))
      )
    } catch (err) {
      console.error(err)
      alert('Failed to approve payment')
    }
  }

  // Reject payment
  const rejectPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return
    try {
      const paymentDocRef = doc(firestore, 'payments', paymentId)
      await updateDoc(paymentDocRef, { status: 'rejected', approved: false })
      setPayments(prev =>
        prev.map(p => (p.id === paymentId ? { ...p, status: 'rejected', approved: false } : p))
      )
    } catch (err) {
      console.error(err)
      alert('Failed to reject payment')
    }
  }

  if (loading)
    return <p className="text-center mt-20 text-gray-600 text-lg">Loading payments...</p>

  if (error)
    return <p className="text-center mt-20 text-red-600 font-semibold">{error}</p>

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Payments & Subscriptions</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by User UID or Plan Name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 w-full md:w-1/2 focus:outline-blue-500"
        />

        <select
          value={filterStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilterStatus(e.target.value as 'all' | 'pending' | 'success' | 'rejected')
          }
          className="border rounded px-4 py-2 w-full md:w-1/4 focus:outline-blue-500"
          aria-label="Filter payments by status"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Payments table */}
      <div className="overflow-x-auto rounded border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">User UID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Plan</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount (₦)</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Paid At</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Approved</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                  No payments found.
                </td>
              </tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm break-all">{payment.uid}</td>
                  <td className="px-4 py-2 text-sm">{payment.planName}</td>
                  <td className="px-4 py-2 text-sm">{(payment.amount / 100).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm capitalize">{payment.status}</td>
                  <td className="px-4 py-2 text-sm">
                    {payment.paidAt?.toDate
                      ? payment.paidAt.toDate().toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-center text-sm">
                    {payment.approved ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    {payment.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => approvePayment(payment.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectPayment(payment.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="italic text-gray-500">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


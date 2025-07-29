'use client'

import { useState, useEffect } from 'react'
import { firestore } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore'

const plans = [
  {
    name: '2 Weeks Access',
    durationInDays: 14,
    amountInKobo: 3800000,
  },
  {
    name: '1 Month Access',
    durationInDays: 30,
    amountInKobo: 7800000,
  },
  {
    name: '2 Months Access',
    durationInDays: 60,
    amountInKobo: 15600000,
  },
  {
    name: '1 Year Access',
    durationInDays: 365,
    amountInKobo: 93000000,
  },
]

interface AssignedUser {
  id: string
  uid: string
  email: string
  planName: string
  planExpiry: Timestamp | Date | null
}

export default function AssignPlanPage() {
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(plans[0])
  const [status, setStatus] = useState('')
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const fetchAssignedUsers = async () => {
    setLoadingList(true)
    try {
      const paymentsRef = collection(firestore, 'payments')
      const q = query(
        paymentsRef,
        where('status', '==', 'assigned-manually'),
        orderBy('paidAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const users: AssignedUser[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          uid: data.uid,
          email: data.email,
          planName: data.planName,
          planExpiry: data.planExpiry || null,
        }
      })
      setAssignedUsers(users)
    } catch (error) {
      console.error('Error fetching assigned users:', error)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    fetchAssignedUsers()
  }, [])

  const handleAssign = async () => {
    setStatus('Assigning plan...')
    try {
      const q = query(collection(firestore, 'users'), where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setStatus('❌ User not found')
        return
      }

      const userDoc = querySnapshot.docs[0]
      const userId = userDoc.id

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + selectedPlan.durationInDays)

      const userRef = doc(firestore, 'users', userId)
      await updateDoc(userRef, {
        plan: selectedPlan.name,
        planExpiry: expiryDate,
      })

      await addDoc(collection(firestore, 'payments'), {
        uid: userId,
        email,
        reference: `manual-${Date.now()}`,
        planName: selectedPlan.name,
        amount: selectedPlan.amountInKobo,
        duration: `${selectedPlan.durationInDays} days`,
        status: 'assigned-manually',
        paidAt: serverTimestamp(),
        planExpiry: expiryDate,
      })

      setStatus('✅ Plan successfully assigned')
      setEmail('')
      fetchAssignedUsers()
    } catch (error) {
      console.error(error)
      setStatus('❌ Error assigning plan')
    }
  }

  const handleRevoke = async (userId: string, paymentDocId: string) => {
    setStatus('Revoking plan...')
    try {
      if (!userId || !paymentDocId) {
        setStatus('❌ Missing user ID or payment document ID')
        return
      }

      const userRef = doc(firestore, 'users', userId)
      await updateDoc(userRef, {
        plan: null,
        planExpiry: null,
      })

      const paymentRef = doc(firestore, 'payments', paymentDocId)
      await updateDoc(paymentRef, {
        status: 'revoked',
      })

      setStatus('✅ Plan successfully revoked')
      fetchAssignedUsers()
    } catch (error) {
      console.error(error)
      setStatus('❌ Error revoking plan')
    }
  }

  return (
    <main className="max-w-xl mx-auto pt-28 px-4">
      <h1 className="text-2xl font-bold mb-6">Assign Plan to User</h1>

      <div className="space-y-4 mb-10">
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
        />

        <select
          value={selectedPlan.name}
          onChange={(e) =>
            setSelectedPlan(plans.find((p) => p.name === e.target.value)!)
          }
          className="w-full px-4 py-2 border rounded-md"
        >
          {plans.map((plan) => (
            <option key={plan.name} value={plan.name}>
              {plan.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Assign Plan
        </button>

        {status && <p className="mt-4 text-sm text-blue-700">{status}</p>}
      </div>

      <h2 className="text-xl font-semibold mb-4">Assigned Plans</h2>

      {loadingList ? (
        <p>Loading assigned users...</p>
      ) : assignedUsers.length === 0 ? (
        <p>No assigned plans yet.</p>
      ) : (
        <ul className="space-y-4">
          {assignedUsers.map(({ id, email, planName, planExpiry, uid }) => (
            <li
              key={id}
              className="flex justify-between items-center border rounded p-4"
            >
              <div>
                <p className="font-semibold">{email}</p>
                <p>
                  Plan: <span className="font-medium">{planName}</span>
                </p>
                <p>
                  Ends On:{' '}
                  <span className="font-medium">
                    {planExpiry instanceof Timestamp
                      ? planExpiry.toDate().toLocaleDateString()
                      : planExpiry instanceof Date
                      ? planExpiry.toLocaleDateString()
                      : 'N/A'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => handleRevoke(uid, id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Revoke Plan
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}



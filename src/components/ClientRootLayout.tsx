'use client'

import { ReactNode, useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import Navbar from './Navbar'
import { AuthProvider, useAuth } from '@/lib/auth'

export default function ClientRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <InnerClientRootLayout>{children}</InnerClientRootLayout>
    </AuthProvider>
  )
}

function InnerClientRootLayout({ children }: { children: ReactNode }) {
  const [hasPlan, setHasPlan] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function checkPlan() {
      if (user) {
        try {
          const paymentsRef = collection(firestore, 'payments')
          const q = query(
            paymentsRef,
            where('uid', '==', user.uid),
            where('status', '==', 'success'),
            orderBy('planExpiry', 'desc'),
            limit(1)
          )
          const snapshot = await getDocs(q)
          const latest = snapshot.docs[0]?.data()

          const valid =
            !!latest &&
            latest.planName &&
            latest.planExpiry?.toMillis?.() > Date.now()

          setHasPlan(valid)
        } catch (err) {
          console.error('Payment check error:', err)
          setHasPlan(false)
        }
      } else {
        setHasPlan(false)
      }
      setLoading(false)
    }

    setLoading(true)
    checkPlan()
  }, [user])

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <>
      <Navbar hasPlan={hasPlan} />
      {children}
    </>
  )
}

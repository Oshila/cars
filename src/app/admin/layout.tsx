'use client'

import { ReactNode, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firestore } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import Navbar from '@/components/Navbar'
import AdminNavbar from '@/components/AdminNavbar'

export default function ClientRootLayout({ children }: { children: ReactNode }) {
  const [hasPlan, setHasPlan] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid)
          const userDocSnap = await getDoc(userDocRef)
          const userData = userDocSnap.data()
          const admin = userData?.isAdmin === true
          setIsAdmin(admin)

          if (!admin) {
            const paymentsRef = collection(firestore, 'payments')
            const q = query(
              paymentsRef,
              where('uid', '==', currentUser.uid),
              where('status', '==', 'success'),
              orderBy('planExpiry', 'desc'),
              limit(1)
            )
            const snapshot = await getDocs(q)
            const latest = snapshot.docs[0]?.data()

            const validPlan =
              !!latest &&
              latest.planName &&
              latest.planExpiry?.toMillis?.() > Date.now()

            setHasPlan(validPlan)
          } else {
            setHasPlan(true)
          }
        } catch (err) {
          console.error('Error checking user/admin status:', err)
          setHasPlan(false)
          setIsAdmin(false)
        }
      } else {
        setHasPlan(false)
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <Navbar hasPlan={hasPlan} />}
      {children}
    </>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { auth, firestore } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Navbar from './Navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasPlan, setHasPlan] = useState(false)

  useEffect(() => {
    const checkUserPlan = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          const expiry = data?.planExpiry?.toDate?.() || new Date(data.planExpiry)
          if (expiry && new Date() < new Date(expiry)) {
            setHasPlan(true)
          }
        }
      } catch (error) {
        console.error('Error checking plan:', error)
      }
    }

    checkUserPlan()
  }, [])

  return (
    <>
      <Navbar hasPlan={hasPlan} />
      {children}
    </>
  )
}

'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { useAuth } from '@/lib/auth'

interface PlanContextType {
  hasPlan: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const PlanContext = createContext<PlanContextType>({
  hasPlan: false,
  loading: true,
  refresh: async () => {},
})

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [hasPlan, setHasPlan] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkPlan = async () => {
    if (user) {
      try {
        const paymentsRef = collection(firestore, 'payments')
        const q = query(
          paymentsRef,
          where('uid', '==', user.uid),
          where('status', 'in', ['success', 'assigned-manually']),
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
        console.error('Plan check failed:', err)
        setHasPlan(false)
      }
    } else {
      setHasPlan(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    checkPlan()
  }, [user])

  // Optional: Refresh plan every 1 minute (to detect revoke automatically)
  useEffect(() => {
    const interval = setInterval(() => {
      checkPlan()
    }, 60 * 1000) // every 60 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <PlanContext.Provider value={{ hasPlan, loading, refresh: checkPlan }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)

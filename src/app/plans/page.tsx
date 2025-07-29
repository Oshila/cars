'use client'

import { useEffect, useState } from 'react'
import { auth, firestore } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'
import dynamic from 'next/dynamic'

const PaystackWrapper = dynamic(() => import('../../components/PaystackWrapper'), { ssr: false })

const plans = [
  {
    name: '1 day Access',
    price: '₦24,000',
    amountInKobo: 10000,
    duration: '1 day',
    features: ['Basic trading signals', 'Email alerts'],
  },
  {
    name: '2 Weeks Access',
    price: '₦24,000',
    amountInKobo: 2400000,
    duration: '14 days',
    features: ['Basic trading signals', 'Email alerts'],
  },
  {
    name: '1 Month Access',
    price: '₦48,000',
    amountInKobo: 4800000,
    duration: '30 days',
    features: ['All signals', 'Telegram group access', 'Priority email support'],
  },
  {
    name: '2 Months Access',
    price: '₦96,000',
    amountInKobo: 9600000,
    duration: '60 days',
    features: [
      'All 1-month features',
      'Early access to premium calls',
      'Portfolio feedback',
    ],
  },
  {
    name: '1 Year Access',
    price: '₦576,000',
    amountInKobo: 57600000,
    duration: '365 days',
    features: [
      'All 2-month features',
      '1-on-1 mentorship sessions',
      'Custom trading strategy review',
      'VIP lifetime channel access',
    ],
  },
]

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

export default function PlansPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) setUserEmail(user.email)
      else setUserEmail(null)
    })
    return () => unsubscribe()
  }, [])

  if (userEmail === null)
    return (
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <p className="text-center text-xl text-red-600">
          Please log in to subscribe to a plan.
        </p>
      </main>
    )

  const handleClose = () => {
    alert('Payment was not completed.')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <h1 className="text-4xl font-bold mb-10 text-center">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => {
          const handleSuccess = async (reference: { reference: string }) => {
            alert('Payment successful! Reference: ' + reference.reference)

            try {
              const user = auth.currentUser
              if (!user) return

              const planDurationInDays = parseInt(plan.duration.split(' ')[0])
              const expiryDate = new Date()
              expiryDate.setDate(expiryDate.getDate() + planDurationInDays)

              // Save payment to payments collection
              await addDoc(collection(firestore, 'payments'), {
                uid: user.uid,
                email: user.email,
                reference: reference.reference,
                planName: plan.name,
                amount: plan.amountInKobo,
                duration: plan.duration,
                status: 'success',
                paidAt: serverTimestamp(),
                planExpiry: expiryDate,
              })

              // Update user document with plan info
              const userRef = doc(firestore, 'users', user.uid)
              await updateDoc(userRef, {
                plan: plan.name,
                planExpiry: expiryDate,
              })

              console.log('User plan and expiry updated.')
            } catch (error) {
              console.error('Error saving payment info or updating user:', error)
            }
          }

          return (
            <div
              key={plan.name}
              className="border rounded-xl p-6 shadow-md bg-white flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
                <p className="text-xl text-gray-800 mb-1">{plan.price}</p>
                <p className="text-sm text-gray-500 mb-4">Valid for {plan.duration}</p>
                <ul className="mb-6 space-y-2 text-gray-700 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <PaystackWrapper
                email={userEmail}
                amount={plan.amountInKobo}
                publicKey={PAYSTACK_PUBLIC_KEY}
                planName={plan.name}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
}

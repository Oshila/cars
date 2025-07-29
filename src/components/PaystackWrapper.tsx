'use client'

import { PaystackButton } from 'react-paystack'

type PaystackSuccessResponse = {
  reference: string
  status: string
  trans: string
  transaction: string
  message: string
}

type PaystackWrapperProps = {
  email: string
  amount: number
  publicKey: string
  planName: string
  onSuccess: (reference: PaystackSuccessResponse) => void
  onClose: () => void
}

export default function PaystackWrapper({
  email,
  amount,
  publicKey,
  planName,
  onSuccess,
  onClose,
}: PaystackWrapperProps) {
  return (
    <PaystackButton
      text="Subscribe"
      className="mt-auto bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
      email={email}
      amount={amount}
      publicKey={publicKey}
      metadata={{ planName, custom_fields: [] }}
      onSuccess={onSuccess}
      onClose={onClose}
    />
  )
}


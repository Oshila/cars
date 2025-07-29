'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { useAuth } from '@/lib/auth'

type Message = {
  id: string
  text: string
  senderUid: string
  senderRole: string
  timestamp: Timestamp | null
}

export default function SignalRoom() {
  const [messages, setMessages] = useState<Message[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const signalsRef = collection(firestore, 'signals')
    const q = query(signalsRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          text: data.text || '',
          senderUid: data.senderUid || '',
          senderRole: data.senderRole || 'user',
          timestamp: data.timestamp || null,
        }
      })
      setMessages(msgs)
      setTimeout(() => {
        const el = document.getElementById('messagesEnd')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribe()
  }, [user?.uid])

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Signal Room
      </h2>

      <div
        className="flex-grow overflow-y-auto mb-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#a0aec0 transparent' }}
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 italic">No messages yet.</p>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
              msg.senderUid === user?.uid
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-gray-900'
            }`}
            style={{ wordBreak: 'break-word' }}
          >
            <p className="whitespace-pre-line">{msg.text}</p>
            <small className="block mt-1 text-xs opacity-70">
              {msg.senderRole.charAt(0).toUpperCase() + msg.senderRole.slice(1)} •{' '}
              {msg.timestamp
                ? new Date(msg.timestamp.toMillis()).toLocaleString()
                : 'Sending...'}
            </small>
          </div>
        ))}
        <div id="messagesEnd" />
      </div>
        <p className="text-center text-gray-500 italic select-none">
        Only admins can send messages.
      </p>
    </div>
  )
}



'use client'

import { useState, useEffect, useRef } from 'react'
import { firestore } from '../lib/firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { User } from 'firebase/auth'

interface SignalRoomProps {
  user: User
}

type Message = {
  id: string
  text: string
  sender: 'admin' | 'user'
  timestamp?: Timestamp
}

export default function SignalRoom({ user }: SignalRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const ADMIN_UID = 'BenuQF3rJeZOt0dfj7RKWMZ1HzC3'

  useEffect(() => {
    const q = query(collection(firestore, 'signals'), orderBy('timestamp', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(messageData)
    })

    return () => unsubscribe()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || user.uid !== ADMIN_UID) return

    try {
      await addDoc(collection(firestore, 'signals'), {
        text: input.trim(),
        sender: 'admin',
        timestamp: serverTimestamp(),
      })
      setInput('')
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isAdmin = user.uid === ADMIN_UID

  return (
    <div className="max-w-3xl mx-auto p-4 border rounded shadow-md h-[400px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Signal Room</h2>

      <div className="flex-1 overflow-y-auto border rounded p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-20">No signals yet.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${
              msg.sender === 'admin' ? 'text-blue-700' : 'text-gray-700'
            }`}
          >
            <span className="font-semibold">
              {msg.sender === 'admin' ? 'Admin' : 'User'}:{' '}
            </span>
            {msg.text}
            <div className="text-xs text-gray-400">
              {msg.timestamp?.toDate
                ? msg.timestamp.toDate().toLocaleTimeString()
                : '...'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isAdmin ? (
        <div className="mt-3 flex space-x-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type your signal here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="mt-3 text-gray-500 text-center text-sm italic">
          You can only view signals.
        </p>
      )}
    </div>
  )
}


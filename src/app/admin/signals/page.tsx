'use client'

import { useEffect, useState } from 'react'
import { firestore } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDoc,
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
  const [input, setInput] = useState('')
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user')
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const fetchUserRoleAndMessages = async () => {
      try {
        // Get user role from Firestore
        const userRef = doc(firestore, 'users', user.uid)
        const snapshot = await getDoc(userRef)
        const data = snapshot.data()
        if (data?.role === 'admin') {
          setUserRole('admin')
        }

        // Subscribe to signal messages
        const q = query(collection(firestore, 'signals'), orderBy('timestamp', 'asc'))
        const unsubscribe = onSnapshot(
          q,
          snapshot => {
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
          },
          error => {
            console.error('Error listening to signals:', error)
          }
        )

        return unsubscribe
      } catch (error) {
        console.error('Error fetching user or messages:', error)
      }
    }

    fetchUserRoleAndMessages()
  }, [user?.uid])

  const sendMessage = async () => {
    if (!input.trim()) return
    if (userRole !== 'admin') {
      alert('Only admins can send messages.')
      return
    }

    try {
      await addDoc(collection(firestore, 'signals'), {
        text: input,
        senderUid: user!.uid,
        senderRole: userRole,
        timestamp: serverTimestamp(),
      })

      await fetch('/api/sendTelegramMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `An update has been sent by the admin. Login and check it out: https://alchemistfx.vercel.app/login`,
        }),
      })

      setInput('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message.')
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    try {
      await deleteDoc(doc(firestore, 'signals', id))
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message.')
    }
  }

  const formatTimestamp = (ts: Timestamp | null) => {
    if (!ts) return '...'
    return new Date(ts.toMillis()).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Signal Room</h2>

      <div className="h-64 overflow-y-auto border p-3 mb-4 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-500">No messages yet.</p>
        )}
        {messages.map(msg => {
          const isAdmin = msg.senderRole === 'admin'
          return (
            <div
              key={msg.id}
              className={`p-2 rounded ${
                isAdmin ? 'bg-blue-200' : 'bg-gray-200'
              } flex justify-between items-start`}
            >
              <div>
                <p className="text-sm">{msg.text}</p>
                <small className="text-gray-600">
                  {isAdmin ? 'Admin' : 'User'} | {formatTimestamp(msg.timestamp)}
                </small>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="text-red-600 text-xs hover:underline ml-4"
                >
                  Delete
                </button>
              )}
            </div>
          )
        })}
      </div>

      {userRole === 'admin' ? (
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border rounded px-3 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="italic text-gray-500">Only admins can send messages.</p>
      )}
    </div>
  )
}
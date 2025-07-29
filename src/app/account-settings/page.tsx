'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth'

export default function AccountSettings() {
  const user = auth.currentUser

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async () => {
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (user && displayName !== user.displayName) {
        await updateProfile(user, { displayName })
      }

      if (user && email !== user.email) {
        await updateEmail(user, email)
      }

      setMessage('Profile updated successfully!')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setError(null)
    setMessage(null)

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.')
      return
    }

    if (!user || !user.email) {
      setError('User not logged in.')
      return
    }

    setLoading(true)

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)

      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <label className="block mb-2">
          Display Name
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block mb-4">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save Profile
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        <label className="block mb-2">
          Current Password
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block mb-2">
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block mb-4">
          Confirm New Password
          <input
            type="password"
            value={confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Change Password
        </button>
      </section>
    </div>
  )
}


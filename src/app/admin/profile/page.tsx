'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { firestore } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import Image from 'next/image'

interface UserProfile {
  displayName: string
  email: string
  photoURL?: string
  phoneNumber?: string
  bio?: string
}

export default function ProfilePage() {
  const auth = getAuth()
  const user = auth.currentUser

  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    photoURL: '',
    phoneNumber: '',
    bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch profile info
  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const docRef = doc(firestore, 'users', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phoneNumber: data.phoneNumber || '',
          bio: data.bio || '',
        })
      } else {
        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          phoneNumber: '',
          bio: '',
        })
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load profile data.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      })

      const docRef = doc(firestore, 'users', user.uid)
      await updateDoc(docRef, {
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
      })

      setSuccessMsg('Profile updated successfully!')
      setEditMode(false)
    } catch (err) {
      console.error(err)
      setError('Failed to save profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center mt-20 text-gray-600">Loading profile...</p>

  if (!user) return <p className="text-center mt-20 text-red-600">You must be logged in.</p>

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}
      {successMsg && (
        <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMsg}</p>
      )}

      <div className="flex flex-col items-center space-y-4 mb-6">
        {profile.photoURL ? (
          <Image
            src={profile.photoURL}
            alt="Profile Photo"
            width={112}
            height={112}
            className="rounded-full object-cover border-2 border-blue-500"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-4xl text-gray-500 font-semibold">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault()
          saveProfile()
        }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="displayName" className="block font-semibold mb-1">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full border rounded px-4 py-2 ${
              editMode ? 'border-blue-500 focus:outline-blue-500' : 'bg-gray-100 cursor-not-allowed'
            }`}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-semibold mb-1">
            Email (read-only)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full border rounded px-4 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="photoURL" className="block font-semibold mb-1">
            Profile Photo URL
          </label>
          <input
            type="url"
            id="photoURL"
            name="photoURL"
            value={profile.photoURL}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="https://example.com/photo.jpg"
            className={`w-full border rounded px-4 py-2 ${
              editMode ? 'border-blue-500 focus:outline-blue-500' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block font-semibold mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="+1234567890"
            className={`w-full border rounded px-4 py-2 ${
              editMode ? 'border-blue-500 focus:outline-blue-500' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
        </div>

        <div>
          <label htmlFor="bio" className="block font-semibold mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            disabled={!editMode}
            rows={4}
            placeholder="Tell us a little about yourself..."
            className={`w-full border rounded px-4 py-2 resize-none ${
              editMode ? 'border-blue-500 focus:outline-blue-500' : 'bg-gray-100 cursor-not-allowed'
            }`}
          />
        </div>

        <div className="flex justify-center space-x-4">
          {editMode ? (
            <>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false)
                  fetchUserProfile()
                  setError(null)
                  setSuccessMsg(null)
                }}
                className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  )
}


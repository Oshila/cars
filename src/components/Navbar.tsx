'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

interface NavbarProps {
  hasPlan: boolean
}

export default function Navbar({ hasPlan }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname() || ''

  const hideNavbarPaths = [
    '/',
    '/login',
    '/register',
    '/admin',
    '/admin/payments',
    '/admin/users',
    '/admin/profile',
    '/admin/signals',
    '/admin/assignPlan',
    '/admin-login',
  ]

  if (hideNavbarPaths.includes(pathname)) return null

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-300 px-6 py-4 fixed w-full top-0 left-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-black font-extrabold text-xl tracking-wide">
            OshilaFx
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link href="/subscription" className="text-gray-700 hover:text-blue-600 transition">
              My Subscription
            </Link>
            <Link href="/transactions" className="text-gray-700 hover:text-blue-600 transition">
              Transaction History
            </Link>
            <Link href="/plans" className="text-gray-700 hover:text-blue-600 transition">
              Services / Plans
            </Link>
            {hasPlan && (
              <Link href="/signals" className="text-gray-700 hover:text-blue-600 transition">
                Signal Room
              </Link>
            )}
            <Link href="/account-settings" className="text-gray-700 hover:text-blue-600 transition">
              Account Settings
            </Link>
          </div>

          {/* Right side desktop */}
          <div className="hidden md:flex items-center space-x-8 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-800 transition" title="Return to main website">
              Home Website
            </Link>
            <span className="text-gray-400 cursor-not-allowed select-none" title="Coming soon">
              Account Management
            </span>
            <span className="text-gray-400 cursor-not-allowed select-none" title="Coming soon">
              Incoming
            </span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-semibold transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden bg-white border-t border-gray-300 transition-max-height duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-screen' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col py-4 space-y-1 px-4">
            <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              Dashboard
            </Link>
            <Link href="/subscription" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              My Subscription
            </Link>
            <Link href="/transactions" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              Transaction History
            </Link>
            <Link href="/plans" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              Services / Plans
            </Link>
            {hasPlan && (
              <Link href="/signals" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
                Signal Room
              </Link>
            )}
            <Link href="/account-settings" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              Account Settings
            </Link>
            <hr className="my-3 border-gray-300" />
            <Link href="/" onClick={() => setIsOpen(false)} className="block py-2 px-3 rounded hover:bg-gray-100 transition">
              Home Website
            </Link>
            <span className="block py-2 px-3 text-gray-400 cursor-not-allowed select-none" title="Coming soon">
              Account Management (coming soon)
            </span>
            <span className="block py-2 px-3 text-gray-400 cursor-not-allowed select-none" title="Coming soon">
              Incoming (coming soon)
            </span>
            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="text-red-600 hover:bg-red-100 rounded py-2 px-3 w-full text-left font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* To avoid content hidden behind fixed navbar */}
      <div className="h-16 md:h-16" />
    </>
  )
}



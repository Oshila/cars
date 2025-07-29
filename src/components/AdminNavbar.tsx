'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react' // You can swap these icons if needed

export default function AdminNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side links for desktop */}
        <div className="hidden md:flex space-x-6">
          <Link href="/admin" className="hover:underline">
            dashboard
          </Link>
          <Link href="/admin/assignPlan" className="hover:underline">
            Assign Plans
          </Link>
          <Link href="/admin/signals" className="hover:underline">
            Signal Room
          </Link>
          <Link href="/admin/payments" className="hover:underline">
            Payments & Subscriptions
          </Link>
          <Link href="/admin/users" className="hover:underline">
            All Users
          </Link>
        </div>

        {/* Right side links for desktop */}
        <div className="hidden md:flex space-x-6 items-center ml-auto">
          <Link href="/admin/profile" className="hover:underline">
            Profile
          </Link>
          <Link href="/login" className="hover:underline">
            Logout
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-4 space-y-3 border-t border-gray-700 pt-4">
          <Link
            href="/admin"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            dashboard
          </Link>
          <Link
            href="/admin/assignPlan"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            Assign Plans
          </Link>
          <Link
            href="/admin/signals"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            Signal Room
          </Link>
          <Link
            href="/admin/payments"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            Payments & Subscriptions
          </Link>
          <Link
            href="/admin/users"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            All Users
          </Link>
          <Link
            href="/admin/profile"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/login"
            className="block hover:underline"
            onClick={() => setOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </nav>
  )
}


'use client';

import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 flex justify-end">
        <Link href="/login" className="text-blue-400 hover:underline">
          Already have an account? Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <AuthForm type="register" />
      </main>
    </div>
  );
}

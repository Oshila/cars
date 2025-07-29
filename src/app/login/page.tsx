'use client';

import AuthForm from '@/components/AuthForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="p-4 flex justify-end">
        <Link href="/register" className="text-white-400 hover:underline">
          {"Don't have an account? Register"}
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <AuthForm type="login" />
      </main>
    </div>
  );
}


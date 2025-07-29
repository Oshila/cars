'use client';

import { useState } from 'react';
import { auth, firestore } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  type: 'login' | 'register';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'login') {
        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get Firestore doc by user UID
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setError('User record not found. Please register first.');
          return;
        }

        const userData = userDocSnap.data();

        // Check isAdmin flag and redirect accordingly
        if (userData.isAdmin) {
          router.push('/admin');  // Admin dashboard
        } else {
          router.push('/dashboard');   // Normal user dashboard
        }

      } else {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create Firestore user doc with email and isAdmin=false, no plan initially
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          isAdmin: false,
          plan: null,
          planExpiry: null,
        });

        router.push('/dashboard');
      }
   } catch (err: unknown) {
  console.error(err);
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('Something went wrong');
  }
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-4 pt-20">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-300">
        <h1 className="text-2xl font-bold mb-6 text-center">{type === 'login' ? 'Login' : 'Register'}</h1>

        {error && (
          <p className="bg-red-600 text-white p-2 mb-4 rounded text-sm text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="w-full p-2 rounded border border-gray-400 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              autoComplete={type === 'register' ? 'new-password' : 'current-password'}
              required
              className="w-full p-2 rounded border border-gray-400 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800 p-2 rounded font-semibold"
          >
            {type === 'login' ? 'Log In' : 'Register'}
          </button>
        </form>

        <p className="text-sm mt-4 text-center text-gray-700">
          {type === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <a
            href={type === 'login' ? '/register' : '/login'}
            className="text-blue-600 underline"
          >
            {type === 'login' ? 'Register here' : 'Login here'}
          </a>
        </p>
      </div>
    </div>
  );
}


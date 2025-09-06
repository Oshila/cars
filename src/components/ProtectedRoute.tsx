import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from 'firebase/auth';

interface AppUser extends User {
  isAdmin?: boolean; // optional, in case Firestore user data has it
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (!loading && user && adminOnly) {
        // fetch Firestore user to check isAdmin
        const tokenResult = await user.getIdTokenResult();
        const isAdmin = tokenResult.claims.admin;
        if (!isAdmin) router.push('/dashboard');
      }
    };

    checkAdmin();
  }, [user, loading, router, adminOnly]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return <>{children}</>;
}

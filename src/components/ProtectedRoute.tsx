import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/router';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = unknown yet
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (!loading && user && adminOnly) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setIsAdmin(!!tokenResult.claims.admin);
          if (!tokenResult.claims.admin) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Failed to check admin claims:', error);
          router.push('/dashboard');
        }
      } else {
        setIsAdmin(true); // not admin-only page, allow access
      }
    };

    checkAdmin();
  }, [user, loading, router, adminOnly]);

  if (loading || (adminOnly && isAdmin === null)) return <LoadingSpinner />;
  if (!user) return null;

  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import Link from 'next/link';

interface UserData {
  uid: string;
  email?: string;
  name?: string;
  balance: number;
  isAdmin: boolean;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
}

interface Purchase {
  id: string;
  carId: string;
  userId: string;
  status: 'processing' | 'shipped' | 'delivered';
  createdAt?: Date;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cars, setCars] = useState<Record<string, Car>>({});
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState<number>(0);
  const [fundLoading, setFundLoading] = useState(false);
  const [fundMessage, setFundMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        // fetch user
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          router.push('/login');
          return;
        }

        const userData = userDoc.data() as Omit<UserData, 'uid'>;
        setUser({ ...userData, uid: firebaseUser.uid });

        // fetch purchases
        const purchasesRef = collection(db, 'purchases');
        const q = query(purchasesRef, where('userId', '==', firebaseUser.uid));
        const snap = await getDocs(q);

        const purchaseList: Purchase[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            carId: data.carId,
            userId: data.userId,
            status: data.status || 'processing',
            createdAt: data.createdAt?.toDate?.(),
          };
        });

        setPurchases(purchaseList);

        // fetch all car details in parallel
        const uniqueCarIds = [...new Set(purchaseList.map((p) => p.carId))];
        const carEntries: [string, Car][] = [];

        await Promise.all(
          uniqueCarIds.map(async (carId) => {
            const carDoc = await getDoc(doc(db, 'cars', carId));
            if (carDoc.exists()) {
              carEntries.push([
                carId,
                { id: carDoc.id, ...(carDoc.data() as Omit<Car, 'id'>) },
              ]);
            }
          })
        );

        setCars(Object.fromEntries(carEntries));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleAddFunds = async () => {
    if (!user) return;
    if (fundAmount <= 0) {
      setFundMessage('Enter a valid amount');
      return;
    }
    setFundLoading(true);
    setFundMessage('');
    try {
      await addDoc(collection(db, 'topups'), {
        userId: user.uid,
        amount: fundAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setFundMessage('Request sent! Contact admin to confirm USDT payment.');
      setFundAmount(0);
    } catch (error: any) {
      setFundMessage(`Error: ${error.message}`);
    } finally {
      setFundLoading(false);
    }
  };

  const handleTrackShipping = async (purchaseId: string, currentStatus?: string) => {
    const steps = ['processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus || 'processing');
    const nextStatus =
      currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'delivered';

    try {
      await updateDoc(doc(db, 'purchases', purchaseId), {
        status: nextStatus,
      });

      setPurchases((prev) =>
        prev.map((p) =>
          p.id === purchaseId ? { ...p, status: nextStatus as Purchase['status'] } : p
        )
      );
    } catch (err) {
      console.error('Error updating shipping:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Balance</h2>
          <p className="text-3xl font-bold text-blue-600">
            ${user.balance.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add Funds</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="number"
              placeholder="Amount (USDT)"
              value={fundAmount || ''}
              onChange={(e) => setFundAmount(Number(e.target.value))}
              className="flex-1 border p-2 rounded"
            />
            <button
              onClick={handleAddFunds}
              disabled={fundLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {fundLoading ? 'Requesting...' : 'Request'}
            </button>
          </div>
          {fundMessage && <p className="text-sm text-gray-600 mt-2">{fundMessage}</p>}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/cars"
              className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center"
            >
              Browse Cars
            </Link>
            {user.isAdmin && (
              <Link
                href="/admin"
                className="block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-center"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Purchases */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Your Purchased Cars</h2>
        {purchases.length === 0 ? (
          <p className="text-gray-600">You haven't purchased any cars yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
              const car = cars[purchase.carId];
              return (
                <div
                  key={purchase.id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {car ? (
                    <>
                      <img
                        src={`/cars/${car.image}`} // <-- fixed image path
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-gray-600">{car.year}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          ${car.price.toLocaleString()}
                        </p>
                        {purchase.createdAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            Purchased: {purchase.createdAt.toLocaleDateString()}
                          </p>
                        )}
                        <span
                          className={`px-2 py-1 mt-2 inline-block rounded text-xs font-medium ${
                            purchase.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : purchase.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {purchase.status}
                        </span>

                        {user.isAdmin && (
                          <button
                            onClick={() =>
                              handleTrackShipping(purchase.id, purchase.status)
                            }
                            disabled={purchase.status === 'delivered'}
                            className="mt-3 block w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-center disabled:opacity-50"
                          >
                            {purchase.status === 'delivered'
                              ? 'Delivered'
                              : 'Advance Shipping'}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="p-4">Car details not found.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

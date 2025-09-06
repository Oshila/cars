'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getAuth,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import app, { db } from '@/lib/firebase';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  description: string;
}

interface UserData {
  uid: string;
  balance: number;
}

export default function Cars() {
  const [user, setUser] = useState<UserData | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authInstance = getAuth(app);
    const dbInstance = getFirestore(app);

    const unsubscribe = onAuthStateChanged(authInstance, async (u) => {
      if (u) {
        const userDoc = await getDoc(doc(dbInstance, 'users', u.uid));
        if (userDoc.exists()) {
          setUser({ uid: u.uid, ...userDoc.data() } as UserData);
        }
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    // Fetch cars
    const fetchCars = async () => {
      const carsSnapshot = await getDocs(collection(dbInstance, 'cars'));
      const carsList = carsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Car[];
      setCars(carsList);
      setLoading(false);
    };

    fetchCars();

    return () => unsubscribe();
  }, [router]);

  const handlePurchase = async (car: Car) => {
    if (!user) return;
    setPurchasing(car.id);

    try {
      if (user.balance < car.price) {
        alert('Insufficient balance!');
        setPurchasing(null);
        return;
      }

      const userRef = doc(db, 'users', user.uid);

      // Deduct balance
      await updateDoc(userRef, {
        balance: user.balance - car.price,
      });

      // Save purchase
      await addDoc(collection(db, 'purchases'), {
        userId: user.uid,
        carId: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        image: car.image,
        status: 'processing',
        purchasedDate: serverTimestamp(),
      });

      setUser({
        ...user,
        balance: user.balance - car.price,
      });

      alert(`Successfully purchased ${car.make} ${car.model}!`);
    } catch (error) {
      console.error('Error purchasing car:', error);
      alert('Failed to purchase car. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-gray-800">Available Cars</h1>

          {user && (
            <div className="bg-white rounded-lg p-4 shadow-md">
              <p className="text-lg font-semibold">
                Balance: ${user.balance.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Cars grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image
                src={car.image.startsWith('/')
                  ? car.image
                  : `/cars/${car.image}`}
                alt={`${car.make} ${car.model}`}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {car.make} {car.model}
                </h2>
                <p className="text-gray-600">{car.year}</p>
                <p className="text-gray-700 mt-2">{car.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${car.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handlePurchase(car)}
                    disabled={!user || purchasing === car.id || user.balance < car.price}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      !user || user.balance < car.price
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {purchasing === car.id ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
                {user && user.balance < car.price && (
                  <p className="text-red-500 text-sm mt-2">
                    Insufficient balance
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

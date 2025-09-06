'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  isAdmin?: boolean;
}

interface Purchase {
  id: string;
  userId: string;
  carId: string;
  carMake: string;
  carModel: string;
  price: number;
  status: string;
  paymentStatus: string;
}

interface CarForm {
  make: string;
  model: string;
  year: string;
  price: string;
  image: string;
  description: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [carForm, setCarForm] = useState<CarForm>({
    make: '',
    model: '',
    year: '',
    price: '',
    image: '',
    description: '',
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          // Fetch users
          const usersQuery = query(
            collection(db, 'users'),
            where('isAdmin', '==', false)
          );
          const usersSnapshot = await getDocs(usersQuery);
          const usersData: User[] = [];
          usersSnapshot.forEach((doc) => {
            usersData.push({ id: doc.id, ...doc.data() } as User);
          });
          setUsers(usersData);

          // Fetch purchases
          const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
          const purchasesData: Purchase[] = [];
          purchasesSnapshot.forEach((doc) => {
            purchasesData.push({ id: doc.id, ...doc.data() } as Purchase);
          });
          setPurchases(purchasesData);

          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Top up user balance
  const handleTopUp = async () => {
    if (!selectedUser || !topUpAmount) return;
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userRef, {
        balance: selectedUser.balance + parseFloat(topUpAmount),
      });

      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, balance: user.balance + parseFloat(topUpAmount) }
            : user
        )
      );

      setTopUpAmount('');
      alert('Balance updated successfully!');
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Error updating balance');
    }
  };

  // Update purchase payment status
  const updatePaymentStatus = async (purchaseId: string, status: string) => {
    try {
      const purchaseRef = doc(db, 'purchases', purchaseId);
      await updateDoc(purchaseRef, { paymentStatus: status });

      setPurchases(
        purchases.map((purchase) =>
          purchase.id === purchaseId
            ? { ...purchase, paymentStatus: status }
            : purchase
        )
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  // Update purchase shipping status
  const updateShippingStatus = async (purchaseId: string, status: string) => {
    try {
      const purchaseRef = doc(db, 'purchases', purchaseId);
      await updateDoc(purchaseRef, { status });

      setPurchases(
        purchases.map((purchase) =>
          purchase.id === purchaseId ? { ...purchase, status } : purchase
        )
      );
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }
  };

  // Delete purchase
  const deletePurchase = async (purchaseId: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await deleteDoc(doc(db, 'purchases', purchaseId));
      setPurchases(purchases.filter((p) => p.id !== purchaseId));
      alert('Purchase deleted');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
    }
  };

  // Add new car
  const handleAddCar = async () => {
    try {
      if (
        !carForm.make ||
        !carForm.model ||
        !carForm.year ||
        !carForm.price ||
        !carForm.image
      ) {
        alert('Please fill in all required fields');
        return;
      }

      await addDoc(collection(db, 'cars'), {
        ...carForm,
        year: parseInt(carForm.year),
        price: parseFloat(carForm.price),
        createdAt: serverTimestamp(),
      });

      setCarForm({
        make: '',
        model: '',
        year: '',
        price: '',
        image: '',
        description: '',
      });

      alert('Car added successfully!');
    } catch (error) {
      console.error('Error adding car:', error);
      alert('Failed to add car');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navbar */}
      <div className="sticky top-0 bg-white shadow-md z-50 flex justify-between items-center px-4 py-3 mb-8">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={async () => {
            await auth.signOut();
            router.push('/login');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            User Management
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User to Top Up
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedUser?.id || ''}
              onChange={(e) =>
                setSelectedUser(
                  users.find((user) => user.id === e.target.value) || null
                )
              }
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (${user.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Amount"
                className="flex-1 p-2 border rounded"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
              <button
                onClick={handleTopUp}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Top Up
              </button>
            </div>
          )}
        </div>

        {/* Purchase Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Purchase Management
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Car
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Shipping
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {purchase.carMake} {purchase.carModel}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      ${purchase.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <select
                        className="p-1 border rounded"
                        value={purchase.paymentStatus}
                        onChange={(e) =>
                          updatePaymentStatus(purchase.id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <select
                        className="p-1 border rounded"
                        value={purchase.status}
                        onChange={(e) =>
                          updateShippingStatus(purchase.id, e.target.value)
                        }
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button
                        onClick={() => deletePurchase(purchase.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Car */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add New Car
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Make"
            value={carForm.make}
            onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Model"
            value={carForm.model}
            onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Year"
            value={carForm.year}
            onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={carForm.price}
            onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setCarForm({ ...carForm, image: e.target.files[0].name });
              }
            }}
            className="p-2 border rounded col-span-2"
          />
          <p className="text-sm text-gray-500 col-span-2">
            Place the selected image in <code>public/cars/</code> folder.
          </p>
          <textarea
            placeholder="Description"
            value={carForm.description}
            onChange={(e) =>
              setCarForm({ ...carForm, description: e.target.value })
            }
            className="p-2 border rounded col-span-2"
          />
        </div>
        <button
          onClick={handleAddCar}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Car
        </button>
      </div>
    </div>
  );
}

'use client'
import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function SellerPage() {

  let info =localStorage.getItem('userInfo');
  let totalFunds = 0;
  // console.log(info)
  if (info != null) {
    console.log(info)
    let json = JSON.parse(info)
    console.log("json",json)
    console.log("username", json.success.username)
    totalFunds = parseInt(json.success.totalFunds)
  }

  const [walletAmount, setWalletAmount] = useState(0);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const router = useRouter();


  const handleAddNewItem = () => {
    router.push('/pages/AddItemPage');
  };

  const handleCloseAccount = () => {
    // Close the account
    setWalletAmount(0);
    alert('Account closed.');
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Seller Home Page</h1>
        <div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => alert('Logged out')}>
            Log Out
          </button>
        </div>
      </header>

      <div className="mt-10 flex justify-end items-center space-x-4">
        <div className="text-lg">Wallet: ${walletAmount}</div>
        <button
          onClick={() => handleAddNewItem()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          New Item
        </button>
        <button
          onClick={handleCloseAccount}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close Account
        </button>
      </div>
    </main>
  );
}

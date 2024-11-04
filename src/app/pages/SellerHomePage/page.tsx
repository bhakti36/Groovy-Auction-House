'use client'
import { useState } from 'react';

export default function SellerPage() {
  const [walletAmount, setWalletAmount] = useState(0);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const handleAddNewItem = () => {
    if (newItemName.trim()) {
      // Add a new item 
      alert(`New item "${newItemName}" added.`);
      setNewItemName('');
      setShowNewItemDialog(false);
    }
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
          onClick={() => setShowNewItemDialog(true)}
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

      {showNewItemDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg mb-4">Add New Item</h2>
            <input
              type="text"
              placeholder="Enter item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddNewItem}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
              <button
                onClick={() => setShowNewItemDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

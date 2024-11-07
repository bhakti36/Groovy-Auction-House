'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

export default function BuyerPage() {

  let info = localStorage.getItem('userInfo');
  let totalFunds = 0;
  if (info != null) {
    let json = JSON.parse(info);
    totalFunds = parseInt(json.success.totalFunds);
  }
  
  const [walletAmount, setWalletAmount] = useState(totalFunds);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showCloseAccountDialog, setShowCloseAccountDialog] = useState(false);
  const router = useRouter();

  const handleAddMoney = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      setWalletAmount(walletAmount + amount);
      setInputAmount('');
      setShowAddMoneyDialog(false);
    }
  };

  const handleCloseAccount = () => {
    setShowCloseAccountDialog(true); 
  };

  const confirmCloseAccount = () => {
    const request = {
      buyerID: 1, 
    };

    instance.post('/buyer/closeAccount', request)
    .then((response) => {
      console.log('Response:', response.data);
      setErrorMessage('');
      setWalletAmount(0); 
      localStorage.removeItem('userInfo'); 
      router.push('/'); 
    })
    .catch((error) => {
      console.error('Error response:', error.response ? error.response.data : error.message);
      setErrorMessage('Error closing account.');
    });

    setShowCloseAccountDialog(false); 
  };

  const cancelCloseAccount = () => {
    setShowCloseAccountDialog(false); 
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userInfo');
    setShowLogoutDialog(false);
    router.push('/'); // Redirect to homepage on logout
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Buyer home page</h1>
        <div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="mt-10 flex justify-end items-center space-x-4">
        <div className="text-lg">Wallet: ${walletAmount}</div>
        <button
          onClick={() => setShowAddMoneyDialog(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Money
        </button>
        <button
          onClick={handleCloseAccount}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close Account
        </button>
      </div>

      {/* Add Money Dialog */}
      {showAddMoneyDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg mb-4">Add Money</h2>
            <input
              type="number"
              placeholder="Enter $ Amount"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="border p-2 mb-4 w-full"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddMoney}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
              <button
                onClick={() => setShowAddMoneyDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg mb-4">Are you sure you want to log out?</h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Account Confirmation Dialog */}
      {showCloseAccountDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg mb-4">Are you sure you want to close your account?</h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={confirmCloseAccount}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Close Account
              </button>
              <button
                onClick={cancelCloseAccount}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-500 rounded">
          {errorMessage}
        </div>
      )}
    </main>
  );
}

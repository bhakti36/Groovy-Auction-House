'use client'
import { totalmem } from 'os';
import { useState } from 'react';

export default function BuyerPage() {
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
  const [walletAmount, setWalletAmount] = useState(totalFunds);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [inputAmount, setInputAmount] = useState('');

  const handleAddMoney = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      setWalletAmount(walletAmount + amount);
      setInputAmount('');
      setShowAddMoneyDialog(false);
    }
  };

  const handleCloseAccount = () => {
    // Closing the account logic
    setWalletAmount(0);
    alert('Account closed.');
  };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Buyer home page</h1>
        <div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => alert('Logged out')}>
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
    </main>
  );
}

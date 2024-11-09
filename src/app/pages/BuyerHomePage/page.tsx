'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import './globals.css';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  value: string;
  timeLeft: string;
  status: string;
}

export default function BuyerPage() {
  const router = useRouter();
  let totalFunds = 0;
  let info = "";
  // let userID = 0;

  useEffect(() => {
    info = sessionStorage.getItem('userInfo')!;
    if (info != null) {
      const json = JSON.parse(info);
      setUserID(json.success.accountID);
      totalFunds = parseInt(json.success.totalFunds);
      setWalletAmount(totalFunds);
    }
  }, []);

  const [walletAmount, setWalletAmount] = useState(totalFunds);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [, setErrorMessage] = useState('');
  const [userType,] = useState('buyer');
  const [userID, setUserID] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortChoice, setSortChoice] = useState('timeLeft');
  const [items, setItems] = useState<Item[]>([]); 
  
  const handleCloseAccount = () => {
    console.log('handleCloseAccount called' + userID);
    const request = {
      buyerID: userID
    }
    instance.post('/buyer/closeAccount', request)
      .then((response) => {
        setErrorMessage('');
      })
      .catch((error) => {
        setErrorMessage('Error adding item.');
      })
    setWalletAmount(0);
    alert('Account closed.');
    router.push('/pages/LoginPage');
  };

  const handleAddMoney = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      if (info != null) {
        const json = JSON.parse(info);
        const accountid = json.success.accountID;

        const method = '/' + userType + '/addFunds';
        const request = {
          accountID: accountid,
          funds: amount,
        };

        instance.post(method, request).then((response) => {
          setWalletAmount(walletAmount + amount);
          json.success.totalFunds = walletAmount + amount;
          sessionStorage.setItem('userInfo', JSON.stringify(json));
        }).catch((error) => {
          console.log(error);
        });

        setInputAmount('');
        setShowAddMoneyDialog(false);
      }
    }
  };

  const handleViewItem = () => {
    const request = {
      IsPublished: false,
      IsComplete: false,
      IsFrozen: false
    };

    instance.post('/buyer/viewItem', request)
      .then((response) => {
        const responseItems = response.data.success.items;
        
        const formattedItems: Item[] = responseItems.map((item: any) => ({
          id: item.ItemID,
          name: item.Name,
          description: item.Description,
          image: JSON.parse(item.Images)[0]?.url || '/images/default_image.jpg',
          value: `$${item.InitialPrice}`,
          timeLeft: calculateTimeLeft(item.StartDate), 
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
      })
      .catch((error) => {
        setErrorMessage('Error retrieving items.');
      });
  };

  useEffect(() => {
    handleViewItem();
  }, []);

  const calculateTimeLeft = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortChoice === 'timeLeft') {
        return a.timeLeft.localeCompare(b.timeLeft);
      }
      return 0; 
  });

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="header">
        <h1 className="title">Buyer home page</h1>
        <div>
          <button className="button" onClick={() => alert('Logged out')}>
            Log Out
          </button>
        </div>
      </header>

      <div className="wallet-section">
        <div className="search-sort-container">
          <input
            type="text"
            placeholder="Search"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="search-box"
          />
          <select className="sort-choice">
            <option value="name">Sort by Name</option>
            <option value="value">Sort by Value</option>
            <option value="time">Sort by Time Left</option>
          </select>
          <button onClick={() => alert('Search button clicked')} className="search-button">
            Search
          </button>
        </div>
        <div className="wallet-amount">Wallet: ${walletAmount}</div>
        <button onClick={() => setShowAddMoneyDialog(true)} className="add-money-button">
          Add Money
        </button>
        <button onClick={handleCloseAccount} className="close-account-button">
          Close Account
        </button>
      </div>

      {showAddMoneyDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2 className="dialog-title">Add Money</h2>
            <input
              type="number"
              placeholder="Enter $ Amount"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="dialog-input"
            />
            <div className="dialog-buttons">
              <button onClick={handleAddMoney} className="button-ok">
                OK
              </button>
              <button onClick={() => setShowAddMoneyDialog(false)} className="button-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-container">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <img src={item.image} alt={item.name} className="item-image" />
            <h3 className="item-name">{item.name}</h3>
            <div className="item-status-value">
              <p className="item-time">Time Left</p>
              <p className="item-time">{item.timeLeft}</p>
            </div>
            <div className="item-status-value">
              <p className="item-status">{item.status}</p>
              <p className="item-value">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

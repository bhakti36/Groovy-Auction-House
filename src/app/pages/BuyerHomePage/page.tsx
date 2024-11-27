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
  startDate: string;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
  purchaseprice:number;

}

interface ItemJson {
  ItemID: number;
  Name: string;
  Description: string;
  Images: string;
  InitialPrice: number;
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  IsComplete: boolean;
  IsFrozen: boolean;
  PurchasePrice: number;
}

interface PurchaseItemJson {
  PurchaseID: number;
  ItemID: number;
  Name: string;
  Description: string;
  Images: string;
  PurchasePrice: number;
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  IsComplete: boolean;
  IsFrozen: boolean;
}

export default function BuyerPage() {
  const router = useRouter();
  let totalFunds = 0;
  let info = "";
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    info = sessionStorage.getItem('userInfo')!;
    if (info != null) {
      const json = JSON.parse(info);
      setUserID(json.success.accountID);
      console.log(json);
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
  const [sortChoice,] = useState('timeLeft');
  const [items, setItems] = useState<Item[]>([]);

  const handleCloseAccount = () => {
    const isConfirmed = window.confirm("Are you sure you want to close account?");
    if (isConfirmed) {
      console.log('handleCloseAccount called' + userID);
      const request = {
        buyerID: userID
      }
      instance.post('/buyer/closeAccount', request)
        .then((response) => {
          console.log('Response:', response);
          setErrorMessage('');
        })
        .catch((error) => {
          console.log(error);
          setErrorMessage('Error adding item.');
        })
      setWalletAmount(0);
      router.push('/pages/LoginPage');
    }
  };

  const handleAll = () => {
    console.log("all");
    handleViewItem();
  }
  const handleReviewBidsList = () => {
    //console.log("review bids");
    handleReviewBids();

  }
  const handleReviewPurchasesList = () => {
    //console.log("test 123");
    handleReviewPurchases();
  }


  const handleLogOut = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      console.log('handleLogOut called ' + userID);
      router.push('/pages/LoginPage');
    }
  };

  const handleAddMoney = () => {
    const amount = parseFloat(inputAmount);
    if (!isNaN(amount) && amount > 0) {
      if (info != null) {
        console.log("info", info)
        const accountid = userID

        const method = '/' + userType + '/addFunds';
        const request = {
          accountID: accountid,
          funds: amount,
        };

        instance.post(method, request).then((response) => {
          console.log('Response:', response);
          setWalletAmount(walletAmount + amount);
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
      IsPublished: true,
      IsComplete: false,
      IsFrozen: false
    };

    instance.post('/buyer/viewItem', request)
      .then((response) => {
        const responseItems = response.data.success.items;

        const base_html = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/"

        const formattedItems: Item[] = responseItems.map((item: ItemJson) => ({
          id: item.ItemID,
          name: item.Name,
          description: item.Description,
          image: base_html + (JSON.parse(item.Images)[0]) || '/images/default_image.jpg',
          value: `$${item.InitialPrice}`,
          timeLeft: calculateTimeLeft(item.StartDate, item.DurationDays, item.DurationHours, item.DurationMinutes),
          startDate: item.StartDate,
          durationDays: item.DurationDays,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
      });
  };

  const handleReviewBids = () => {
    const request = {
      buyerID:userID
    };

    instance.post('/buyer/reviewBids', request)
      .then((response) => {
        const responseItems = response.data.reviewBidsList;
       
console.log("hi",response);
        const base_html = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/"

        const formattedItems: Item[] = responseItems.map((item: ItemJson) => ({
          id: item.ItemID,
          name: item.Name,
          description: item.Description,
          image: base_html + (JSON.parse(item.Images)[0]) || '/images/default_image.jpg',
          value: `$${item.InitialPrice}`,
          timeLeft: calculateTimeLeft(item.StartDate, item.DurationDays, item.DurationHours, item.DurationMinutes),
          startDate: item.StartDate,
          durationDays: item.DurationDays,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
      });
  };

  const handleReviewPurchases = () => {
    const request = {
      buyerID:userID
    };

    instance.post('/buyer/reviewPurchases', request)
      .then((response) => {
        
        const responseItems = response.data.reviewPurchasesList;
        console.log("review purchase ka response",responseItems);

        const base_html = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/"

        const formattedItems: Item[] = responseItems.map((item: ItemJson) => ({
          id: item.ItemID,
          name: item.Name,
          description: item.Description,
          image: base_html + (JSON.parse(item.Images)[0]) || '/images/default_image.jpg',
          value: `$${item.InitialPrice}`,
          timeLeft: calculateTimeLeft(item.StartDate, item.DurationDays, item.DurationHours, item.DurationMinutes),
          startDate: item.StartDate,
          durationDays: item.DurationDays,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,
          purchaseprice: item.PurchasePrice,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
      });
  };

  useEffect(() => {
    handleViewItem();

    const interval = setInterval(() => {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          timeLeft: calculateTimeLeft(item.startDate, item.durationDays, item.durationHours, item.durationMinutes),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (startDate: string, durationDays: number, durationHours: number, durationMinutes: number) => {
    const now = new Date();
    const start = new Date(startDate);

    start.setDate(start.getDate() + durationDays);
    start.setHours(start.getHours() + durationHours);
    start.setMinutes(start.getMinutes() + durationMinutes);

    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
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
          <button className="button" onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      </header>

      <div className="wallet-section">
        <div className="search-sort-container">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <div className="filter-bar">
        <button onClick={() => handleAll()}> All </button>
        <button onClick={() => handleReviewBidsList()}> Review Active Bids </button>
        <button onClick={() => handleReviewPurchasesList()}> Review Purchases </button>
        
      </div>
      <div className="grid-container">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <img src={item.image} alt={item.name} className="item-image" />
            <h3 className="item-name">{item.name}</h3>
            <div className="item-status-value">
              <p className="item-time">Initial Price:</p>
              <p className="item-time">MaxBid Amount:</p>
            </div>
            <div className="item-status-value">
              <p className="item-time">Time Left</p>
              <p className="item-time">{item.timeLeft}</p>
            </div>
            <div className="item-status-value">
              <p className="item-status">{item.status}</p>
              <p className="item-value">{item.value}</p>
            </div>
            {/* <div className="item-status-value">
            <p className="item-status">Bid History..</p>
            </div> */}
          </div>
        ))}
      </div>
    </main>
  );
}

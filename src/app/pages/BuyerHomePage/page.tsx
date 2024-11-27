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
  MaxBidAmount: number;
  purchaseprice: number;

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
  MaxBidAmount: number;
  IsComplete: boolean;
  IsFrozen: boolean;
  PurchasePrice: number;
}


export default function BuyerPage() {
  const router = useRouter();
  let info = "";
  // const [filter, setFilter] = useState<string>("All");

  const [walletAmount, setWalletAmount] = useState(0);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [inputAmount, setInputAmount] = useState('');
  const [, setErrorMessage] = useState('');
  const [userType,] = useState('buyer');
  const [userID, setUserID] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortChoice,] = useState('timeLeft');
  const [items, setItems] = useState<Item[]>([]);
  const [userName, setUserName] = useState('');
  const [reviewPurchaseFlag, setreviewPurchaseFlag] = useState(false);
  const [allMaxBidFlag, setallMaxBidFlag] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>("all");
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    info = sessionStorage.getItem('userInfo')!;
    let userName = "";
    if (info != null) {
      const json = JSON.parse(info);
      setUserID(json.success.accountID);
      console.log("test", json);
      console.log("test", json.success.accountID);
      console.log("test", userID);
      console.log(json);
      // totalFunds = parseInt(json.success.totalFunds);
      // setWalletAmount(totalFunds);
      userName = json.success.username;
      setUserName(userName);
    }
  }, [userID]);


  const handleCloseAccount = () => {
    const isConfirmed = window.confirm("Are you sure you want to close account?");
    if (isConfirmed) {
      //console.log('handleCloseAccount called' + userID);
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
    //console.log("all");
    setreviewPurchaseFlag(true);
    setActiveButton("all");
    handleViewItem();
  }
  const handleReviewBidsList = () => {
    //console.log("review bids");
    setActiveButton("reviewBids");
    setreviewPurchaseFlag(true);
    handleReviewBids();

  }
  const handleReviewPurchasesList = () => {
    //console.log("test 123");
    setActiveButton("reviewPurchases");
    setreviewPurchaseFlag(false);
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
        //console.log("info", info)
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
    setreviewPurchaseFlag(true);
    setallMaxBidFlag(false);
    setLoading(true);
    const request = {
      buyerID: userID,
    };
    console.log('request:', request);
    setTimeout(() => {

      instance.post('/buyer/viewItem', request)
      .then((response) => {
        console.log('Response of all-->:', response);
        setWalletAmount(response.data.totalFunds);
        const responseItems = response.data.items;

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
          MaxBidAmount: item.MaxBidAmount,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
        setLoading(false); 
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
      });
     
    }, 1000); 

   
  };

  const handleReviewBids = () => {
    setLoading(true);
    setallMaxBidFlag(true);
    const request = {
      buyerID: userID
    };

    setTimeout(() => {
      instance.post('/buyer/reviewBids', request)
      .then((response) => {
        const responseItems = response.data.reviewBidsList;

        //console.log("response", response);
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
          MaxBidAmount: item.MaxBidAmount,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,

          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
        setLoading(false); 
      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
        setLoading(false); 
      });
     
    }, 1000); 


   
  };

  const handleReviewPurchases = () => {
    setLoading(true);
    setallMaxBidFlag(true);
    const request = {
      buyerID: userID
    };
//timeout
    setTimeout(() => {
      instance.post('/buyer/reviewPurchases', request)
      .then((response) => {

        const responseItems = response.data.reviewPurchasesList;
        console.log("responseItems", responseItems);

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
          MaxBidAmount: item.MaxBidAmount,
          purchaseprice: item.PurchasePrice,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);
        setErrorMessage('');
        setLoading(false); 
      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
        setLoading(false); 
      });
     
    }, 1000);

   
  };

  const handleItemClick = (itemId: number) => {
    sessionStorage.setItem('itemId', JSON.stringify(itemId));
    sessionStorage.setItem('buyerId', JSON.stringify(userID));
    sessionStorage.setItem('username', JSON.stringify(userName));
    router.push('/pages/ItemViewPage');
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
  }, [userID]);

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

    const getButtonClass = (button: string) => {
      return button === activeButton ? "active-button" : "";
    };

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

      {loading && (
        <div className="loader">
          <div className="spinner"></div> {/* Add your spinner here */}
        </div>
      )}

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
        <button  className={getButtonClass("all")} onClick={() => handleAll()}> All </button>
        <button className={getButtonClass("reviewBids")} onClick={() => handleReviewBidsList()}> Review Active Bids </button>
        <button className={getButtonClass("reviewPurchases")} onClick={() => handleReviewPurchasesList()}> Review Purchases </button>

      </div>
      <div className="grid-container">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card" onClick={() => { if (item.timeLeft != "Ended") handleItemClick(item.id) }}>
            <img src={item.image} alt={item.name} className="item-image" />
            <h3 className="item-name">{item.name}</h3>
            <div className="item-status-value">
              <p className="item-time">Initial Price:</p>
              <p className="item-time">{item.value}</p>
            </div>
            {allMaxBidFlag && (
            <div className="item-status-value">
              <p className="item-time">
                {reviewPurchaseFlag ? "MaxBid Amount" : "Sale Price:"}
              </p>
              <p className="item-time">{item.MaxBidAmount}</p>
            </div>
            )}

            {reviewPurchaseFlag && (
              <div className="item-status-value">
                <p className="item-time">Time Left</p>
                <p className="item-time">{item.timeLeft}</p>
              </div>
            )}
            {/* <div className="item-status-value">
              <p className="item-time">Purchased By</p>
              <p className="item-time">{userName}</p>
            </div> */}
            <div className="item-status-value">
              <p className="item-status">Status:</p>
              <p className="item-time">{item.status}</p>
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

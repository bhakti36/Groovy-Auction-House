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


export default function CustomerPage() {
  const router = useRouter();
  let info = "";
  // const [filter, setFilter] = useState<string>("All");

  const [, setErrorMessage] = useState('');
  const [userType,] = useState('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortChoice,setSortChoice] = useState('timeLeft');
  const [items, setItems] = useState<Item[]>([]);
  const [activeButton, setActiveButton] = useState<string | null>("all");
  const [loading, setLoading] = useState(false);
 
  const handleLogIn = () => {
    sessionStorage.clear();
    router.push('/pages/LoginPage');
  };
  
  const handleAll = () => {
    //console.log("all");
    setActiveButton("all");
    handleViewItem();
  }
  

  const handleViewItem = () => {
    setLoading(true);
    
    setTimeout(() => {

      instance.get('/customer/viewItem')
      .then((response) => {
        console.log('Response of all-->:', response);
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
  
  const handleItemClick = (itemId: number) => {
    sessionStorage.setItem('itemId', JSON.stringify(itemId));
    router.push('/pages/CustomerItemViewPage');
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
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortChoice === "timeLeft") return a.timeLeft.localeCompare(b.timeLeft);
      if (sortChoice === "value") return a.value.localeCompare(b.value);
      if (sortChoice === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    const getButtonClass = (button: string) => {
      return button === activeButton ? "active-button" : "";
    };

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <header className="header">
        <h1 className="title">Groovy Auction House</h1>
        <div>
          <button className="button" onClick={handleLogIn}>
            Log in
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
          <select
            className="sort-choice"
            value={sortChoice}
            onChange={(e) => setSortChoice(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="value">Sort by Value</option>
            <option value="timeLeft">Sort by Time Left</option>
          </select>
          {/* <button onClick={() => console.log(`Searching for: ${searchQuery}`)} className="search-button">
            Search
          </button> */}
        </div>
        
        
      </div>

      

      <div className="filter-bar">
        <button className={getButtonClass("all")} onClick={() => handleAll()}> All </button>
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

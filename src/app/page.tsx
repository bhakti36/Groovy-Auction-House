'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
import './globals.css';
import MultiRangeSlider from "multi-range-slider-react";
import Snowfall from 'react-snowfall';


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
  biddingHistory: Bid[];
  isMaxBid: boolean;
  purchaseprice: number;
}

interface Bid {
  BidID: number;
  BuyerID: number;
  ItemID: number;
  BidAmount: number;
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
  biddingHistory: Bid[];
  IsComplete: boolean;
  IsFrozen: boolean;
  PurchasePrice: number;
}


export default function CustomerPage() {
  const router = useRouter();
  const maxNumPrice = 100000;

  const [, setErrorMessage] = useState('');
  const [userType,] = useState('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortChoice,setSortChoice] = useState('timeLeft');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(maxNumPrice);
 
  const handleLogIn = () => {
    sessionStorage.clear();
    router.push('/pages/LoginPage');
  };


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
          value: item.biddingHistory[0]? item.biddingHistory[0].BidAmount:item.InitialPrice,
          timeLeft: calculateTimeLeft(item.StartDate, item.DurationDays, item.DurationHours, item.DurationMinutes),
          startDate: item.StartDate,
          durationDays: item.DurationDays,
          isMaxBid: item.biddingHistory[0]? true: false,
          durationHours: item.DurationHours,
          durationMinutes: item.DurationMinutes,
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        console.log(formattedItems)

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
    sessionStorage.removeItem('buyerId')
    sessionStorage.removeItem('username')
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
  }, [userType]);

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
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((item) => item.timeLeft !== 'Ended')
    .filter((item) => {
      const itemValue = Number(item.value);
      return itemValue >= minValue && (maxValue === maxNumPrice || itemValue <= maxValue);
    })
    .sort((a, b) => {
      if (sortChoice === "publishedDate") return a.startDate.localeCompare(b.startDate);
      if (sortChoice === "timeLeft") return a.timeLeft.localeCompare(b.timeLeft);
      if (sortChoice === "value") return Number(a.value) - Number(b.value);
      if (sortChoice === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <main className="min-h-screen p-6 bg-red-700">
      <Snowfall color="white" snowflakeCount={150} />
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
            <option value="publishedDate">Sort by Time Published</option>
          </select>
          <div className="multi-range-slider-container">
            <MultiRangeSlider
              min={0} 
              max={maxNumPrice} 
              minValue={minValue}
              maxValue={maxValue}
              ruler={false}
              label={false}
              barInnerColor="pink"
              style={{
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
              }}
              onInput={(e) => {
                setMinValue(e.minValue);
                setMaxValue(e.maxValue);
              }}
            />
            <div className="price-range-inputs">
            <label>
              <span style={{ color: 'white' }}>Price $</span>
              <input
                type="number"
                value={minValue}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= maxValue) {
                    setMinValue(value);
                  }
                }}
              />
              <span style={{ color: 'white' }}>~ $</span>
              <input
                type="text" 
                value={maxValue === maxNumPrice ? `${maxNumPrice}+` : maxValue} 
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue === `${maxNumPrice}+`) {
                    setMaxValue(maxNumPrice);
                  } else {
                    const value = Number(inputValue);
                    if (value >= minValue && value <= maxNumPrice) {
                      setMaxValue(value);
                    }
                  }
                }}
              />
            </label>
          </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="item-card"
            onClick={() => handleItemClick(item.id)}
          >
            <img src={item.image} alt={item.name} className="item-image" />
            <h3 className="item-name">{item.name}</h3>
            <div className="item-status-value">
              <p className="item-time">{item.isMaxBid? "Maximum Bid:" : "Initial Price:"}</p>
              <p className="item-time">${item.value}</p>
            </div>

            <p className="item-status-value">
                <span className="item-status">Time Left:</span>
                <span className="item-time">{item.timeLeft}</span>
            </p>

          </div>
        ))}

      </div>
    </main>
  );
}

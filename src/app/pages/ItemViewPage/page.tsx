'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import './globals.css';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

const base_html = 'https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/';

interface Bid {
  BidID: number;
  BuyerID: number;
  BidAmount: number;
}

// interface ItemDetails {
//   ItemId: number;
//   Name: string;
//   Description: string;
//   Images: string[];
//   StartDate: string;
//   DurationDays: number;
//   DurationHours: number;
//   DurationMinutes: number;
//   timeLeft: string;
//   IsPublished: number;
//   IsFrozen: number;
//   IsArchived: number;
//   IsComplete: number;
//   MaxBidAmount: number;
//   IsFailed: number;
//   biddingHistory: BiddingHistory[];
// }

export interface Item {
  ItemId: number;
  Name: string;
  Description: string;
  Images: string[];
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  timeLeft: string;
  IsPublished: number;
  IsFrozen: number;
  IsArchived: number;
  IsComplete: number;
  MaxBidAmount: number;
 // IsFailed: number;
  bids: Bid[];
}

export interface ItemJson {
  ItemID: number;
  Name: string;
  Description: string;
  Images: string[];
  InitialPrice: number;
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  IsComplete: number;
  IsFrozen: number;
  MaxBidAmount: number;
  IsPublished: number;
  IsArchived: number;
  bids: BidJson[];
}

export interface BidJson {
  BidID: number;
  BuyerID: number;
  BidAmount: number;
  BidTimeStamp: string;
}

export default function ItemViewPage() {
  const [item, setItem] = useState<Item | null>(null);
  //const [items, setItems] = useState<Item[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentBid, setCurrentBid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  useEffect(() => {
    // const info = sessionStorage.getItem('itemDetails');
    // if (info) {
    //   // try {
    //   //   const responseData = JSON.parse(info);
    //   //   const itemDetails = responseData.success.itemDetails;




    // }


    handleItemDetail();
  }, []);

  const handleItemDetail = () => {

    const itemId = sessionStorage.getItem('itemId');
    //console.log("inside item detail api call item---.",itemId)
    const buyerId = sessionStorage.getItem('buyerId');
    //console.log("inside item detail api call buyer-->",buyerId)

    const request = {
      itemId: itemId,
      buyerId: buyerId
    };

    instance
      .post("/buyer/detailItem", request)
      .then((response) => {
        console.log("Response:****", response.data.success.itemDetails);
        if (response.status !== 200) {
          setErrorMessage("Error retrieving items.");
          return;
        }
        const responseItem: ItemJson =
        response.data?.success?.itemDetails  || null;
        console.log("Response Items:--->", responseItem);
        if (!responseItem) {
          console.error("No item found in the response.");
          return;
        }
        const base_html =
          "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/";
         // const imageUrl = JSON.parse(responseItem.Images)?.[0] || "default_image.jpg";

          const timeLeft = calculateTimeLeft(
            responseItem.StartDate,
            responseItem.DurationDays,
            responseItem.DurationHours,
            responseItem.DurationMinutes
          );
          
          const formattedItem: Item = {
            ItemId: responseItem.ItemID, // Matching the interface property
            Name: responseItem.Name,
            Description: responseItem.Description,
            Images: Array.isArray(responseItem.Images)? responseItem.Images : JSON.parse(responseItem.Images).map((key: string) => `${base_html}${key}`),
            StartDate: responseItem.StartDate,
            DurationDays: responseItem.DurationDays,
            DurationHours: responseItem.DurationHours,
            DurationMinutes: responseItem.DurationMinutes,
            timeLeft,
            IsPublished: responseItem.IsPublished,
            IsFrozen: responseItem.IsFrozen,
            IsArchived: responseItem.IsArchived,
            IsComplete: responseItem.IsComplete,
            MaxBidAmount: responseItem.MaxBidAmount,
           // IsFailed: responseItem.IsFailed,
            bids: (responseItem.bids || []).map((bid: any) => ({
              BidID: bid.BidID,
              BuyerID: bid.BuyerID,
              BidAmount: bid.BidAmount,
              BidTimeStamp: bid.BidTimeStamp,
            })),
          };
          
          setItem(formattedItem); 
         
      })
      .catch((error) => {
        console.error("Error response:", error);
        setErrorMessage("Error retrieving items.");
      });

  }

  useEffect(() => {
    const interval = setInterval(() => {
      setItem((prevItem) => {
        // Check if prevItem exists (it could be null)
        if (prevItem) {
          return {
            ...prevItem, 
            timeLeft: calculateTimeLeft(
              prevItem.StartDate,
              prevItem.DurationDays,
              prevItem.DurationHours,
              prevItem.DurationMinutes
            ),
          };
        }
        return prevItem; 
      });
    }, 1000);
  
    return () => clearInterval(interval); 
  }, []);
  

  const handlePlaceBid = () => {
    const itemId = sessionStorage.getItem('itemId');
    const buyerId = sessionStorage.getItem('buyerId');

    if (!item || !itemId || !buyerId) {
      setErrorMessage('Missing item or buyer details. Please refresh the page and try again.');
      return;
    }

    if (!currentBid || isNaN(Number(currentBid))) {
      setErrorMessage('Please enter a valid bid amount.');
      return;
    }

    const bidAmount = Number(currentBid);

    if (bidAmount <= item.MaxBidAmount) {
      setErrorMessage(`Your bid must be greater than the current max bid of $${item.MaxBidAmount}.`);
      return;
    }

    setErrorMessage('');

    const request = {
      itemID: itemId,
      accountID: buyerId,
      bidAmount,
    };

    // console.log('Request for placing bid:', request);
    // API call
    instance.post('/buyer/placeBid', request)
      .then((response) => {
        console.log("test", response.data.message)
        window.alert(response.data.message);
        router.push("/pages/BuyerHomePage");

      })
      .catch((error) => {
        console.error('Error response:', error);
        setErrorMessage('Error retrieving items.');
      });
  };

  const handlePrevImage = () => {
    if (item) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? item.Images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (item) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === item.Images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const calculateTimeLeft = (
    startDate: string,
    durationDays: number,
    durationHours: number,
    durationMinutes: number
  ) => {
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

  return (
    <div className="item-detail-page">
      {item ? (
        <>
          <div className="image-container">
            <button className="prev-button" onClick={handlePrevImage} aria-label="Previous Image">
              &#8249;
            </button>
            <img
              src={item.Images[currentImageIndex]}
              alt={`Item image ${currentImageIndex + 1}`}
              className="item-image"
            />
            <button className="next-button" onClick={handleNextImage} aria-label="Next Image">
              &#8250;
            </button>
          </div>

          <div className="item-info">
            <h1>{item.Name}</h1>
            <p>{item.Description}</p>
            <div className="bid-entry">
              <label htmlFor="currentBid">Enter Your Bid:</label>
              <input
                type="number"
                id="currentBid"
                placeholder="Enter your bid"
                min={item.MaxBidAmount + 1}
                value={currentBid}
                onChange={(e) => setCurrentBid(e.target.value)}
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="place-bid-button" onClick={handlePlaceBid}>
              Place Bid
            </button>

            {/* <div className="bidding-history">
              <h2>Bidding History</h2>
              {item.biddingHistory.length > 0 ? (
                item.biddingHistory.map((bid, index) => (
                  <div key={index} className="bid-entry">
                    <p>Bid Amount: ${bid.BidAmount}</p>
                  </div>
                ))
              ) : (
                <p>No bids yet.</p>
              )}
            </div> */}
            <p className="item-time">Time Left: {item.timeLeft}</p>
          </div>
        </>
      ) : (
        <p>Loading item details...</p>
      )}
    </div>
  );
}


'use client';

import React, { useEffect,useState } from "react";
import "./globals.css";
import axios from 'axios';



const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});
const base_html = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/"

interface BiddingHistory {
  BidID: number;
  BuyerID: number;
  BidAmount: number;
}

interface ItemDetails {
  ItemId: number;
  Name: string;
  Description: string;
  Images: string[];
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  IsPublished: number;
  IsFrozen: number;
  IsArchived: number;
  IsComplete: number;
  IsFailed: number;
  biddingHistory: BiddingHistory[];
}

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
}

export default function ItemViewPage() {
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [items, setItems] = useState<Item[]>([]); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  let info = "";
  // const item = {
  //   name: "Antique Vase",
  //   description: "A rare antique vase from the 18th century.",
  //   images: [
  //     "https://via.placeholder.com/600x400?text=Image+1",
  //     "https://via.placeholder.com/600x400?text=Image+2",
  //     "https://via.placeholder.com/600x400?text=Image+3",
  //   ],
    
  // };

 
  useEffect(() => {
    info = sessionStorage.getItem('itemDetails')!;
    if (info) {
      try {
        const responseData = JSON.parse(info);

        // Extracting item details from the response
        const itemDetails = responseData.success.ItemDetails;
        const transformedItem: ItemDetails = {
          ...itemDetails,
          Images: JSON.parse(itemDetails.Images).map((key: string) => `${base_html}${key}`), 
        };

        setItem(transformedItem);
        // console.log("Transformed Item Details:-----", transformedItem);

        const formattedItems: Item[] = itemDetails.map((item: ItemJson) => ({
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
          // status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available'
        }));

        setItems(formattedItems);

        //time left div
        const interval = setInterval(() => {
          setItems(prevItems => 
            prevItems.map(item => ({
              ...item,
              timeLeft: calculateTimeLeft(item.startDate, item.durationDays, item.durationHours, item.durationMinutes),
            }))
          );
        }, 1000);
        console.log("interval-->",interval);

        //
      } catch (error) {
        console.error("Error parsing item details:-----", error);
      }
    }
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

  const handlePlaceBid = (itemId: number) => {
    console.log("Placing a bid for item:", itemId);
  
  };
  


  // // Handle image navigation
  // const handlePrevImage = () => {
  //   setCurrentImageIndex((prevIndex) =>
  //     prevIndex === 0 ? item.images.length - 1 : prevIndex - 1
  //   );
  // };

  // const handleNextImage = () => {
  //   setCurrentImageIndex((prevIndex) =>
  //     prevIndex === item.images.length - 1 ? 0 : prevIndex + 1
  //   );
  // };

  return (
    <div className="item-detail-page">
      {item ? (
        <>
          {/* Image Viewer */}
          <div className="image-container">
            <img
              src={item.Images[0]} 
              className="item-image"
            />
          </div>

          {/* Item Details */}
          <div className="item-info">
            <h1>{item.Name}</h1>
            <p>{item.Description}</p>
            <div className="item-status-value">
              <p className="item-time">Time Left</p>
              <p className="item-time">checkingg</p>
            </div>

            {/* Place Bid Button */}
        <button
          className="place-bid-button"
          onClick={() => handlePlaceBid(item.ItemId)}
        >
          Place Bid
        </button>
          </div>

          {/* Bidding History */}
          <div className="bidding-history">
            <h2>Bidding History</h2>
            {item.biddingHistory.map((bid, index) => (
              <div key={index}>
                <p>Bid ID: {bid.BidID}</p>
                <p>Buyer ID: {bid.BuyerID}</p>
                <p>Bid Amount: ${bid.BidAmount}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading item details...</p>
      )}
    </div>
  );

}





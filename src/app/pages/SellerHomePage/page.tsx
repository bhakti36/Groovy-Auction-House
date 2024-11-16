'use client'
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';

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

interface ItemJson { 
  ItemID: number; 
  Name: string; 
  Description: string; 
  Images: string;
  InitialPrice: number; 
  StartDate: string; 
  IsComplete: boolean; 
  IsFrozen: boolean; 
  }

export default function SellerPage() {
  let totalFunds = 0;
  useEffect(() => {
    const info =sessionStorage.getItem('userInfo');
    let userName='';
    // console.log(info)
    if (info != null) {
      console.log(info)
      const json = JSON.parse(info)
      console.log("json",json)
      console.log("username", json.success.username)
      totalFunds = parseInt(json.success.funds)
      console.log(totalFunds)
      setWalletAmount(totalFunds)
      userName=json.success.username;
      setUserName(userName)
      setUserID(json.success.accountID)
    }
  }, []);

  const [walletAmount, setWalletAmount] = useState(0);
  // const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  // const [newItemName, setNewItemName] = useState('');
  const router = useRouter();
  const [, setErrorMessage] = useState('');
  const [userNameHome, setUserName] = useState('');
  const [searchQuery, ] = useState('');
  const [sortChoice,] = useState('timeLeft');
  const [userID, setUserID] = useState(2);
  const handleAddNewItem = () => {
    router.push('/pages/AddItemPage');
  };
  const [items, setItems] = useState<Item[]>([]); 

  
  const handleCloseAccount = () => {
    const request = {
      sellerID: userID
    }
    instance.post('/seller/closeAccount',request)
    .then((response)=>{
      console.log('Response:', response.data);
      setErrorMessage('');
    })
    .catch((error)=>{
      console.error('Error response:', error.response ? error.response.data : error.message);
      setErrorMessage('Error adding item.');
    })
    setWalletAmount(0);
    alert('Account closed.');
    router.push('/pages/LoginPage');
  };
  const handleViewItem = () => {
    const request = {
      sellerID: userID
    };
  
    instance.post('/seller/reviewItems', request)
      .then((response) => {
        console.log('Full API response:', JSON.stringify(response, null, 2));
  
        // Attempt to access `items` in different possible locations based on the actual response structure
        let responseItems = null;
        if (response.data && response.data.success && Array.isArray(response.data.success.items)) {
          responseItems = response.data.success.items;
        } else if (response.data && Array.isArray(response.data.items)) {
          responseItems = response.data.items;
        } else {
          console.error("Unexpected response format:", response.data);
          setErrorMessage('Error: Unexpected response format.');
          return;
        }
  
        const base_html = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/";
  
        const formattedItems: Item[] = responseItems.map((item: ItemJson) => ({
          id: item.ItemID,
          name: item.Name,
          description: item.Description,
          image: base_html + (JSON.parse(item.Images)[0] || 'default_image.jpg'),
          value: `$${item.InitialPrice}`,
          timeLeft: calculateTimeLeft(item.StartDate),
          status: item.IsComplete ? 'Sold' : item.IsFrozen ? 'Pending' : 'Available',
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
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-semibold">Seller Home Page</h1>
        <h1>{userNameHome}</h1>
        
      </header>

      <div className="mt-10 flex justify-end items-center space-x-4">
        <div className="text-lg">Wallet: ${walletAmount}</div>
        <button
          onClick={() => handleAddNewItem()}
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
            {/* Action Buttons in Two Rows */}
            <div className="item-actions">
              <button className="action-button frozen-button">Frozen</button>
              <button className="action-button archive-button">Archive</button>
              <button className="action-button publish-button">Publish</button>
              <button className="action-button edit-button">Edit</button>
            </div>
          </div>
          
        ))}
      </div>
    </main>
  );
}
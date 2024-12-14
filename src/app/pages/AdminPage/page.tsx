'use client'
import React, { useState, useEffect  } from 'react';
import Snowfall from 'react-snowfall'; 
import axios from 'axios';
import './globals.css';
import { useRouter } from 'next/navigation';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

interface ItemDetail {
  name: string;
  status: string;
  id: number;
  requestUnfreeze: boolean;
}

const AdminPage = () => {
  const [itemList, setItemList] = useState<ItemDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [userID, setUserID] = useState(1);
  const [accountID, setAccountID] = useState(1);
  const [userName, setUserName] = useState('');
  const [userType,] = useState('admin');
  const router = useRouter();

  useEffect(() => {
    
    let userName = sessionStorage.getItem("userName");
    let userID = sessionStorage.getItem("userID");
    let userType = sessionStorage.getItem("userType");
    if (userName === null || userID === null || userType === null || userType !== "admin") {
      router.push("/");
    } else {
      setUserName(userName);
      setUserID(parseInt(userID));  
      const fetchItems = async () => {
        setLoading(true);
        try {
          const response = await instance.post('/admin/freeze_unfreeze', {
            accountID: userID,
          });
          console.log(response.data);
          const itemDetailList = response.data.items.map((item: any) => ({
            name: item.name || 'Unnamed Item',
            status: item.isFrozen ? 'Frozen' : 'Unfrozen',
            requestUnfreeze: item.unFreezeRequested,
            id: item.itemID,
          }));
          setItemList(itemDetailList);
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    }
  }, [userID]);

  const handleFreezeUnfreeze = async (id: number, freeze: boolean) => {
    setItemList((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, requestUnfreeze: freeze && item.requestUnfreeze? true: false, status: freeze ? 'Frozen' : 'Unfrozen' } : item
      )
    );

    try {
      const response = await instance.post('/admin/freeze_unfreeze', {
        accountID: accountID,
        freeze,
        itemID: id,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const handleLogOut = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      console.log('handleLogOut called ' + userID);
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userID");
      router.push('/');
    }
  };

  const handleAuctionReport = () => {
    setLoading(true);
    router.push('/pages/ReportPage');
  };

  const handleForensicReport = () => {
    setLoading(true);
    router.push('/pages/ForensicReportPage');
  };

  return (
    <main className="min-h-screen p-6 bg-red-700">
      <Snowfall color="white" snowflakeCount={150} />
      <header className="header">
        <h1 className="title">Groovy Auction House</h1>
        <button className="button" onClick={handleLogOut}>
            Log Out
        </button>
      </header>    
      <div className="button-group">
          <button className="button" onClick={() => handleAuctionReport()}>Generate Auction Report</button>
          <button className="button" onClick={() => handleForensicReport()}>Generate Forensic Report</button>
      </div>    
      <table className="item-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Status</th>
            <th>Requested Unfreeze</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {itemList.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className={`status ${item.status.toLowerCase()}`}>{item.status}</td>
              <td>{item.requestUnfreeze ? 'Yes' : 'No'}</td>
              <td>
                <button
                  className="action-button small-button"
                  onClick={() => handleFreezeUnfreeze(item.id, true)}
                  disabled={item.status === 'Frozen'}
                >
                  Freeze
                </button>
                <button
                  className="action-button small-button"
                  onClick={() => handleFreezeUnfreeze(item.id, false)}
                  disabled={item.status === 'Unfrozen'}
                >
                  Unfreeze
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </main>
  )}
      
       

      
 


export default AdminPage;

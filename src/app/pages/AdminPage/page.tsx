'use client'
import React, { useState, useEffect  } from 'react';
import Snowfall from 'react-snowfall'; // Import Snowfall effect
import axios from 'axios';
import { useRouter } from 'next/navigation';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

interface ItemDetail {
  name: string;
  status: string;
  itemID: number;
  unFreezeRequested: boolean;
  isFrozen: boolean;
}

const AdminPage = () => {
  const [itemList, setItemList] = useState<ItemDetail[]>([]);
  const [, setLoading] = useState(false);
  const [accountID, setAccountID] = useState(1);
  const router = useRouter();

  useEffect(() => {

    const userName = sessionStorage.getItem("userName");
    const userID = sessionStorage.getItem("userID");
    const userType = sessionStorage.getItem("userType");

    if (userName === null || userID === null || userType === null || userType !== "admin") {
      router.push("/");
    } else {
      setAccountID(parseInt(userID));  
    }

    console.log('Account ID:', accountID);
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await instance.post('/admin/freeze_unfreeze', {
          accountID: accountID,
        });
        console.log(response.data);
        const itemDetailList = response.data.items.map((item: ItemDetail) => ({
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
  }, [accountID]);

  const handleFreezeUnfreeze = async (id: number, freeze: boolean) => {
    setItemList((prevItems) =>
      prevItems.map((item) =>
        item.itemID === id ? { ...item, requestUnfreeze: freeze && item.unFreezeRequested? true: false, status: freeze ? 'Frozen' : 'Unfrozen' } : item
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

  const handleAuctionReport = () => {
    setLoading(true);
    router.push('/pages/ReportPage');
  };

  const handleForensicReport = () => {
    setLoading(true);
    router.push('/pages/ForensicReportPage');
  };

  const handleLogOut = () => {
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      console.log('handleLogOut called ' + accountID);
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userID");
      router.push('/');
    }
  };

  return (

    <div style={{ position: 'relative', height: '100vh', backgroundColor: '#dc2626' }}>
    {/* Snowfall Effect */}
    <Snowfall color="white" snowflakeCount={150} />
    <header className="header">
        <h1 className="title">Groovy Auction House - Admin</h1>
        <div className="flex items-center space-x-4">
          <button className="button" onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      </header>

        <div >
      <div className="button-container">
        <div><button onClick={() => handleAuctionReport()}>Generate Auction Report</button></div>
        <div><button onClick={() => handleForensicReport()}>Generate Forensic Report</button></div>
      </div>
      <table>
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
            <tr key={item.itemID}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.unFreezeRequested ? 'Yes' : 'No'}</td>
              <td>
                <button
                  onClick={() => handleFreezeUnfreeze(item.itemID, true)}
                  disabled={item.status === 'Frozen'}
                >
                  Freeze
                </button>
                <button
                  onClick={() => handleFreezeUnfreeze(item.itemID, false)}
                  disabled={item.status === 'Unfrozen'}
                >
                  Unfreeze
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )}
      
       

      
 


export default AdminPage;

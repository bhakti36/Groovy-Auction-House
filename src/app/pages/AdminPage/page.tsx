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
  id: number;
  requestUnfreeze: boolean;
}

const AdminPage = () => {
  const [itemList, setItemList] = useState<ItemDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountID, setAccountID] = useState(1);
  const router = useRouter();

  useEffect(() => {
    let info = sessionStorage.getItem('userInfo');
    if (info != null) {
      const json = JSON.parse(info);
      setAccountID(json.success.accountID);
    }
    console.log('Account ID:', accountID);
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await instance.post('/admin/freeze_unfreeze', {
          accountID: accountID,
        });
        console.log(response.data);
        const itemDetailList = response.data.items.map((item: any) => ({
          name: item.Name || 'Unnamed Item',
          status: item.IsFrozen ? 'Frozen' : 'Unfrozen',
          requestUnfreeze: item.UnFreezeRequested,
          id: item.ItemID,
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

  const handleAuctionReport = () => {
    setLoading(true);
    router.push('/pages/ReportPage');
  };

  const handleForensicReport = () => {
    setLoading(true);
    router.push('/pages/ForensicReportPage');
  };

  return (

    <div style={{ position: 'relative', height: '100vh', backgroundColor: '#dc2626' }}>
    {/* Snowfall Effect */}
    <Snowfall color="white" snowflakeCount={150} />
        <div >
        <h1 className="text-xl  font-semibold text-white">GROOVY ACTION HOUSE</h1>
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
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>{item.requestUnfreeze ? 'Yes' : 'No'}</td>
              <td>
                <button
                  onClick={() => handleFreezeUnfreeze(item.id, true)}
                  disabled={item.status === 'Frozen'}
                >
                  Freeze
                </button>
                <button
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
    </div>
    </div>
  )}
      
       

      
 


export default AdminPage;

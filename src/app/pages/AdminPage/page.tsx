'use client'
import React, { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const instance = axios.create({
    baseURL: 'https://uum435a7xb.execute-api.us-east-2.amazonaws.com/Test',
    });

 

const AdminPage : React.FC = () => {
  const [userType, setUserType] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [itemList, setItemList] = useState([
    { id: 1, name: 'Antique Vase', status: 'Active' },
    { id: 2, name: 'Vintage Painting', status: 'Frozen' },
    { id: 3, name: 'Rare Coin', status: 'Active' },
  ]);

  // Handle Freeze action
  const handleFreezeUnfreeze = (id: number, freeze: boolean) => {
    setItemList((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, status: freeze ? 'Frozen' : 'Unfrozen' } : item
      )
    );
    

    let method = '/' + userType + '/freeze';
    let request = {
      admin_credential: {
          username: "Admin",  
          password: "Admin123"   
      },
      freeze: freeze,          
      itemID: id
  };
    
    instance.post(method, request).then((response) => {
        console.log(response);
        //if response is admin specific
        console.log("Freezed");
        // navigate('/adminhome');

        
    }).catch((error) => {
        console.log(error);
    });
   // setErrorMessage('');
  };

  // Handle Unfreeze action
  // const handleUnfreeze = (id: number) => {
  //   setItemList((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, status: 'Active' } : item
  //     )
  //   );

  //   let method = '/' + userType + '/unfreeze';
  //    let request = {
  //        username: username,
  //        password: password
  //  }
    
  //   instance.post(method, request).then((response) => {
  //       console.log(response);
  //       //if response is admin specific
  //       console.log("Un Freezed");
  //       // navigate('/adminhome');

        
  //   }).catch((error) => {
  //       console.log(error);
  //   });
  // };
  // const navigate = useNavigate();
  
  const handleReport = () => {}
  

  return (
    <div >
      <h1>XXX Auction - Admin</h1>
      <div><button onClick={() => handleReport()}>Generate Report</button></div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Status</th>
            <th>Freeze</th>
            <th>Unfreeze</th>
          </tr>
        </thead>
        <tbody>
          {itemList.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleFreezeUnfreeze(item.id,true)} disabled={item.status === 'Frozen'}>Freeze</button>
              </td>
              <td>
                <button onClick={() => handleFreezeUnfreeze(item.id,false)} disabled={item.status === 'Unfrozen'}>Unfreeze</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        
    </div>
  )}
      
       

      
 


export default AdminPage;

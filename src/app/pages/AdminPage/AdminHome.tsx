'use client'
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://uum435a7xb.execute-api.us-east-2.amazonaws.com/Test',
    });

const AdminPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('buyer');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    let method = '/' + userType + '/login';
    let request = {
        username: username,
        password: password
    }
    
    instance.post(method, request).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
    setErrorMessage(''); // Clear error message on successful login
  };

  

  return (
    <div className="admin-freeze-unfreeze-page">
      <h1>XXX Auction - Admin</h1>
      
        

    </div>
  );
};

export default AdminPage;

'use client'
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('buyer');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

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
        if (response.data.status == 200) {
          // console.log("hii");
            // Redirect to the appropriate page
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            if (userType == 'buyer') {
                // Redirect to buyer page
                router.push('/pages/BuyerHomePage')
            } else if (userType == 'seller') {
              router.push('/pages/SellerHomePage')
                // Redirect to seller page
            } else if (userType == 'admin') {
                // Redirect to admin page
              router.push('/pages/AdminPage')
            }
        }
        else {
            setErrorMessage('Invalid username or password');
        } 
    }).catch((error) => {
        console.log(error);
    });
    setErrorMessage(''); // Clear error message on successful login
  };

  const handleRegister = () => {
    if (!username || !password || (isRegister && !confirmPassword)) {
      setErrorMessage('Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Make sure you enter the same password twice!');
      return;
    }
    let method = '/' + userType + '/createAccount';
    let request = {
        username: username,
        password: password
    }

    instance.post(method, request).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });


    setErrorMessage(''); // Clear error message on successful registration
  };

  return (
    <div className="login-register-page">
      <h1>XXX Auction - Login/Register</h1>
      <div>
        <input
          type="text"
          placeholder="Please input the username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
      </div>
      <div>
        <input
          type="password"
          placeholder="Please input the password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {isRegister && (
        <div>
          <input
            type="password"
            placeholder="Please confirm the password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="error">Make sure you enter the same password twice!</p>
          )}
        </div>
      )}
      
        <div>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            {!isRegister && <option value="admin">Admin</option>}
          </select>
        </div>

      <div>
        <button onClick={() => (isRegister ? handleRegister(): handleLogin())}>
          {isRegister? 'Register' : 'Login'}
        </button>
        
        <button onClick={() => (isRegister ? setIsRegister(false) : setIsRegister(true))}>
          {isRegister ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div>
      {errorMessage && (
        <p className="error">{errorMessage}</p>
      )}
    </div>
  );
};

export default LoginPage;

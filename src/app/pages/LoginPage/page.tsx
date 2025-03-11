'use client'
import React, { useState } from 'react';
import Snowfall from 'react-snowfall'; // Import Snowfall effect
import { useRouter } from "next/navigation";
import axios from 'axios';

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Popup 

  const router = useRouter();

  const handleLogin = () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const method = '/' + userType + '/login';
    const request = {
        username: username,
        password: password
    }
    
    instance.post(method, request).then((response) => {
        console.log(response);
        if (response.data.status == 200) {
          // console.log("hii");
          console.log(response.data);
            // Redirect to the appropriate page
            sessionStorage.setItem('userID', response.data.success.accountID);
            sessionStorage.setItem('userName', response.data.success.username);
            sessionStorage.setItem('userType', userType);
            // sessionStorage.removeItem('userInfo');
            // sessionStorage.setItem('userInfo', JSON.stringify(response.data));

            if (userType == 'buyer') {
                router.push('/pages/BuyerHomePage');
            } else if (userType == 'seller') {
                router.push('/pages/SellerHomePage');
            } else if (userType == 'admin') {
                router.push('/pages/AdminPage');
            }
        }
        else if(response.data.status == 403) {
          setErrorMessage('Account is closed');
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
    const method = '/' + userType + '/createAccount';
    const request = {
        username: username,
        password: password
    };

    instance.post(method, request)
    .then((response) => {
      console.log(response);
      if (response.data.status === 200) {
        setShowSuccessPopup(true);
        setErrorMessage('');
      } else {
        setErrorMessage('Username Exists');
      }
    })
    .catch((error) => {
      if (error.response && error.response.data.code === 401 && error.response.data.message === 'Username Exists') {
        setErrorMessage('Username already exists. Please choose a different one.');
      } else {
        setErrorMessage('Username Exists');
      }
    }); 
  };

  return (
    <div style={{ position: 'relative', height: '100vh', backgroundColor: '#dc2626' }}>
      {/* Snowfall Effect */}
      <Snowfall color="white" snowflakeCount={150} />

      <div className="login-register-page" style={{
        maxWidth: '400px',
        margin: 'auto',
        padding: '20px',
        border: '1px solid #ccc',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        background: 'rgba(255, 255, 255, 0.9)', // Semi-transparent background
        borderRadius: '10px',
      }}>
        <h1 style={{ color: '#d32f2f' }}>GROOVY-AUCTION_HOUSE - Login/Register</h1>
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
              <p className="error" style={{ color: '#d32f2f' }}>Make sure you enter the same password twice!</p>
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
            {isRegister ? 'Register' : 'Login'}
          </button>
          
          <button onClick={() => (isRegister ? setIsRegister(false) : setIsRegister(true))}>
            {isRegister ? 'Switch to Login' : 'Switch to Register'}
          </button>
        </div>
        {errorMessage && (
          <p className="error" style={{ color: '#d32f2f' }}>{errorMessage}</p>
        )}
        {showSuccessPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">Registration Successful</h2>
              <p>Your account has been successfully created.</p>
              <button
                onClick={() =>{ setShowSuccessPopup(false); router.back(); }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

'use client'
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://uum435a7xb.execute-api.us-east-2.amazonaws.com/Test',
});

const AddItemPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [images, setImages] = useState<File[]>([]); 
  const [startTime, setStartTime] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddItem = () => {
    // Log values before making the request
    console.log('handleAddItem called');
    console.log('name:', name);
    console.log('description:', description);
    console.log('initialPrice:', initialPrice);
    console.log('images:', images);
    console.log('startTime:', startTime);
    console.log('durationDays:', durationDays);
    console.log('durationHours:', durationHours);
    console.log('durationMinutes:', durationMinutes);

    if (!name || !description || !initialPrice || !startTime || !durationDays || !durationHours || !durationMinutes) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    const request = {
      Name: name,
      Description: description,
      Initial_Price: initialPrice,
      Images: images,
      StartDate: startTime,
      DurationDays: parseInt(durationDays),
      DurationHours: parseInt(durationHours),
      DurationMinutes: parseInt(durationMinutes),
      SellerID: 2, // Default SellerID set to 2
    };

    console.log('Request payload:', request); // Log the full request payload

    instance.post('/seller/additem', request)
      .then((response) => {
        console.log('Response:', response.data);
        setErrorMessage(''); 
      })
      .catch((error) => {
        console.error('Error response:', error.response ? error.response.data : error.message);
        setErrorMessage('Error adding item.');
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); 
    setImages(files);
  };

  return (
    <div className="add-item-page">
      <h1>Add Item</h1>
      <div>
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <textarea
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Initial Price"
          value={initialPrice}
          onChange={(e) => setInitialPrice(e.target.value)}
        />
      </div>
      <div>
        <input
          type="file"
          multiple
          onChange={handleImageUpload}
        />
        {images.length > 0 && <p>{images.length} image(s) selected</p>}
      </div>
      <div>
        <label>Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="duration-container">
        <label>Duration (Days):</label>
        <input
          type="number"
          value={durationDays}
          min="0"
          onChange={(e) => setDurationDays(e.target.value)}
        />
        <label>Hours:</label>
        <input
          type="number"
          value={durationHours}
          min="0"
          max="23"
          onChange={(e) => setDurationHours(e.target.value)}
        />
        <label>Minutes:</label>
        <input
          type="number"
          value={durationMinutes}
          min="0"
          max="59"
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleAddItem}>Submit Changes</button>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default AddItemPage;

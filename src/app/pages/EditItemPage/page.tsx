'use client'
import React, { useState } from 'react';
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://uum435a7xb.execute-api.us-east-2.amazonaws.com/Test',
});

const EditItemPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [images, setImages] = useState<File[]>([]); 
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEditItem = () => {
    if (!name || !description || !initialPrice || !startTime || !endTime) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    const request = {
      name,
      description,
      initialPrice,
      images, 
      startTime,
      endTime,
    };

    instance.post('/seller/additem', request)
      .then((response) => {
        console.log(response);
        setErrorMessage(''); 
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage('Error editing item.');
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); 
    setImages(files);
  };

  return (
    <div className="edit-item-page">
      <h1>Edit Item</h1>
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
      <div>
        <label>End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleEditItem}>Submit Changes</button>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default EditItemPage;

'use client';
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from "next/navigation";

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 
  
  const handleAddItem = async () => {
    console.log('handleAddItem called');

    // Validate that the duration is within acceptable range
    const hours = parseInt(durationHours);
    const minutes = parseInt(durationMinutes);

    if (hours < 0 || hours > 23) {
      setErrorMessage('Please enter a valid hour between 0 and 23.');
      return;
    }

    if (minutes < 0 || minutes > 59) {
      setErrorMessage('Please enter a valid minute between 0 and 59.');
      return;
    }

    if (!name || !description || !initialPrice || !startTime || !durationDays || !durationHours || !durationMinutes) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    // Convert images to Base64 format
    const imagePromises = images.map((image) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      })
    );

    try {
      setIsLoading(true); 

      const base64Images = await Promise.all(imagePromises);
      console.log('Base64 images:', base64Images);

      const cleanedBase64Images = base64Images.map((base64Image) => base64Image.replace(/^data:image\/[a-z]+;base64,/, '') ); 
      console.log('Cleaned Base64 images:', cleanedBase64Images);

      let files = []

      const date = new Date(); 
      const folderName = `${name}_${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}_${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;

      for(let i = 0; i < cleanedBase64Images.length; i++) {
        const upload_request = {
          folderName: folderName,
          fileName:  i + '.png',
          imageData: cleanedBase64Images[i]
        }
        files.push(`${name}_${folderName}` + '/'+  i + '.png')
  
        const response_upload = await instance.post('/seller/uploadImg', upload_request);
        console.log('Response:', response_upload.data);
      }
      // const upload_request = {
      //   fileName: name + '.png',
      //   imageData: cleanedBase64Images[0]
      // }

      // const response_upload = await instance.post('/seller/uploadImg', upload_request);
      // console.log('Response:', response_upload.data);
      
      const request = {
        Name: name,
        Description: description,
        Initial_Price: initialPrice,
        Images: files,
        StartDate: startTime,
        DurationDays: parseInt(durationDays),
        DurationHours: hours, 
        DurationMinutes: minutes, 
        SellerID: 2, 
      };

      console.log('Request payload:', request);

      const response = await instance.post('/seller/additem', request);
      console.log('Response:', response.data);

      setErrorMessage('');
      
      window.alert("Item added successfully!");
      router.push('/pages/SellerHomePage'); 
      
    } catch (error) {
      const err = error as AxiosError;
      console.error('Error response:', err.response ? err.response.data : err.message);
      setErrorMessage(
        err.response ? `Error adding item: ${err.response.data}` : 'Error adding item.'
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
        <button onClick={handleAddItem} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Changes'}
        </button>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default AddItemPage;

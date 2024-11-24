'use client';
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter, useSearchParams } from "next/navigation";

const instance = axios.create({
  baseURL: 'https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test',
});

const s3BaseUrl = "https://groovy-auction-house.s3.us-east-2.amazonaws.com/images/";

const EditItemPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [durationDays, setDurationDays] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 
  const [userID, setUserID] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const itemID = searchParams.get("ItemID");

  useEffect(() => {
    const fetchData = async () => {
      const info = sessionStorage.getItem("userInfo");
      if (info) {
        const json = JSON.parse(info);
        const accountID = json.success?.accountID; 
        setUserID(json.success.accountID);  
 
        if (accountID && itemID) {
          await handleSellerViewItem(accountID, itemID);
        }
      }
    };
    fetchData();
  }, [itemID]);
  
  const handleSellerViewItem = async (userID: number, itemID: string) => {
    const request = { SellerID: userID, ItemID: itemID };
    
    try {
      const response = await instance.post("/seller/viewItem", request);
      const itemDetails = response.data?.success?.itemDetails;
      if (itemDetails) {
        setName(itemDetails.itemName || '');
        setDescription(itemDetails.itemDescription || '');
        setInitialPrice(itemDetails.initialPrice?.toString() || '');
        setDurationDays(itemDetails.DurationDays?.toString() || '');
        setDurationHours(itemDetails.DurationHours?.toString() || '');
        setDurationMinutes(itemDetails.DurationMinutes?.toString() || '');
        
        const parsedImages = itemDetails.images ? JSON.parse(itemDetails.images) : [];
        setImages(parsedImages); 
        
        setErrorMessage('');
      } else {
        setErrorMessage('Error retrieving item details.');
      }
    } catch (error) {
      console.error("Error response:", error);
      setErrorMessage("Error retrieving items.");
    }
  };
  
  const handleEditItem = async () => {
    console.log('handleEditItem called');
    console.log('SellerID: ',userID);

    const hours = parseInt(durationHours);
    const minutes = parseInt(durationMinutes);
    const days = parseInt(durationDays);

    if (hours < 0 || hours > 23) {
      setErrorMessage('Please enter a valid hour between 0 and 23.');
      return;
    }

    if (minutes < 0 || minutes > 59) {
      setErrorMessage('Please enter a valid minute between 0 and 59.');
      return;
    }

    if (!name || !description || !initialPrice || !durationDays || !durationHours || !durationMinutes) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

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

      const files = []

      const date = new Date(); 
      const folderName = `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}_${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}`;

      for (let i = 0; i < cleanedBase64Images.length; i++) {
        const upload_request = {
          folderName: folderName,
          fileName: `${i}.png`,
          imageData: cleanedBase64Images[i] 
        };
        
        files.push(`${folderName}/${i}.png`);
      
        try {
          const response_upload = await instance.post('/seller/uploadImg', upload_request);
          console.log('Response:', response_upload.data);
        } catch (error) {
          console.error('Upload Error:', error);
        }
      }
      
      const imagesString = JSON.stringify(files);
      
      const request = {
        updates: {
          name: name,
          description: description,
          initial_price: initialPrice,
          images: imagesString, 
          durationDays: days,
          durationHours: hours,
          durationMinutes: minutes,
        },
        sellerID: userID,
        itemID: itemID
      };

      console.log('Request payload:', request);

      const response = await instance.post('/seller/editItem', request);
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
      setIsLoading(false); 
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); 
    setImages(files);
  };
  
  return (
    <div className="add-item-page">
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

      <div className="images-container">
        {Array.isArray(images) && images.length > 0 ? (
          images.map((image, index) => (
            <img 
              key={index} 
              src={`${s3BaseUrl}${image}`} 
              alt={`Item Image ${index + 1}`} 
              style={{ maxWidth: '200px', marginBottom: '10px' }} 
            />
          ))
        ) : (
          <p>No images available.</p>
        )}
      </div>

      <div>
        <input
          type="file"
          multiple
          onChange={handleImageUpload}
        />
        {images.length > 0 && <p>{images.length} image(s) selected</p>}
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
        <button onClick={handleEditItem} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Changes'}
        </button>
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

export default EditItemPage;

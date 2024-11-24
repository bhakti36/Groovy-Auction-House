
'use client';

import React, { useState } from "react";
import "./globals.css";

const ItemViewPage: React.FC = () => {
  // Hardcoded item data
  const item = {
    name: "Antique Vase",
    description: "A rare antique vase from the 18th century.",
    images: [
      "https://via.placeholder.com/600x400?text=Image+1",
      "https://via.placeholder.com/600x400?text=Image+2",
      "https://via.placeholder.com/600x400?text=Image+3",
    ],
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle image navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? item.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === item.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="item-detail-page">
      {/* Image Viewer */}
      <div className="image-container">
        <button className="arrow left-arrow" onClick={handlePrevImage}>
          &#8249;
        </button>
        <img
          src={item.images[currentImageIndex]}
          alt={`${item.name} - ${currentImageIndex + 1}`}
        />
        <button className="arrow right-arrow" onClick={handleNextImage}>
          &#8250;
        </button>
      </div>

      {/* Item Details */}
      <div className="item-info">
        <h1>{item.name}</h1>
        <p>{item.description}</p>
      </div>
    </div>
  );
};

export default ItemViewPage;

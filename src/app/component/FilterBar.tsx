"use client";
import React from "react";
import { useState } from "react";
import "./FilterBar.css";

interface FilterBarProps {
  setFilter: (filter: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ setFilter }) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setFilter(filter);
  };
  return (
    <div className="filter-bar">
      {" "}
      <button
        className={activeFilter === "All" ? "active" : ""}
        onClick={() => handleFilterClick("All")}
      >
        All
      </button>{" "}
      <button
        className={activeFilter === "Available" ? "active" : ""}
        onClick={() => handleFilterClick("Available")}
      >
        Available
      </button>{" "}
      <button
        className={activeFilter === "Sold" ? "active" : ""}
        onClick={() => handleFilterClick("Sold")}
      >
        Sold
      </button>{" "}
      <button
        className={activeFilter === "Pending" ? "active" : ""}
        onClick={() => handleFilterClick("Pending")}
      >
        Pending
      </button>{" "}
      <button
        className={activeFilter === "Frozen" ? "active" : ""}
        onClick={() => handleFilterClick("Frozen")}
      >
        Frozen
      </button>{" "}
    </div>
  );
};

export default FilterBar;

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
        className={activeFilter === "Active" ? "active" : ""}
        onClick={() => handleFilterClick("Active")}
      >
        Active
      </button>{" "}
      <button
        className={activeFilter === "Inactive" ? "active" : ""}
        onClick={() => handleFilterClick("Inactive")}
      >
        Inactive
      </button>{" "}
      <button
        className={activeFilter === "Completed" ? "active" : ""}
        onClick={() => handleFilterClick("Completed")}
      >
        Completed
      </button>{" "}
      <button
        className={activeFilter === "Failed" ? "active" : ""}
        onClick={() => handleFilterClick("Failed")}
      >
        Failed
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

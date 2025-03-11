// src/components/MobileSortButton.tsx
import React from "react";

interface MobileSortButtonProps {
  onSortClick: () => void;
  sortDirection: "asc" | "desc";
}

const MobileSortButton: React.FC<MobileSortButtonProps> = ({ onSortClick, sortDirection }) => {
  return (
    <div className="block md:hidden mb-4 text-right">
      <button
        onClick={onSortClick}
        className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
        title={`Sort by date (${sortDirection === "desc" ? "newest first" : "oldest first"})`}
      >
        Sort by Date
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block ml-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M7 7l3-3m0 0l3 3m-3-3v18" strokeWidth={2} />
        </svg>
      </button>
    </div>
  );
};

export default MobileSortButton;

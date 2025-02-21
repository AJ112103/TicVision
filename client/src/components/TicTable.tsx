// src/components/TicTable.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Trash } from "lucide-react";
import MobileSortButton from "./MobileSortButton";

export interface TicData {
  id?: string; // Document ID for deletion
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string;
}

interface TicTableProps {
  filteredData: TicData[];
  sortDirection: "asc" | "desc";
  toggleSort: () => void;
}

const TicTable: React.FC<TicTableProps> = ({ filteredData, sortDirection, toggleSort }) => {
  // Handler to call the Cloud Function to delete a tic.
  const handleDelete = async (ticId?: string) => {
    if (!ticId) return;
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("User not authenticated");
      return;
    }
    try {
      const response = await fetch(
        "https://us-central1-ticvision.cloudfunctions.net/deleteTic",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ticId }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        alert("Error deleting tic: " + errorData.error);
      } else {
        // Optionally, refresh data or update UI accordingly.
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting tic:", error);
      alert("Error deleting tic");
    }
  };

  return (
    <motion.div
      className="bg-white rounded shadow p-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl mb-4 font-semibold">Tic Data Table</h3>
      <MobileSortButton onSortClick={toggleSort} sortDirection={sortDirection} />

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="tic-table min-w-full bg-white rounded-lg overflow-hidden border">
          <thead className="bg-primary text-white">
            <tr>
              <th className="py-3 px-6 text-left">
                <div className="flex items-center gap-2">
                  Date
                  <button
                    onClick={toggleSort}
                    className="p-1 rounded hover:bg-primary/50 transition-colors duration-200"
                    title={`Sort by date (${
                      sortDirection === "desc" ? "newest first" : "oldest first"
                    })`}
                  >
                    <ArrowUpDown size={16} />
                  </button>
                </div>
              </th>
              <th className="py-3 px-6 text-left">Time of Day</th>
              <th className="py-3 px-6 text-left">Tic Type</th>
              <th className="py-3 px-6 text-left">Intensity</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No data available.
                </td>
              </tr>
            ) : (
              filteredData.map((tic, index) => (
                <tr
                  key={tic.id || index}
                  className={`group ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td data-label="Date" className="py-3 px-6">
                    {new Date(tic.date).toLocaleDateString()}
                  </td>
                  <td data-label="Time of Day" className="py-3 px-6">
                    {tic.timeOfDay}
                  </td>
                  <td data-label="Location (Tic)" className="py-3 px-6">
                    {tic.location}
                  </td>
                  <td data-label="Intensity" className="py-3 px-6 flex items-center justify-between">
                    <span>{tic.intensity}</span>
                    <motion.button
                      onClick={() => handleDelete(tic.id)}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      className="invisible group-hover:visible"
                      title="Delete Tic"
                    >
                      <Trash size={20} className="text-gray-500" />
                    </motion.button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden">
        {filteredData.length === 0 ? (
          <p className="text-center py-4">No data available.</p>
        ) : (
          filteredData.map((tic, index) => (
            <motion.div
              key={tic.id || index}
              className="bg-white rounded shadow p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">
                  {new Date(tic.date).toLocaleDateString()}
                </h4>
                <motion.button
                  onClick={() => handleDelete(tic.id)}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-500"
                  title="Delete Tic"
                >
                  <Trash size={20} />
                </motion.button>
              </div>
              <p className="mb-1">
                <span className="font-semibold">Time of Day: </span>
                {tic.timeOfDay}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Tic Type: </span>
                {tic.location}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Intensity: </span>
                {tic.intensity}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TicTable;

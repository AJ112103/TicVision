// src/components/TicTable.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import MobileSortButton from "./MobileSortButton";

export interface TicData {
  id?: string; // Document ID (if available)
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string;
  description: string;
}

interface TicTableProps {
  filteredData: TicData[];
  sortDirection: "asc" | "desc";
  toggleSort: () => void;
}

const TicTable: React.FC<TicTableProps> = ({
  filteredData,
  sortDirection,
  toggleSort,
}) => {
  // For mobile view, track which card is expanded to show the description.
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCardExpansion = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <motion.div
      className="bg-white rounded shadow p-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl mb-4 font-semibold text-center">Tic Data Table</h3>
      <MobileSortButton onSortClick={toggleSort} sortDirection={sortDirection} />

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden border">
          <thead className="bg-primary text-white">
            <tr>
              <th className="py-3 px-6 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-2">
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
              <th className="py-3 px-6 text-center whitespace-nowrap">
                Time of Day
              </th>
              <th className="py-3 px-6 text-center whitespace-nowrap">
                Tic Type
              </th>
              <th className="py-3 px-6 text-center whitespace-nowrap">
                Intensity
              </th>
              <th className="py-3 px-6 text-center whitespace-nowrap">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No data available.
                </td>
              </tr>
            ) : (
              filteredData.map((tic, index) => (
                <tr
                  key={tic.id || index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td
                    data-label="Date"
                    className="py-3 px-6 text-center whitespace-nowrap"
                  >
                    {new Date(tic.date).toLocaleDateString()}
                  </td>
                  <td
                    data-label="Time of Day"
                    className="py-3 px-6 text-center whitespace-nowrap"
                  >
                    {tic.timeOfDay}
                  </td>
                  <td
                    data-label="Tic Type"
                    className="py-3 px-6 text-center whitespace-nowrap"
                  >
                    {tic.location}
                  </td>
                  <td
                    data-label="Intensity"
                    className="py-3 px-6 text-center whitespace-nowrap"
                  >
                    {tic.intensity}
                  </td>
                  <td
                    data-label="Description"
                    className="py-3 px-6 text-center whitespace-nowrap"
                  >
                    {tic.description ? tic.description : "None"}
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
          filteredData.map((tic, index) => {
            const cardId = tic.id || index.toString();
            return (
              <motion.div
                key={cardId}
                className="bg-white rounded shadow p-4 mb-4 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => toggleCardExpansion(cardId)}
              >
                <div className="text-center mb-2">
                  <h4 className="font-semibold">
                    {new Date(tic.date).toLocaleDateString()}
                  </h4>
                </div>
                <div className="mb-1 text-center">
                  <span className="font-semibold">Time of Day: </span>
                  {tic.timeOfDay}
                </div>
                <div className="mb-1 text-center">
                  <span className="font-semibold">Tic Type: </span>
                  {tic.location}
                </div>
                <div className="mb-1 text-center">
                  <span className="font-semibold">Intensity: </span>
                  {tic.intensity}
                </div>
                <AnimatePresence>
                  {expandedCard === cardId && (
                    <motion.div
                      className="mt-2 text-center p-2 bg-gray-100 rounded"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <span className="font-semibold">Description: </span>
                      {tic.description ? tic.description : "None"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default TicTable;

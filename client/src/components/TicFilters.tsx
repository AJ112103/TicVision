// src/components/TicFilters.tsx
import React from "react";
import { motion } from "framer-motion";

export const timeRanges = {
  all: "All Time",
  today: "Today",
  lastWeek: "Last Week",
  lastMonth: "Last Month",
  last3Months: "Last 3 Months",
  last6Months: "Last 6 Months",
  lastYear: "Last Year",
  specificDate: "Specific Date",
} as const;

export type TimeRangeKey = keyof typeof timeRanges;

interface TicFiltersProps {
  timeRangeFilter: TimeRangeKey;
  setTimeRangeFilter: (val: TimeRangeKey) => void;
  specificDate: string;
  setSpecificDate: (val: string) => void;
  locationFilter: string[];
  toggleLocation: (loc: string) => void;
  uniqueLocations: string[];
  handleResetFilters: () => void;
}

const TicFilters: React.FC<TicFiltersProps> = ({
  timeRangeFilter,
  setTimeRangeFilter,
  specificDate,
  setSpecificDate,
  locationFilter,
  toggleLocation,
  uniqueLocations,
  handleResetFilters,
}) => {
  return (
    <motion.div
      className="bg-white rounded shadow p-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl mb-4 font-semibold">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Time Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="timeRange">
            Time Range
          </label>
          <select
            id="timeRange"
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={timeRangeFilter}
            onChange={(e) =>
              setTimeRangeFilter(e.target.value as keyof typeof timeRanges)
            }
          >
            {Object.entries(timeRanges).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Date Picker */}
        {timeRangeFilter === "specificDate" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium mb-1" htmlFor="specificDate">
              Select Date
            </label>
            <input
              type="date"
              id="specificDate"
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
            />
          </motion.div>
        )}

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Tic Types</label>
          <div className="flex flex-wrap gap-2">
            {uniqueLocations.map((loc, index) => {
              const isSelected = locationFilter.includes(loc);
              return (
                <motion.button
                  key={loc}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors duration-200 ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {loc}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded px-3 py-2 text-sm"
        onClick={handleResetFilters}
      >
        Reset Filters
      </motion.button>
    </motion.div>
  );
};

export default TicFilters;

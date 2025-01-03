import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import './ticTable.css';

interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string;
}

const TicTable: React.FC = () => {
  const [ticData, setTicData] = useState<TicData[]>([]);
  const [filteredData, setFilteredData] = useState<TicData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
  const [specificDate, setSpecificDate] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchTicHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ticData, timeRangeFilter, specificDate, locationFilter]);

  const fetchTicHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found.');
      return;
    }

    setLoading(true);
    try {
      const historyCollection = collection(db, 'users', user.uid, 'ticHistory');
      const snapshot = await getDocs(historyCollection);
      const data: TicData[] = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          timeOfDay: docData.timeOfDay,
          date: docData.date,
          intensity: docData.intensity,
          location: docData.location,
        } as TicData;
      });

      console.log('Raw tic history from Firestore:', data);

      setTicData(data);

      const locations = Array.from(new Set(data.map(tic => tic.location)));
      setUniqueLocations(locations);
    } catch (error) {
      console.error('Error fetching tic history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...ticData];
    const now = new Date();

    if (timeRangeFilter !== 'specificDate') {
      data = data.filter(tic => {
        const ticDate = new Date(tic.date);
        switch (timeRangeFilter) {
          case 'today':
            return ticDate.toDateString() === now.toDateString();
          case 'lastWeek':
            return now.getTime() - ticDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
          case 'lastMonth':
            return (
              now.getMonth() === ticDate.getMonth() &&
              now.getFullYear() === ticDate.getFullYear()
            );
          case 'last3Months':
            return now.getTime() - ticDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
          case 'last6Months':
            return now.getTime() - ticDate.getTime() <= 180 * 24 * 60 * 60 * 1000;
          case 'lastYear':
            return now.getFullYear() === ticDate.getFullYear();
          case 'all':
          default:
            return true;
        }
      });
    } else if (specificDate) {
      const selectedDate = new Date(specificDate).toDateString();
      data = data.filter(
        tic => new Date(tic.date).toDateString() === selectedDate
      );
    }

    if (locationFilter.length > 0) {
      data = data.filter(tic => locationFilter.includes(tic.location));
    }

    setFilteredData(data);
  };

  const handleResetFilters = () => {
    setTimeRangeFilter('all');
    setSpecificDate('');
    setLocationFilter([]);
  };

  const toggleLocation = (location: string) => {
    setLocationFilter(prevSelected => {
      if (prevSelected.includes(location)) {
        return prevSelected.filter(loc => loc !== location);
      } else {
        return [...prevSelected, location];
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl mb-4"
      >
        Tic History
      </motion.h2>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card mb-6 p-4"
      >
        <h3 className="text-xl mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Time Range Filter */}
          <div>
            <label className="label" htmlFor="timeRange">Time Range</label>
            <select
              id="timeRange"
              className="input w-full"
              value={timeRangeFilter}
              onChange={e => setTimeRangeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="lastYear">Last Year</option>
              <option value="specificDate">Specific Date</option>
            </select>
          </div>

          {/* Specific Date Picker */}
          {timeRangeFilter === 'specificDate' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <label className="label" htmlFor="specificDate">Select Date</label>
              <input
                type="date"
                id="specificDate"
                className="input w-full"
                value={specificDate}
                onChange={e => setSpecificDate(e.target.value)}
              />
            </motion.div>
          )}

          {/* Location Filter */}
          <div>
            <label className="label" htmlFor="location">Location</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {uniqueLocations.map((location, index) => {
                const isSelected = locationFilter.includes(location);
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    type="button"
                    onClick={() => toggleLocation(location)}
                    className={`px-3 py-1 rounded-full border ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    } transition`}
                  >
                    {location}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4"
        >
          <button
            className="btn btn-secondary"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </motion.div>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          Loading...
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-x-auto"
        >
          <table className="min-w-full bg-white rounded-lg overflow-hidden tic-table">
            <thead className="bg-primary text-white">
              <tr>
                <th className="py-3 px-6 text-left">Time of Day</th>
                <th className="py-3 px-6 text-left">Location</th>
                <th className="py-3 px-6 text-left">Intensity</th>
                <th className="py-3 px-6 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td colSpan={4} className="text-center py-4">
                    No data available.
                  </td>
                </motion.tr>
              ) : (
                filteredData.map((tic, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td data-label="Time of Day" className="py-3 px-6">{tic.timeOfDay}</td>
                    <td data-label="Location" className="py-3 px-6">{tic.location}</td>
                    <td data-label="Intensity" className="py-3 px-6">{tic.intensity}</td>
                    <td data-label="Date" className="py-3 px-6">
                      {new Date(tic.date).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TicTable;
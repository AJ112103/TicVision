import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Calendar, 
  Clock, 
  LineChart, 
  Plus,
  Sliders,
  User
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TicEntry {
  id: string;
  location: string;
  intensity: number;
  timestamp: Date;
  notes?: string;
}

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [ticHistory, setTicHistory] = useState<TicEntry[]>([]);

  const chartData = [
    { date: '2024-01', intensity: 4 },
    { date: '2024-02', intensity: 6 },
    { date: '2024-03', intensity: 3 },
    { date: '2024-04', intensity: 7 },
    { date: '2024-05', intensity: 5 }
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
  };

  const handleIntensityChange = (value: number) => {
    setIntensity(value);
  };

  const handleSubmit = () => {
    if (!selectedLocation) return;

    const newEntry: TicEntry = {
      id: Date.now().toString(),
      location: selectedLocation,
      intensity: intensity,
      timestamp: new Date(),
    };

    setTicHistory([...ticHistory, newEntry]);
    setSelectedLocation(null);
    setIntensity(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Stats Overview */}
          <div className="card col-span-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Today's Overview</h2>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-primary/10 p-4">
                <Activity className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-text-secondary">Total Tics</p>
                <p className="text-2xl font-bold">{ticHistory.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <Sliders className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-text-secondary">Avg Intensity</p>
                <p className="text-2xl font-bold">
                  {ticHistory.length > 0
                    ? (
                        ticHistory.reduce((acc, curr) => acc + curr.intensity, 0) /
                        ticHistory.length
                      ).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <Clock className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-text-secondary">Last Entry</p>
                <p className="text-2xl font-bold">
                  {ticHistory.length > 0
                    ? new Date(
                        ticHistory[ticHistory.length - 1].timestamp
                      ).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : "--:--"}
                </p>
              </div>
            </div>
          </div>

          {/* Tic Entry Section */}
          <div className="card col-span-full md:col-span-1">
            <h2 className="mb-4 text-xl font-bold">Log New Tic</h2>
            <div className="relative aspect-[2/3] w-full">
              <div className="human-silhouette">
                {/* You would add clickable regions here for the human silhouette */}
                <button
                  onClick={() => handleLocationSelect('head')}
                  className={`silhouette-region head ${
                    selectedLocation === 'head' ? 'active' : ''
                  }`}
                />
                <button
                  onClick={() => handleLocationSelect('neck')}
                  className={`silhouette-region neck ${
                    selectedLocation === 'neck' ? 'active' : ''
                  }`}
                />
                {/* Add more regions as needed */}
              </div>
            </div>
            <div className="mt-4">
              <label className="label">Intensity</label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => handleIntensityChange(Number(e.target.value))}
                className="intensity-slider"
              />
              <div className="mt-2 flex justify-between text-sm text-text-secondary">
                <span>Mild (1)</span>
                <span>Severe (10)</span>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="btn-primary mt-4 w-full"
              disabled={!selectedLocation}
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Tic
            </button>
          </div>

          {/* Visualization Section */}
          <div className="card col-span-full md:col-span-1 lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold">Tic History</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#6366F1"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
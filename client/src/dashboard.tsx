import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Clock, Plus, Sliders } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LogTicModal from "./logticmodal"

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
      <main className="container mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:gap-6"
        >
          <div className="card col-span-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold sm:text-2xl">Today's Overview</h2>
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-primary/10 p-3 sm:p-4">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <p className="mt-2 text-xs sm:text-sm text-text-secondary">Total Tics</p>
                <p className="text-xl sm:text-2xl font-bold">{ticHistory.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 sm:p-4">
                <Sliders className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <p className="mt-2 text-xs sm:text-sm text-text-secondary">Avg Intensity</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {ticHistory.length > 0
                    ? (ticHistory.reduce((acc, curr) => acc + curr.intensity, 0) / ticHistory.length).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 sm:p-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <p className="mt-2 text-xs sm:text-sm text-text-secondary">Last Entry</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {ticHistory.length > 0
                    ? new Date(ticHistory[ticHistory.length - 1].timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "--:--"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <LogTicModal />
            </div>

            <div className="card lg:col-span-2">
              <h2 className="mb-4 text-lg font-bold sm:text-xl">Tic History</h2>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="intensity" stroke="#6366F1" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
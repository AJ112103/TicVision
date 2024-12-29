import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, Clock, Plus, Sliders } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from './firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import LogTicModal from "./logticmodal";

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
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [name, setName] = useState("");
  const userId = localStorage.getItem("userId");

  const chartData = ticHistory.map((entry) => ({
    date: entry.timestamp.toISOString().split('T')[0],
    intensity: entry.intensity,
  }));

  const checkUserName = async () => {
    if (userId) {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && !userDoc.data().name) {
        setShowNamePopup(true);
      }
    }
  };

  useEffect(() => {
    checkUserName();
  }, []);

  const handleNameSubmit = async () => {
    if (userId && name.trim()) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { name });
      setShowNamePopup(false);
    }
  };

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
      intensity,
      timestamp: new Date(),
    };

    setTicHistory([...ticHistory, newEntry]);
    setSelectedLocation(null);
    setIntensity(5);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showNamePopup && (
          <motion.div
            className="popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="popup-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="popup-title">Welcome to Your Dashboard! 👋</h2>
              <p className="popup-description">
                To personalize your experience and make it more welcoming, 
                we'd love to know what to call you.
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="popup-input"
                placeholder="Your name"
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                className="btn-primary w-full mt-6"
                disabled={!name.trim()}
              >
                Get Started
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Today's Overview</h2>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-lg bg-primary/10 p-4">
                <Activity className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-gray-600">Total Tics</p>
                <p className="text-2xl font-bold">{ticHistory.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <Sliders className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-gray-600">Avg Intensity</p>
                <p className="text-2xl font-bold">
                  {ticHistory.length > 0
                    ? (ticHistory.reduce((acc, curr) => acc + curr.intensity, 0) / ticHistory.length).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-4">
                <Clock className="h-6 w-6 text-primary" />
                <p className="mt-2 text-sm text-gray-600">Last Entry</p>
                <p className="text-2xl font-bold">
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

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <LogTicModal />
            </div>
            <div className="card lg:col-span-2">
              <h2 className="text-xl font-bold mb-6">Tic History</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      stroke="#E5E7EB"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      stroke="#E5E7EB"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="intensity"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ stroke: '#6366F1', strokeWidth: 2, r: 4, fill: 'white' }}
                      activeDot={{ stroke: '#6366F1', strokeWidth: 2, r: 6, fill: 'white' }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
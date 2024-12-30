import { useState } from 'react';

type TicEntry = {
  intensity: number;
  timestamp: string;
};
import { Activity, Calendar, Clock, Sliders } from 'lucide-react';
import TicBarChart from "./graph";
import { useNavigate } from "react-router-dom";
import LogTicModal from "./logticmodal";

const Dashboard = () => {
  const [ticHistory] = useState<TicEntry[]>([]);
  const navigate = useNavigate();

  const handleGraphClick = () => {
    navigate("/graph");
  };

  return (
    <div className="min-h-screen bg-background">
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
            <div className="card lg:col-span-2 cursor-pointer" onClick={handleGraphClick}>
              <h2 className="text-xl font-bold mb-6">Tic History</h2>
              <TicBarChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
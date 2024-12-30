import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { getFirestore, collection, query, getDocs, where } from "firebase/firestore";
import { auth } from "./firebase";

interface TicData {
  timeOfDay: string;
  date?: string;
  intensity: number;
  location: string;
}

interface ChartDataPoint {
  timeOfDay?: string;
  date?: string;
  [key: string]: number | string | undefined;
}

const ticTypes = [
  { id: "1", name: "Arm", color: "#4a90a1" },
  { id: "2", name: "Complex Vocal", color: "#407f8f" },
  { id: "3", name: "Eye", color: "#366e7d" },
  { id: "4", name: "Jaw", color: "#2c5d6b" },
  { id: "5", name: "Leg", color: "#224c59" },
  { id: "6", name: "Mouth", color: "#183b47" },
  { id: "7", name: "Neck", color: "#0e2a35" },
  { id: "8", name: "Shoulder", color: "#559bad" },
  { id: "9", name: "Simple Vocal", color: "#60a6bb" },
  { id: "10", name: "Stomach", color: "#6bb1c9" },
  { id: "11", name: "Word Phrase", color: "#76bcd7" }
];

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const timeLabel = payload[0]?.payload?.timeOfDay || payload[0]?.payload?.date;
    const activeEntries = payload.filter(entry => entry.value !== undefined && entry.value > 0);

    if (activeEntries.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold mb-2">{timeLabel}</p>
        <div className="space-y-1">
          {activeEntries.map((entry, index) => {
            const ticType = ticTypes.find(t => t.name === entry.name);
            return (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: ticType?.color }}
                />
                <span className="text-sm text-gray-700">
                  {entry.name}: {entry.value} intensity
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const TicBarChart = () => {
  const [timeRange, setTimeRange] = useState("day");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "ticData"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const rawData = querySnapshot.docs.map(doc => doc.data() as TicData);

      const processedData = rawData.reduce((acc: ChartDataPoint[], item) => {
        const timeKey = timeRange === "day" ? item.timeOfDay : item.date;
        const existingEntry = acc.find(entry => 
          timeRange === "day" ? entry.timeOfDay === timeKey : entry.date === timeKey
        );

        if (existingEntry) {
          existingEntry[item.location] = (existingEntry[item.location] as number || 0) + item.intensity;
        } else {
          const newEntry: ChartDataPoint = timeRange === "day" 
            ? { timeOfDay: timeKey } 
            : { date: timeKey };
          newEntry[item.location] = item.intensity;
          acc.push(newEntry);
        }
        return acc;
      }, []);

      setChartData(processedData);
    };

    fetchData();
  }, [timeRange]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="card bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tic Intensity</h2>
          <select 
            onChange={(e) => setTimeRange(e.target.value)} 
            value={timeRange}
            className="input bg-white border-gray-200 hover:border-primary focus:border-primary"
          >
            <option value="day">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey={timeRange === "day" ? "timeOfDay" : "date"}
                tick={{ fill: "#374151" }}
              />
              <YAxis 
                domain={[0, 10]}
                tick={{ fill: "#374151" }}
                label={{ value: "Intensity", angle: -90, position: 'insideLeft', fill: "#374151" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span className="text-sm font-medium">{value}</span>}
              />
              {ticTypes.map((tic) => (
                <Bar 
                  key={tic.id} 
                  dataKey={tic.name} 
                  fill={tic.color}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  maxBarSize={50}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TicBarChart;
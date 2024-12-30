import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "./firebase";

interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string; // the tic “type”
}

interface MyTic {
  name: string;  
  count: number;
  color: string;
}

// 1. Add "all" to your time range options
const timeRanges = {
  all: "All Time",
  day: "Today",
  week: "Last Week",
  month: "Last Month",
  threeMonths: "Last 3 Months",
  sixMonths: "Last 6 Months",
  year: "Last Year"
};

const TicLineChart = () => {
  // 2. Default the timeRange to "all"
  const [timeRange, setTimeRange] = useState("all");
  const [chartData, setChartData] = useState<any[]>([]);
  const [myTics, setMyTics] = useState<MyTic[]>([]);
  const [selectedTics, setSelectedTics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Fetch "mytics" from Firestore
  const fetchMyTics = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const myTicsCollection = collection(db, "users", user.uid, "mytics");
      const snapshot = await getDocs(myTicsCollection);

      const tics = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name, 
          count: data.count,
          // Random color
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        };
      });

      console.log("Fetched MyTics from Firestore:", tics);

      setMyTics(tics);
      // By default, select all tics
      setSelectedTics(tics.map(tic => tic.name));
    } catch (error) {
      console.error("Error fetching my tics:", error);
    }
  };

  // Fetch the ticHistory records
  const fetchTicHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const historyCollection = collection(db, "users", user.uid, "ticHistory");
      const snapshot = await getDocs(historyCollection);
      const ticData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          timeOfDay: data.timeOfDay,
          date: data.date,
          intensity: data.intensity,
          location: data.location,
          id: doc.id
        } as TicData;
      });

      console.log("Raw tic history from Firestore:", ticData);

      const processedData = processTicData(ticData);

      console.log("Processed data for chart:", processedData);

      setChartData(processedData);
    } catch (error) {
      console.error("Error fetching tic history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process tic data so that entries with the same location on the same date/time are averaged
  const processTicData = (data: TicData[]) => {
    const now = new Date();

    // Filter data based on selected timeRange
    const filteredData = data.filter(tic => {
      const ticDate = new Date(tic.date);
      switch (timeRange) {
        case "all":
          // Show everything
          return true;
        case "day":
          return ticDate.toDateString() === now.toDateString();
        case "week":
          return now.getTime() - ticDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return (
            now.getMonth() === ticDate.getMonth() &&
            now.getFullYear() === ticDate.getFullYear()
          );
        case "threeMonths":
          return now.getTime() - ticDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
        case "sixMonths":
          return now.getTime() - ticDate.getTime() <= 180 * 24 * 60 * 60 * 1000;
        case "year":
          return now.getFullYear() === ticDate.getFullYear();
        default:
          return true;
      }
    });

    // Group data by date/timeKey, then by location
    const groupedData = filteredData.reduce((acc: any, tic) => {
      // For day view, group by timeOfDay, else group by full date
      const key = timeRange === "day" ? tic.timeOfDay : tic.date;

      if (!acc[key]) {
        acc[key] = { timeKey: key };
      }
      if (!acc[key][tic.location]) {
        acc[key][tic.location] = { sum: 0, count: 0 };
      }

      acc[key][tic.location].sum += tic.intensity;
      acc[key][tic.location].count += 1;

      return acc;
    }, {});

    // Convert the grouped object to an array
    const result = Object.values(groupedData).map((entry: any) => {
      const item: Record<string, number | string> = {
        timeKey: entry.timeKey
      };
      // For each location, compute average intensity
      Object.keys(entry).forEach(k => {
        if (k !== "timeKey") {
          const { sum, count } = entry[k];
          item[k] = sum / count;
        }
      });
      return item;
    });

    // Sort by timeKey
    return result.sort((a: any, b: any) => {
      if (timeRange === "day") {
        // Sort by time of day if day view
        const timeA = new Date(`2000/01/01 ${a.timeKey}`).getTime();
        const timeB = new Date(`2000/01/01 ${b.timeKey}`).getTime();
        return timeA - timeB;
      } else {
        // Otherwise, sort by actual date
        return new Date(a.timeKey).getTime() - new Date(b.timeKey).getTime();
      }
    });
  };

  // Fetch myTics on mount
  useEffect(() => {
    fetchMyTics();
  }, []);

  // Fetch ticHistory whenever timeRange changes
  useEffect(() => {
    fetchTicHistory();
  }, [timeRange]);

  // Toggle lines by location
  const toggleTic = (ticName: string) => {
    setSelectedTics(prev =>
      prev.includes(ticName)
        ? prev.filter(name => name !== ticName)
        : [...prev, ticName]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tic Intensity Over Time
          </h2>
          {/* 3. Add "All Time" as an option in the dropdown */}
          <select
            onChange={(e) => setTimeRange(e.target.value)}
            value={timeRange}
            className="w-full sm:w-auto input bg-white border-gray-200 hover:border-primary focus:border-primary p-2 rounded text-sm"
          >
            {Object.entries(timeRanges).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggleable buttons for each tic location */}
        <div className="mb-4">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
            {myTics.map((tic) => (
              <button
                key={tic.name}
                onClick={() => toggleTic(tic.name)}
                className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium truncate ${
                  selectedTics.includes(tic.name)
                    ? "bg-[#4a90a1] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tic.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timeKey"
                tick={{ fill: "#374151", fontSize: "12px" }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "#374151", fontSize: "12px" }}
                label={{
                  value: "Intensity",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#374151",
                  fontSize: "12px",
                  dx: -10
                }}
                width={40}
              />
              <Tooltip
                wrapperStyle={{ fontSize: "12px" }}
                contentStyle={{ fontSize: "12px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                iconSize={8}
              />

              {/* Only show lines for selected tic locations */}
              {myTics
                .filter((tic) => selectedTics.includes(tic.name))
                .map((tic) => (
                  <Line
                    key={tic.name}
                    type="monotone"
                    dataKey={tic.name}
                    stroke={tic.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TicLineChart;

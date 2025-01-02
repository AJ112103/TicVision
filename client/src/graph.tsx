import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore";
import { auth } from "./firebase";

// Define the shape of a TicData record
interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string; // the tic “type”
}

// Define the shape of a MyTic object
interface MyTic {
  name: string;
  count: number;
  color: string;
}

// Define timeRanges as a constant with 'as const' to ensure literal types
const timeRanges = {
  all: "All Time",
  day: "Today",
  week: "Last Week",
  month: "Last Month",
  threeMonths: "Last 3 Months",
  sixMonths: "Last 6 Months",
  year: "Last Year"
} as const;

// Create a TypeScript type that represents the keys of timeRanges
type TimeRangeKey = keyof typeof timeRanges;

const TicLineChart = () => {
  // Update useState to use the TimeRangeKey type
  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");
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

      const tics: MyTic[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          name: data.name,
          count: data.count,
          // Random color
          color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
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
      const ticData: TicData[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          timeOfDay: data.timeOfDay,
          date: data.date,
          intensity: data.intensity,
          location: data.location,
          // Removed 'id' as it's not defined in TicData interface
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Handler for changing selected tics via dropdown
  const handleTicSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTics(selectedOptions);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
      </div>
    );
  }

  // Prepare data for Google Charts
  const prepareChartData = () => {
    if (chartData.length === 0 || myTics.length === 0) {
      return [];
    }

    // Filter myTics based on selectedTics
    const filteredMyTics = myTics.filter(tic => selectedTics.includes(tic.name));

    if (filteredMyTics.length === 0) {
      return [];
    }

    // Header row
    const header = ["Time", ...filteredMyTics.map(tic => tic.name)];

    // Data rows
    const rows = chartData.map(entry => {
      const row = [entry.timeKey];
      filteredMyTics.forEach(tic => {
        row.push(entry[tic.name] || 0);
      });
      return row;
    });

    return [header, ...rows];
  };

  // Define chart options
  const chartOptions = {
    title: "Tic Intensity Over Time",
    curveType: "function",
    legend: { position: "bottom" },
    hAxis: {
      title: timeRanges[timeRange],
      slantedText: true,
      slantedTextAngle: 45
    },
    vAxis: {
      title: "Intensity",
      minValue: 0,
      // Optionally, dynamically set maxValue based on data
    },
    colors: myTics
      .filter(tic => selectedTics.includes(tic.name))
      .map(tic => tic.color),
    // Optionally, control series visibility here if needed
  };

  const filteredChartData = prepareChartData();

  // If no data, show a message
  if (filteredChartData.length === 0) {
    return (
      <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6">
          <p className="text-center text-gray-500">No data available for the selected range or tic types.</p>
        </div>
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
          {/* Time Range Dropdown */}
          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value as TimeRangeKey)}
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

        {/* Multi-Select Dropdown for Tic Types */}
        <div className="mb-4">
          <label htmlFor="tic-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Tic Types:
          </label>
          <select
            id="tic-select"
            multiple
            value={selectedTics}
            onChange={handleTicSelection}
            className="w-full sm:w-auto block bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary p-2 text-sm"
            size={Math.min(5, myTics.length)} // Adjust size based on number of tics
          >
            {myTics.map((tic) => (
              <option key={tic.name} value={tic.name}>
                {tic.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold down the Ctrl (windows) or Command (Mac) button to select multiple tics.
          </p>
        </div>

        <div className="h-[300px] sm:h-[400px] w-full">
          <Chart
            width={"100%"}
            height={"100%"}
            chartType="LineChart"
            loader={
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
              </div>
            }
            data={filteredChartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TicLineChart;

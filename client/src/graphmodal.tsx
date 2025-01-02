import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "./firebase";

interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string;
}

const TodayTicsBarChart = () => {
  const db = getFirestore();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ticHistory
  const fetchTicHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const historyCollection = collection(db, "users", user.uid, "ticHistory");
      const snapshot = await getDocs(historyCollection);

      // Map snapshot to TicData array
      const allTics: TicData[] = snapshot.docs.map((doc) => doc.data() as TicData);
      
      // Filter to "today" only
      const today = new Date().toDateString();
      const filteredToday = allTics.filter(
        (tic) => new Date(tic.date).toDateString() === today
      );

      // Process the data for "average intensity" grouped by timeOfDay + location
      const processed = processTicData(filteredToday);
      setChartData(processed);
    } catch (error) {
      console.error("Error fetching tic history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group and compute average by timeOfDay + location
  const processTicData = (data: TicData[]) => {
    // Group by timeOfDay
    const grouped = data.reduce((acc: any, tic) => {
      const { timeOfDay, location, intensity } = tic;
      if (!acc[timeOfDay]) {
        acc[timeOfDay] = {};
      }
      if (!acc[timeOfDay][location]) {
        acc[timeOfDay][location] = { sum: 0, count: 0 };
      }
      acc[timeOfDay][location].sum += intensity;
      acc[timeOfDay][location].count += 1;
      return acc;
    }, {});

    // Convert object to array
    const rows: any[] = [];
    const uniqueLocations = new Set<string>();

    // 1) Collect all unique locations
    Object.values(grouped).forEach((locationsObj: any) => {
      Object.keys(locationsObj).forEach((loc) => uniqueLocations.add(loc));
    });

    // 2) Build rows for each timeOfDay
    Object.entries(grouped).forEach(([timeOfDay, locationMap]: any) => {
      const row: Record<string, any> = { timeKey: timeOfDay };
      for (const loc in locationMap) {
        const { sum, count } = locationMap[loc];
        row[loc] = sum / count; // average
      }
      rows.push(row);
    });

    // 3) Sort by timeOfDay as time
    rows.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.timeKey}`).getTime();
      const timeB = new Date(`2000/01/01 ${b.timeKey}`).getTime();
      return timeA - timeB;
    });

    // 4) Build the final data array for Google Charts
    // Header: ["Time", loc1, loc2, loc3, ...]
    const header = ["Time", ...Array.from(uniqueLocations)];
    const chartData = rows.map((row) => {
      // Each row: [timeKey, row[loc1], row[loc2], ...]
      return [
        row.timeKey,
        ...Array.from(uniqueLocations).map((loc) => row[loc] || 0),
      ];
    });
    return [header, ...chartData];
  };

  // On mount, fetch
  useEffect(() => {
    fetchTicHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
      </div>
    );
  }

  // Chart options
  const chartOptions = {
    curveType: "function",
    legend: { position: "bottom" },
    hAxis: {
      slantedText: false,
    },
    vAxis: {
      // average intensity range: 0–10
      viewWindow: {
        min: 0,
        max: 10,
      },
    },
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6">
        <div className="h-[300px] sm:h-[400px] w-full">
          <Chart
            width="100%"
            height="100%"
            chartType="LineChart"
            loader={
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
              </div>
            }
            data={chartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TodayTicsBarChart;

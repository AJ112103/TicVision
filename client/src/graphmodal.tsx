import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { auth } from "./firebase";

// Firestore data shape
interface TicData {
  timeOfDay: string; // e.g. "Morning", "Day", "Evening", "Night"
  date: string;      // e.g. "2024-01-01"
  intensity: number; // e.g. 5
  location: string;  // e.g. "Neck", "Shoulder"
}

// The rows we feed into Recharts
interface ChartDataPoint {
  timeOfDay: string;
  [docKey: string]: number | string; 
}

// Predefined time-of-day labels on the X-axis
const timeLabels = ["Morning", "Afternoon", "Evening", "Night"];

// A list of pastel colors we can cycle through
const pastelColors = [
  "#FFB3BA", "#FFDFBA",
  "#BAFFC9", "#BAE1FF", "#D5BAFF",
  "#FFC1E3", "#C1FFC1", "#C1E1FF",
  "#FFBACD", "#E7FFBA", "#BAFFD4",
];

const TicBarChart = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [docKeys, setDocKeys] = useState<string[]>([]);  
  const [locationColorMap, setLocationColorMap] = useState<Record<string, string>>({});
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);

  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Get today's date (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0];

      // Query Firestore for today's tics
      const q = query(
        collection(db, "users", user.uid, "ticHistory"),
        where("date", "==", today)
      );
      const querySnapshot = await getDocs(q);
      const rawData = querySnapshot.docs.map((doc) => doc.data() as TicData);

      // 1. Collect all unique locations
      const allLocations = Array.from(new Set(rawData.map((item) => item.location)));
      setUniqueLocations(allLocations);

      // 2. Build or extend our location->color map dynamically
      const newColorMap: Record<string, string> = { ...locationColorMap };
      allLocations.forEach((loc, i) => {
        // Assign a color if it's not already in the map
        if (!newColorMap[loc]) {
          newColorMap[loc] = pastelColors[i % pastelColors.length];
        }
      });
      setLocationColorMap(newColorMap);

      // 3. Create unique docKey for each record, e.g. "Neck_0", "Shoulder_1"
      const createdDocKeys: string[] = [];
      rawData.forEach((item, i) => {
        const docKey = `${item.location}_${i}`;
        createdDocKeys.push(docKey);
      });
      setDocKeys(createdDocKeys);

      // 4. Initialize chartData with rows for each timeOfDay in timeLabels
      const baseData: ChartDataPoint[] = timeLabels.map((label) => {
        const row: ChartDataPoint = { timeOfDay: label };
        // Set each docKey to 0 initially
        createdDocKeys.forEach((key) => {
          row[key] = 0;
        });
        return row;
      });

      // 5. Place each doc's intensity in the matching row (based on timeOfDay)
      rawData.forEach((item, i) => {
        const docKey = `${item.location}_${i}`;
        const idx = timeLabels.indexOf(item.timeOfDay);
        if (idx !== -1) {
          baseData[idx][docKey] = item.intensity;
        }
      });

      console.log("Processed Data:", baseData);
      setChartData(baseData);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build a custom "payload" so we only have 1 legend entry per location
  // Instead of letting Recharts auto-generate a legend for each docKey
  const legendPayload = uniqueLocations.map((loc) => ({
    id: loc,
    value: loc, // text shown in legend
    color: locationColorMap[loc] || "#ccc",
    type: "square", // shape of the legend icon
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="card bg-white shadow-sm">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap="10%"
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timeOfDay"
                tick={{ fill: "#374151", fontSize: 12 }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "#374151", fontSize: 12 }}
                label={{
                  value: "Intensity",
                  angle: -90,
                  position: "insideLeft",
                  offset: -30,
                  fill: "#374151",
                  fontSize: 12,
                  dx: 50,
                }}
              />

              {/* 
                Provide our own legend payload so each location is shown exactly once.
                We also position the legend at the bottom.
              */}
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ marginTop: 10 }}
                payload={legendPayload}
              />

              {/* 
                Create one Bar per docKey (e.g. "Neck_0"), 
                each with the color from locationColorMap[location].
              */}
              {docKeys.map((docKey) => {
                const location = docKey.split("_")[0];
                const fillColor = locationColorMap[location] || "#ccc";
                return (
                  <Bar
                    key={docKey}
                    dataKey={docKey}
                    fill={fillColor}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TicBarChart;

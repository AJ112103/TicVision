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

interface MyTic {
  name: string;
  count: number;
  color: string;
}

// Time ranges
const timeRanges = {
  all: "All Time",
  day: "Today",
  week: "Last Week",
  month: "Last Month",
  threeMonths: "Last 3 Months",
  sixMonths: "Last 6 Months",
  year: "Last Year",
} as const;
type TimeRangeKey = keyof typeof timeRanges;

// CHART MODES: "avg", "total", "count"
const chartModes = ["avg", "total", "count"] as const;
type ChartMode = (typeof chartModes)[number];

const TicLineChart = () => {
  const db = getFirestore();

  const [timeRange, setTimeRange] = useState<TimeRangeKey>("all");
  const [chartData, setChartData] = useState<any[]>([]);
  const [myTics, setMyTics] = useState<MyTic[]>([]);
  const [selectedTics, setSelectedTics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which chart mode we’re in
  const [chartModeIndex, setChartModeIndex] = useState(0);
  const currentChartMode: ChartMode = chartModes[chartModeIndex];

  // Labels for each mode
  const renderModeLabel = (mode: ChartMode) => {
    switch (mode) {
      case "avg":
        return "Average Intensity";
      case "total":
        return "Total Intensity";
      case "count":
        return "Number of Tics";
    }
  };

  // Handlers for cycling modes via arrows
  const prevMode = () => {
    setChartModeIndex((prev) => (prev + chartModes.length - 1) % chartModes.length);
  };
  const nextMode = () => {
    setChartModeIndex((prev) => (prev + 1) % chartModes.length);
  };

  // Fetch "MyTics"
  const fetchMyTics = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const myTicsCollection = collection(db, "users", user.uid, "mytics");
      const snapshot = await getDocs(myTicsCollection);

      const tics: MyTic[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          count: data.count,
          color: `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`,
        };
      });

      setMyTics(tics);
      // By default, select all
      setSelectedTics(tics.map((tic) => tic.name));
    } catch (error) {
      console.error("Error fetching my tics:", error);
    }
  };

  // Fetch ticHistory
  const fetchTicHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const historyCollection = collection(db, "users", user.uid, "ticHistory");
      const snapshot = await getDocs(historyCollection);
      const ticData: TicData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          timeOfDay: data.timeOfDay,
          date: data.date,
          intensity: data.intensity,
          location: data.location,
        } as TicData;
      });

      // Process data with the current chart mode
      const processedData = processTicData(ticData, currentChartMode);
      setChartData(processedData);
    } catch (error) {
      console.error("Error fetching tic history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Process data with 3 modes
  const processTicData = (data: TicData[], mode: ChartMode) => {
    const now = new Date();

    // Filter by timeRange
    const filteredData = data.filter((tic) => {
      const ticDate = new Date(tic.date);
      switch (timeRange) {
        case "all":
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

    // Group data
    const groupedData = filteredData.reduce((acc: any, tic) => {
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

    // Convert to array
    const result = Object.values(groupedData).map((entry: any) => {
      const item: Record<string, number | string> = {
        timeKey: entry.timeKey,
      };
      Object.keys(entry).forEach((k) => {
        if (k !== "timeKey") {
          const { sum, count } = entry[k];
          switch (mode) {
            case "avg":
              item[k] = sum / count; // average
              break;
            case "total":
              item[k] = sum; // sum
              break;
            case "count":
              item[k] = count; // number of tics
              break;
          }
        }
      });
      return item;
    });

    // Sort
    return result.sort((a: any, b: any) => {
      if (timeRange === "day") {
        const timeA = new Date(`2000/01/01 ${a.timeKey}`).getTime();
        const timeB = new Date(`2000/01/01 ${b.timeKey}`).getTime();
        return timeA - timeB;
      } else {
        return new Date(a.timeKey).getTime() - new Date(b.timeKey).getTime();
      }
    });
  };

  // On mount, fetch MyTics
  useEffect(() => {
    fetchMyTics();
  }, []);

  // Re-fetch ticHistory if timeRange or chartMode changes
  useEffect(() => {
    fetchTicHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, currentChartMode]);

  // Toggle selection
  const toggleTic = (ticName: string) => {
    setSelectedTics((prevSelected) => {
      if (prevSelected.includes(ticName)) {
        return prevSelected.filter((name) => name !== ticName);
      } else {
        return [...prevSelected, ticName];
      }
    });
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
      </div>
    );
  }

  // Prepare data for chart
  const prepareChartData = () => {
    if (chartData.length === 0 || myTics.length === 0) {
      // Minimal dataset if no data
      return [["Time"]];
    }

    const filteredMyTics = myTics.filter((tic) => selectedTics.includes(tic.name));
    if (filteredMyTics.length === 0) {
      // No tics selected -> empty x-axis
      return [["Time"]];
    }

    // Build header
    const header = ["Time", ...filteredMyTics.map((tic) => tic.name)];
    // Build rows
    const rows = chartData.map((entry) => {
      const row = [entry.timeKey];
      filteredMyTics.forEach((tic) => {
        row.push(entry[tic.name] || 0);
      });
      return row;
    });

    return [header, ...rows];
  };

  const filteredChartData = prepareChartData();

  // Find max value
  const findMaxValue = (data: any[][]) => {
    let maxVal = 0;
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      for (let j = 1; j < row.length; j++) {
        const val = row[j];
        if (typeof val === "number" && val > maxVal) {
          maxVal = val;
        }
      }
    }
    return maxVal;
  };
  const maxDataValue = findMaxValue(filteredChartData);

  // For average intensity, set max at 10; otherwise max = maxDataValue + 5
  const chartMax =
    currentChartMode === "avg" ? 10 : Math.max(maxDataValue + 5, 5);

  // Chart options
  const chartOptions = {
    // 1) Remove chart title (redundant)
    // title: "", // omitted or set to ""
    curveType: "function",
    legend: { position: "bottom" },

    // 2) No slant on the x-axis
    hAxis: {
      // Remove slantedText: true
      slantedText: false,
      // If you want to ensure wide labels are fully shown, you can also set:
      // maxTextLines: 1,
      // or adjust chartArea to provide more space for the x-axis
    },
    vAxis: {
      // 3) For "avg" mode, 0 to 10. Otherwise, 0 to (max + 5)
      viewWindow: {
        min: 0,
        max: chartMax,
      },
    },
    // Colors
    colors: myTics
      .filter((tic) => selectedTics.includes(tic.name))
      .map((tic) => tic.color),
    // Optionally: adjust chartArea if you need more space:
    // chartArea: {
    //   left: 50,
    //   right: 20,
    //   top: 10,
    //   bottom: 50,
    // },
  };

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
      <div className="bg-white shadow-sm rounded-lg p-3 sm:p-6">

        {/* ROW 1: Mode Switcher (arrows + label) centered */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {/* Left Arrow */}
          <button
            onClick={prevMode}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" strokeWidth={2} />
            </svg>
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {renderModeLabel(currentChartMode)}
          </h2>

          {/* Right Arrow */}
          <button
            onClick={nextMode}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* ROW 2: Time Range Dropdown - we can keep it right-aligned or center it */}
        <div className="flex justify-center mb-4">
          <select
            onChange={(e) => setTimeRange(e.target.value as TimeRangeKey)}
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

        {/* TIC FILTER */}
        <div className="mb-4">
          <label
            htmlFor="tic-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Tic Types:
          </label>
          <div className="flex flex-wrap gap-2">
            {myTics.map((tic) => {
              const isSelected = selectedTics.includes(tic.name);
              return (
                <button
                  key={tic.name}
                  type="button"
                  onClick={() => toggleTic(tic.name)}
                  className="
                    flex items-center gap-1 px-3 py-2 
                    rounded-full border border-gray-300
                    bg-white text-gray-700
                    hover:bg-gray-100
                    transition
                  "
                >
                  <span>{tic.name}</span>
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CHART */}
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
            data={filteredChartData}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TicLineChart;

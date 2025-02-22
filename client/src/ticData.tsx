// src/TicData.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase"; // Adjust the path as needed
import TicFilters, { TimeRangeKey } from "./components/TicFilters";
import TicChart from "./components/TicChart";
import TicTable, { TicData as TicDataType } from "./components/TicTable";

// For storing user-defined tic types
interface MyTic {
  name: string;
  count: number;
  color: string;
}

// Available chart modes
const chartModes = ["avg", "total", "count"] as const;
type ChartMode = (typeof chartModes)[number];

const TicData: React.FC = () => {
  const [ticData, setTicData] = useState<TicDataType[]>([]);
  const [myTics, setMyTics] = useState<MyTic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // FILTER STATES
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeKey>("all");
  const [specificDate, setSpecificDate] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // CHART MODE
  const [chartModeIndex, setChartModeIndex] = useState<number>(0);
  const currentChartMode: ChartMode = chartModes[chartModeIndex];

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found.");
      return;
    }
    setLoading(true);
    try {
      // 1) Fetch ticHistory
      const historyCollection = collection(db, "users", user.uid, "ticHistory");
      const snapshot = await getDocs(historyCollection);

      const rawData: TicDataType[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          timeOfDay: docData.timeOfDay,
          date: docData.date,
          intensity: docData.intensity,
          location: docData.location,
          // Include description if available, fallback to empty string
          description: docData.description ?? "",
        };
      });

      // 2) Fetch myTics (used for assigning colors, etc.)
      const myTicsCollection = collection(db, "users", user.uid, "mytics");
      const myTicsSnap = await getDocs(myTicsCollection);
      const tics: MyTic[] = myTicsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          count: data.count,
          // Generate a random color for each tic type (or fetch from doc)
          color: `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`,
        };
      });

      setTicData(rawData);
      setMyTics(tics);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- FILTERING & SORTING -----------------
  const filteredData = useMemo(() => {
    const now = new Date();
    let data = [...ticData];

    // Time range filter
    if (timeRangeFilter !== "specificDate") {
      data = data.filter((tic) => {
        const ticDate = new Date(tic.date);
        switch (timeRangeFilter) {
          case "today":
            return ticDate.toDateString() === now.toDateString();
          case "lastWeek":
            return now.getTime() - ticDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
          case "lastMonth":
            return (
              ticDate.getMonth() === now.getMonth() &&
              ticDate.getFullYear() === now.getFullYear()
            );
          case "last3Months":
            return now.getTime() - ticDate.getTime() <= 90 * 24 * 60 * 60 * 1000;
          case "last6Months":
            return (
              now.getTime() - ticDate.getTime() <= 180 * 24 * 60 * 60 * 1000
            );
          case "lastYear":
            return ticDate.getFullYear() === now.getFullYear();
          case "all":
          default:
            return true;
        }
      });
    } else if (specificDate) {
      const selDateStr = new Date(specificDate).toDateString();
      data = data.filter(
        (tic) => new Date(tic.date).toDateString() === selDateStr
      );
    }

    // Location filter
    if (locationFilter.length > 0) {
      data = data.filter((tic) => locationFilter.includes(tic.location));
    }

    // Sort (date asc or desc)
    data.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [ticData, timeRangeFilter, specificDate, locationFilter, sortDirection]);

  // Collect unique locations for the filter checkboxes
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(ticData.map((t) => t.location)));
  }, [ticData]);

  const toggleSort = () => {
    setSortDirection(sortDirection === "desc" ? "asc" : "desc");
  };

  const handleResetFilters = () => {
    setTimeRangeFilter("all");
    setSpecificDate("");
    setLocationFilter([]);
    setSortDirection("desc");
  };

  const toggleLocation = (loc: string) => {
    setLocationFilter((prev) =>
      prev.includes(loc) ? prev.filter((x) => x !== loc) : [...prev, loc]
    );
  };

  // ----------------- CHART DATA PROCESSING -----------------
  const processChartData = (data: TicDataType[]) => {
    // If "today" is chosen, group by timeOfDay; otherwise group by date
    const groupingByTimeOfDay = timeRangeFilter === "today";
    const grouped: Record<
      string,
      Record<string, { sum: number; count: number }>
    > = {};

    data.forEach((tic) => {
      const key = groupingByTimeOfDay ? tic.timeOfDay : tic.date;
      if (!grouped[key]) grouped[key] = {};
      if (!grouped[key][tic.location]) {
        grouped[key][tic.location] = { sum: 0, count: 0 };
      }
      grouped[key][tic.location].sum += tic.intensity;
      grouped[key][tic.location].count += 1;
    });

    // Convert the grouped object into an array for charting
    const result = Object.entries(grouped).map(([timeKey, locationMap]) => {
      const row: Record<string, number | string> = { timeKey };
      Object.entries(locationMap).forEach(([loc, { sum, count }]) => {
        switch (currentChartMode) {
          case "avg":
            row[loc] = sum / count;
            break;
          case "total":
            row[loc] = sum;
            break;
          case "count":
            row[loc] = count;
            break;
        }
      });
      return row;
    });

    // Sort by timeKey
    result.sort((a, b) => {
      if (timeRangeFilter === "today") {
        // Sort by timeOfDay as time
        const timeA = new Date(`2000-01-01 ${a.timeKey}`).getTime();
        const timeB = new Date(`2000-01-01 ${b.timeKey}`).getTime();
        return timeA - timeB;
      } else {
        // Sort by date
        const dateA = new Date(a.timeKey as string).getTime();
        const dateB = new Date(b.timeKey as string).getTime();
        return dateA - dateB;
      }
    });

    return result;
  };

  const chartRawData = useMemo(
    () => processChartData(filteredData),
    [filteredData, currentChartMode, timeRangeFilter]
  );

  // Collect all locations found in the chart data
  const allLocationsInChart = useMemo(() => {
    const setLoc = new Set<string>();
    chartRawData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== "timeKey") setLoc.add(k);
      });
    });
    return Array.from(setLoc);
  }, [chartRawData]);

  // Assign a color for each location
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const randomColor = () =>
      `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    allLocationsInChart.forEach((loc) => {
      const matchedTic = myTics.find((t) => t.name === loc);
      if (matchedTic) {
        map[loc] = matchedTic.color;
      } else {
        if (!map[loc]) {
          map[loc] = randomColor();
        }
      }
    });
    return map;
  }, [allLocationsInChart, myTics]);

  // Convert the raw chart data into the 2D array format for Google Charts
  const chartDataForGoogle = useMemo(() => {
    if (!chartRawData.length) return [["Time"]];
    const header = ["Time", ...allLocationsInChart];
    const rows = chartRawData.map((entry) => {
      const row = [entry.timeKey];
      allLocationsInChart.forEach((loc) => {
        row.push(entry[loc] || 0);
      });
      return row;
    });
    return [header, ...rows];
  }, [chartRawData, allLocationsInChart]);

  // Find the max data value for adjusting chart Y-axis
  const findMaxValue = (data: any[][]) => {
    let maxVal = 0;
    for (let i = 1; i < data.length; i++) {
      for (let j = 1; j < data[i].length; j++) {
        const val = data[i][j];
        if (typeof val === "number" && val > maxVal) {
          maxVal = val;
        }
      }
    }
    return maxVal;
  };

  const maxDataValue = findMaxValue(chartDataForGoogle);
  const chartMax =
    currentChartMode === "avg" ? 10 : Math.max(maxDataValue + 5, 5);

  // Options for Google Chart
  const chartOptions = {
    curveType: "function",
    legend: { position: "bottom" },
    hAxis: { slantedText: false },
    vAxis: { viewWindow: { min: 0, max: chartMax } },
    colors: allLocationsInChart.map((loc) => colorMap[loc]),
  };

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

  // Handlers for switching chart modes
  const prevMode = () => {
    setChartModeIndex((prev) => (prev + chartModes.length - 1) % chartModes.length);
  };

  const nextMode = () => {
    setChartModeIndex((prev) => (prev + 1) % chartModes.length);
  };

  return (
    <div className="bg-[#c6e8f0] min-h-screen py-8">
      <motion.div
        className="container mx-auto max-w-screen-xl w-full overflow-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* TITLE */}
        <motion.h2
          className="text-3xl text-[#4a90a1] sm:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tic Data
        </motion.h2>

        {/* FILTERS */}
        <TicFilters
          timeRangeFilter={timeRangeFilter}
          setTimeRangeFilter={setTimeRangeFilter}
          specificDate={specificDate}
          setSpecificDate={setSpecificDate}
          locationFilter={locationFilter}
          toggleLocation={toggleLocation}
          uniqueLocations={uniqueLocations}
          handleResetFilters={handleResetFilters}
        />

        {/* LOADING SPINNER */}
        {loading && (
          <motion.div
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Loading...
          </motion.div>
        )}

        {/* CHART + TABLE */}
        {!loading && (
          <>
            <TicChart
              chartDataForGoogle={chartDataForGoogle}
              chartOptions={chartOptions}
              currentChartMode={currentChartMode}
              prevMode={prevMode}
              nextMode={nextMode}
              renderModeLabel={renderModeLabel}
            />
            <TicTable
              filteredData={filteredData}
              sortDirection={sortDirection}
              toggleSort={toggleSort}
            />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TicData;

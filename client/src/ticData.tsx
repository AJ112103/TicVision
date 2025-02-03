import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase"; // Adjust paths as needed
import { ArrowUpDown } from "lucide-react";
import * as d3 from "d3";
import "./ticData.css"; // Import your CSS file here

// Interfaces
interface TicData {
  timeOfDay: string;
  date: string;
  intensity: number;
  location: string; // We'll treat 'location' as the 'tic name' here
}

interface MyTic {
  name: string;
  count: number;
  color: string;
}

// Chart modes
const chartModes = ["avg", "total", "count"] as const;
type ChartMode = (typeof chartModes)[number];

// Time Range Keys
const timeRanges = {
  all: "All Time",
  today: "Today",
  lastWeek: "Last Week",
  lastMonth: "Last Month",
  last3Months: "Last 3 Months",
  last6Months: "Last 6 Months",
  lastYear: "Last Year",
  specificDate: "Specific Date",
} as const;

type TimeRangeKey = keyof typeof timeRanges;

const TicData: React.FC = () => {
  // ---- STATES ----
  const [ticData, setTicData] = useState<TicData[]>([]);
  const [myTics, setMyTics] = useState<MyTic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // FILTER STATES
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeKey>("all");
  const [specificDate, setSpecificDate] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);

  // SORT DIRECTION FOR TABLE
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // CHART MODE
  const [chartModeIndex, setChartModeIndex] = useState<number>(0);
  const currentChartMode: ChartMode = chartModes[chartModeIndex];

  // D3 chart container reference
  const d3ChartRef = useRef<HTMLDivElement>(null);

  // ---- EFFECTS ----
  useEffect(() => {
    fetchData();
  }, []);

  // ---- DATA FETCH ----
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
      const rawData: TicData[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          timeOfDay: docData.timeOfDay,
          date: docData.date,
          intensity: docData.intensity,
          location: docData.location,
        };
      });

      // 2) Fetch myTics (for colors, etc.)
      const myTicsCollection = collection(db, "users", user.uid, "mytics");
      const myTicsSnap = await getDocs(myTicsCollection);
      const tics: MyTic[] = myTicsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name,
          count: data.count,
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

  // ---- FILTERING ----
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
            return now.getTime() - ticDate.getTime() <= 180 * 24 * 60 * 60 * 1000;
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

  // Distinct locations
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(ticData.map((t) => t.location)));
  }, [ticData]);

  // Table sort toggle
  const toggleSort = () => {
    const newDirection = sortDirection === "desc" ? "asc" : "desc";
    setSortDirection(newDirection);
  };

  // Reset filters
  const handleResetFilters = () => {
    setTimeRangeFilter("all");
    setSpecificDate("");
    setLocationFilter([]);
    setSortDirection("desc");
  };

  // Toggle location
  const toggleLocation = (location: string) => {
    setLocationFilter((prev) =>
      prev.includes(location)
        ? prev.filter((loc) => loc !== location)
        : [...prev, location]
    );
  };

  // Chart mode switch
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

  const prevMode = () => {
    setChartModeIndex((prev) => (prev + chartModes.length - 1) % chartModes.length);
  };

  const nextMode = () => {
    setChartModeIndex((prev) => (prev + 1) % chartModes.length);
  };

  // ---- CHART DATA PROCESSING ----
  const processChartData = (data: TicData[]) => {
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

    // Sort by date or timeOfDay
    result.sort((a, b) => {
      if (groupingByTimeOfDay) {
        // Sort by time of day
        const timeA = new Date(`2000-01-01 ${a.timeKey}`).getTime();
        const timeB = new Date(`2000-01-01 ${b.timeKey}`).getTime();
        return timeA - timeB;
      } else {
        // Sort by actual date
        const dateA = new Date(a.timeKey as string).getTime();
        const dateB = new Date(b.timeKey as string).getTime();
        return dateA - dateB;
      }
    });

    return result;
  };

  const chartRawData = useMemo(() => {
    return processChartData(filteredData);
  }, [filteredData, currentChartMode, timeRangeFilter]);

  // Build chart header => ["Time", location1, location2, ...]
  const allLocationsInChart = useMemo(() => {
    const setLoc = new Set<string>();
    chartRawData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== "timeKey") setLoc.add(k);
      });
    });
    return Array.from(setLoc);
  }, [chartRawData]);

  // Assign colors
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

  // Final 2D array for chart export (CSV, etc.)
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

  // Find max data value for Y-axis limit
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
  const chartMax = currentChartMode === "avg" ? 10 : Math.max(maxDataValue + 5, 5);

  // ---- D3 CHART RENDERING ----
  const drawChart = useCallback(() => {
    if (!d3ChartRef.current) return;
    // Clear previous chart contents
    d3.select(d3ChartRef.current).selectAll("*").remove();

    // Get container dimensions
    const container = d3ChartRef.current;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the SVG element
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // If no data is available, show a message
    if (chartDataForGoogle.length <= 1) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("No data available.");
      return;
    }

    // Extract header and data rows
    const header = chartDataForGoogle[0]; // e.g., ["Time", "loc1", "loc2", ...]
    const dataRows = chartDataForGoogle.slice(1);

    // Determine if grouping by time of day
    const groupingByTimeOfDay = timeRangeFilter === "today";

    // Build a data structure for each series
    const seriesData: Record<string, { x: Date; y: number }[]> = {};
    header.slice(1).forEach((loc) => {
      seriesData[loc] = [];
    });
    dataRows.forEach((row) => {
      let xValue: Date;
      if (groupingByTimeOfDay) {
        // Parse time-of-day using a fixed date (e.g., Jan 1, 2000)
        xValue = new Date("2000-01-01 " + row[0]);
      } else {
        xValue = new Date(row[0]);
      }
      header.slice(1).forEach((loc, i) => {
        const yValue = +row[i + 1];
        seriesData[loc].push({ x: xValue, y: yValue });
      });
    });

    // Compute x domain from all data points
    const allX: Date[] = dataRows.map((row) =>
      groupingByTimeOfDay ? new Date("2000-01-01 " + row[0]) : new Date(row[0])
    );
    const xExtent = d3.extent(allX) as [Date, Date];

    // Create scales
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, chartMax]).range([innerHeight, 0]);

    // Append group for chart content
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create x-axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat(
        d3.timeFormat(groupingByTimeOfDay ? "%I:%M %p" : "%b %d") as (d: Date) => string
      );
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    // Create y-axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append("g").call(yAxis);

    // Create line generator
    const lineGenerator = d3
      .line<{ x: Date; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw a line for each series
    Object.keys(seriesData).forEach((loc) => {
      g.append("path")
        .datum(seriesData[loc])
        .attr("fill", "none")
        .attr("stroke", colorMap[loc] || "#000")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);
    });

    // Add legend at the bottom of the chart
    const legend = svg.append("g").attr("class", "legend");
    const legendData = header.slice(1);
    const legendSpacing = 10;
    let legendX = margin.left;
    const legendY = height - margin.bottom + 30;

    legendData.forEach((loc) => {
      legend
        .append("rect")
        .attr("x", legendX)
        .attr("y", legendY - 10)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colorMap[loc] || "#000");
      legend
        .append("text")
        .attr("x", legendX + 15)
        .attr("y", legendY)
        .attr("dy", "-0.2em")
        .attr("font-size", "12px")
        .text(loc);
      // Estimate text width and update legendX for the next item
      const textWidth = (legend
        .append("text")
        .text(loc)
        .node() as SVGTextElement).getComputedTextLength();
      legendX += 15 + textWidth + legendSpacing;
    });
  }, [chartDataForGoogle, colorMap, chartMax, timeRangeFilter]);

  // Redraw the chart when dependencies change and on window resize
  useEffect(() => {
    drawChart();
    window.addEventListener("resize", drawChart);
    return () => window.removeEventListener("resize", drawChart);
  }, [drawChart]);

  // ---- EXPORT FUNCTIONS ----

  // Export the chart data as CSV
  const exportCSV = () => {
    if (chartDataForGoogle.length <= 1) return;
    const csvContent = chartDataForGoogle.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export the chart as an SVG file
  const exportSVG = () => {
    if (!d3ChartRef.current) return;
    const svgElement = d3ChartRef.current.querySelector("svg");
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Export the chart as a PNG image
  const exportPNG = () => {
    if (!d3ChartRef.current) return;
    const svgElement = d3ChartRef.current.querySelector("svg");
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    // Use the SVG element's width and height attributes
    const width = parseInt(svgElement.getAttribute("width") || "800", 10);
    const height = parseInt(svgElement.getAttribute("height") || "400", 10);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.download = "chart.png";
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    };
    img.src = url;
  };

  /**
   * Mobile-only sort button
   * - Hidden on screens above 768px
   * - Calls toggleSort() on click
   */
  const MobileSortButton: React.FC<{
    onSortClick: () => void;
    sortDirection: "asc" | "desc";
  }> = ({ onSortClick, sortDirection }) => {
    return (
      <div className="block md:hidden mb-4 text-right">
        <button
          onClick={onSortClick}
          className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200"
          title={`Sort by date (${
            sortDirection === "desc" ? "newest first" : "oldest first"
          })`}
        >
          Sort by Date
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M7 7l3-3m0 0l3 3m-3-3v18" strokeWidth={2} />
          </svg>
        </button>
      </div>
    );
  };

  // ---- RENDER ----
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <motion.div
        className="container mx-auto max-w-screen-xl w-full overflow-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* TITLE */}
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tic Data
        </motion.h2>

        {/* FILTERS */}
        <motion.div
          className="bg-white rounded shadow p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl mb-4 font-semibold">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Time Range Filter */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="timeRange">
                Time Range
              </label>
              <select
                id="timeRange"
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={timeRangeFilter}
                onChange={(e) =>
                  setTimeRangeFilter(e.target.value as TimeRangeKey)
                }
              >
                {Object.entries(timeRanges).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Date Picker */}
            {timeRangeFilter === "specificDate" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="specificDate"
                >
                  Select Date
                </label>
                <input
                  type="date"
                  id="specificDate"
                  className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                />
              </motion.div>
            )}

            {/* Location Filter (Tic Types) */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tic Types
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueLocations.map((loc, index) => {
                  const isSelected = locationFilter.includes(loc);
                  return (
                    <motion.button
                      key={loc}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors duration-200 ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {loc}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-100 hover:bg-gray-200 transition-colors duration-200 rounded px-3 py-2 text-sm"
            onClick={handleResetFilters}
          >
            Reset Filters
          </motion.button>
        </motion.div>

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
            {/* CHART CARD */}
            <motion.div
              className="bg-white rounded shadow p-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Chart Mode Switcher */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={prevMode}
                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                >
                  {/* Left Arrow */}
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

                <h2 className="text-xl font-bold text-gray-900">
                  {renderModeLabel(currentChartMode)}
                </h2>

                <button
                  onClick={nextMode}
                  className="p-2 hover:bg-gray-100 rounded transition-colors duration-200"
                >
                  {/* Right Arrow */}
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

              {/* Export Buttons */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={exportCSV}
                  className="px-3 py-2 border rounded hover:bg-gray-100 transition-colors duration-200 text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={exportPNG}
                  className="px-3 py-2 border rounded hover:bg-gray-100 transition-colors duration-200 text-sm"
                >
                  Export PNG
                </button>
                <button
                  onClick={exportSVG}
                  className="px-3 py-2 border rounded hover:bg-gray-100 transition-colors duration-200 text-sm"
                >
                  Export SVG
                </button>
              </div>

              {/* Chart Container */}
              <div
                ref={d3ChartRef}
                className="w-full h-[400px] sm:h-[500px] overflow-hidden"
              ></div>
            </motion.div>

            {/* TABLE CARD */}
            <motion.div
              className="bg-white rounded shadow p-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl mb-4 font-semibold">Tic Data Table</h3>

              {/* Mobile Sort Button */}
              <MobileSortButton
                onSortClick={toggleSort}         // use your existing toggleSort
                sortDirection={sortDirection}    // pass in the current sort direction
              />

              {/* Table Container */}
              <div className="overflow-x-auto">
                {/* Add the .tic-table class to apply our custom CSS */}
                <table className="tic-table min-w-full bg-white rounded-lg overflow-hidden border">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="py-3 px-6 text-left">
                        <div className="flex items-center gap-2">
                          Date
                          <button
                            onClick={toggleSort}
                            className="p-1 rounded hover:bg-primary/50 transition-colors duration-200"
                            title={`Sort by date (${
                              sortDirection === "desc"
                                ? "newest first"
                                : "oldest first"
                            })`}
                          >
                            <ArrowUpDown size={16} />
                          </button>
                        </div>
                      </th>
                      <th className="py-3 px-6 text-left">Time of Day</th>
                      <th className="py-3 px-6 text-left">Location (Tic)</th>
                      <th className="py-3 px-6 text-left">Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No data available.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((tic, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td data-label="Date" className="py-3 px-6">
                            {new Date(tic.date).toLocaleDateString()}
                          </td>
                          <td data-label="Time of Day" className="py-3 px-6">
                            {tic.timeOfDay}
                          </td>
                          <td data-label="Location (Tic)" className="py-3 px-6">
                            {tic.location}
                          </td>
                          <td data-label="Intensity" className="py-3 px-6">
                            {tic.intensity}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TicData;

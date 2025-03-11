import React from "react";
import { motion } from "framer-motion";
import { Chart } from "react-google-charts";

// Define ChartMode type
type ChartMode = "avg" | "total" | "count";

interface TicChartProps {
  chartDataForGoogle: any[];
  chartOptions: any;
  currentChartMode: ChartMode;
  prevMode: () => void;
  nextMode: () => void;
  renderModeLabel: (mode: ChartMode) => string;
}

const TicChart: React.FC<TicChartProps> = ({
  chartDataForGoogle,
  chartOptions,
  currentChartMode,
  prevMode,
  nextMode,
  renderModeLabel,
}) => {
  return (
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

      {/* Chart Container */}
      <div className="w-full h-[400px] sm:h-[500px] overflow-hidden">
        <Chart
          width="100%"
          height="100%"
          chartType="LineChart"
          loader={
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-gray-500"></div>
            </div>
          }
          data={chartDataForGoogle}
          options={chartOptions}
        />
      </div>
    </motion.div>
  );
};

export default TicChart;
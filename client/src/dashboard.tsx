import { useNavigate } from "react-router-dom";
import LogTicModal from "./logticmodal";
import TodayTicsBarChart from "./graphmodal";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous");

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserName(user.displayName || "Anonymous");
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const todayDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const ticsLogged = 5;

  const handleViewGraphs = () => {
    navigate("/graph");
  };

  return (
    <motion.div
      // Fade in the entire dashboard
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#c6e8f0] p-4 sm:p-6"
    >
      <motion.main
        // Slide up main content
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Welcome Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-xl sm:text-2xl font-bold text-[#256472] mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-base sm:text-lg text-[#256472]">{todayDate}</p>
        </motion.div>

        {/* Today's Overview Section */}
        <motion.div
          className="bg-[#4a90a1] text-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 border border-black"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-base sm:text-lg font-bold text-center bg-[#e3f2fd] text-[#256472] py-2 rounded-lg shadow-md border border-gray-700">
            Today's Overview
          </h2>

          {/* Tics Logged Section */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="bg-[#2F434A] text-[#C1E4EC] rounded-full h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center shadow-l border border-[#C1E4EC]">
              <p className="text-2xl sm:text-4xl font-bold">{ticsLogged}</p>
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-2 sm:mt-3 border border-[#C1E4EC]">
              Tics Logged
            </h3>
          </motion.div>

          <hr className="border-t border-[#C1E4EC] my-4 sm:my-6" />

          {/* AI Suggestion Section */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h2 className="text-xs sm:text-lg font-bold text-center bg-[#C1E4EC] text-[#2F434A] py-2 px-2 rounded-lg shadow-md border border-gray-700">
              Identify Triggers for High Intensity: Note that on 2024-12-30, the intensity
              peaked at 10 for complex vocal tics. Review the day prior to this date for 
              possible stressors or environmental factors that may have contributed 
              to the heightened tic intensity
            </h2>
            <h3 className="text-sm sm:text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-2 sm:mt-3 border border-[#C1E4EC]">
              AI Suggestion
            </h3>
          </motion.div>

          <hr className="border-t border-[#C1E4EC] my-4 sm:my-6" />

          {/* Log New Tic Section */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <LogTicModal />
            <h3 className="text-sm sm:text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-2 sm:mt-3 border border-[#C1E4EC]">
              Log New Tic
            </h3>
          </motion.div>

          <hr className="border-t border-[#C1E4EC] my-4 sm:my-6" />

          {/* Tic Trends Section */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <button 
              onClick={handleViewGraphs}
              className="bg-[#256472] text-[#C1E4EC] py-2 px-4 rounded-lg shadow-md hover:bg-[#2F434A] transition-colors duration-300 w-full sm:w-auto"
            >
              <TodayTicsBarChart />
            </button>
            <h3 className="text-sm sm:text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-2 sm:mt-3 border border-[#C1E4EC]">
              Tic Trends
            </h3>
          </motion.div>
        </motion.div>
      </motion.main>
    </motion.div>
  );
};

export default Dashboard;

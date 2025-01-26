import { useNavigate } from "react-router-dom";
import LogTicModal from "./logticmodal";
import TodayTicsBarChart from "./graphmodal";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const Dashboard = () => {
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous"); // Default to 'Anonymous'

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserName(user.displayName || "Anonymous"); // Fallback to 'Anonymous' if no displayName
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

  const ticsLogged = 5; // Replace with dynamic data

  return (
    <div className="min-h-screen bg-[#c6e8f0]">
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#256472]">Welcome, {userName}!</h1>
          <p className="text-lg text-[#256472]">{todayDate}</p>
        </div>

        {/* Today's Overview Section */}
        <div className="bg-[#4a90a1] text-white rounded-lg shadow-lg p-6 space-y-6 border border-black">
          <h2 className="text-lg font-bold text-center bg-[#e3f2fd] text-[#256472] py-2 rounded-lg shadow-md border border-gray-700 ">
          Today's Overview
          </h2>

          {/* Tics Logged Section */}
          <div className="flex flex-col items-center">
            <div className="bg-[#2F434A] text-[#C1E4EC] rounded-full h-16 w-16 flex items-center justify-center shadow-l border border-[#C1E4EC]">
              <p className="text-4xl font-bold">{ticsLogged}</p>
            </div>
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              Tics Logged
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-center bg-[#C1E4EC] text-[#2F434A] py-2 px-2 rounded-lg shadow-md border border-gray-700 ">
              Identify Triggers for High Intensity: Note that on 2024-12-30, the intensity peaked at 10 for complex vocal tics. Review the day prior to this date for possible stressors or environmental factors that may have contributed to the heightened tic intensity
            </h2>
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              AI Suggestion
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          <div className="flex flex-col items-center">
            <LogTicModal />
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              Log New Tic
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          <div className="flex flex-col items-center">
            <TodayTicsBarChart />
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md border border-[#C1E4EC]">
              Tic Trends
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

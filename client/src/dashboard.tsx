import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "./firebase";
import LogTicModal from "./logticmodal";
import TodayTicsBarChart from "./graphmodal";

const Dashboard = () => {
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous");
  const [ticCounter, setTicCounter] = useState(0);
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.displayName || "Anonymous");
          setTicCounter(userData.ticCounter || 0);
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Fetch advice based on ticCounter
    const fetchAdvice = async () => {
      if (!userId || ticCounter === 0) return;

      try {
        // Determine the base counter (e.g., 10, 20, 30, etc.)
        const baseCounter = Math.floor(ticCounter / 10) * 10;

        // Query the advice document where ticCounter matches baseCounter
        const adviceRef = collection(db, "users", userId, "advice");
        const adviceQuery = query(adviceRef, where("ticCounter", "==", baseCounter), limit(1));
        const adviceSnapshot = await getDocs(adviceQuery);

        if (!adviceSnapshot.empty) {
          const latestAdvice = adviceSnapshot.docs[0].data();
          const adviceIndex = ticCounter % 10; // Determine the advice index based on the remainder
          setAdvice(
            (latestAdvice.advice[adviceIndex]?.slice(3) || "Log at least 10 tics to receive AI advice")
          );          
        } else {
          setAdvice("Log at least 10 tics to receive AI advice");
        }
      } catch (error) {
        console.error("Error fetching advice:", error);
      }
    };

    fetchUserData();
    fetchAdvice();
  }, [userId, ticCounter]);

  const todayDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

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
          <h2 className="text-lg font-bold text-center bg-[#e3f2fd] text-[#256472] py-2 rounded-lg shadow-md border border-gray-700">
            Overview
          </h2>

          {/* Tics Logged Section */}
          <div className="flex flex-col items-center">
            <div className="bg-[#2F434A] text-[#C1E4EC] rounded-full h-16 w-16 flex items-center justify-center shadow-lg border border-[#C1E4EC]">
              <p className="text-4xl font-bold">{ticCounter}</p>
            </div>
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              Tics Logged
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          {/* AI Advice Section */}
          <div className="flex flex-col items-center">
            <h2 className="max-w-xs p-2 rounded-lg shadow-md border border-gray-700 bg-[#C1E4EC] text-[#2F434A] text-lg font-bold text-left whitespace-normal">
              When you sense your neck tic coming on, try a competing response: gently tense your neck muscles for 10 seconds and then slowly release, to disrupt the tic cycle.
            </h2>
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              AI Suggestion
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          {/* Log New Tic */}
          <div className="flex flex-col items-center">
            <LogTicModal />
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              Log New Tic
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          {/* Tic Trends */}
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

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "./firebase";
import LogTicModal from "./logticmodal";

const Dashboard = () => {
  const userId = localStorage.getItem("userId");
  const [userName, setUserName] = useState("Anonymous");
  const [ticCounter, setTicCounter] = useState(0);
  const [advice, setAdvice] = useState("");

  // Fetch user display name and count tics from the last 24 hours.
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.displayName || "Anonymous");
        } else {
          console.error("User document not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchTicsLast24Hours = async () => {
      if (!userId) return;
      try {
        const myTicsRef = collection(db, "users", userId, "mytics");
        const snapshot = await getDocs(myTicsRef);
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        let count = 0;
        snapshot.docs.forEach((doc) => {
          const tic = doc.data();
          // Assuming tic.date is stored as a string "YYYY-MM-DD"
          const ticDate = new Date(tic.date);
          if (ticDate >= twentyFourHoursAgo) {
            count++;
          }
        });
        setTicCounter(count);
      } catch (error) {
        console.error("Error fetching tics for last 24 hours:", error);
      }
    };

    fetchUserData();
    fetchTicsLast24Hours();
  }, [userId]);

  // Fetch advice based on the number of tics logged in the last 24 hours.
  useEffect(() => {
    const fetchAdvice = async () => {
      if (!userId || ticCounter === 0) return;
      try {
        const baseCounter = Math.floor(ticCounter / 10) * 10;
        const adviceRef = collection(db, "users", userId, "advice");
        const adviceQuery = query(adviceRef, where("ticCounter", "==", baseCounter), limit(1));
        const adviceSnapshot = await getDocs(adviceQuery);
        if (!adviceSnapshot.empty) {
          const latestAdvice = adviceSnapshot.docs[0].data();
          const adviceIndex = ticCounter % 10;
          setAdvice(
            latestAdvice.advice[adviceIndex]?.slice(3) ||
            "Log at least 10 tics to receive AI advice"
          );
        } else {
          setAdvice("Log at least 10 tics to receive AI advice");
        }
      } catch (error) {
        console.error("Error fetching advice:", error);
      }
    };

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
            Today's Overview
          </h2>

          {/* Tics Logged Section */}
          <div className="flex flex-col items-center">
            <div className="bg-[#2F434A] text-[#C1E4EC] rounded-full h-16 w-16 flex items-center justify-center shadow-lg border border-[#C1E4EC]">
              <p className="text-4xl font-bold">{ticCounter}</p>
            </div>
            <h3 className="text-lg font-bold text-center bg-[#256472] text-[#C1E4EC] py-1 px-2 rounded-lg shadow-md mt-3 border border-[#C1E4EC]">
              Tics Logged (Last 24 Hours)
            </h3>
          </div>

          <hr className="border-t border-[#C1E4EC] my-6" />

          {/* AI Advice Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-center bg-[#C1E4EC] text-[#2F434A] py-2 px-2 rounded-lg shadow-md border border-gray-700">
              {advice}
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

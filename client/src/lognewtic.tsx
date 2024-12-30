import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import armIcon from "./assets/arm.svg";
import eyeIcon from "./assets/eye.svg";
import jawIcon from "./assets/jaw.svg";
import legIcon from "./assets/leg.svg";
import mouthIcon from "./assets/mouth.svg";
import neckIcon from "./assets/neck.svg";
import shoulderIcon from "./assets/shoulder.svg";
import stomachIcon from "./assets/stomach.svg";
import wordIcon from "./assets/word.svg";
import simpleIcon from "./assets/simple.svg";
import complexIcon from "./assets/complex.svg";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  increment,
  setDoc,
} from "firebase/firestore";
import { auth } from "./firebase";

const db = getFirestore();

const ticTypes = [
  { id: "1", name: "Arm", icon: armIcon },
  { id: "2", name: "Complex Vocal", icon: complexIcon },
  { id: "3", name: "Eye", icon: eyeIcon },
  { id: "4", name: "Jaw", icon: jawIcon },
  { id: "5", name: "Leg", icon: legIcon },
  { id: "6", name: "Mouth", icon: mouthIcon },
  { id: "7", name: "Neck", icon: neckIcon },
  { id: "8", name: "Shoulder", icon: shoulderIcon },
  { id: "9", name: "Simple Vocal", icon: simpleIcon },
  { id: "10", name: "Stomach", icon: stomachIcon },
  { id: "11", name: "Word Phrase", icon: wordIcon },
];

// Loading Spinner Component
const Loading = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
  </div>
);

const LogNewTic = () => {
  const { ticType } = useParams<{ ticType: string }>();
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timeOfDay, setTimeOfDay] = useState("Morning");
  const [loading, setLoading] = useState(false); // Loading state
  const [success, setSuccess] = useState(false); // Success state

  const selectedTic = ticTypes.find(
    (tic) => tic.name.replace(/\s+/g, "-").toLowerCase() === ticType
  );

  const addTicDirectly = async (ticData: {
    date: string;
    timeOfDay: string;
    location: string;
    intensity: number;
  }) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      const newTic = {
        ...ticData,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", userId, "ticHistory"), newTic);

      const ticType = ticData.location;
      const myTicDocRef = doc(db, "users", userId, "mytics", ticType);

      const myTicDoc = await getDoc(myTicDocRef);

      if (myTicDoc.exists()) {
        await setDoc(myTicDocRef, { count: increment(1) }, { merge: true });
      } else {
        await setDoc(myTicDocRef, {
          name: ticType,
          count: 1,
          createdAt: serverTimestamp(),
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error adding tic:", error);
      alert("Failed to add tic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const ticData = {
      date: selectedDate,
      timeOfDay,
      location: ticType?.replace("-", " ") || "Unknown",
      intensity,
    };

    await addTicDirectly(ticData);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded-lg shadow" style={{ height: "70vh" }}>
      <h2 className="text-lg font-bold text-center mb-4">Log New Tic</h2>

      {loading ? (
        <Loading />
      ) : success ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-semibold">Success!</p>
        </div>
      ) : (
        <>
          {/* Tic Type Box */}
          {selectedTic && (
            <div className="flex flex-col items-center justify-center p-4 mb-6 bg-[#4a90a1] w-40 text-white rounded-lg mx-auto">
              <img
                src={selectedTic.icon}
                alt={selectedTic.name}
                className="-mb-3 w-20 h-auto"
              />
              <span className="text-sm font-medium">{selectedTic.name}</span>
            </div>
          )}

          {/* Intensity Slider */}
          <div className="mb-4">
            <input
              id="intensity"
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full mt-2 accent-[#4a90a1]"
            />
            <div className="text-center mt-2 text-gray-600">
              Intensity: {intensity}
            </div>
          </div>

          {/* Date Picker */}
          <div className="mb-4">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full mt-2 p-2 border rounded"
            />
          </div>

          {/* Time of Day Selector */}
          <div className="mb-4">
            <label
              htmlFor="timeOfDay"
              className="block text-sm font-medium text-gray-700"
            >
              Time of Day
            </label>
            <select
              id="timeOfDay"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full mt-2 p-2 border rounded"
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#4a90a1] hover:bg-[#4a90a1] text-white py-2 px-4 rounded"
          >
            Log Tic
          </button>
        </>
      )}
    </div>
  );
};

export default LogNewTic;

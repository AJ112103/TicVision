import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Switch from "react-switch";
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

const Loading = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
  </div>
);

const LogNewTic = () => {
  const { ticType } = useParams<{ ticType: string }>();
  const navigate = useNavigate();
  const [intensity, setIntensity] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timeOfDay, setTimeOfDay] = useState("Morning");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);

  const selectedTic = ticTypes.find(
    (tic) => tic.name.replace(/\s+/g, "-").toLowerCase() === ticType
  );

  const getUserLocation = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
            setIncludeLocation(true);
          },
          (error) => {
            console.error("Error fetching location:", error);
            setIncludeLocation(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
        setIncludeLocation(false);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setIncludeLocation(false);
    }
  };

  const checkPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" });
      if (permission.state === "granted") {
        setIncludeLocation(true);
        getUserLocation();
      } else if (permission.state === "prompt") {
        setIncludeLocation(false);
      } else if (permission.state === "denied") {
        setLocationBlocked(true);
        setIncludeLocation(false);
      }
    } catch (error) {
      console.error("Error checking geolocation permission:", error);
    }
  };

  const addTicDirectly = async (ticData: {
    date: string;
    timeOfDay: string;
    location: string;
    intensity: number;
    latitude?: number;
    longitude?: number;
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
    const ticData: any = {
      date: selectedDate,
      timeOfDay,
      location: ticType?.replace("-", " ") || "Unknown",
      intensity,
    };

    if (includeLocation && latitude !== null && longitude !== null) {
      ticData.latitude = latitude;
      ticData.longitude = longitude;
    }

    await addTicDirectly(ticData);
  };

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      getUserLocation();
    } else {
      setIncludeLocation(false);
      setLatitude(null);
      setLongitude(null);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-center mb-6">Log New Tic</h2>

        {loading ? (
          <Loading />
        ) : success ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg font-semibold">Success!</p>
          </div>
        ) : (
          <>
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

            <div className="mb-4">
              <label
                htmlFor="intensity"
                className="block text-sm font-medium text-gray-700 text-center mb-2"
              >
                Intensity
              </label>
              <input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-[#4a90a1]"
              />
              <div className="text-center mt-2 text-gray-600">
                Intensity: {intensity}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 text-center mb-2"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded box-border"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="timeOfDay"
                className="block text-sm font-medium text-gray-700 text-center mb-2"
              >
                Time of Day
              </label>
              <select
                id="timeOfDay"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div className="mb-6 text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Location
              </label>
              <Switch
                onChange={handleToggleChange}
                checked={includeLocation}
                onColor="#4a90a1"
                offColor="#d1d5db"
                uncheckedIcon={false}
                checkedIcon={false}
                height={24}
                width={48}
                disabled={locationBlocked}
              />
              <p className="mt-2 text-sm text-gray-600">
                {includeLocation
                  ? "Location will be included."
                  : "Location will not be included."}
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#4a90a1] hover:bg-[#3b7a87] text-white py-2 px-4 rounded"
            >
              Log Tic
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LogNewTic;

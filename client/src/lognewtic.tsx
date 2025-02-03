import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Switch from "react-switch";
import { getAuth } from "firebase/auth";

import armIcon from "./assets/arm-icon.svg";
import backIcon from "./assets/back-icon.svg";
import breathingIcon from "./assets/breathing-icon.svg";
import eyeIcon from "./assets/eye-icon.svg";
import jawIcon from "./assets/jaw-icon.svg";
import legIcon from "./assets/leg-icon.svg";
import mouthIcon from "./assets/mouth-icon.svg";
import neckIcon from "./assets/neck-icon.svg";
import phraseIcon from "./assets/phrase-icon.svg";
import shoulderIcon from "./assets/shoulder-icon.svg";
import stomachIcon from "./assets/stomach-icon.svg";
import simpleIcon from "./assets/simple-icon.svg";
import echolaliaIcon from "./assets/echolalia-icon.svg";
import coprolaliaIcon from "./assets/coprolalia-icon.svg";
import animalsoundIcon from "./assets/animal-sounds-icon.svg";
import chestIcon from "./assets/chest-icon.svg";
import headIcon from "./assets/head-icon.svg";
import pelvisIcon from "./assets/pelvis-icon.svg";
import handIcon from "./assets/hand-icon.svg";
import footIcon from "./assets/foot-icon.svg";

const ticTypes = [
  { id: "1", name: "Arm", tag: "motor", icon: armIcon },
  { id: "2", name: "Back", tag: "motor", icon: backIcon },
  { id: "3", name: "Eye", tag: "motor", icon: eyeIcon },
  { id: "4", name: "Jaw", tag: "motor", icon: jawIcon },
  { id: "5", name: "Leg", tag: "motor", icon: legIcon },
  { id: "6", name: "Mouth", tag: "motor", icon: mouthIcon },
  { id: "7", name: "Neck", tag: "motor", icon: neckIcon },
  { id: "8", name: "Shoulder", tag: "motor", icon: shoulderIcon },
  { id: "9", name: "Simple Vocal", tag: "vocal", icon: simpleIcon },
  { id: "10", name: "Stomach", tag: "motor", icon: stomachIcon },
  { id: "11", name: "Palilalia", tag: "vocal", icon: phraseIcon },
  { id: "12", name: "Breathing", tag: "motor", icon: breathingIcon },
  { id: "13", name: "Echolalia", tag: "vocal", icon: echolaliaIcon },
  { id: "14", name: "Coprolalia", tag: "vocal", icon: coprolaliaIcon },
  { id: "15", name: "Animal Sound", tag: "vocal", icon: animalsoundIcon },
  { id: "16", name: "Chest", tag: "motor", icon: chestIcon },
  { id: "17", name: "Head", tag: "motor", icon: headIcon },
  { id: "18", name: "Pelvis", tag: "motor", icon: pelvisIcon },
  { id: "19", name: "Hand", tag: "motor", icon: handIcon },
  { id: "20", name: "Foot", tag: "motor", icon: footIcon },
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
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert("User not authenticated. Please sign in to log a tic.");
      return;
    }
  
    try {
      setLoading(true);
  
      const idToken = await user.getIdToken(); // Get the user's ID token
  
      const response = await fetch(
        "https://logtic-ejt4pl3dna-uc.a.run.app", // Custom Cloud Run URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`, // Include token for authentication
          },
          body: JSON.stringify(ticData),
        }
      );
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Error logging tic:", error);
        alert(error.error || "Failed to log tic. Please try again.");
        return;
      }
  
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      console.error("Error calling Cloud Run endpoint:", error);
      alert("Failed to log tic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  <div className="flex flex-col items-center justify-center h-screen bg-[#c6e8f0]">
    {/* Modal Container */}
    <div className="max-w-md w-full bg-[#c6e8f0] rounded-lg p-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      ) : success ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg font-semibold">Success!</p>
        </div>
      ) : (
        <>
        <h2 className="text-lg font-bold text-center mb-6">Log New Tic</h2>
          {/* Selected Tic Display */}
          {selectedTic && (
            <div className="flex flex-col items-center justify-center mx-auto mb-6 p-4 bg-[#256472] text-[#C1E4EC] rounded-lg w-[150px] border border-gray-700">
              <img
                src={selectedTic.icon}
                alt={selectedTic.name}
                className="mb-3 w-20 h-auto"
              />
              <span className="text-sm font-medium text-center">{selectedTic.name}</span>
            </div>
          )}

          {/* Intensity Slider */}
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
            <div className="text-center mt-2 text-gray-600">Intensity: {intensity}</div>
          </div>

          {/* Date Picker */}
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
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Time of Day Selector */}
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
              <option value="All Day">All Day</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          {/* Include Location Switch */}
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

          {/* Submit Button */}
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
}

export default LogNewTic;

import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

// Icons
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
import animalsoundIcon from "./assets/animal-sound-icon.svg";
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

const filterSections = ["My Tics", "Vocal", "Motor", "All"];

const LogTicModal = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [filteredTics, setFilteredTics] = useState([]);
  const [myTics, setMyTics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleTileClick = (ticName) => {
    navigate(`/logtic/${ticName.replace(/\s+/g, "-").toLowerCase()}`);
  };

  const fetchMyTics = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users", userId, "mytics"));
      const tics = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        count: doc.data().count,
        ...ticTypes.find((tic) => tic.name.toLowerCase() === doc.data().name.toLowerCase()),
      }));
      setMyTics(tics.filter(Boolean));
    } catch (error) {
      console.error("Error fetching tics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTics();
  }, []);

  useEffect(() => {
    switch (filterSections[currentSection]) {
      case "My Tics":
        setFilteredTics(myTics);
        break;
      case "Vocal":
        setFilteredTics(ticTypes.filter((tic) => tic.tag === "vocal"));
        break;
      case "Motor":
        setFilteredTics(ticTypes.filter((tic) => tic.tag === "motor"));
        break;
      case "All":
        setFilteredTics(ticTypes);
        break;
      default:
        break;
    }
  }, [currentSection, myTics]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentSection((prev) => Math.min(prev + 1, filterSections.length - 1)),
    onSwipedRight: () => setCurrentSection((prev) => Math.max(prev - 1, 0)),
  });

  return (
    <div
      className="bg-[#C1E4EC] border border-gray-700 rounded-lg p-4 shadow-lg"
      {...swipeHandlers}
    >
      {/* Section Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentSection((prev) => Math.max(prev - 1, 0))}
          className="text-[#256472] px-2"
          disabled={currentSection === 0}
        >
          {"<"}
        </button>
        <h4 className="text-lg font-bold text-[#256472]">{filterSections[currentSection]}</h4>
        <button
          onClick={() => setCurrentSection((prev) => Math.min(prev + 1, filterSections.length - 1))}
          className="text-[#256472] px-2"
          disabled={currentSection === filterSections.length - 1}
        >
          {">"}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto">
          {filteredTics.map((tic) => (
            <button
              key={tic.id}
              onClick={() => handleTileClick(tic.name)}
              className="flex flex-col items-center justify-center p-4 bg-[#256472] text-[#C1E4EC] rounded-lg hover:bg-[#3c7a8b] w-[120px] border border-gray-700 "
            >
              <img src={tic.icon} alt={tic.name} className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium">{tic.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogTicModal;
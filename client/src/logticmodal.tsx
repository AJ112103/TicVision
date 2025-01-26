import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  { id: "11", name: "Word Phrase", tag: "vocal", icon: phraseIcon },
  { id: "12", name: "Breathing", tag: "motor", icon: breathingIcon },
];

const filterSections = ["My Tics", "Vocal", "Motor", "All"];

const LogTicModal = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [filteredTics, setFilteredTics] = useState<any[]>([]);
  const [myTics, setMyTics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const db = getFirestore();

  // For swiping between filter sections
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentSection((prev) => Math.min(prev + 1, filterSections.length - 1)),
    onSwipedRight: () => setCurrentSection((prev) => Math.max(prev - 1, 0)),
  });

  // Fetch myTics from Firestore
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
        ...ticTypes.find(
          (tic) => tic.name.toLowerCase() === doc.data().name.toLowerCase()
        ),
      }));
      // Filter out any with undefined attributes
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

  // Handle filter sections
  useEffect(() => {
    const currentFilter = filterSections[currentSection];
    switch (currentFilter) {
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

  // Navigate to log page
  const handleTileClick = (ticName: string) => {
    navigate(`/logtic/${ticName.replace(/\s+/g, "-").toLowerCase()}`);
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  const tileVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.04, // small stagger
      },
    }),
  };

  return (
    <motion.div
      className="bg-[#C1E4EC] border border-gray-700 rounded-lg p-4 shadow-lg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...swipeHandlers}
    >
      {/* Section Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentSection((prev) => Math.max(prev - 1, 0))}
          className="text-[#256472] px-2 disabled:text-gray-300"
          disabled={currentSection === 0}
        >
          {"<"}
        </button>
        <h4 className="text-lg font-bold text-[#256472]">
          {filterSections[currentSection]}
        </h4>
        <button
          onClick={() =>
            setCurrentSection((prev) =>
              Math.min(prev + 1, filterSections.length - 1)
            )
          }
          className="text-black px-2 disabled:text-gray-300"
          disabled={currentSection === filterSections.length - 1}
        >
          {">"}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-32 sm:h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <AnimatePresence>
            {filteredTics.map((tic, index) => (
              <motion.button
                key={tic.id}
                variants={tileVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                exit={{ opacity: 0 }}
                onClick={() => handleTileClick(tic.name)}
                className="flex flex-col items-center justify-center p-4 bg-[#256472] text-[#C1E4EC] rounded-lg hover:bg-[#3c7a8b] border border-gray-700"
              >
                <img src={tic.icon} alt={tic.name} className="w-12 h-12 mb-2" />
                <span className="text-sm font-medium">{tic.name}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default LogTicModal;

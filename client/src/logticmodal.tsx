import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
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
import { useNavigate } from "react-router-dom";

interface TicType {
  id: string;
  name: string;
  tag: "vocal" | "motor";
  icon: string; // Path to SVG icon
}

const ticTypes: TicType[] = [
  { id: "1", name: "Arm", tag: "motor", icon: armIcon },
  { id: "2", name: "Complex Vocal", tag: "vocal", icon: complexIcon },
  { id: "3", name: "Eye", tag: "motor", icon: eyeIcon },
  { id: "4", name: "Jaw", tag: "motor", icon: jawIcon },
  { id: "5", name: "Leg", tag: "motor", icon: legIcon },
  { id: "6", name: "Mouth", tag: "motor", icon: mouthIcon },
  { id: "7", name: "Neck", tag: "motor", icon: neckIcon },
  { id: "8", name: "Shoulder", tag: "motor", icon: shoulderIcon },
  { id: "9", name: "Simple Vocal", tag: "vocal", icon: simpleIcon },
  { id: "10", name: "Stomach", tag: "motor", icon: stomachIcon },
  { id: "11", name: "Word Phrase", tag: "vocal", icon: wordIcon },
];

const myTics: TicType[] = [
    { id: "1", name: "Arm", tag: "motor", icon: armIcon },
];

const filterSections = ["My Tics", "Vocal", "Motor", "All"];


const LogTicModal = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [filteredTics, setFilteredTics] = useState<TicType[]>([]);
  const navigate = useNavigate();

    const handleTileClick = (ticName: string) => {
        navigate(`/logtic/${ticName.replace(/\s+/g, "-").toLowerCase()}`);
    };

  const updateFilteredTics = (sectionIndex: number) => {
    switch (filterSections[sectionIndex]) {
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
  };

  useEffect(() => {
    updateFilteredTics(currentSection);
  }, [currentSection]);

  const handleSwipe = (direction: string) => {
    if (direction === "LEFT" && currentSection < filterSections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else if (direction === "RIGHT" && currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("LEFT"),
    onSwipedRight: () => handleSwipe("RIGHT"),
  });

  return (
    <div className="card lg:col-span-1" {...swipeHandlers}>
      <h4 className="mb-2 text-lg sm:text-m text-center">
        {filterSections[currentSection]}
      </h4>
      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {filterSections.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentSection === index ? "bg-gray-800" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
      {/* Scrollable Content */}
      <div className="overflow-y-scroll h-64 border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredTics.length > 0 ? (
            filteredTics.map((tic) => (
              <button
                key={tic.id}
                onClick={() => handleTileClick(tic.name)}
                className="flex flex-col items-center justify-center p-4 bg-[#4a90a1] text-white rounded-lg hover:bg-[#3c7a8b]"
              >
                {/* Icon */}
                <img
                  src={tic.icon}
                  alt={tic.name}
                  className="-mb-3 w-20 h-15"
                />
                {/* Tic Name */}
                <span className="text-sm font-medium">{tic.name}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-text-secondary">No tics available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogTicModal;

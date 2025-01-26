import React from "react";
import brainIcon from "./assets/brain-icon.svg"; // Replace with actual icon paths
import lightbulbIcon from "./assets/lightbulb-icon.svg";
import graphIcon from "./assets/graph-icon.svg";
import educationIcon from "./assets/education-icon.svg";

const Index = () => {
  return (
    <div className="bg-[#4a90a1] text-white min-h-screen flex flex-col items-center py-8">
      {/* Header Section */}
      <div className="bg-[#4a90a1] text-white text-center px-6 py-4 rounded-lg max-w-md">
        <h1 className="text-lg font-bold mb-2">TicVision</h1>
        <p className="text-sm">
          TicVision empowers individuals with <strong>Tourette's Syndrome</strong> and their caregivers by combining <strong>advanced tools</strong> and <strong>insights</strong> to make tic management <strong>easier than ever</strong>.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        {/* Feature Card 1 */}
        <div className="bg-white text-[#4a90a1] p-4 rounded-lg shadow-lg flex flex-col items-center">
          <img src={brainIcon} alt="Comprehensive Tic Tracking" className="h-16 w-16 mb-4" />
          <p className="text-sm font-bold">Comprehensive Tic Tracking</p>
        </div>

        {/* Feature Card 2 */}
        <div className="bg-white text-[#4a90a1] p-4 rounded-lg shadow-lg flex flex-col items-center">
          <img src={lightbulbIcon} alt="Personalized Suggestions" className="h-16 w-16 mb-4" />
          <p className="text-sm font-bold">Personalized Suggestions</p>
        </div>

        {/* Feature Card 3 */}
        <div className="bg-white text-[#4a90a1] p-4 rounded-lg shadow-lg flex flex-col items-center">
          <img src={graphIcon} alt="Tic Data Visualization" className="h-16 w-16 mb-4" />
          <p className="text-sm font-bold">Tic Data Visualization</p>
        </div>

        {/* Feature Card 4 */}
        <div className="bg-white text-[#4a90a1] p-4 rounded-lg shadow-lg flex flex-col items-center">
          <img src={educationIcon} alt="Tic Education" className="h-16 w-16 mb-4" />
          <p className="text-sm font-bold">Tic Education</p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-8 bg-white text-[#4a90a1] px-6 py-3 rounded-lg shadow-md">
        <p className="text-lg font-bold">More Coming Soon!</p>
      </div>
    </div>
  );
};

export default Index;

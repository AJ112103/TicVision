import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import brainIcon from "./assets/brain-icon.svg";
import lightbulbIcon from "./assets/lightbulb-icon.svg";
import graphIcon from "./assets/graph-icon.svg";
import educationIcon from "./assets/education-icon.svg";
import { Target } from "lucide-react";

interface MotionCardProps {
  children: ReactNode;
  delay: number;
}

const MotionCard = ({ children }: MotionCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
    className="bg-white text-[#4a90a1] p-4 rounded-lg shadow-lg flex flex-col items-center"
  >
    {children}
  </motion.div>
);

const Index = () => {
  const journeyFeatures = [
    { icon: <Target size={24} className="text-white" />, text: "Track your progress over time." },
    { icon: <Target size={24} className="text-white" />, text: "Gain insights into your tics and triggers." },
    { icon: <Target size={36} className="text-white" />, text: "Enjoy a supportive community and personalized recommendations." }
  ];

  return (
    <div className="bg-[#4a90a1] text-white min-h-screen flex flex-col items-center py-8 px-4 md:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#4a90a1] text-white text-center px-6 py-4 rounded-lg max-w-md mb-8"
      >
        <div className="bg-[#256472] rounded-3xl p-6 md:p-8 shadow-lg">
          <p className="text-m md:text-base">
            <strong>TicVision</strong> empowers individuals with <strong>Tourette's Syndrome</strong> and their caregivers by combining <strong>advanced tools</strong> and <strong>insights</strong> to make tic management <strong>easier than ever</strong>.
          </p>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <MotionCard delay={0.4}>
          <img src={brainIcon} alt="Comprehensive Tic Tracking" className="h-16 w-16 mb-4" />
          <p className="text-sm md:text-base font-bold">Comprehensive Tic Tracking</p>
        </MotionCard>
        
        <MotionCard delay={0.6}>
          <img src={lightbulbIcon} alt="Personalized Suggestions" className="h-16 w-16 mb-4" />
          <p className="text-sm md:text-base font-bold">Personalized Suggestions</p>
        </MotionCard>
        
        <MotionCard delay={0.8}>
          <img src={graphIcon} alt="Tic Data Visualization" className="h-16 w-16 mb-4" />
          <p className="text-sm md:text-base font-bold">Tic Data Visualization</p>
        </MotionCard>
        
        <MotionCard delay={1.0}>
          <img src={educationIcon} alt="Tic Education" className="h-16 w-16 mb-4" />
          <p className="text-sm md:text-base font-bold">Tic Education</p>
        </MotionCard>
      </div>

      {/* Footer Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="mt-8 bg-white text-[#4a90a1] px-6 py-3 rounded-lg shadow-md"
      >
        <p className="text-lg font-bold">More Coming Soon!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center max-w-2xl"
      >
        <h2 className="text-xl mt-8 md:text-2xl font-bold">
          Start Your Journey with TicVision Today
        </h2>
      </motion.div>

      {/* Journey Features */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-2xl my-12"
      >
        <div className="bg-[#5ba8b9] rounded-3xl p-6 md:p-8 shadow-lg">
          {journeyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className="flex items-center bg-[#4a90a1] text-white rounded-2xl p-4 mb-4 last:mb-0"
            >
              {feature.icon}
              <p className="ml-4 text-sm md:text-base">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vision Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-center max-w-2xl"
      >
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Understand Your Tics, Visualise Your Progress.
        </h2>
      </motion.div>

    </div>
  );
};

export default Index;

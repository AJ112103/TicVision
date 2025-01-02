import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LogTicModal from "./logticmodal";
import TodayTicsBarChart from "./graphmodal";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleGraphClick = () => {
    navigate("/graph");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card lg:col-span-1"
            >
              <LogTicModal />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card lg:col-span-2 cursor-pointer group hover:shadow-md transition-shadow duration-200"
              onClick={handleGraphClick}
            >
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl font-bold mb-6"
              >
                Tic History
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TodayTicsBarChart />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
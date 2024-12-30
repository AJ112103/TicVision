import TicBarChart from "./graphmodal";
import { useNavigate } from "react-router-dom";
import LogTicModal from "./logticmodal";

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
            <div className="card lg:col-span-1">
              <LogTicModal />
            </div>
            <div className="card lg:col-span-2 cursor-pointer" onClick={handleGraphClick}>
              <h2 className="text-xl font-bold mb-6">Tic History</h2>
              <TicBarChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
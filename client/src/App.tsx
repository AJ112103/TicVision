import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Index from "./index";
import Login from "./login";
import Dashboard from "./dashboard";
import Profile from "./profile";
import LogNewTic from "./lognewtic";
import TicBarChart from "./graph";
import Navbar from "./navbar";
import TicTable from "./ticTable"; 
import LearnMore from "./learnmore";

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="p-4">{children}</div> {/* Added padding for better layout */}
    </>
  );
};

const App = () => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    ); // Optional: Add a loading indicator while auth is being checked
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/learn-more"
              element={
                <LearnMore/>
              }
            />
            <Route path="/register" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/logtic/:ticType"
              element={
                isAuthenticated ? (
                  <AuthenticatedLayout>
                    <LogNewTic />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/graph"
              element={
                isAuthenticated ? (
                  <AuthenticatedLayout>
                    <TicBarChart />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* New /table Route */}
            <Route
              path="/table"
              element={
                isAuthenticated ? (
                  <AuthenticatedLayout>
                    <TicTable />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* Optional: Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AnimatePresence>
    </QueryClientProvider>
  );
};

export default App;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import all page components
import Index from "./index";
import Login from "./login";
import Dashboard from "./dashboard";
import Profile from "./profile";
import LogNewTic from "./lognewtic";
import TicBarChart from "./graph";
import Navbar from "./navbar";
import TicTable from "./ticTable";
import LearnMore from "./learnmore";
import Suggestions from "./suggestions";

// Import the Footer component
import Footer from "./footer";

const queryClient = new QueryClient();

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
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        <BrowserRouter>
          {/* Conditionally render Navbar and pass isLoggedIn */}
          {window.location.pathname !== "/login" && (
            <Navbar isLoggedIn={isAuthenticated} />
          )}

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route path="/register" element={<Login />} />
            <Route path="/learn-more" element={<LearnMore />} />

            {/* Authenticated routes */}
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/logtic/:ticType"
              element={
                isAuthenticated ? <LogNewTic /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? <Profile /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/graph"
              element={
                isAuthenticated ? <TicBarChart /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/table"
              element={
                isAuthenticated ? <TicTable /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/suggestions"
              element={
                isAuthenticated ? <Suggestions /> : <Navigate to="/login" />
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Conditionally render Footer */}
          {window.location.pathname !== "/login" && <Footer />}
        </BrowserRouter>
      </AnimatePresence>
    </QueryClientProvider>
  );
};

export default App;

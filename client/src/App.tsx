import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import all page components
import Index from "./index";
import Login from "./login";
import Dashboard from "./dashboard";
import Profile from "./profile";
import LogNewTic from "./lognewtic";
import Navbar from "./navbar";
import TicData from "./ticData";          // from features-aamer
import LearnMore from "./learnmore";
import Suggestions from "./suggestions";
import TicInfo from "./ticinfo";
import Footer from "./footer";

// If you have a TicTable component for /history:
import TicTable from "./TicTable";

const queryClient = new QueryClient();

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Show a loading indicator until Firebase auth check completes
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Main return
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <MainRoutes isAuthenticated={isAuthenticated} />
        </AnimatePresence>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// A sub-component that defines all routes and conditionally displays Navbar/Footer
function MainRoutes({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname.toLowerCase());

  return (
    <>
      {/* Conditionally render Navbar */}
      {!hideNavbar && <Navbar isLoggedIn={isAuthenticated} />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/register" element={<Login />} />
        <Route path="/learn-more" element={<LearnMore />} />

        {/* Authenticated routes */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/logtic/:ticType"
          element={isAuthenticated ? <LogNewTic /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/data"
          element={isAuthenticated ? <TicData /> : <Navigate to="/login" />}
        />
        <Route
          path="/suggestions"
          element={isAuthenticated ? <Suggestions /> : <Navigate to="/login" />}
        />
        <Route
          path="/ticinfo"
          element={isAuthenticated ? <TicInfo /> : <Navigate to="/login" />}
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Conditionally render Footer */}
      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;


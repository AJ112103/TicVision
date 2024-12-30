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

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div>{children}</div>
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
    return null;
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
          </Routes>
        </BrowserRouter>
      </AnimatePresence>
    </QueryClientProvider>
  );
};

export default App;
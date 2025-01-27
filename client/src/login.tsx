import React, { useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
// We'll reuse your existing GoogleAuthProvider config
const provider = new GoogleAuthProvider();

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime,
        },
        { merge: true }
      );

      console.log("User Info:", user);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#c6e8f0] flex items-center justify-center p-4">
      {/* Outer motion div for fade-in + slight slide-up */}
      <motion.div
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h1
          className="text-2xl font-bold text-[#256472] mb-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Welcome to TicVision
        </motion.h1>
        <motion.p
          className="text-gray-700 mb-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Take control of your journey by tracking and managing your tics with
          powerful insights.
        </motion.p>

        <motion.button
          className="flex items-center justify-center bg-[#256472] text-white font-semibold px-4 py-2 rounded-md mx-auto hover:bg-[#3a7a8b] transition-colors"
          onClick={handleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {/* Google Icon */}
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="h-5 w-5 mr-2"
          />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;

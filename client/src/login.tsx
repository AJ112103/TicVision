import React, { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(""); // Name field for sign-up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Toggle login/signup
  const [forgotPassword, setForgotPassword] = useState(false); // Forgot password mode

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle Email & Password Authentication (Sign Up / Sign In)
  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        if (!name.trim()) {
          alert("Please enter your name.");
          return;
        }
        // Sign-up new user
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);

        await setDoc(
          userRef,
          {
            email: user.email,
            displayName: name,
            createdAt: user.metadata.creationTime,
          },
          { merge: true }
        );

        console.log("User signed up:", user);
      } else {
        // Sign-in existing user
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", auth.currentUser);
      }
    } catch (error: any) {
      console.error("Authentication failed:", error);
      alert(error.message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
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
      console.error("Google login failed:", error);
      alert("Google login failed. Please try again.");
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email.");
      setForgotPassword(false);
    } catch (error: any) {
      console.error("Reset failed:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#c6e8f0] flex items-center justify-center p-4">
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
          {forgotPassword ? "Reset Password" : isSignUp ? "Sign Up" : "Sign In"}
        </motion.h1>

        {forgotPassword ? (
          <>
            <motion.input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <motion.button
              className="w-full bg-[#256472] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#3a7a8b] transition-colors"
              onClick={handleForgotPassword}
            >
              Send Reset Link
            </motion.button>
            <motion.p
              className="text-sm text-gray-600 mt-4 cursor-pointer"
              onClick={() => setForgotPassword(false)}
            >
              Back to Login
            </motion.p>
          </>
        ) : (
          <>
            {isSignUp && (
              <motion.input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md mb-3"
              />
            )}
            <motion.input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md mb-3"
            />
            <motion.input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />

            <motion.button
              className="w-full bg-[#256472] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#3a7a8b] transition-colors"
              onClick={handleEmailAuth}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </motion.button>

            <motion.p
              className="text-sm text-gray-600 mt-4 cursor-pointer"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </motion.p>

            <motion.p
              className="text-sm text-blue-600 mt-2 cursor-pointer"
              onClick={() => setForgotPassword(true)}
            >
              Forgot Password?
            </motion.p>

            {!isSignUp && (
              <>
                <div className="my-4 text-gray-500">OR</div>
                <motion.button
                  className="flex items-center justify-center w-full bg-[#4285F4] text-white font-semibold px-4 py-2 rounded-md hover:bg-[#357ae8] transition-colors"
                  onClick={handleGoogleLogin}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google Logo"
                    className="h-5 w-5 mr-2"
                  />
                  Sign in with Google
                </motion.button>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;

import React, { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { motion } from 'framer-motion';
import './login.css';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
  
      await setDoc(
        userRef,
        {
          email: user.email,
          displayName: user.displayName,
          createdAt: user.metadata.creationTime,
        },
        { merge: true }
      );

      console.log('User Info:', user);
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-info">
          <motion.h1 
            className="login-info-title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Take Control of Your Journey
          </motion.h1>
          <motion.p 
            className="login-info-description"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            TicVision helps you track, understand, and manage your tics with powerful visualization tools and personalized insights.
          </motion.p>
        </div>
        <motion.div
          className="login-auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h1 className="login-title">Welcome to TicVision</h1>
          <motion.button
            className="login-button"
            onClick={handleLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="google-logo"
            />
            Sign in with Google
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
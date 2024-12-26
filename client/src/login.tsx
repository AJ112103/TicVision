import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { motion } from 'framer-motion';
import './login.css';

const provider = new GoogleAuthProvider();

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User Info:', user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-info">
        <motion.h1 className="login-info-title" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          Take Control of Your Journey
        </motion.h1>
        <motion.p className="login-info-description" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
          TicVision helps you track, understand, and manage your tics with powerful visualization tools and personalized insights.
        </motion.p>
      </div>
      <motion.div
        className="login-auth"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 50 }}
      >
        <h1 className="login-title">Welcome to TicVision</h1>
        <motion.p
          className="login-description"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: '#555' }}
        >
          Sign in to track your progress and manage your tics effectively.
        </motion.p>
        <motion.button
          className="login-button"
          onClick={handleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ padding: '1rem 2rem', fontSize: '1.125rem', borderRadius: '8px', marginTop: '1rem', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            className="google-logo"
            style={{ marginRight: '0.75rem' }}
          />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Login;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
  };

  return (
    <motion.div
      className="login-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 className="login-title" variants={itemVariants}>
        Welcome to TicVision
      </motion.h1>
      <motion.p className="login-description" variants={itemVariants}>
        Sign in to track your progress and manage your tics effectively.
      </motion.p>
      <motion.button
        className="login-button"
        onClick={handleLogin}
        variants={itemVariants}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google Logo"
          className="google-logo"
        />
        Sign in with Google
      </motion.button>
    </motion.div>
  );
};

export default Login;
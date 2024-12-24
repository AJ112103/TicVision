import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
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
      <h1 className="login-title">Welcome to TicVision</h1>
      <p className="login-description">
        Sign in to track your progress and manage your tics effectively.
      </p>
      <button className="login-button" onClick={handleLogin}>
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google Logo"
          className="google-logo"
        />
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
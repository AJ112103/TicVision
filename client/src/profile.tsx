import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserCircleIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserData({
            name: user.displayName || 'Anonymous',
            email: user.email || 'Not Provided',
          });
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userId');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background px-6 pt-16">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            className="w-32 h-32 mb-8 rounded-full bg-secondary/20 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <UserCircleIcon className="w-24 h-24 text-gray-400" />
          </motion.div>

          <h1 className="text-4xl font-display font-bold mb-8 text-center">Your Profile</h1>
          <div className="card w-full p-6 bg-white shadow-md rounded-lg">
            <div className="space-y-6 w-full">
              <div className="profile-field flex justify-between">
                <b className="profile-label">Name:</b>
                <span className="profile-value text-right">{userData.name}</span>
              </div>
              <div className="profile-field flex justify-between">
                <b className="profile-label">Email:</b>
                <span className="profile-value text-right">{userData.email}</span>
              </div>
              
              <button
                className="btn btn-primary w-full mt-8"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Confirm Logout</h2>
              <p className="mb-8 text-text-secondary text-center">Are you sure you want to log out?</p>
              <div className="flex gap-4">
                <button className="btn btn-primary flex-1" onClick={handleLogout}>
                  Yes, Logout
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
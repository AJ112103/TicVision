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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteData = async () => {
    if (!userId) return;
    
    setIsDeleting(true);
    
    try {
      // Get the current user's token
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const idToken = await currentUser.getIdToken();
      
      const response = await fetch('https://us-central1-ticvision.cloudfunctions.net/deleteUserData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}` // Include the auth token
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user data');
      }
      
      // Sign out and redirect to login after successful deletion
      await signOut(auth);
      localStorage.removeItem('userId');
      navigate('/login');
    } catch (error: any) {
      console.error('Delete data failed:', error);
      alert(`Failed to delete your data: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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
              
              <div className="flex flex-col gap-4 mt-8">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  Logout
                </button>
                <button
                  className="btn btn-danger w-full"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Data
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Logout Modal */}
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

      {/* Delete Data Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
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
              <h2 className="text-2xl font-bold mb-4 text-center">Delete All Your Data</h2>
              <p className="mb-8 text-text-secondary text-center">
                Warning: All of your user data will be permanently deleted. 
                This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  className="btn btn-danger flex-1" 
                  onClick={handleDeleteData}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  No, Cancel
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
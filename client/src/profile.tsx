import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserCircleIcon } from '@heroicons/react/solid'; // Using HeroIcons for the user icon
import './profile.css'

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    totalTics: 0,
    avgIntensity: 0,
    lastEntry: '--:--',
  });

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const user = userDoc.data();
          setUserData({
            name: user.name || 'Anonymous',
            email: user.email || 'Not Provided',
            totalTics: user.totalTics || 0,
            avgIntensity: user.avgIntensity?.toFixed(1) || '0',
            lastEntry: user.lastEntry
              ? new Date(user.lastEntry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--',
          });
        }
      }
    };

    fetchUserData();
  }, [userId]);

  return (
    <div className="profile-page">
      <h1 className="profile-title">Your Profile</h1>
      <div className="profile-card">
        <div className="profile-icon">
          <UserCircleIcon className="w-full h-full" />
        </div>
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Total Tics Logged:</strong> {userData.totalTics}</p>
        <p><strong>Average Intensity:</strong> {userData.avgIntensity}</p>
        <p><strong>Last Tic Entry:</strong> {userData.lastEntry}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
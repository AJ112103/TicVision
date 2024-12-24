// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA03Jh1CN7VfyvM0shTJ8mg-e8mMmuKjzU",
  authDomain: "ticvision.firebaseapp.com",
  projectId: "ticvision",
  storageBucket: "ticvision.firebasestorage.app",
  messagingSenderId: "841713575729",
  appId: "1:841713575729:web:0adc213a8ccb22341bb210",
  measurementId: "G-HWB11Y5H2K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
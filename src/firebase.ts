// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgG0KUxxhIMtY64r8wh9RhB3UNiayXOB4",
  authDomain: "school-attendance-d8444.firebaseapp.com",
  projectId: "school-attendance-d8444",
  storageBucket: "school-attendance-d8444.firebasestorage.app",
  messagingSenderId: "328842025473",
  appId: "1:328842025473:web:5d1c7c26218c677149be00",
  measurementId: "G-3F2063NM40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
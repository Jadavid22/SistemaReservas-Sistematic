// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtLCJIuQyKqlIZQZ8NI0zC7ngS-01kWHo",
  authDomain: "loggin-rappidmart.firebaseapp.com",
  projectId: "loggin-rappidmart",
  storageBucket: "loggin-rappidmart.firebasestorage.app",
  messagingSenderId: "557039589033",
  appId: "1:557039589033:web:d9194ef07eaede6e9e7bb8"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

export { appFirebase, db };

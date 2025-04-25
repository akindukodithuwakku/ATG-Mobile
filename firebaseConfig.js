// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // For Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyDESUeWqrx1tzZqpXruFS0O-QHm3RSSanA",
  authDomain: "chatapp-44c28.firebaseapp.com",
  databaseURL: "https://chatapp-44c28-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "chatapp-44c28",
  storageBucket: "chatapp-44c28.firebasestorage.app",
  messagingSenderId: "87802594985",
  appId: "1:87802594985:web:174268d970c50fdc6a0bb8",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
// // Import the functions you need from the SDKs you need
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/storage';
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBUxMzt6AzTSLJITzKVx_50aInn7GEeuPE",
//   authDomain: "atg-healthcare-fileupload.firebaseapp.com",
//   projectId: "atg-healthcare-fileupload",
//   storageBucket: "atg-healthcare-fileupload.firebasestorage.app",
//   messagingSenderId: "543976982505",
//   appId: "1:543976982505:web:83ad46bcc9567cd5032d78",
//   measurementId: "G-EKYKH4HMXT"
// };

// // Initialize Firebase
// if(!firebase.apps.length){
//   firebase.initializeApp(firebaseConfig);
// }
// export{firebase};

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

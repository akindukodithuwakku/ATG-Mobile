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
  apiKey: "AIzaSyAiy8U60lkidLF1U2ghUbkWZmj3xYU5Fyo",
  authDomain: "chat-8e6e6.firebaseapp.com",
  databaseURL: "https://chat-8e6e6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "chat-8e6e6",
  storageBucket: "chat-8e6e6.firebasestorage.app",
  messagingSenderId: "185365783971",
  appId: "1:185365783971:web:9b11d942de2466bae26616",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };

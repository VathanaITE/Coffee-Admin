// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAenEim-614wQmlj_7CDf6pSSLSNvx90SY",
  authDomain: "coffeeapp-c0ed3.firebaseapp.com",
  databaseURL: "https://coffeeapp-c0ed3-default-rtdb.firebaseio.com",
  projectId: "coffeeapp-c0ed3",
  storageBucket: "coffeeapp-c0ed3.firebasestorage.app",
  messagingSenderId: "751784247181",
  appId: "1:751784247181:web:ceeeff8c153b0937c207c4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const realTimeDatabase = getDatabase(app);
export const auth = getAuth(app);
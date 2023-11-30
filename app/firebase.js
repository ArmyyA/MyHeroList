// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsNEYRL48FgZ-b3gHF5G68QgJ8w_MahMM",
  authDomain: "myherolist-79db9.firebaseapp.com",
  projectId: "myherolist-79db9",
  storageBucket: "myherolist-79db9.appspot.com",
  messagingSenderId: "482598469208",
  appId: "1:482598469208:web:ee9b877aa961f3d2e9542d",
  measurementId: "G-7W40D7K2EB",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth();

export { app, auth };

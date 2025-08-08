// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNEGMwnn075RYYxXc9NQNCGoYtrhq_Q_0",
  authDomain: "monthlycalendartracker.firebaseapp.com",
  databaseURL: "https://monthlycalendartracker-default-rtdb.firebaseio.com",
  projectId: "monthlycalendartracker",
  storageBucket: "monthlycalendartracker.firebasestorage.app",
  messagingSenderId: "151202130765",
  appId: "1:151202130765:web:563379d60ebb44a0bce504",
  measurementId: "G-E3RBH9FV5Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database(); 
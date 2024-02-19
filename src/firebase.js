// firebase.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/storage';

// Replace with your actual Firebase project configuration
const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASECONFIG)

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database and storage references
const database = firebase.database();
const storageRef = firebase.storage().ref();

export { database, storageRef };
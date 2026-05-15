import React from 'react'
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from './firebase';

export const realTimeDatabase = getDatabase(app);
export const productsRef = ref(realTimeDatabase, 'menu');

// Check connection status
const connectedRef = ref(realTimeDatabase, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log('✅ Connected to Firebase Realtime Database');
  } else {
    console.log('❌ Disconnected from Firebase Realtime Database');
  }
});

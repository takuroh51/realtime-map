import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDUQr4jigDxixYmwJfeRiEMVq4pJ1BTIKQ",
  authDomain: "skoota-momocrash.firebaseapp.com",
  databaseURL: "https://skoota-momocrash-default-rtdb.firebaseio.com",
  projectId: "skoota-momocrash",
  storageBucket: "skoota-momocrash.firebasestorage.app",
  messagingSenderId: "229327001030",
  appId: "1:229327001030:web:1ebe391af5a85fa7048ec7",
  measurementId: "G-CBM5VCFDTH"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

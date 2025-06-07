import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC1R7nWraiRwWvOhqs6i3pVlTrWiWpWF8I",
    authDomain: "artboard-904b0.firebaseapp.com",
    projectId: "artboard-904b0",
    storageBucket: "artboard-904b0.firebasestorage.app",
    messagingSenderId: "34953500737",
    appId: "1:34953500737:web:d60b8b0079a2dc8d604ec0"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
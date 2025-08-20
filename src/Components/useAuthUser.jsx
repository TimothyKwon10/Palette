import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FireBase/firebase"; 

function useAuthUser() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setChecking(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return { user, checking };
}

export default useAuthUser;

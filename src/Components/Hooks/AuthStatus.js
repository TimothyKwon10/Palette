import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { auth } from '../../FireBase/firebaseConfig';

function AuthStatus() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                setLoggedIn(true);
            }
            else {
                setLoggedIn(false);
            }
            setCheckingStatus(false);
        });

        return () => unSubscribe();
    }, []);
    return { loggedIn, checkingStatus };
}

export default AuthStatus;
import Header from "../Header.jsx"
import ImgMosaic from "../ImgMosaic.jsx";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '../../FireBase/firebaseConfig';
import AuthStatus from '../Hooks/AuthStatus.js'
import CategorySelect from "../CategorySelect.jsx"

function Home() {
    const { loggedIn, checkingStatus } = AuthStatus();
    const [firstTime, setFirstTime] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkFirstTime = async () => {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                if (userData.firstTime) {
                    setFirstTime(true);
                }
            }
            setLoading(false);
        };

        checkFirstTime();
    }, [])

    if (loading || checkingStatus) {
        return (
            <h1>Loading...</h1>
        )
    }

    if (!loggedIn || !firstTime) { //Not first time login or not logged in what so ever
        return (
            <div className = "px-6">
                <Header/>
                <div className="mb-6"></div>
                <ImgMosaic/>
            </div>
        )
    }

    return ( // first time logging in 
        <div className = "px-6">
            <Header/>
            <CategorySelect/>
        </div>
    );
}

export default Home;
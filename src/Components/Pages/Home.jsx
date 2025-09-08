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
    const [feed, setFeed] = useState([]);

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

                //grabs user feed
                const data = userSnap.data();
                if (data.personal_feed) {
                    setFeed(data.personal_feed);
                }
            }
            setLoading(false);
        };
        checkFirstTime();
    }, [])

    if (loading || checkingStatus) {
        return (
            <div className="flex h-screen items-center justify-center">
                <h2 className="text-gray-500">Loading...</h2>
            </div>
        )
    }

    if (!loggedIn) { //Not logged in 
        return (
            <div className = "px-6">
                <Header/>
                <div className="mb-6"></div>
                <ImgMosaic/>
            </div>
        )
    }
    else if (!firstTime && loggedIn) { //Logged in, send personal feed
        return (
            <div className = "px-6">
                <Header/>
                <div className="mb-6"></div>
                <ImgMosaic images={feed} />
            </div>
        )
    }
    else {
        return ( // first time logging in 
            <div className = "px-6">
                <Header/>
                <CategorySelect/>
            </div>
        );
    }
}

export default Home;
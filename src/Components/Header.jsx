import userIcon from "../assets/images/user.png";
import HomeIcon from "./HomeIcon.jsx";
import SearchBar from "./SearchBar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import AuthStatus from "./Hooks/AuthStatus.js";
import { getAuth, signOut } from "firebase/auth";
import Logo from "../assets/images/FullLogo_NoBuffer.jpg"

function Header() {
    const { loggedIn, checkingStatus } = AuthStatus(); //Log in status check
    const navigate = useNavigate();
    const location = useLocation();

    const auth = getAuth(); // TESTING MODE -----------------------------------------------------
    const handleLogout = async () => {
        try {
          await signOut(auth);
          console.log("User signed out successfully.");
        } catch (error) {
          console.error("Error signing out:", error);
        }
      };


    if (checkingStatus) { 
        return (
            <h1>Loading...</h1>
        );
    }

    const goToCollections = () => navigate("/Collections");
    const goToCreate = () => navigate("/Create");
    const goToLogin = () => navigate("/Login");
    const goToRegister = () => navigate("/Register");

    const isCollections = location.pathname === "/Collections";
    const isCreate = location.pathname === "/Create";
    const isLogin = location.pathname === "/Login";
    const isRegister = location.pathname === "/Register";

    return (
        <div className="relative flex w-full items-center justify-between py-6 px-6 font-[Lato-Regular] sticky top-0 bg-white z-50">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#019cb9] via-[#b8e6e0] to-[#fa5902]" />
            <div className="flex items-center gap-11 text-zinc-500">
                <a href="/" className="inline-block">
                    <img
                        src = {Logo}
                        alt = "Palette Logo"
                        className = "h-12 w-auto"
                    />
                </a>
                <HomeIcon />
            </div>

            <SearchBar/>

            {/* right side of search bar */}
            <div className="flex gap-8 items-center text-sm">
                {loggedIn ? (
                    <>
                        <div className="group">
                            <button
                                onClick={goToCreate}
                                className="bg-[#fa5902] text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
                            >
                                <span>CREATE</span>
                                {isCreate && (
                                <div className="w-full h-0.5 bg-white mt-0.5 rounded-sm" />
                                )}
                            </button>
                        </div>


                        <div className="flex flex-col items-center group">
                            <button
                                onClick={goToCollections}
                                className="text-[#026C7B] transition-transform duration-200 hover:scale-[1.07]"
                            >
                                MY PALETTES
                            </button>
                            {isCollections && <div className="w-full h-0.5 bg-[#026C7B] mt-0.5 rounded-sm" />}
                        </div>

                        <button onClick = {handleLogout}>
                            <img
                                src={userIcon}
                                alt="Profile"
                                className="w-6 h-6 transition-transform duration-200 hover:scale-110"
                            />
                        </button>
                    </>
                    ) :
                    (
                        <>
                            <div className="group">
                                <button
                                    onClick={goToRegister}
                                    className="bg-[#fa5902] text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
                                >
                                    <span>REGISTER</span>
                                    {isRegister && (
                                        <div className="w-full h-0.5 bg-white mt-0.5 rounded-sm" />
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col items-center group">
                                <button
                                    onClick={goToLogin}
                                    className="text-[#026C7B] transition-transform duration-200 hover:scale-[1.07]"
                                >
                                    LOGIN
                                </button>
                                {isLogin && <div className="w-full h-0.5 bg-zinc-500 mt-0.5 rounded-sm" />}
                            </div>
                        </>
                    )
                }   
            </div>
        </div>
    );
}

export default Header;

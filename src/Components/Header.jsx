import userIcon from "../assets/images/user.png";
import HomeIcon from "./HomeIcon.jsx";
import SearchBar from "./SearchBar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import AuthStatus from "./Hooks/AuthStatus.js";
import { getAuth, signOut } from "firebase/auth";
import Logo from "../assets/images/FullLogo_NoBuffer.jpg"
import Add from "../assets/images/add.png"
import LogOut from "../assets/images/logout.png"
import { useState, useRef, useEffect } from "react";

function Header() {
    const { loggedIn, checkingStatus } = AuthStatus(); //Log in status check
    const navigate = useNavigate();
    const location = useLocation();
    const [ menu, setMenu ] = useState(false);
    const menuRef = useRef();

    const auth = getAuth();
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully.");
        } 
        catch (error) {
            console.error("Error signing out:", error);
        }
    };

    useEffect(() => {
        const handler = (e) => {
          if (menuRef.current && !menuRef.current.contains(e.target)) {
            setMenu(false);
          }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);


    if (checkingStatus) { 
        return (
            <div className="flex h-screen items-center justify-center">
                <h2 className="text-gray-500">Loading...</h2>
            </div>
        );
    }

    const goToCollections = () => navigate("/MyPalettes");
    const goToCreate = () => navigate("/Create");
    const goToLogin = () => navigate("/Login");
    const goToRegister = () => navigate("/Register");

    const isPalettes = location.pathname === "/MyPalettes";
    const isCreate = location.pathname === "/Create";
    const isLogin = location.pathname === "/Login";
    const isRegister = location.pathname === "/Register";

    return (
        <div className="relative gap-6 flex flex-wrap w-full items-center justify-between py-6 px-6 font-[Lato-Regular] sticky top-0 bg-white z-50">
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#019cb9] via-[#b8e6e0] to-[#fa5902]" />
            <div className="order-1 flex items-center lg:gap-11 gap-6 text-zinc-500">
                <a href="/" className="inline-block">
                    <img
                        src = {Logo}
                        alt = "Palette Logo"
                        className = "lg:h-12 h-10 w-auto"
                    />
                </a>
                <HomeIcon />
            </div>

            <div className = "flex items-center justify-center order-3 w-full md:order-2 md:flex-1 md:w-auto lg:max-w-xl">
                <SearchBar/>
            </div>

            {/* right side of search bar */}
            <div className="order-2 flex lg:gap-8 gap-4 items-center text-sm">
                {loggedIn ? (
                    <>
                        <div className="group">
                            <button
                                onClick={goToCreate}
                                className="hidden md:flex bg-[#fa5902] text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
                            >
                                <span>CREATE</span>
                                {isCreate && (
                                <div className="w-full h-0.5 bg-white mt-0.5 rounded-sm" />
                                )}
                            </button>
                            <button
                                onClick={goToCreate}
                                className="flex md:hidden bg-[#fa5902] text-white p-2.5 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
                                title="Create"
                            >
                                <img src = {Add} className = "h-4 w-auto"/>
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
                            {isPalettes && <div className="w-full h-0.5 bg-[#026C7B] mt-0.5 rounded-sm" />}
                        </div>
                                
                        <div className="relative" ref = {menuRef}>
                            <button onClick = {() => setMenu((prev) => !prev)}>
                                <img
                                    src={userIcon}
                                    alt="Profile"
                                    className="w-6 h-6 transition-transform duration-200 hover:scale-110"
                                />
                            </button>
                            {menu && (
                                <div className= "absolute right-0 mt-2 w-32 ring-1 rounded shadow-lg ring-[#ECEEF1] bg-white z-50">
                                    <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-[#ECEEF1]"
                                    >
                                    <img src = {LogOut} className = "h-4 auto"/>
                                    Logout
                                    </button>
                                </div>
                            )}
                        </div>
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

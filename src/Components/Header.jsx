import userIcon from "../assets/images/user.png";
import HomeIcon from "./HomeIcon.jsx";
import SearchBar from "./SearchBar.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import AuthStatus from "./Hooks/AuthStatus.js";

function Header() {
    const { loggedIn, checkingStatus } = AuthStatus(); //Log in status check
    const navigate = useNavigate();
    const location = useLocation();

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
        <div className="flex w-full items-center justify-between py-6 px-6 font-[Lato-Regular] border-b border-zinc-300 sticky top-0 bg-white z-50">
            <div className="flex gap-8 text-zinc-500">
                <button>[Some Website Name]</button>
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
                                className="bg-black text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
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
                                className="text-zinc-500 transition-transform duration-200 hover:scale-[1.07]"
                            >
                                COLLECTIONS
                            </button>
                            {isCollections && <div className="w-full h-0.5 bg-zinc-500 mt-0.5 rounded-sm" />}
                        </div>

                        <button>
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
                                    className="bg-black text-white px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.07] flex flex-col items-center"
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
                                    className="text-zinc-500 transition-transform duration-200 hover:scale-[1.07]"
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

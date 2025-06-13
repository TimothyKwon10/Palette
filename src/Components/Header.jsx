import userIcon from "../assets/images/user.png";
import HomeIcon from "./HomeIcon.jsx";
import SearchBar from "./SearchBar.jsx";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const goToCollections = () => navigate("/Collections");
    const goToCreate = () => navigate("/Create");

    const isCollections = location.pathname === "/Collections";
    const isCreate = location.pathname === "/Create";

    return (
        <div className="flex w-full items-center justify-between py-6 px-6 font-[Lato-Regular] border-b border-zinc-300">
            <div className="flex gap-8 text-zinc-500">
                <button>[Some Website Name]</button>
                <HomeIcon />
            </div>

            <SearchBar/>

            <div className="flex gap-8 items-center text-sm">
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
            </div>
        </div>
    );
}

export default Header;

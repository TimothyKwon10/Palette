import homeIcon from '../assets/images/home3.png';
import homeIcon1 from '../assets/images/home2.png';
import { useLocation, useNavigate } from "react-router-dom";

function HomeIcon() {
    const location = useLocation();
    const isHome = location.pathname === "/Home";

    const navigate = useNavigate();
    const goToHome = () => {
        navigate("/Home");
    };

    return (
        <button
            onClick={!isHome ? goToHome : undefined}
            className="group flex flex-col items-center h-12 justify-center"
        >
            <img
                src={isHome ? homeIcon1 : homeIcon1}
                alt="Home"
                className="w-6 h-6 object-cover transition-transform duration-200 group-hover:scale-110"
            />
            <div
                className={`w-full h-0.5 mt-1 rounded-sm transition-opacity duration-200 ${
                    isHome ? "bg-[#026c7b] opacity-100" : "opacity-0"
                }`}
            />
        </button>
    );
}

export default HomeIcon;

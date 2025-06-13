import homeIcon from '../assets/images/home.png';
import homeIcon1 from '../assets/images/home1.png'
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function HomeIcon() {
    const location = useLocation();
    const isHome = location.pathname === "/Home";

    const navigate = useNavigate();
    const goToHome = () => {
        navigate("/Home");
    }

    if (isHome) {
        return (
            <button className="group flex flex-col items-center">
                <img
                    src={homeIcon1}
                    alt="Home"
                    className = "w-6 h-6 object-cover transition-transform duration-200 group-hover:scale-110"
                />
                <div className="w-full h-0.5 mt-1 bg-zinc-500 rounded-sm" />
            </button>
        )
    }

    else {
        return (
            <button onClick = {goToHome} className = "relative w-6 h-6 group">
                <img
                    src = {homeIcon}
                    alt = "Home"
                    className="absolute inset-0 object-cover transition-opacity duration-200 opacity-100 group-hover:opacity-0 group-hover:scale-110 transition-transform duration-200 group-hover:scale-110"
                />
                <img
                    src = {homeIcon1}
                    alt = "Home"
                    className = "absolute inset-0 object-cover transition-opacity duration-200 opacity-0 group-hover:opacity-100 transition-transform duration-200 group-hover:scale-110"
                />
            </button>
        )
    }
}

export default HomeIcon;
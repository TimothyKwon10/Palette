import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from "react";
import { auth } from '../../FireBase/firebaseConfig';
import { useNavigate } from 'react-router-dom'
import PaintBanner from '../../assets/images/PaintBanner.jpg';
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Logo from "../../assets/images/IconOnly_NoBuffer.png"

function Login() {
    //use states for different fields and page state 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/Home');

            const response = await fetch("http://127.0.0.1:8000/admin/refresh-feeds", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer AJSHDbjhbqweqey1SABDbi1jskhdbaAm" //NEED TO CHANGEGKJENWN
                }
            });
        }
        catch (err) {
            console.log("ERROR WITH REGISTER");
            console.log(err);
        }
    };

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithPopup(auth, provider);
            navigate('/Home');

            const response = await fetch("http://127.0.0.1:8000/admin/refresh-feeds", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer AJSHDbjhbqweqey1SABDbi1jskhdbaAm" //NEED TO CHANGEGKJENWN
                }
            });
        }
        catch (err) {
            console.log("ERROR WITH GOOGLE REGISTER")
        }
    }

    return (
        <div className = "flex h-screen font-[Lato-Regular]">
            {/* Left side of the page, img */}
            <div 
                className = "relative overflow-hidden"
                style = {{ width: '55%' }}
            >
                <img
                    src = {PaintBanner}
                    alt="Decorative"
                    className="h-full w-full object-cover"
                    style={{ clipPath: 'ellipse(100% 120% at 0% 50%)' }}
                />
            </div>
            {/* Right side of the page, the actual login portion */}
            <div 
                className = "flex items-center justify-center bg-white flex-col"
                style = {{ width: '45%' }}
            >
                <img src = {Logo} className = "h-14 md:h-16 lg:h-20 w-auto mb-3 sm:mb-4 md:mb-5"></img>
                <h1 className = "font-[PlayfairDisplay] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-4 sm:mb-6 md:mb-8">Welcome Back</h1>
                <form onSubmit = {handleLogin} className = "w-2/3 flex flex-col items-center gap-5">
                    <input
                        type = "email"
                        placeholder = "Email"
                        onChange = {(e) => setEmail(e.target.value)}
                        className = "w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fa5902]"
                    />
                    <input
                        type = "password"
                        placeholder = "Password"
                        onChange = {(e) => setPassword(e.target.value)}
                        className = "w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fa5902]"
                    />
                    
                    <button type = "submit" className = "w-full bg-[#fa5902] text-white p-3 rounded hover:bg-[#d94e02] transition">
                        Login
                    </button>
                    <div className="w-full flex items-center my-4">
                        <hr className="flex-grow border-t border-gray-400" />
                        <span className="mx-4 text-gray-500">OR</span>
                        <hr className="flex-grow border-t border-gray-400" />
                    </div>
                    <button onClick = {handleGoogleLogin} className = "w-full flex gap-2 bg-[#fa5902] text-white p-3 rounded hover:bg-[#d94e02] transition items-center justify-center">
                        <FaGoogle className = "w-5 h-5" />
                        Login With Google
                    </button>
                    <span className = "text-gray-600">Explore as {' '}
                        <Link to = "/Home" className = "text-[#017d96] underline">Guest</Link>
                    </span>
                    <span className = "text-gray-600 mt-2">Don't have an account? {' '}
                        <Link to = "/Register" className = "text-[#017d96] underline">Register</Link>
                    </span>
                </form>
            </div>
        </div>
    );
}

export default Login;
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from '../../FireBase/firebase';
import { useNavigate } from 'react-router-dom'
import PaintBanner from '../../assets/images/PaintBanner.jpg';
import { FaGoogle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Register() {
    //use states for different fields and page state 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/Home');
        }
        catch (err) {
            console.log("ERROR WITH REGISTER");
            console.log(err);
        }
    };

    const handleGoogleSignUp = async (e) => {
        e.preventDefault();
        try {
            await signInWithPopup(auth, provider);
            navigate('/Home');
        }
        catch (err) {
            console.log("ERROR WITH GOOGLE REGISTER")
        }
    }

    return (
        <div className = "flex h-screen">
            {/* Left side of the page, the actual login portion */}
            <div 
                className = "w-3/7 flex items-center justify-center bg-white flex-col"
                style = {{ width: '45%' }}
            >
                <h1 className = "font-[PlayfairDisplay] text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-4 sm:mb-6 md:mb-8">Welcome To [Some Website Name]</h1>
                <form onSubmit = {handleSignUp} className = "w-2/3 flex flex-col items-center gap-5">
                    <input
                        type = "email"
                        placeholder = "Email"
                        onChange = {(e) => setEmail(e.target.value)}
                        className = "w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#019cb9]"
                    />
                    <input
                        type = "password"
                        placeholder = "Password"
                        onChange = {(e) => setPassword(e.target.value)}
                        className = "w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#019cb9]"
                    />
                    
                    <button type = "submit" className = "w-full bg-[#019cb9] text-white p-3 rounded hover:bg-[#017d96] transition">
                        Sign Up
                    </button>
                    <div className="w-full flex items-center my-4">
                        <hr className="flex-grow border-t border-gray-400" />
                        <span className="mx-4 text-gray-500">OR</span>
                        <hr className="flex-grow border-t border-gray-400" />
                    </div>
                    <button onClick = {handleGoogleSignUp} className = "w-full flex gap-2 bg-[#019cb9] text-white p-3 rounded hover:bg-[#017d96] transition items-center justify-center">
                        <FaGoogle className = "w-5 h-5" />
                        Sign Up With Google
                    </button>
                    <span className = "text-gray-600">Already have an account? {' '}
                        <Link to = "/Login" className = "text-[#017d96] underline">Log In</Link>
                    </span>
                </form>
            </div>
            {/* Right side of the page, img */}
            <div 
                className = "relative overflow-hidden"
                style = {{ width: '55%' }}
            >
                <img
                    src = {PaintBanner}
                    alt="Decorative"
                    className="h-full w-full object-cover"
                    style={{ clipPath: 'ellipse(100% 120% at 100% 50%)' }}
                />
            </div>
        </div>
    );
}

export default Register;
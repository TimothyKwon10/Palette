import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from '../../FireBase/firebase';
import { useNavigate } from 'react-router-dom'
import PaintBanner from '../../assets/images/PaintBanner.jpg';
import { FaGoogle } from 'react-icons/fa';

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
            navigate('../Home.jsx');
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
            navigate('../Home.jsx');
        }
        catch (err) {
            console.log("ERROR WITH GOOGLE REGISTER")
        }
    }

    return (
        <div className = "flex h-screen">
            <div className = "w-3/7 flex items-center justify-center bg-white flex-col">
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
                    <p>or</p>
                    <button onClick = {handleGoogleSignUp} className = "w-full flex gap-2 bg-[#019cb9] text-white p-3 rounded hover:bg-[#017d96] transition items-center justify-center">
                        <FaGoogle className = "w-5 h-5" />
                        Sign Up With Google
                    </button>
                </form>
            </div>
            <div className = "w-4/7 relative overflow-hidden">
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
import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './Components/Authentication/Register';
import Login from './Components/Authentication/Login';
import Home from './Components/Pages/Home';
import MyPalettes from './Components/Pages/MyPalettes'
import Create from "./Components/Pages/Create"
import Search from './Components/Pages/Search';
import Finalize from './Components/Pages/Finalize'
import AuthStatus from './Components/Hooks/AuthStatus';
import RequireUpload from './Components/requireUpload';
import Image from './Components/Pages/Image'
import Palette from './Components/Pages/Palette'
import { Toaster } from "react-hot-toast";

function App() {

  const {loggedIn, checkingStatus } = AuthStatus();
  if (checkingStatus) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="text-gray-500">Loading...</h2>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={
          loggedIn ? <Navigate to = "/Home" replace/> : <Navigate to = "/Login" replace/>
          } />

        <Route path="/Home" element = {<Home/>} />
        <Route path="/Register" element = {
          loggedIn ? <Navigate to = "/Home" replace/> : <Register/>
        } />
        <Route path="/Login" element = {
          loggedIn ? <Navigate to = "/Home" replace/> : <Login/>
        } />
        <Route path="/MyPalettes" 
          element={loggedIn ? <MyPalettes /> : <Navigate to="/Login" replace />} 
        />
        <Route path="/Create" 
          element={loggedIn ? <Create /> : <Navigate to="/Login" replace />} 
        />
        <Route element={loggedIn ? <RequireUpload /> : <Navigate to="/login" replace />}>
          <Route path="/create/finalize" element={<Finalize />} />
        </Route>
        <Route path="/Image/:id" element={<Image/>}/>
        <Route path="/Palette/:id"
          element={loggedIn ? <Palette/> : <Navigate to="/Login" replace />}/>
        <Route path="/Search" element = {<Search/>}/>
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          success: {
            style: { background: "white", color: "black", border: "#ECEEF1" },
            iconTheme: { primary: "#fa5902", secondary: "#fff" },
          },
        }}
      />
    </>
  )
}

export default App

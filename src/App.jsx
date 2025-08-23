import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './Components/Authentication/Register';
import Login from './Components/Authentication/Login';
import Home from './Components/Pages/Home';
import MyPalletes from './Components/Pages/MyPalettes'
import Create from "./Components/Pages/Create"
import Search from './Components/Pages/Search';
import Finalize from './Components/Pages/Finalize'
import AuthStatus from './Components/Hooks/AuthStatus';
import RequireUpload from './Components/requireUpload';
import Image from './Components/Pages/Image'

function App() {

  const {loggedIn, checkingStatus } = AuthStatus();
  if (checkingStatus) {
    return <h1>Loading...</h1>;
  }

  return (
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
        element={loggedIn ? <MyPalletes /> : <Navigate to="/Login" replace />} 
      />
      <Route path="/Create" 
        element={loggedIn ? <Create /> : <Navigate to="/Login" replace />} 
      />
      <Route element={loggedIn ? <RequireUpload /> : <Navigate to="/login" replace />}>
        <Route path="/create/finalize" element={<Finalize />} />
      </Route>
      <Route path="/Image/:id" element={<Image/>}/>
      <Route path="/Search" element = {<Search/>}/>
    </Routes>
  )
}

export default App

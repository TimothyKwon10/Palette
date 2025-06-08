import { Routes, Route, Navigate } from 'react-router-dom'
import Register from './Components/Authentication/Register';
import Login from './Components/Authentication/Login';
import Home from './Components/Home';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" replace />} />
      <Route path="/Home" element = {<Home />} />
      <Route path="/Register" element = {<Register />} />
      <Route path="/Login" element = {<Login />} />
    </Routes>
  )
}

export default App

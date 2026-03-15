import './App.css'
import SignIn from './Components/Sign_in'
import Login from './Components/Login'
import AdminDashboard from './Pages/AdminDashboard'
import UserDashboard from './Pages/UserDashboard'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

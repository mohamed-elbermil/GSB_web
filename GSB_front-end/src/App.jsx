import './App.css'
import AuthPage from './Components/AuthPage'
import AdminDashboard from './Pages/AdminDashboard'
import UserDashboard from './Pages/UserDashboard'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {  
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/sign-in" element={<AuthPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

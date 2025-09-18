
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './Components/Dashboard/Dashboard'
import './App.css'

function App() {
 

  return (
    <>
    <Routes>
        {/* default → dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* actual dashboard page */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* anything else → dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  
    </>
  )
}

export default App

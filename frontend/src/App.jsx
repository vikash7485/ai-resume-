import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'
import Navbar from './components/Navbar'
import CandidateDashboard from './pages/CandidateDashboard'
import EmployerVerification from './pages/EmployerVerification'
import GovernmentPortal from './pages/GovernmentPortal'
import Home from './pages/Home'

function App() {
  return (
    <div className="App">
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/candidate" element={<CandidateDashboard />} />
          <Route path="/employer" element={<EmployerVerification />} />
          <Route path="/government" element={<GovernmentPortal />} />
        </Routes>
      </Container>
    </div>
  )
}

export default App


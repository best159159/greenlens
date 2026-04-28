import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Analyze from './pages/Analyze'
import DashboardPage from './pages/DashboardPage' // Actually acting as ResultPage, URL changed to /result
import History from './pages/History'
import Campaign from './pages/Campaign'
import FirebaseTest from './pages/FirebaseTest'

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen font-sans">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route path="/analyze" element={
                            <ProtectedRoute>
                                <Analyze />
                            </ProtectedRoute>
                        } />
                        {/* URL changed to /result instead of /dashboard to avoid confusion */}
                        <Route path="/result" element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/history" element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        } />
                        <Route path="/campaign" element={
                            <ProtectedRoute>
                                <Campaign />
                            </ProtectedRoute>
                        } />

                        {/* Firebase Diagnostic (dev only) */}
                        <Route path="/firebase-test" element={<FirebaseTest />} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    )
}

export default App

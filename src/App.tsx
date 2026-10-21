import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.tsx'
import { Navbar } from './components/Navbar.tsx'
import { DiscoveryFeedPage } from './pages/DiscoveryFeedPage.tsx'
import { MatchesChatPage } from './pages/MatchesChatPage.tsx'
import { DeclarativeArchitecturePage } from './pages/DeclarativeArchitecturePage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RegisterPage } from './pages/RegisterPage.tsx'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DiscoveryFeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/engine"
            element={
              <ProtectedRoute>
                <DeclarativeArchitecturePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

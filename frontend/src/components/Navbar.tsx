import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Music, User, LogOut, Upload, BarChart3, Settings } from 'lucide-react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-dark-800 shadow-xl border-b border-dark-600 backdrop-blur-sm animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-gradient hover:scale-105 transition-transform duration-300">
            <Music className="h-8 w-8 text-gold-500" />
            <span className="text-xl font-bold">Music Analysis</span>
          </Link>

          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/upload"
                  className="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-all duration-200"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/arrangements"
                  className="nav-link flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-dark-700 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  <span>Arrangements</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gold-500 bg-dark-700 px-3 py-2 rounded-lg border border-gold-500/20">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-earth-300 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-dark-700 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="nav-link px-4 py-2 rounded-lg hover:bg-dark-700 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Scissors, BarChart2, Link2 } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="border-b border-ink-700 bg-ink-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-acid rounded-lg flex items-center justify-center
                          group-hover:bg-acid-light transition-colors">
            <Scissors size={16} className="text-ink-900" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl text-ink-50 tracking-tight">SNIP</span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-colors
                ${isActive('/dashboard')
                  ? 'bg-ink-700 text-ink-50'
                  : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800'
                }`}
            >
              <Link2 size={15} />
              <span className="hidden sm:inline">My URLs</span>
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-ink-400 font-body">
                {user.email || user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-300
                           hover:text-coral hover:bg-ink-800 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
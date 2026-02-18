import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  Menu, X, Sun, Moon, Search, Upload, User, LogOut, BarChart3
} from 'lucide-react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const NavLink = ({ to, icon: Icon, label, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition 
        ${location.pathname === to
          ? 'text-primary-600 dark:text-primary-400 bg-gray-100 dark:bg-gray-700'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </Link>
  )

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              VisionFind
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" label="Home" />
            <NavLink to="/about" label="About" />

            {user ? (
              <>
                {/* Admin-only links */}
                {isAdmin() ? (
                  <>
                    <NavLink to="/upload" label="Upload" icon={Upload} />
                    <NavLink to="/search" label="Search" icon={Search} />
                    <NavLink to="/admin" label="Admin" icon={BarChart3} />
                  </>
                ) : (
                  <>
                    {/* Regular user links */}
                    <NavLink to="/search" label="Search" icon={Search} />
                    <NavLink to="/profile" label="Profile" icon={User} />
                  </>
                )}

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Guest links */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
              <NavLink to="/about" label="About" onClick={() => setMobileMenuOpen(false)} />

              {user ? (
                <>
                  {isAdmin() ? (
                    <>
                      <NavLink to="/upload" label="Upload" onClick={() => setMobileMenuOpen(false)} />
                      <NavLink to="/search" label="Search" onClick={() => setMobileMenuOpen(false)} />
                      <NavLink to="/admin" label="Admin Dashboard" onClick={() => setMobileMenuOpen(false)} />
                    </>
                  ) : (
                    <>
                      <NavLink to="/search" label="Search" onClick={() => setMobileMenuOpen(false)} />
                      <NavLink to="/profile" label="Profile" onClick={() => setMobileMenuOpen(false)} />
                    </>
                  )}

                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" label="Login" onClick={() => setMobileMenuOpen(false)} />
                  <NavLink to="/register" label="Register" onClick={() => setMobileMenuOpen(false)} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar

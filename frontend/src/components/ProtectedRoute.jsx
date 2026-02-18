import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = [] }) => {
  const { user, loading, isAdmin, role } = useAuth()

  // 🌀 Still loading user data (token verification, fetch, etc.)
  if (loading) {
    return <Loader />
  }

  // 🚫 Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 🔒 If adminOnly, block non-admin users
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />
  }

  // ✅ Support for role-based route restrictions
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  // ✅ Authorized user → render route
  return children
}

export default ProtectedRoute

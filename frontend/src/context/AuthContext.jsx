import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api, { authAPI } from '../api/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem('access') || localStorage.getItem('token')
    if (accessToken) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getUser()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      // Use the custom login endpoint which returns user data + tokens
      const response = await api.post('/api/auth/login/', { username, password })
      const { access, refresh, user: userData } = response.data

      localStorage.setItem('access', access)
      if (refresh) localStorage.setItem('refresh', refresh)
      setUser(userData)
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      // Fallback: try JWT token endpoint
      try {
        const tokenRes = await authAPI.login({ username, password })
        localStorage.setItem('access', tokenRes.data.access)
        if (tokenRes.data.refresh) localStorage.setItem('refresh', tokenRes.data.refresh)

        const userRes = await authAPI.getUser()
        setUser(userRes.data)
        toast.success('Login successful!')
        return { success: true }
      } catch (err) {
        const message = err.response?.data?.detail || err.response?.data?.error || 'Invalid username or password'
        toast.error(message)
        return { success: false, error: message }
      }
    }
  }

  const register = async (username, email, password, password2) => {
    try {
      const response = await authAPI.register({ username, email, password, password2 })
      const { access, refresh, user: userData } = response.data

      localStorage.setItem('access', access)
      if (refresh) localStorage.setItem('refresh', refresh)
      setUser(userData)
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.password?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
    toast.info('Logged out successfully')
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.is_superuser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

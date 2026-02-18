import axios from 'axios'

// ==================================================
// BACKEND BASE URL
// ==================================================
// Uses Vercel env variable if present,
// otherwise falls back to Render backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://content-based-image-retrieval-sysytem.onrender.com'

// ==================================================
// AXIOS INSTANCE
// ==================================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================================================
// REQUEST INTERCEPTOR (Attach JWT)
// ==================================================
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access') || localStorage.getItem('token')

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      console.log(`🔑 JWT attached → ${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ==================================================
// RESPONSE INTERCEPTOR (Handle Auth Errors)
// ==================================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error('🚫 Unauthorized – token expired or invalid')
        // Optional auto logout:
        // localStorage.clear()
        // window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================================================
// AUTH APIs
// ==================================================
export const authAPI = {
  // Custom registration endpoint
  register: (data) => api.post('/api/auth/register/', data),

  // JWT Login (SimpleJWT)
  login: (data) => api.post('/api/token/', data),

  // Refresh token
  refresh: (data) => api.post('/api/token/refresh/', data),

  // Get logged-in user
  getUser: () => api.get('/api/auth/user/'),
}

// ==================================================
// IMAGE APIs
// ==================================================
export const imageAPI = {
  upload: (formData) =>
    api.post('/api/images/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  list: () => api.get('/api/images/list/'),

  delete: (id) => api.delete(`/api/images/${id}/`),
}

// ==================================================
// SEARCH API
// ==================================================
export const searchAPI = {
  search: (formData, topK = 20) => {
    formData.append('top_k', topK)

    return api.post('/api/search/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// ==================================================
// STATS API
// ==================================================
export const statsAPI = {
  getStats: () => api.get('/api/stats/'),
}

// ==================================================
// EXPORT DEFAULT INSTANCE
// ==================================================
export default api

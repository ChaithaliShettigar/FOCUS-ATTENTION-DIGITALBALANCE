// API configuration and service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper to get auth token from localStorage
const getToken = () => localStorage.getItem('accessToken')
const getRefreshToken = () => localStorage.getItem('refreshToken')
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
}
const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

// Generic API request handler with token refresh
async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    // If token expired, try to refresh
    if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setTokens(refreshData.accessToken, null)
          
          // Retry original request with new token
          config.headers.Authorization = `Bearer ${refreshData.accessToken}`
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config)
          return await retryResponse.json()
        } else {
          clearTokens()
          window.location.href = '/auth'
          throw new Error('Session expired. Please login again.')
        }
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============ AUTH API ============

export const authAPI = {
  register: async (userData) => {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (data.success) {
      setTokens(data.accessToken, data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  },

  login: async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (data.success) {
      setTokens(data.accessToken, data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    
    return data
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } finally {
      clearTokens()
    }
  },

  getCurrentUser: async () => {
    return await apiRequest('/auth/me', { method: 'GET' })
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  },

  deleteAccount: async (password, confirmDelete = true) => {
    const data = await apiRequest('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirmDelete }),
    })
    
    if (data.success) {
      clearTokens()
    }
    
    return data
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available')
    
    const data = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(res => res.json())
    
    if (data.success) {
      setTokens(data.accessToken, null)
    }
    
    return data
  },
}

// ============ PROFILE API ============

export const profileAPI = {
  getProfile: async () => {
    return await apiRequest('/profile', { method: 'GET' })
  },

  updateProfile: async (updates) => {
    return await apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  updatePassword: async (currentPassword, newPassword, confirmPassword) => {
    return await apiRequest('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
  },

  togglePublicFocus: async () => {
    return await apiRequest('/profile/toggle-public-focus', { method: 'POST' })
  },

  deleteProfile: async (password, confirmDelete = true) => {
    const data = await apiRequest('/profile', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirmDelete }),
    })
    
    if (data.success) {
      clearTokens()
    }
    
    return data
  },

  searchPublicProfiles: async (query) => {
    return await apiRequest(`/profile/search?query=${encodeURIComponent(query)}`, { method: 'GET' })
  },

  searchUsersByUsername: async (query) => {
    return await apiRequest(`/profile/search-users?query=${encodeURIComponent(query)}`, { method: 'GET' })
  },

  getPublicProfile: async (userId) => {
    return await apiRequest(`/profile/public/${userId}`, { method: 'GET' })
  },
}

// ============ GROUP API ============

export const groupAPI = {
  createGroup: async (groupData) => {
    return await apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    })
  },

  getUserGroups: async () => {
    return await apiRequest('/groups', { method: 'GET' })
  },

  getGroup: async (groupId) => {
    return await apiRequest(`/groups/${groupId}`, { method: 'GET' })
  },

  joinGroup: async (groupData) => {
    return await apiRequest('/groups/join/code', {
      method: 'POST',
      body: JSON.stringify(groupData),
    })
  },

  leaveGroup: async (groupId) => {
    return await apiRequest(`/groups/${groupId}/leave`, {
      method: 'POST',
    })
  },

  updateGroup: async (groupId, updates) => {
    return await apiRequest(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  deleteGroup: async (groupId) => {
    return await apiRequest(`/groups/${groupId}`, {
      method: 'DELETE',
    })
  },

  addMember: async (groupId, userId) => {
    return await apiRequest(`/groups/${groupId}/add-member`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },

  removeMember: async (groupId, userId) => {
    return await apiRequest(`/groups/${groupId}/remove-member`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },
}

// ============ HELPER FUNCTIONS ============

export const isAuthenticated = () => {
  return !!getToken()
}

export const getUserFromStorage = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export { clearTokens, setTokens, getToken }


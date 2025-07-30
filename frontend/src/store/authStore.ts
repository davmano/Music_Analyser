import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  initializeAuth: () => void
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password,
          })

          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
          })

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Login failed')
        }
      },

      register: async (username: string, email: string, password: string) => {
        try {
          const response = await axios.post(`${API_URL}/api/auth/register`, {
            username,
            email,
            password,
          })

          const { token, user } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
          })

          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Registration failed')
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        delete axios.defaults.headers.common['Authorization']
      },

      initializeAuth: () => {
        const { token } = get()
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

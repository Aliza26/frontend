import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'memoryos_user'

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const storedUser = loadStoredUser()

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: storedUser, isAuthenticated: !!storedUser },
  reducers: {
    login: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem(STORAGE_KEY)
    },
    updateConsent: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user))
      }
    },
  },
})

export const { login, logout, updateConsent } = authSlice.actions
export default authSlice.reducer

import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
    updateConsent: (state, action) => {
      if (state.user) state.user = { ...state.user, ...action.payload }
    },
  },
})

export const { login, logout, updateConsent } = authSlice.actions
export default authSlice.reducer

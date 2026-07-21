import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'memoryos_theme'

const loadStoredTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' || stored === 'light' ? stored : 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: loadStoredTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, state.mode)
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer

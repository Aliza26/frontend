import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    project: projectReducer,
  },
})

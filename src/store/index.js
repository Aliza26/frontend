import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import authReducer from './slices/authSlice'
import projectReducer from './slices/projectSlice'
import ticketsReducer from './slices/ticketsSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    project: projectReducer,
    tickets: ticketsReducer,
  },
})

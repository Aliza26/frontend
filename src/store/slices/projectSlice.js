import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'project',
  initialState: { projects: [], activeProjectId: null },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload
      if (!state.activeProjectId && action.payload.length > 0) {
        state.activeProjectId = action.payload[0].id
      }
    },
    setActiveProject: (state, action) => {
      state.activeProjectId = action.payload
    },
    clearProjects: (state) => {
      state.projects = []
      state.activeProjectId = null
    },
  },
})

export const { setProjects, setActiveProject, clearProjects } = projectSlice.actions
export default projectSlice.reducer

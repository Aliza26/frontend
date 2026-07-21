import { createSlice } from '@reduxjs/toolkit'

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: { resolvedIds: [] },
  reducers: {
    markTicketResolved: (state, action) => {
      if (!state.resolvedIds.includes(action.payload)) {
        state.resolvedIds.push(action.payload)
      }
    },
  },
})

export const { markTicketResolved } = ticketsSlice.actions
export default ticketsSlice.reducer

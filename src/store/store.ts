import { configureStore } from '@reduxjs/toolkit'
import gatesReducer from './slices/gatesSlice'
import zonesReducer from './slices/zonesSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      gates: gatesReducer,
      zones: zonesReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
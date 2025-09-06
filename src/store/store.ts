import { configureStore } from '@reduxjs/toolkit'
import gatesReducer from './slices/gatesSlice'
import zonesReducer from './slices/zonesSlice'
import authReducer from './slices/authSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      gates: gatesReducer,
      zones: zonesReducer,
      auth: authReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../store/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient();
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>
    <QueryClientProvider client={queryClient}>

    {children}
    </QueryClientProvider>
    </Provider>
}
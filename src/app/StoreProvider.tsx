'use client'
import { useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../store/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wsService } from '@/services/ws'


 function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Establish single WebSocket connection on app mount
    wsService.connect();
    
    // Cleanup on app unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  return <>{children}</>;
}




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
      <WebSocketProvider>

    {children}
      </WebSocketProvider>
    </QueryClientProvider>
    </Provider>
}
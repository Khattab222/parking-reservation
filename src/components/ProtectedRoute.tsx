
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const {  token } = useAppSelector((state) => state.auth);

  useEffect(() => {
  
    if ( !token) {
      router.push('/login');
    }
  }, [ token, router]);

 
  
 

  return <>{children}</>;
}
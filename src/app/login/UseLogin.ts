import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";




const UseLogin = () => {

  const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, loading, error,user } = useAppSelector((state) => state.auth);
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/checkpoint');
      }
    }
  }, [isAuthenticated, user, router]);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (username && password) {
        dispatch(login({ username, password }));
      }
    };
  return{error,handleSubmit,username,setUsername,password,setPassword,loading}
}

export default UseLogin
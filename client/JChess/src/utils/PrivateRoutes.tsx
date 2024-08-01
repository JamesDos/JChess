import { Outlet, Navigate, useLocation} from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";


export const PrivateRoutes = () => {
  const auth = useAuth()
  console.log(`Access token is ${auth.accessToken}`)
  // const location = useLocation()
  return (
    // user.token ? <Outlet/> : <Navigate to="/login"/>
    auth.accessToken 
      ?  <Outlet/> 
      : <Navigate to="/login" replace/>
  )
}
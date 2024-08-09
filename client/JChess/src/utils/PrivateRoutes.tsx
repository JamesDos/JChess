import { Outlet, Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";


export const PrivateRoutes = () => {
  const auth = useAuth() 
  // const location = useLocation()
  return (
    // user.token ? <Outlet/> : <Navigate to="/login"/>
    auth.accessToken 
      ?  <Outlet/> 
      : <Navigate to="/login" replace/>
  )
}
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

export const PrivateRoutes = () => {
  // const user = useAuth()
  const auth = {"token": false}
  return (
    // user.token ? <Outlet/> : <Navigate to="/login"/>
    auth.token ? <Outlet/> : <Navigate to="/login"/>
  )
}
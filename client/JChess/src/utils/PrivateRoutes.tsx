import { Outlet, Navigate } from "react-router-dom";

export const PrivateRoutes = () => {
  const auth = {"token": false}
  return (
    auth.token ? <Outlet/> : <Navigate to="/login"/>
  )
}
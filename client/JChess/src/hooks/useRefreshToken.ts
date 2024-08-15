import axiosInstance from "../api/axios";
import useAuth from "./useAuth";
import { jwtDecode } from "jwt-decode";

interface JWTClaimsType {
  username: string,
  id: string
}

const useRefreshToken = () => {
  const { setAuth } = useAuth()

  const refresh = async () => {
    console.log("in useRefreshToken")
    const response = await axiosInstance.get(
      "/refresh", 
      {withCredentials: true}
    )
    const token = response.data.accessToken
    try {
      const decoded = jwtDecode<JWTClaimsType>(token)
      setAuth(prev => ({
        username: decoded.username|| "",
        password: prev?.password || "", 
        accessToken: response.data.accessToken,
      }))
      return response.data.accessToken
    } catch (err) {
      console.error(err)
    }
  }

  return refresh
}

export default useRefreshToken
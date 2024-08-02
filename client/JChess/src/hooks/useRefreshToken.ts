import axiosInstance from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth()

  const refresh = async () => {
    const response = await axiosInstance.get(
      "/refresh", 
      {withCredentials: true}
    )
    setAuth(prev => ({
      username: prev?.username || "",
      password: prev?.password || "", 
      accessToken: response.data.accessToken,
    }))
    console.log(`Response is ${response.data.accessToken}`)
    return response.data.accessToken
  }

  return refresh
}

export default useRefreshToken
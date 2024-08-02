import axiosInstance from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth()

  const logout = async () => {
    const newAuth = {
      username: "",
      password: "",
      accessToken: ""
    }
    setAuth(newAuth)
    try {
      const response = await axiosInstance("/logout",{
        withCredentials: true
      })
      console.log(`Logout res: ${response.status}`)
      
    } catch (err) {
      console.log(err)
    }
  }

  return logout
}

export default useLogout
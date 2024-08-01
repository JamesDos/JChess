import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
  /** Attaches request and response interceptors to axiosPrivate instance */
  const refresh = useRefreshToken()
  const auth = useAuth()
  useEffect(() => { 

    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        // initial request when auth header is not set
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`
        }
        return config
      }, (err) => Promise.reject(err)
    )

    const responseIntercept = axiosPrivate.interceptors.response.use(
      res => res, 
      async (err) => {
        const prevRequest = err?.config
        if (err?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true
          const newAccessToken = await refresh()
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`
          return axiosPrivate(prevRequest)
        }
        return Promise.reject(err) // return received error

      }
    )
    
    // clean up to remove request and response inteceptors
    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept)
      axiosPrivate.interceptors.response.eject(responseIntercept)
    }
  }, [auth, refresh])

  return axiosPrivate
}

export default useAxiosPrivate
import { Outlet } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true)
  const refesh = useRefreshToken()
  const auth = useAuth()

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refesh()
      }
      catch (err) {
        console.log(err)
      }
      finally {
        setIsLoading(false)
      }
    }
    // only verify refresh token when we don't have access token
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false)
    
  }, [refesh, auth])

  useEffect(() => {
    console.log(`isLoading: ${isLoading}`)
    console.log(`authToken: ${JSON.stringify(auth?.accessToken)}`)
  }, [isLoading, auth])

  return (
    <>
      {isLoading ? <p>Loading</p> : <Outlet/>}
    </>
  )
}

export default PersistLogin
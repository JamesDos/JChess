import React, { useState, useEffect, createContext } from "react";
import {io, Socket} from 'socket.io-client';
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import useRefreshToken from "../hooks/useRefreshToken";

export const SocketContext = createContext<Socket| null>(null)

const SOCKET_URL = "http://localhost:3000"

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { accessToken } = useAuth()
  // const refresh = useRefreshToken()

  useEffect(() => {

    if (!accessToken) {
      console.log(`accessToken in useSocket is ${accessToken}`)
      console.log("no auth token for socket connection!")
      return 
    }

    // if (accessToken) {
    //   const decoded = jwtDecode(accessToken)
    //   if (decoded.exp) {
    //     const isExpired = decoded?.exp < new Date().getTime() / 1000
    //     if (isExpired) {
    //       console.log("expired token, refreshing")
    //       refresh()
    //     }
    //   }
    // }
    
    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      }
    })

    socket.on("connect", () => {
      console.log("in useSocket connect")
      setSocket(socket)
    })

    socket.on("disconnect", () => {
      console.log("in useSocket disconnect")
      setSocket(null)
    })

    return () => {
      console.log("in useSocket cleanup")
      socket.close()
    }

  }, [accessToken])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
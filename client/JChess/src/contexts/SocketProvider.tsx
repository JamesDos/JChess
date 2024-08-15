import React, { useState, useEffect, createContext, useCallback } from "react";
import {io, Socket} from 'socket.io-client';
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import useRefreshToken from "../hooks/useRefreshToken";

export const SocketContext = createContext<Socket| null>(null)

const SOCKET_URL = "http://localhost:3000"

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { accessToken } = useAuth()
  const refresh = useRefreshToken()


  useEffect(() => {

    // if (!accessToken) {
    //   console.log("no auth token for socket connection!")
    //   return 
    // }

    // const verifyRefreshToken =  async () => {
    //   try {
    //     const decoded = jwtDecode(accessToken)
    //     if (!decoded.exp) {
    //       console.error("Decoded token doesn't have expiration")
    //       return
    //     }
    //     const currentTime = Date.now() / 1000
    //     if (decoded.exp < currentTime) {
    //       console.log("token expired, refreshing...")
    //       await refresh()
    //     }
    //   } catch (err) {
    //     console.error(err)
    //   }
    // }

    // verifyRefreshToken() // refreshes accessToken if it is expired
    
    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      }
    })

    socket.on("connect", () => {
      console.log("connecting socket...")
      setSocket(socket)
      socket.emit("rejoin-game")
    })

    socket.on("disconnect", () => {
      console.log("disconnecting socket...")
      setSocket(null)
    })

    return () => {
      console.log("closing socket...")
      socket?.close()
    }

  }, [accessToken])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
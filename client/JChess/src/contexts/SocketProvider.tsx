import React, { useState, useEffect, createContext } from "react";
import {io, Socket} from 'socket.io-client';
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext<Socket| null>(null)

const SOCKET_URL = "http://localhost:3000"

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { accessToken } = useAuth()


  useEffect(() => {
    
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
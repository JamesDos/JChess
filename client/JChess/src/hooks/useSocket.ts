import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import useAuth from "./useAuth";


const SOCKET_URL = "http://localhost:3000"

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { accessToken } = useAuth()

  useEffect(() => {
    if (!accessToken) {
      console.log("no auth token for socket connection!")
      return 
    }
    
    const socket = io(SOCKET_URL, {
      auth: {
        accessToken
      }
    })

    socket.on("connect", () => {
      setSocket(socket)
    })

    socket.on("disconnect", () => {
      setSocket(null)
    })

    return () => {
      socket.close()
    }

  }, [accessToken])


  return socket
}
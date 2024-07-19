import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from "../../contexts/SocketProvider";

export const Lobby = () => {
  const socket = useSocket()

  const [makeRoomId, setMakeRoomId] =  useState("")
  const [joinRoomId, setJoinRoomId] = useState("")

  const createRoom = useCallback( (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    const roomId = uuidv4()
    setMakeRoomId(roomId)
    socket?.emit("join-game", roomId, (message: string) => { // user joins new room by default
      console.log(message)
    })
  }, []) 

  const joinGame = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>, roomId: string) => {
    e.preventDefault()
    socket?.emit("join-game", roomId, (message: string) => {
      console.log(message)
      }) 
  }, [])

  return (
    <div className="lobby-container">
      <form>
        <button 
        className="create-game-btn"
        onClick={(e) => createRoom(e)}
        >Make Game</button>
        <div className="room-id-display">{makeRoomId}</div>
        <input 
          type="text" 
          className="join-game-text-input"
          onChange={e => setJoinRoomId(e.target.value)}
          ></input>
        <Link to="/game" state={joinRoomId}>
          <button
            className="join-game-btn"
            onClick={e => joinGame(e, joinRoomId)}
            type="button"
          >Join Game</button>
        </Link >
      </form>
    </div>
  )
}
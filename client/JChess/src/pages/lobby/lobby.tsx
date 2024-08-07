import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../../connections/socket";
import useGameSetUp from "../../hooks/useGameSetUp";

export interface LobbyProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>,
  setOrientation: React.Dispatch<React.SetStateAction<string>>,
  setPlayers: React.Dispatch<React.SetStateAction<{id: string}[]>>,
}

export const Lobby = () => {

  const { dispatch } = useGameSetUp()

  const [makeRoomId, setMakeRoomId] =  useState("")
  const [joinRoomId, setJoinRoomId] = useState("")

  const navigate = useNavigate()

  const createRoom = useCallback( (e: React.MouseEvent) => {
    e.preventDefault()
    socket.emit("create-game", (room: string) => {
      console.log(`Created room with id ${room}`)
      dispatch({ type: "create-room", room: room })
      setMakeRoomId(room)
    })
  }, [dispatch]) 

  const joinGame = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    socket.emit("join-room", {roomId: joinRoomId}, (res: string) => {
      // TODO: make send res in callback for gameHandler
      console.log(`Join room response is ${res}`)
      const data = JSON.parse(res)
      const players = [{socketId: data.payload.white.id}, {socketId: data.payload.black.id}]

      console.log("before dispatch")
      dispatch({ 
        type: "join-room", 
        room: data.gameId, 
        newPlayers: players})
      console.log("before navigate")
      navigate("/game")

    })
  }, [dispatch, joinRoomId, navigate])

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
        <button
          className="join-game-btn"
          onClick={e => joinGame(e)}
          type="button"
          >Join Game
        </button>
        <Link to="/game">
          <button>
            Go To Game
          </button>
        </Link>
      </form>
    </div>
  )
}
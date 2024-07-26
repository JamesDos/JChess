import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import socket from "../../connections/socket";
import { useGameSetUp } from "../../contexts/GameSetUpProvider";

export interface LobbyProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>,
  setOrientation: React.Dispatch<React.SetStateAction<string>>,
  setPlayers: React.Dispatch<React.SetStateAction<{id: string}[]>>,
}

export const Lobby = () => {

  const { dispatch } = useGameSetUp()


  const [makeRoomId, setMakeRoomId] =  useState("")
  const [joinRoomId, setJoinRoomId] = useState("")

  const createRoom = useCallback( (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    socket.emit("create-room", (room: string) => {
      console.log(`Created room with id ${room}`)
      // props.setRoom(room)
      // props.setOrientation("white")
      dispatch({ type: "create-room", room: room })
      setMakeRoomId(room)
    })
  }, [dispatch]) 

  const joinGame = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    socket.emit("join-room", {roomId: joinRoomId}, (res: any) => {
      if (res.error) {
        console.log(res.message)
        return 
      }
      console.log(res)
      // props.setRoom(res?.roomId)
      // props.setPlayers(res?.players)
      // props.setOrientation("black")
      dispatch({ type: "join-room", room: res.roomId, newPlayers: res.players})
    })
  }, [dispatch, joinRoomId])

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
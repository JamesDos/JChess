import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import socket from "../../connections/socket";
import { useSocket } from "../../hooks/useSocket";
import useGameSetUp from "../../hooks/useGameSetUp";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export interface LobbyProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>,
  setOrientation: React.Dispatch<React.SetStateAction<string>>,
  setPlayers: React.Dispatch<React.SetStateAction<{id: string}[]>>,
}

interface LobbyGameData {
  gameId: string,
  whiteUsername: string,
}

export const Lobby = () => {

  const socket = useSocket()
  const axiosPrivate = useAxiosPrivate()

  const { dispatch } = useGameSetUp()

  const [makeRoomId, setMakeRoomId] =  useState("")
  const [joinRoomId, setJoinRoomId] = useState("")
  const [games, setGames] = useState<LobbyGameData[]>([])

  const navigate = useNavigate()

  const createRoom = useCallback( (e: React.MouseEvent) => {
    e.preventDefault()
    socket?.emit("create-game", (room: string) => {
      console.log(`Created room with id ${room}`)
      dispatch({ type: "create-room", room: room })
      setMakeRoomId(room)
    })
  }, [dispatch, socket]) 

  const joinGame = useCallback((e: React.MouseEvent, gameId: string) => {
    e.preventDefault()
    console.log(`socket is ${socket?.id}`)
    socket?.emit("join-room", {roomId: gameId}, (res: string) => {
      // TODO: make send res in callback for gameHandler
      console.log(`Join room response is ${res}`)
      const data = JSON.parse(res)
      const players = [{socketId: data.payload.white.id}, {socketId: data.payload.black.id}]

      console.log("before dispatch")
      // dispatch({ 
      //   type: "join-room", 
      //   room: data.gameId, 
      //   newPlayers: players})
      console.log("before navigate")
      navigate("/game")

    })
  }, [dispatch, joinRoomId, navigate, socket])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController() // cancels request if component unmounts
    const getGames = async () => {
      try {
        const response = await axiosPrivate.get("/games/pending", {
          signal: controller.signal
        })
        isMounted && setGames(response.data)
        console.log(`Pendings games are ${JSON.stringify(response?.data)}`)
      } catch (err) {
        console.error(err)
      }
    }

    getGames()

    socket?.on("game-change", () => {
      getGames()
    })

    return () => {
      isMounted = false
      controller.abort()
    }

  }, [axiosPrivate, socket])

  const gameList = games.map(game => {
    return <div 
    key={game.gameId} 
    className="gamelist-item"
    onClick = {e => joinGame(e, game.gameId)}>
      {game.gameId} {game.whiteUsername}
      </div>
  })

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
      <div className="lobby--gamelist">
        {gameList}
      </div>
    </div>
  )
}
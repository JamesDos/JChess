import { useState, useCallback, useEffect } from "react";
// import socket from "../../connections/socket";
import { useSocket } from "../../hooks/useSocket";
import useGameSetUp from "../../hooks/useGameSetUp";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { GamesDisplayer } from "./gamesDisplayer";

export interface LobbyProps {
  setRoom: React.Dispatch<React.SetStateAction<string>>,
  setOrientation: React.Dispatch<React.SetStateAction<string>>,
  setPlayers: React.Dispatch<React.SetStateAction<{id: string}[]>>,
}

export interface LobbyGameData {
  gameId: string,
  whiteUsername: string,
}

export const HomePage = () => {

  const socket = useSocket()
  const axiosPrivate = useAxiosPrivate()

  const { dispatch } = useGameSetUp()

  const [games, setGames] = useState<LobbyGameData[]>([])

  const createGame = useCallback( (e: React.MouseEvent) => {
    e.preventDefault()
    socket?.emit("create-game", (room: string) => {
      console.log(`Created room with id ${room}`)
      dispatch({ type: "create-room", room: room })
    })
  }, [dispatch, socket]) 

  const joinGame = useCallback((e: React.MouseEvent, gameId: string) => {
    // TODO: Clean this function up
    e.preventDefault()
    console.log(`socket is ${socket?.id}`)
    socket?.emit("join-room", {roomId: gameId}, (res: string) => {
      console.log(`Join room response is ${res}`)

    })
  }, [socket])

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

  return (
    <section className="min-h-screen m-0 p-0 grid place-items-center scrollbar">
      <GamesDisplayer
        createGame={createGame}
        joinGame={joinGame}
        gameList={games}
      />
    </section>
  )
}
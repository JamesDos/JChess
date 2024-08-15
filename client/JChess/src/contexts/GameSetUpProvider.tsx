import React, { useReducer, useEffect, createContext} from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
// import socket from "../connections/socket";
import { useSocket } from "../hooks/useSocket"
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export const GameSetUpContext = createContext<gameContextType | null>(null)

export interface Player {
  username: string
}

export interface gameContextType {
  room: string,
  orientation: BoardOrientation | string,
  players: Player[],
  dispatch: React.Dispatch<Action>
}

interface gameSetupType {
  room: string,
  orientation: BoardOrientation | string,
  players: {username: string}[],
}

type Action = 
| {type: "update-players", newPlayers: Player[]}
| {type: "cleanup-room"}
| {type: "create-room", room: string }
| {type: "join-room", room: string, newPlayers: Player[], orientation: BoardOrientation}
| {type: "set-orientation", orientation: BoardOrientation}


const reducer = (state: gameSetupType, action: Action) => {
  switch (action.type) {
    case "create-room": {
      return {
        ...state,
        room: action.room,
        orientation: "white"
      }
    }
    case "join-room": {
      return {
        room: action.room,
        orientation: action.orientation,
        players: action.newPlayers,
      }
    }
    case "update-players": {
      return {
        ...state,
        players: action.newPlayers
      }
    }
    case "cleanup-room": {
      return {
        room: "",
        orientation: "",
        players: [],
      }
    }
    case "set-orientation": {
      return {
        ...state,
        orientation: action.orientation
      }
    }
    default:
      throw new Error("Unknown dispatch action type!")
  }
}

export const GameSetUpProvider = ({children}: {children: React.ReactNode}) => {
  const socket = useSocket()
  const [gameSetUpData, dispatch] = useReducer(reducer, {room: "", orientation:"", players:[]})
  const navigate = useNavigate()
  const { username } = useAuth() 

  useEffect(() => {
    console.log(`curr username is ${username}`)
    console.log(`socket is ${socket?.id}`)
    if (!socket) {
      console.log(`no socket in useSocket.`)
      return
    }

    socket.on("message", (message: string) => {
      console.log("in message!")
      const data = JSON.parse(message)
      if (!data.type || !data.payload) {
        console.error("bad message! type field not includeded")
      }
      const payload = data.payload

      if (data.type === "create-game") {
        dispatch({type: "create-room", room: data.payload.gameId})
      }

      if (data.type === "join-game") {
        const players = [{username: payload.white.username}, {username: payload.black.username}]
        if (payload.white.username === username) {
          dispatch({type:"join-room", room: payload.gameId, orientation: "white", newPlayers: players})
        } else if (payload.black.username === username) {
          dispatch({type:"join-room", room: payload.gameId, orientation: "black", newPlayers: players})
        } else {
          console.error("username not in join-game payload!")
          return
        }
        console.log(`players in game are ${players[0].username} ${players[1].username}`)
        navigate("/game")
      }

      
    })

  }, [navigate, socket, username])

  return (
    <GameSetUpContext.Provider value={{...gameSetUpData, dispatch}}>
      {children}
    </GameSetUpContext.Provider>
  )
}
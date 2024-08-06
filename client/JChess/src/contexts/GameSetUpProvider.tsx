import React, { useReducer, useEffect, createContext} from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import socket from "../connections/socket";
import { useNavigate } from "react-router-dom";

export const GameSetUpContext = createContext<gameContextType | null>(null)

interface Player {
  socketId: string
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
  players: {socketId: string}[],
}

type Action = 
| {type: "update-players", newPlayers: Player[]}
| {type: "cleanup-room"}
| {type: "create-room", room: string }
| {type: "join-room", room: string, newPlayers: Player[]}

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
        ...state,
        room: action.room,
        orientation: "black",
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
    default:
      throw new Error("Unknown dispatch action type!")
  }
}

export const GameSetUpProvider = ({children}: {children: React.ReactNode}) => {
  const [gameSetUpData, dispatch] = useReducer(reducer, {room: "", orientation:"", players:[]})
  const navigate = useNavigate()

  useEffect(() => {
    socket.on("opponent-joined", (roomData) => {
      console.log("effect called")
      console.log("roomData", roomData)
      dispatch({type: "update-players", newPlayers: roomData.playerSocketIds})
      navigate("/game")
    });
  }, [navigate])

  useEffect(() => {
    socket.on("message", (message: string) => {
      if (message === `game initialized`) {
        navigate("/game")
      }
    })
  }, [navigate])

  return (
    <GameSetUpContext.Provider value={{...gameSetUpData, dispatch}}>
      {children}
    </GameSetUpContext.Provider>
  )
}
import React, { useReducer, useEffect, useContext, createContext} from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import socket from "../connections/socket";

const GameSetUpContext = createContext<gameContextType | null>(null)

export const useGameSetUp = () => {
  const context = useContext(GameSetUpContext)
  if (context === null) {
    throw new Error("useGameSetUp must be used within a GameSetUpProvider!")
  }
  return context
}

interface Player {
  id: string
}

interface gameContextType {
  room: string,
  orientation: BoardOrientation | string,
  players: Player[],
  dispatch: React.Dispatch<Action>
}

interface gameSetupType {
  room: string,
  orientation: BoardOrientation | string,
  players: {id: string}[],
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

  useEffect(() => {
    socket.on("opponent-joined", (roomData) => {
      console.log("effect called")
      console.log("roomData", roomData)
      dispatch({type: "update-players", newPlayers: roomData.players})
    });
  }, [])

  return (
    <GameSetUpContext.Provider value={{...gameSetUpData, dispatch}}>
      {children}
    </GameSetUpContext.Provider>
  )
}
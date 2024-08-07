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
      console.log(`Message is ${message}`)
      const data = JSON.parse(message)
      if (!data.type || !data.payload) {
        console.error("bad message! type field not includeded")
      }
      const payload = data.payload

      if (data.type === "create-game") {
        dispatch({type: "create-room", room: data.payload.gameId})
      }

      if (data.type === "join-game") {
        const players = [{socketId: payload.white.id}, {socketId: payload.black.id}]
        if (payload.white.id === socket.id) {
          // dispatch({type: "set-orientation", orientation: "white"})
          dispatch({type:"join-room", room: payload.gameId, orientation: "white", newPlayers: players})
        } else if (payload.black.id === socket.id) {
          // dispatch({type: "set-orientation", orientation: "black"})
          dispatch({type:"join-room", room: payload.gameId, orientation: "black", newPlayers: players})
        } else {
          console.error("socket id not in join-game payload!")
          return
        }
  
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
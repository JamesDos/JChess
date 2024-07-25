import React, { useReducer, useEffect, useContext, createContext} from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import socket from "../connections/socket";

const GameSetUpContext = createContext(null)

export const useGame = () => {
  return useContext(GameSetUpContext)
}

interface gameContextType {
  
}

interface gameSetupType {
  room: string,
  orientation: BoardOrientation | string,
  players: {id: string}[],
}

const reducer = (state, action) => {
  switch (action.type) {
    case "update-players": {
      return {
        ...state,
        players: action.newPlayers
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
      dispatch({type: 'update-players', newPlayers: roomData.players})
    });
  }, [])

  return (
    <GameSetUpContext.Provider value={{...gameSetUpData, dispatch}}>
      {children}
    </GameSetUpContext.Provider>
  )
}
import { GameBoard } from "./gameBoard";
import { MoveDisplay } from "../pages/Game/moveDisplay";
import { useState, useReducer } from "react";
import { Move, Color, Square } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";


interface moveData {
  from: string,
  to: string, 
  color: Color, 
  promotion: string,
}

interface GameStatePayload {
  position: string,
  turn: Color,
  history: Move[],
  moveCount: number,
  status: string,
  inCheck: boolean,
  possibleMoves: Move[],
}

interface DisplayPosPayload {
  newMoveNum: number,
  newDisplayPos: string,
  
}

interface GameStateType {
  position: string,
  displayPosition: string,
  draggable: boolean,
  gameHistory: Move[],
  moveCount: number,
  over: string,
  orientation: BoardOrientation,
  inCheck: boolean,
  possibleMoves: Move[]
  turn: Color,
  selectedSquare: Square | null,
  dottedSquares: Square[]
}

const initGameState = (orientation: BoardOrientation) => {
  const startingGameState: GameStateType = {
    position: "start",
    displayPosition: "start",
    draggable: true,
    gameHistory: [],
    moveCount: 1,
    over: "",
    orientation: orientation,
    inCheck: false,
    possibleMoves: [],
    turn: "w",
    selectedSquare: null,
    dottedSquares: []
  }

  return startingGameState
}

type Action =
| {type: "update-game-state", payload: GameStatePayload}
| {type: "set-display-pos", payload: DisplayPosPayload}


const reducer = (state: GameStateType, action: Action) => {
  switch (action.type) {
    case "update-game-state": {
      return {
        ...state,
        position: action.payload.position,
        displayPosition: action.payload.position,
        draggable: (action.payload.turn === state.orientation[0]),
        history: action.payload.history,
        moveCount: action.payload.moveCount,
        inCheck: action.payload.inCheck,
        possibleMoves: action.payload.possibleMoves,
        turn: action.payload.turn,
      }
    
    }

    default:
      throw new Error("Unknown dispatch action type!")
  }
}

export interface BoardDisplayProps {
  orientation: BoardOrientation
}

export const BoardDisplay = (props: BoardDisplayProps) => {

  const [gameState, gameStateDispatch] = useReducer(reducer, props.orientation, initGameState)


  return (
    <div>

      <GameBoard

      />
      <MoveDisplay
      
      />

    </div>
  )
}
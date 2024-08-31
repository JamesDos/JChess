import { GameBoard } from "./gameBoard";
import { MoveDisplay } from "./moveDisplay";
import { useReducer, useEffect } from "react";
import { Move, Color, Square } from "chess.js";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";


interface MoveData {
  from: string,
  to: string, 
  color: Color, 
  promotion: string,
}

export interface GameStatePayload {
  position: string,
  turn: Color,
  history: Move[],
  moveCount: number,
  status: string,
  inCheck: boolean,
  validSquares: ValidSquares,
  draggable: boolean
}

interface DisplayPosPayload {
  newMoveNum: number,
  newDisplayPos: string,
  draggable: boolean,
}

interface HighlightedSquaresPayload {
  square: Square | null,
  newDottedSquares: Square[]
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
  validSquares: ValidSquares, 
  turn: Color,
  selectedSquare: Square | null,
  dottedSquares: Square[]
}

export interface ValidSquares {
  [key: string]: {squares: Square[]}
}

interface InitArgsType {
  orientation: BoardOrientation
  validSquares: ValidSquares
}

const initGameState = (initArgs: InitArgsType) => {
  const startingGameState: GameStateType = {
    position: "start",
    displayPosition: "start",
    draggable: true,
    gameHistory: [],
    moveCount: 1,
    over: "",
    orientation: initArgs.orientation,
    inCheck: false,
    validSquares: initArgs.validSquares,
    turn: "w",
    selectedSquare: null,
    dottedSquares: []
  }

  return startingGameState
}

export type Action =
| {type: "update-game-state", payload: GameStatePayload}
| {type: "update-display-pos", payload: DisplayPosPayload}
| {type: "update-highlighted-squares", payload: HighlightedSquaresPayload}


const reducer = (state: GameStateType, action: Action): GameStateType => {
  switch (action.type) {
    case "update-game-state": {
      return {
        ...state,
        position: action.payload.position,
        displayPosition: action.payload.position,
        draggable: action.payload.draggable,
        gameHistory: action.payload.history,
        moveCount: action.payload.moveCount,
        inCheck: action.payload.inCheck,
        validSquares: action.payload.validSquares,
        turn: action.payload.turn,
      }
    }
    case "update-display-pos": {
      return {
        ...state,
        displayPosition: action.payload.newDisplayPos,
        moveCount: action.payload.newMoveNum,
        selectedSquare: null,
        dottedSquares: [],
        draggable: action.payload.draggable,
      }
    }
    case "update-highlighted-squares": {
      return {
        ...state,
        selectedSquare: action.payload.square,
        dottedSquares: action.payload.newDottedSquares
      }
    }

    default:
      throw new Error("Unknown dispatch action type!")
  }
}

export interface BoardDisplayProps {
  orientation: BoardOrientation,
  recentMove: GameStatePayload | null,
  validSquares: ValidSquares
  onMove: (sourceSquare: Square, targetSquare: Square) => {flags: string, inCheck: boolean} | undefined
}

export const BoardDisplay = (props: BoardDisplayProps) => {

  const [gameState, gameStateDispatch] = useReducer(
    reducer, 
    {
      orientation: props.orientation,
      validSquares: props.validSquares
    },
    initGameState)

  useEffect(() => {
    if (props.recentMove) {
      gameStateDispatch({
        type: "update-game-state",
        payload: props.recentMove
      })
    }
  }, [props.recentMove])




  return (
    <div className="grid grid-cols-2">
      <GameBoard
        inCheck={gameState.inCheck}
        position={gameState.position}
        displayPosition={gameState.displayPosition}
        draggable={gameState.draggable}
        validSquares={gameState.validSquares}
        handleMakeMove={props.onMove}
        orientation={gameState.orientation}
        selectedSquare={gameState.selectedSquare}
        dottedSquares={gameState.dottedSquares}
        dispatch={gameStateDispatch}
      />
      <MoveDisplay
        history={gameState.gameHistory}
        selectedMoveNum={gameState.moveCount}
        dispatch={gameStateDispatch}
      />
    </div>
  )
}
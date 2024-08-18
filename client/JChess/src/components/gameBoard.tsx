import { useSound } from "use-sound";
import { Chessboard } from "react-chessboard";
import { Chess, Square, Move } from 'chess.js';
import { useState } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { Action } from "./boardDisplay";
import { ValidSquares } from "./boardDisplay";

import moveSound from "../assets/audio/move-self.mp3";
import captureSound from "../assets/audio/capture.mp3";
import castleSound from "../assets/audio/castle.mp3";
import promoteSound from "../assets/audio/promote.mp3";
import checkSound from "../assets/audio/move-check.mp3";

export interface GameBoardProps {
  inCheck: boolean,
  validSquares: ValidSquares,
  // chess: Chess,
  position: string,
  displayPosition: string,
  draggable: boolean,
  handleMakeMove: (sourceSquare: Square, targetSquare: Square) => Move | undefined,
  orientation: BoardOrientation,
  selectedSquare: Square | null,
  dottedSquares: Square[],
  dispatch: React.Dispatch<Action>,
}

interface ExtendedMove extends Move {
  inCheck: boolean
}

export const GameBoard = (props: GameBoardProps) => {
  /** Handles all the display logic for ONLY the chessboard */


  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  const playMoveAudio = (move: ExtendedMove) => {
    if (move.inCheck) {
      playCheckSound()
      return;
    }
    const flag = move.flags
    switch (flag) {
      case "c":
      case "pc":
      case "e":
        playCaptureSound()
        break
      case "p":
        playPromoteSound()
        break
      case "k":
      case "q":
        playCastleSound()
        break;
      default:
        playMoveSound()
    }
  }

  // Helper functions
  const getPossibleMoves = (square: Square) => {
    return props.validSquares[square].squares
  }

  const updateHighlightedSquares = (square: Square) => {
    props.dispatch({
      type: "update-highlighted-squares",
      payload: {
        square: square,
        newDottedSquares: getPossibleMoves(square)
      }
    })
  }

  
  // Event handlers
  const handleDropPiece = (sourceSquare: Square, targetSquare: Square) => {
    const move = props.handleMakeMove(sourceSquare, targetSquare)
    if (!move) {
      return false
    }
    playMoveAudio(move)
    if (props.dottedSquares && props.dottedSquares.includes(targetSquare)) {
      props.dispatch({
        type: "update-highlighted-squares",
        payload: {
          square: null,
          newDottedSquares: [sourceSquare, targetSquare]
        }
      })
    }
    return true
  }

  const handleSquareClick = (square: Square) => {
    if (!props.selectedSquare || !props.draggable) {
      return
    }
    if (props.dottedSquares && props.dottedSquares.includes(square)) {
      const move = props.handleMakeMove(props.selectedSquare, square)
      if (!move) {
        return
      }
      playMoveAudio(move)
      props.dispatch({
        type: "update-highlighted-squares",
        payload: {
          square: null,
          newDottedSquares: [props.selectedSquare, square]
        }
      })
    } else {
      updateHighlightedSquares(square)
    }
  }

  const handlePieceClick = (piece: string, square: Square) => {
    if (props.draggable) {
      updateHighlightedSquares(square)
    }
  }

  const handlePieceDragBegin = (piece: string, square: Square) => {
    if (props.draggable) {
      updateHighlightedSquares(square)
    }
  }

  const determineSquareStyles = () => {
    if (!props.dottedSquares) {
      return
    }
    const styles: { [key: string]: { backgroundColor: string } } = {};
    if (props.selectedSquare) {
      styles[props.selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }
    props.dottedSquares.forEach(square => {
      styles[square] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    })
    return styles
  }

  return (
    <Chessboard
    position={props.draggable ? props.position : props.displayPosition}
    onPieceDrop={handleDropPiece}
    arePiecesDraggable={props.draggable}
    onPieceClick={handlePieceClick}
    onSquareClick={handleSquareClick}
    customSquareStyles={determineSquareStyles()}
    onPieceDragBegin={handlePieceDragBegin}
    boardOrientation={props.orientation}
    />
  )
}
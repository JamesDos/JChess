import { useSound } from "use-sound";
import { Chessboard } from "react-chessboard";
import { Chess, Square, Move } from 'chess.js';
import { useState } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

import moveSound from "../assets/audio/move-self.mp3";
import captureSound from "../assets/audio/capture.mp3";
import castleSound from "../assets/audio/castle.mp3";
import promoteSound from "../assets/audio/promote.mp3";
import checkSound from "../assets/audio/move-check.mp3";

export interface GameBoardProps {
  inCheck: boolean,
  possibleMoves: Move[],
  // chess: Chess,
  position: string,
  draggable: boolean,
  handleMakeMove: (sourceSquare: string, targetSquare: string) => Move | null,
  orientation: BoardOrientation,
  // selectedSquare: Square | null,
  // setSelectedSquare: React.Dispatch<React.SetStateAction<Square | null>>,
  // dottedSquares: Square[] | null,
  // setDottedSquares: React.Dispatch<React.SetStateAction<Square[]>>,
}

export const GameBoard = (props: GameBoardProps) => {
  /** Handles all the display logic for ONLY the chessboard */

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [dottedSquares, setDottedSquares] = useState<Square[]>([])

  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  const playMoveAudio = (move: Move) => {
    if (props.chess.inCheck()) {
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
    return props.chess.moves({square: square, verbose: true}).map(move => move.to)
  }

  const updateHighlightedSquares = (sqaure: Square) => {
    props.setSelectedSquare(sqaure)
    props.setDottedSquares(getPossibleMoves(sqaure))
  }

  // Event handlers
  const handleDropPiece = (sourceSquare: Square, targetSquare: Square) => {
    const move = props.handleMakeMove(sourceSquare, targetSquare)
    if (!move) {
      return false
    }
    playMoveAudio(move)
    if (props.dottedSquares && props.dottedSquares.includes(targetSquare)) {
      props.setSelectedSquare(null)
      props.setDottedSquares([sourceSquare, targetSquare])
    }
    return true
  }

  const handleSquareClick = (square: Square) => {
    if (!props.selectedSquare || !props.draggable) {
      return
    }
    if (props.dottedSquares && props.dottedSquares.includes(square)) {
      props.handleMakeMove(props.selectedSquare, square)
      props.setSelectedSquare(null)
      props.setDottedSquares([props.selectedSquare, square])
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
    position={props.position}
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
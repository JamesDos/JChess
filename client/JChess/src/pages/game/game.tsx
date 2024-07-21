import { useState, useEffect, useCallback, useMemo } from "react";
import { useSound } from "use-sound";
import { Chessboard } from "react-chessboard";
import { MoveDisplay } from './moveDisplay';
import { Chess, Square, Move} from 'chess.js';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from "react-router-dom";
// import { useSocket } from "../../contexts/SocketProvider";
import socket from "../../connections/socket";
import './game.css';

import moveSound from "../../assets/audio/move-self.mp3";
import captureSound from "../../assets/audio/capture.mp3";
import castleSound from "../../assets/audio/castle.mp3";
import promoteSound from "../../assets/audio/promote.mp3";
import checkSound from "../../assets/audio/move-check.mp3";

export interface GameProps {
  room: string, 
  orientation: string, 
  players: {id: string}[],
  cleanup: () => void,
}

export const Game = (props: GameProps) => {
  const chess = useMemo(() => new Chess(), []);
  const [displayPosition, setDisplayPosition] = useState('start')
  const [draggable, setDraggable] = useState(true)
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)
  const [selectedSquare, setSelectedSquare] = useState((null as unknown) as Square | null)
  const [dottedSquares, setDottedSquares] = useState(([] as unknown[]) as Square[])
  const [over, setOver] = useState("")
  // const socket = useSocket()

  // sound effects
  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  const checkGameOver = () => {
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        setOver(`Checkmate! ${chess.turn() === "w" ? "black": "white"} wins!`)
      } else if (chess.isDraw()) {
        setOver(`Draw!`)
      } else {
        setOver(`Game Over!`)
      }
    }
  }

  const makeMove = useCallback((moveData) => {
    try {
      const move = chess.move(moveData)
      
      checkGameOver()
      setGameHistory(chess.history({verbose: true}))
      setPosition(chess.fen())
      setDisplayPosition(chess.fen())
      setMoveCount(chess.history().length)
      playMoveAudio(move)

      return move
    } catch (e) { // catch illegal move error
      return null;
    }
  }, [chess])

  const handleMakeMove = (sourceSquare: string, targetSquare: string) => {
    if (chess.turn() != props.orientation[0]) { // chess.turn is 'w' || 'b'
      console.log("Not your turn!")
      return false // prevents players from moving other player's pieces
    }
    if (props.players.length < 2) { // prevents move if both players not connected
      console.log(props.players)
      console.log("At least one player has not connected")
      return false
    }
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: 'q' // always promote to queen for simplicity
    }
    const move = makeMove(moveData)
    if (move === null) {
      return false
    }
    socket.emit("move", { move: move, room: props.room})
    return true
  }

  useEffect(() => {
    socket.on("move", (move) => {
      console.log(`move is ${move}`)
      makeMove(move)
    })
  }, [makeMove])

  const playMoveAudio = (move: Move) => {
    if (chess.inCheck()) {
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

  const handleSetBoardToPos = (pos: string) => {
    setDisplayPosition(pos)
    setDraggable(pos === position)
  }

  const getPossibleMoves = (square: Square) => {
    return chess.moves({square: square, verbose: true}).map(move => move.to)
  }

  const handleDropPiece = (sourceSquare: Square, targetSquare: Square) => {
    if (dottedSquares.includes(targetSquare)) {
      handleMakeMove(sourceSquare, targetSquare)
      setSelectedSquare(null)
      setDottedSquares([sourceSquare, targetSquare])
    }
  }

  const handleSquareClick = (sqaure: Square) => {
    if (dottedSquares.includes(sqaure)) {
      handleMakeMove(selectedSquare, sqaure)
      setSelectedSquare(null)
      setDottedSquares([selectedSquare, sqaure])
    } else {
      updateHighlightedSquares(sqaure)
    }
  }

  const updateHighlightedSquares = (sqaure: Square) => {
    setSelectedSquare(sqaure)
    setDottedSquares(getPossibleMoves(sqaure))
  }

  const resetHighlightedSquares = () => {
    setSelectedSquare(null)
    setDottedSquares([])
  }

  const determineSquareStyles = () => {
    const styles = {}
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }
    dottedSquares.forEach(square => {
      styles[square] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    })
    return styles
  }

  return (
    <div className="game">
      <div className="board">
        <Chessboard 
          position={draggable ? position : displayPosition}
          onPieceDrop={handleDropPiece} 
          arePiecesDraggable={draggable}
          onPieceClick={getPossibleMoves}
          onSquareClick={handleSquareClick}
          customSquareStyles={determineSquareStyles()}
          onPieceDragBegin={(piece, square) => updateHighlightedSquares(square)}
          boardOrientation={props.orientation}
        />
      </div>
      <MoveDisplay
        history={gameHistory}
        setBoard={handleSetBoardToPos}
        selectedMoveNum={moveCount}
        setSelectedMoveNum={setMoveCount}
        resetSquares={resetHighlightedSquares}
        />
    </div>
  )
}

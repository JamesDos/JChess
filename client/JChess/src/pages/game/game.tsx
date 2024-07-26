import { useState, useEffect, useCallback, useMemo } from "react";
import { useSound } from "use-sound";
import { Chessboard } from "react-chessboard";
import { MoveDisplay } from './moveDisplay';
import { Chess, Square, Move, Color} from 'chess.js';
import socket from "../../connections/socket";
import { useGameSetUp } from "../../contexts/GameSetUpProvider";
import './game.css';

import moveSound from "../../assets/audio/move-self.mp3";
import captureSound from "../../assets/audio/capture.mp3";
import castleSound from "../../assets/audio/castle.mp3";
import promoteSound from "../../assets/audio/promote.mp3";
import checkSound from "../../assets/audio/move-check.mp3";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

export interface GameProps {
  room: string, 
  orientation: BoardOrientation | string, 
  players: {id: string}[],
  cleanup: () => void,
}

export interface moveData {
  from: string,
  to: string, 
  color: Color, 
  promotion: string,
}

export const Game = () => {

  const { room, orientation, players, dispatch } = useGameSetUp()

  const chess = useMemo(() => new Chess(), []);
  const [displayPosition, setDisplayPosition] = useState('start')
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [draggable, setDraggable] = useState(true)
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [dottedSquares, setDottedSquares] = useState<Square[]>([])
  const [over, setOver] = useState("")

  // sound effects
  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  // Move Functions

  const checkGameOver = useCallback(() => {
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        setOver(`Checkmate! ${chess.turn() === "w" ? "black": "white"} wins!`)
      } else if (chess.isDraw()) {
        setOver(`Draw!`)
      } else {
        setOver(`Game Over!`)
      }
    }
  }, [chess])

  const playMoveAudio = useCallback((move: Move) => {
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
  }, [chess, playCheckSound, playCaptureSound, playPromoteSound, playCastleSound, playMoveSound])

  const makeMove = useCallback((moveData: moveData) => {
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
  }, [chess, checkGameOver, playMoveAudio])

  const handleMakeMove = (sourceSquare: string, targetSquare: string) => {
    if (chess.turn() != orientation[0]) { // chess.turn is 'w' || 'b'
      console.log("Not your turn!")
      return false // prevents players from moving other player's pieces
    }
    if (players.length < 2) { // prevents move if both players not connected
      console.log(players)
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
    socket.emit("move", { move: move, room: room})
    return true
  }

  // Effects

  useEffect(() => {
    socket.on("move", (move) => {
      console.log(`move is ${move}`)
      makeMove(move)
    })
  }, [makeMove])

  useEffect(() => {
    socket.on("player-disconnected", (player) => {
      setOver(`Opponent with id ${player} has disconnected`)
    })
  }, [])

  useEffect(() => {
    socket.on("close-room", ({roomId}) => {
      if (roomId === room) {
        dispatch({type: "cleanup-room"})
      }
      // if (roomId === props.room) { // check if id of close room is same as current room
      //   props.cleanup()
      // }
    })
  }, [dispatch, room])

  // Helper functions for event handlers

  const handleSetBoardToPos = (pos: string) => {
    setDisplayPosition(pos)
    setDraggable(pos === position)
  }

  const getPossibleMoves = (square: Square) => {
    return chess.moves({square: square, verbose: true}).map(move => move.to)
  }

  const resetHighlightedSquares = () => {
    setSelectedSquare(null)
    setDottedSquares([])
  }

  const updateHighlightedSquares = (sqaure: Square) => {
    setSelectedSquare(sqaure)
    setDottedSquares(getPossibleMoves(sqaure))
  }

  // Event handlers

  const handleDropPiece = (sourceSquare: Square, targetSquare: Square) => {
    const madeMove = handleMakeMove(sourceSquare, targetSquare)
    if (dottedSquares.includes(targetSquare)) {
      setSelectedSquare(null)
      setDottedSquares([sourceSquare, targetSquare])
    }
    return madeMove
  }

  const handleSquareClick = (sqaure: Square) => {
    if (!selectedSquare || !draggable) {
      return
    }
    if (dottedSquares.includes(sqaure)) {
      handleMakeMove(selectedSquare, sqaure)
      setSelectedSquare(null)
      setDottedSquares([selectedSquare, sqaure])
    } else {
      updateHighlightedSquares(sqaure)
    }
  }

  const handlePieceClick = (piece: string, square: Square) => {
    if (draggable) {
      updateHighlightedSquares(square)
    }
  }

  const handlePieceDragBegin = (piece: string, square: Square) => {
    if (draggable) {
      updateHighlightedSquares(square)
    }
  }

  const determineSquareStyles = () => {
    const styles: { [key: string]: { backgroundColor: string } } = {};
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
          onPieceClick={handlePieceClick}
          onSquareClick={handleSquareClick}
          customSquareStyles={determineSquareStyles()}
          onPieceDragBegin={handlePieceDragBegin}
          boardOrientation={orientation as BoardOrientation}
        />
      </div>
      <MoveDisplay
        history={gameHistory}
        setBoard={handleSetBoardToPos}
        selectedMoveNum={moveCount}
        setSelectedMoveNum={setMoveCount}
        resetSquares={resetHighlightedSquares}
        />
      <div className="game-result-container">
        {over}
      </div>
    </div>
  )
}

import { useState, useEffect} from "react";
import { useSound } from "use-sound"
import {Board} from "./components/chessboard/board";
import { MoveDisplay } from './components/moveDisplay/moveDisplay';
import { Chess, Square, Move} from 'chess.js';
import './App.css';

import moveSound from "./assets/audio/move-self.mp3";
import captureSound from "./assets/audio/capture.mp3";
import castleSound from "./assets/audio/castle.mp3";
import promoteSound from "./assets/audio/promote.mp3";
import checkSound from "./assets/audio/move-check.mp3";

import { io } from 'socket.io-client';

const socket = io('http://localhost:3000')

const App = () => {
  const [chess] = useState(new Chess());
  const [displayPosition, setDisplayPosition] = useState('start')
  const [draggable, setDraggable] = useState(true)
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)
  const [selectedSquare, setSelectedSquare] = useState((null as unknown) as Square | null)
  const [dottedSquares, setDottedSquares] = useState(([] as unknown[]) as Square[])

  // sound effects
  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  useEffect(() => {
    socket.on("newMove", (move) => {
      console.log(`newMove is ${move}`)
    })
  }, [socket])


  const handleMakeMove = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      });
      setGameHistory(chess.history({verbose: true}))
      setPosition(chess.fen())
      setDisplayPosition(chess.fen())
      setMoveCount(chess.history().length)
      playMoveAudio(move)
      socket.emit("move", move)
    } catch (error) {
        console.log(error)
    }
  }

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
    <div className="app">
      <Board 
        position={position}
        displayPosition={displayPosition}
        makeMove={handleMakeMove}
        draggable={draggable}
        showPossibleMoves={getPossibleMoves}
        onDrop={handleDropPiece}
        onSquareClick={handleSquareClick}
        setSquareStyles={determineSquareStyles}
        onPieceDragBegin={(piece, square) => updateHighlightedSquares(square)}
      />
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

export default App

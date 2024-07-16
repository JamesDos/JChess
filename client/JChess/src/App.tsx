import { useState } from "react";
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

const App = () => {
  const [chess] = useState(new Chess());
  const [displayPosition, setDisplayPosition] = useState('start')
  const [draggable, setDraggable] = useState(true)
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)
  // sound effects
  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  const makeMove = (sourceSquare: string, targetSquare: string) => {
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

  const setBoardToPos = (pos: string) => {
    setDisplayPosition(pos)
    setDraggable(pos === position)
  }

  const getPossibleMoves = (square: Square) => {
    return chess.moves({square: square, verbose: true}).map(move => move.to)
  }

  return (
    <div className="app">
      <Board 
        position={position}
        displayPosition={displayPosition}
        makeMove={makeMove}
        draggable={draggable}
        getPossibleMoves={getPossibleMoves}
      />
      <MoveDisplay
        history={gameHistory}
        setBoard={setBoardToPos}
        selectedMoveNum={moveCount}
        setSelectedMoveNum={setMoveCount}
        />
    </div>
  )
}

export default App

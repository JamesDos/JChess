import { useState } from "react";
import { useSound } from "use-sound"
import {Board} from "./components/chessboard/board";
import { MoveDisplay } from './components/moveDisplay/moveDisplay';
import { Chess, Square} from 'chess.js';
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

  const onDrop = (sourceSquare: string, targetSquare: string) => {

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
        console.log("Illegal Move!")
    }
  };

  const playMoveAudio = (move) => {
    if (chess.inCheck()) {
      playCheckSound()
      return;
    }
    const flag = move.flags
    console.log(flag)
    console.log("here")
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

  const getGameHistory = () => {
    const rowItemList = []
    for (let i = 0; i < gameHistory.length; i++) {
      const move = gameHistory[i]
      if (i % 2 == 0) { // white move
        rowItemList.push({
          turn: move.before.split(" ").slice(-1),
          white: move.san,
          black: "",
          afterWhiteMovePos: move.after,
          afterBlackMovePos: ""
        })
      } else { // black move
        const latestMove = rowItemList[rowItemList.length - 1]
        latestMove.black = move.san
        latestMove.afterBlackMovePos = move.after
      }
    }
    return rowItemList
  }

  return (
    <div className="app">
      <Board 
        position={position}
        displayPosition={displayPosition}
        onDrop={onDrop}
        draggable={draggable}
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

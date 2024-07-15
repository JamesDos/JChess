import { useState } from "react";
import {Board} from "./components/chessboard/board";
import { MoveDisplay } from './components/moveDisplay/moveDisplay';
import { Chess, Square} from 'chess.js';
import './App.css';


const App = () => {
  const [chess] = useState(new Chess());
  const [displayPosition, setDisplayPosition] = useState('start')
  const [draggable, setDraggable] = useState(true)
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)

  const onDrop = (sourceSquare, targetSquare) => {

    try {
      chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to queen for simplicity
      });
    } catch (error) {
        console.log("Illegal Move!")
    }

    setGameHistory(chess.history({verbose: true}))
    setPosition(chess.fen());
    setDisplayPosition(chess.fen())
    setMoveCount(chess.history().length)
  };

  const setBoardToPos = (pos) => {
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


import { Tile } from "../tile/tile";
import { useState } from "react";
import {ROWS, COLS, Color} from "../types";
import {startingPieces} from "./startingPieces";
import "./board.css";


export const Board = () => {

  const startingBoard = []
  for (let i = 0; i < ROWS; i ++) {
    let color = (i % 2 === 0) ? Color.WHITE : Color.BLACK
    for(let j = 0; j < COLS; j++) {
      let image = ""
      startingPieces.forEach(piece => {
        if (i === piece.xPos && j === piece.yPos) {
          image = piece.image
        }
      })
      startingBoard.push(
      <Tile 
        key={`${i} ${j}`}
        color={color} 
        row={i} 
        col={j}
        pieceImage={image}
        />)
      color = (color === Color.WHITE) ? Color.BLACK : Color.WHITE
    }
  }

  const [board, setBoard] = useState(startingBoard)

  return (
    <div className="board-container">
      {board}
    </div>
  )
}

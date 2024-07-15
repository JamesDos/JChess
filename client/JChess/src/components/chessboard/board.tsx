
import { Tile } from "../tile/tile";
import { useState } from "react";
import {ROWS, COLS, Color} from "../types";
import {startingPieces} from "./startingPieces";
import "./board.css";
import { Chessboard } from "react-chessboard";

let activePiece: HTMLElement | null = null

const grabPiece = (e: React.MouseEvent) => {
  const element = e.target as HTMLElement
  if (element.classList.contains("piece")) {
      console.log(element)
      const x = e.clientX
      const y = e.clientY
      element.style.position = "absolute"
      element.style.left = `${x} px`;
      element.style.top = `${y} px`;
      activePiece = element
  }
}

const movePiece = (e: React.MouseEvent) => {
  if (activePiece) {
    console.log(activePiece)
    const x = e.clientX
    const y = e.clientY
    activePiece.style.position = "absolute"
    activePiece.style.left = `${x} px`;
    activePiece.style.top = `${y} px`;
  } 
}

const dropPiece = (e: React.MouseEvent) => {
  if (activePiece) {
    activePiece = null
  }
}


export const Board = () => {

  const startingBoard = []
  // initialize tile components
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
    <div className="board">
      <div>
        <Chessboard id="Basic-Board"/>
      </div>
    </div>

    // <div 
    //   className="board-container" 
    //   onMouseDown={e => grabPiece(e)}
    //   onMouseMove={e => movePiece(e)}
    //   onMouseUp={e => dropPiece(e)}
    //   >
    //   {board}
    // </div>
  )
}

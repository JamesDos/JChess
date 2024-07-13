
import { Tile } from "../tile/tile";
import { useState } from "react";
import "./board.css";


export const ROWS = 8;
export const COLS = 8;

export interface Piece {
  type: PieceType,
  xPos: number,
  yPos: number,
  image: string,
}

export enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING
}

export const Board = () => {

  let startingBoard = []
  for (let i = 0; i < ROWS; i ++) {
    let isWhite = (i % 2 === 0)
    for(let j = 0; j < COLS; j++) {
      startingBoard.push(
      <Tile 
        isWhite={isWhite} 
        row={i} 
        col={j}/>)
      isWhite = !isWhite
    }
  }

  const [board, setBoard] = useState(startingBoard)

  return (
    <div className="board-container">
      {board}
    </div>
  )
}

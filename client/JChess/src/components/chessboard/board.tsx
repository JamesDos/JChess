
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square} from 'chess.js';
import "./board.css";

export const Board = (props) => {

  return (
    <div className="board">
      <Chessboard
        position={props.draggable ? props.position : props.displayPosition}
        onPieceDrop={props.onDrop} 
        arePiecesDraggable={props.draggable}
        />
    </div>
  );
}

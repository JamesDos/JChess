
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, SQUARES, Square} from 'chess.js';
import "./board.css";

export interface BoardProps {
  position: string,
  displayPosition: string,
  makeMove: (sourceSquare: string, targetSquare: string) => void,
  draggable: boolean,
  getPossibleMoves: (square: Square) => Square[],
}

export const Board = (props: BoardProps) => {

  const [selectedSquare, setSelectedSquare] = useState((null as unknown) as Square | null)
  const [dottedSquares, setDottedSquares] = useState(([] as unknown[]) as Square[])

  const onDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (dottedSquares.includes(targetSquare)) {
      props.makeMove(sourceSquare, targetSquare)
      setSelectedSquare(null)
      setDottedSquares([sourceSquare, targetSquare])
    }
  }

  const onSquareClick = (sqaure: Square) => {
    if (dottedSquares.includes(sqaure)) {
      props.makeMove(selectedSquare, sqaure)
      setSelectedSquare(null)
      setDottedSquares([selectedSquare, sqaure])
    } else {
      updateHighlightedSquares(sqaure)
    }
  }

  const updateHighlightedSquares = (sqaure: Square) => {
    setSelectedSquare(sqaure)
    setDottedSquares(props.getPossibleMoves(sqaure))
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
    <div className="board">
      <Chessboard
        position={props.draggable ? props.position : props.displayPosition}
        onPieceDrop={onDrop} 
        arePiecesDraggable={props.draggable}
        onPieceClick={props.showPossibleMoves}
        onSquareClick={onSquareClick}
        customSquareStyles={determineSquareStyles()}
        onPieceDragBegin={(piece, square) => updateHighlightedSquares(square)}
        />
    </div>
  );
}

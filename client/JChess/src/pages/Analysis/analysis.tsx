
import { Chess, Square, Move, Color, SQUARES} from 'chess.js';
import { useState, useMemo } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { BoardDisplay } from "../../components/BoardDisplay/boardDisplay";

interface MoveData {
  from: string,
  to: string
  promotion: string,
}

export interface GameStatePayload {
  position: string,
  turn: Color,
  history: Move[],
  moveCount: number,
  status: string,
  inCheck: boolean,
  validSquares: ValidSquares,
  draggable: boolean,
}

export interface ValidSquares {
  [key: string]: {squares: Square[]}
}

const getInitialSquares = () => {
  const chess = new Chess()
  const res: ValidSquares = {}
  SQUARES.forEach(square => {
    const validSquares = chess.moves({square: square, verbose: true}).map(move => move.to)
    res[square] = {squares: validSquares}
  })
  return res
}

export const AnalysisPage = () => {

  const chess = useMemo(() => new Chess(), [])
  const [recentMove, setRecentMove] = useState<GameStatePayload | null>(null)
  const [validSquares, setValidSquares] = useState<ValidSquares>(getInitialSquares())
  const [orientation, setOrientation] = useState<BoardOrientation>("white")

  const toggleOrientation = () => {
    console.log("toggling orientation")
    setOrientation(prev => prev === "white" ? "black" : "white")
  }

  const getValidSquares = () => {
    const res: ValidSquares = {}
    SQUARES.forEach(square => {
      const validSquares = chess.moves({square: square, verbose: true}).map(move => move.to)
      res[square] = {squares: validSquares}
    })
    return res
  }

  const getMoveCount = () => {
    const turn = chess.turn()
    const moveNumber = turn === "w" ? chess.moveNumber() - 1 : chess.moveNumber()
    if (turn === "b") {
      return (2 * moveNumber) - 1
    } else {
      return (2 * moveNumber)
    }
  }

  const onMove = (sourceSquare: Square, targetSquare: Square) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' 
      })
      const payload = {
        position: chess.fen(),
        turn: chess.turn(),
        history: chess.history({verbose: true}),
        moveCount: getMoveCount(),
        inCheck: chess.inCheck(),
        validSquares: getValidSquares(),
        status: chess.isCheckmate() ? "COMPLETED" : "ONGOING",
        draggable: true,
      }
      setRecentMove(payload)
      setValidSquares(getValidSquares())
       // draggable: (action.payload.turn === state.orientation[0]),
      return { flags: move.flags, inCheck: chess.inCheck() }
    } catch (err) {
      console.error(err)
    }
  }

  console.log("orientation is ", orientation)

  return (
    <main className="flex h-screen w-screen overflow-x-hidden justify-center items-start mt-8 gap-6 px-12">
      <div className="flex w-[1/4] flex-none h-[10%] pt-8">
        <button 
          className="bg-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleOrientation}
        >
        Flip Board</button>
      </div>
      <div className="w-3/4 flex-none pt-8">
        <BoardDisplay
          onMove={onMove}
          recentMove={recentMove}
          orientation={orientation}
          validSquares={validSquares}
        />
      </div>
    </main>
  )
}
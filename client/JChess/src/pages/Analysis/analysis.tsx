import { MoveDisplay } from "../../components/moveDisplay"
import { GameBoard } from "../../components/BoardDisplay/gameBoard";
import { Chess, Square, Move, Color, SQUARES} from 'chess.js';
import { useState, useMemo, useCallback } from "react";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { BoardDisplay } from "../../components/BoardDisplay/boardDisplay";

interface MoveData {
  from: string,
  to: string
  promotion: string,
}

// export const AnalysisPage = () => {
//   const chess = useMemo(() => new Chess(), [])
//   const [position, setPosition] = useState("start")
//   const [displayPosition, setDisplayPosition] = useState("start")
//   const [moveCount, setMoveCount] = useState(1)
//   const [orientation, setOrientation] = useState<BoardOrientation>("white")

//   const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
//   const [dottedSquares, setDottedSquares] = useState<Square[]>([])

  // const makeAMove = (moveData: MoveData) => {
  //   const move = chess.move(moveData)
    
  //   setPosition(chess.fen())
  //   setDisplayPosition(chess.fen())
  //   setMoveCount(chess.history().length)

  //   return move
  // }

//   const onDrop = (sourceSquare: string, targetSquare: string) => {
//     const move = makeAMove({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: "q", // always promote to a queen for example simplicity
//     });

//     // illegal move
//     return move
//   }

//   const setBoardToPos = (pos: string) => {
//     setDisplayPosition(pos)
//   }

//   const resetHighlightedSquares = () => {
//     setSelectedSquare(null)
//     setDottedSquares([])
//   }

  // const toggleOrientation = () => {
  //   setOrientation(prev => prev === "white" ? "black" : "white")
  // }

//   return (
//     <div className="grid grid-cols-4 h-screen place-items-center">
//       <div className="col-span-1">
//         <button onClick={toggleOrientation}>Flip Board</button>
//       </div>
//       <div className="col-span-2 flex place-items-center w-5/6">
//         <GameBoard
//           position={displayPosition}
//           draggable={true}
//           handleMakeMove={onDrop}
//           orientation={orientation}
//           selectedSquare={selectedSquare}
//           setSelectedSquare={setSelectedSquare}
//           dottedSquares={dottedSquares}
//           setDottedSquares={setDottedSquares}
//         />
//       </div>
//       <div className="col-span-1 flex justify-center h-96 w-11/12">
//         <div className="flex-1">
//           <MoveDisplay 
//             history={chess.history({verbose: true})}
//             setBoard={setBoardToPos}
//             selectedMoveNum={moveCount}
//             setSelectedMoveNum={setMoveCount}
//             resetSquares={resetHighlightedSquares}
//             players={[{username: "player1"}, {username: "player2"}]}
//           />
//         </div>
//       </div>
//     </div>
//   )
// }

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

  return (
    <main>
      <div className="col-span-1">
        <button onClick={toggleOrientation}>Flip Board</button>
      </div>
      <BoardDisplay
        onMove={onMove}
        recentMove={recentMove}
        orientation={orientation}
        validSquares={validSquares}
      />
    </main>
  )
}
import { useState, useEffect, useCallback, useMemo, useReducer } from "react";
import { useSound } from "use-sound";
import { Chessboard } from "react-chessboard";
import { MoveDisplay } from './moveDisplay';
import { Chess, Square, Move, Color} from 'chess.js';
// import socket from "../../connections/socket";
import useGameSetUp from "../../hooks/useGameSetUp";
import { useNavigate } from "react-router-dom";
// import useLocalStorage from "../../hooks/useLocalStorage";
import { useSocket } from "../../hooks/useSocket";
import { GameBoard } from "../../components/gameBoard";
import './game.css';

import moveSound from "../../assets/audio/move-self.mp3";
import captureSound from "../../assets/audio/capture.mp3";
import castleSound from "../../assets/audio/castle.mp3";
import promoteSound from "../../assets/audio/promote.mp3";
import checkSound from "../../assets/audio/move-check.mp3";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

interface moveData {
  from: string,
  to: string, 
  color: Color, 
  promotion: string,
}

interface GameStatePayload {
  position: string,
  turn: Color,
  history: Move[],
  moveCount: number,
  status: string,
  inCheck: boolean,
  possibleMoves: Move[],
}

interface DisplayPosPayload {
  newMoveNum: number,
  newDisplayPos: string,
  
}

// interface MovePayload extends GameStatePayload {
//   inCheck: boolean,
//   possibleMoves: Move[],
// }

interface GameStateType {
  position: string,
  displayPosition: string,
  draggable: boolean,
  gameHistory: Move[],
  moveCount: number,
  over: string,
  orientation: string,
  inCheck: boolean,
  possibleMoves: Move[]
  turn: Color,
}

type Action =
| {type: "update-game-state", payload: GameStatePayload}
| {type: "set-display-pos", payload: }



const initGameState = (orientation: string) => {
  const startingGameState: GameStateType = {
    position: "start",
    displayPosition: "start",
    draggable: true,
    gameHistory: [],
    moveCount: 1,
    over: "",
    orientation: orientation,
    inCheck: false,
    possibleMoves: [],
    turn: "w"
  }

  return startingGameState
}

const reducer = (state: GameStateType, action: Action) => {
  switch (action.type) {
    case "update-game-state": {
      return {
        ...state,
        position: action.payload.position,
        displayPosition: action.payload.position,
        draggable: (action.payload.turn === state.orientation[0]),
        history: action.payload.history,
        moveCount: action.payload.moveCount,
        inCheck: action.payload.inCheck,
        possibleMoves: action.payload.possibleMoves,
        turn: action.payload.turn,
      }
    
    }



    default:
      throw new Error("Unknown dispatch action type!")
  }
}

export const Game = () => {


  // TODO: Refactor code to rely on socket data rather than react state data
  const { room, orientation, players, dispatch } = useGameSetUp()

  const socket = useSocket()

  const [gameState, gameStateDispatch] = useReducer(reducer, orientation, initGameState)

  const chess = useMemo(() => new Chess(), []);
  const [displayPosition, setDisplayPosition] = useState('start')
  const [position, setPosition] = useState('start'); // fen string representation of position
  const [draggable, setDraggable] = useState(true)
  const [gameHistory, setGameHistory] = useState(chess.history({verbose: true}))
  const [moveCount, setMoveCount] = useState(1)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const [dottedSquares, setDottedSquares] = useState<Square[]>([])
  const [over, setOver] = useState("")

  // sound effects
  const [playMoveSound] = useSound(moveSound)
  const [playCaptureSound] = useSound(captureSound)
  const [playCastleSound] = useSound(castleSound)
  const [playPromoteSound] = useSound(promoteSound)
  const [playCheckSound] = useSound(checkSound)

  const navigate = useNavigate()

  // Move Functions
  const checkGameOver = useCallback(() => {
    if (chess.isGameOver()) {
      if (chess.isCheckmate()) {
        setOver(`Checkmate! ${chess.turn() === "w" ? "black": "white"} wins!`)
        console.log(chess.pgn())
      } else if (chess.isDraw()) {
        setOver(`Draw!`)
      } else {
        setOver(`Game Over!`)
      }
    }
  }, [chess])

  const playMoveAudio = useCallback((move: Move) => {
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
  }, [chess, playCheckSound, playCaptureSound, playPromoteSound, playCastleSound, playMoveSound])

  const makeMove = useCallback((moveData: moveData) => {
    try {
      const move = chess.move(moveData)
      
      checkGameOver()
      setGameHistory(chess.history({verbose: true}))
      setPosition(chess.fen())
      setDisplayPosition(chess.fen())
      setMoveCount(chess.history().length)
      playMoveAudio(move)

      return move
    } catch (e) { // catch illegal move error
      return null;
    }
  }, [chess, checkGameOver, playMoveAudio])

  // const handleMakeMove = (sourceSquare: string, targetSquare: string) => {
  //   if (chess.turn() != orientation[0]) { // chess.turn is 'w' || 'b'
  //     console.log("Not your turn!")
  //     return false // prevents players from moving other player's pieces
  //   }
  //   if (players.length < 2) { // prevents move if both players not connected
  //     console.log(`At least one player has not connected. Curr players are ${players}`)
  //     return false
  //   }
  //   const moveData = {
  //     from: sourceSquare,
  //     to: targetSquare,
  //     color: chess.turn(),
  //     promotion: 'q' // always promote to queen for simplicity
  //   }
  //   const move = makeMove(moveData)
  //   if (move === null) {
  //     return false
  //   }
  //   socket?.emit("move", { move: move, roomId: room })
  //   return true
  // }

  const handleMakeMove = (sourceSquare: string, targetSquare: string) => {
    if (gameState.turn != gameState.orientation[0]) { // chess.turn is 'w' || 'b'
      console.log("Not your turn!")
      return false // prevents players from moving other player's pieces
    }
    if (players.length < 2) { // prevents move if both players not connected
      console.log(`At least one player has not connected. Curr players are ${players}`)
      return false
    }
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: gameState.turn,
      promotion: 'q' // always promote to queen for simplicity
    }
    const move = makeMove(moveData)
    if (move === null) {
      return false
    }
    socket?.emit("move", { move: move, roomId: room })
    return true
  }

  const handleResign = (e: React.MouseEvent) => {
    e.preventDefault()
    socket?.emit("resign", {roomId: room})
  }

  const updateGameState = useCallback((payload: GameStatePayload) => {
    console.log("restoring game state....")
    setPosition(payload.position)
    setDisplayPosition(payload.position)
    setDraggable(payload.turn === orientation[0])
    setGameHistory(payload.history)
    setMoveCount(payload.moveCount)
  }, [orientation])

  // Effects
  useEffect(() => {
    socket?.on("message", (message: string) => {
      const data = JSON.parse(message)
      console.log(`message received: ${data}`)
      if (!data.type || !data.payload) {
        console.error("bad message! type or payload field not included")
      }
      const payload = data.payload

      if (data.type === "init-game") {
        updateGameState(payload)
      }

      if (data.type === "move") {
        const move = payload.move
        makeMove(move)
      }
      
      if (data.type === "user-reconnect") {
  
        console.log(`restored gameState is ${JSON.stringify(payload)}`)
        updateGameState(payload)

      }

      if (data.type === "game-over") {
        console.log(`final pgn is ${payload.pgn}`)
      }

      if (data.type === "game-resign") {
        const resigner = payload.resigner
        const winner = payload.winner
        const message = `${resigner.color} resigns! ${winner.color} wins!`
        setOver(message)
        chess.setComment(`${resigner.color} resigns`)
      }


    })
  }, [makeMove, socket, chess, updateGameState])


  // useEffect(() => {
  //   socket.on("move", (move) => {
  //     console.log(`move is ${move}`)
  //     makeMove(move)
  //   })
  // }, [makeMove])

  // useEffect(() => {
  //   socket.on("opponent-resign", (message) => {
  //     setOver(message)
  //     setDraggable(false)
  //   })
  // }, [])

  // useEffect(() => {
  //   socket.on("player-disconnected", (player) => {
  //     console.log(`Opponent with id ${player} has disconnected`)
  //     setOver(`Opponent with id ${player} has disconnected`)
  //   })
  // }, [])

  // useEffect(() => {
  //   socket.on("close-room", ({roomId}) => {
  //     if (roomId === room) {
  //       dispatch({type: "cleanup-room"})
  //     }
  //   })
  // }, [dispatch, room])

  // Helper functions for event handlers
  const handleSetBoardToPos = (pos: string) => {
    setDisplayPosition(pos)
    setDraggable(pos === position)
  }

  const getPossibleMoves = (square: Square) => {
    return chess.moves({square: square, verbose: true}).map(move => move.to)
  }

  const resetHighlightedSquares = () => {
    setSelectedSquare(null)
    setDottedSquares([])
  }

  const updateHighlightedSquares = (sqaure: Square) => {
    setSelectedSquare(sqaure)
    setDottedSquares(getPossibleMoves(sqaure))
  }

  // Event handlers
  const handleDropPiece = (sourceSquare: Square, targetSquare: Square) => {
    const madeMove = handleMakeMove(sourceSquare, targetSquare)
    if (dottedSquares.includes(targetSquare)) {
      setSelectedSquare(null)
      setDottedSquares([sourceSquare, targetSquare])
    }
    return madeMove
  }

  const handleSquareClick = (sqaure: Square) => {
    if (!selectedSquare || !draggable) {
      return
    }
    if (dottedSquares.includes(sqaure)) {
      handleMakeMove(selectedSquare, sqaure)
      setSelectedSquare(null)
      setDottedSquares([selectedSquare, sqaure])
    } else {
      updateHighlightedSquares(sqaure)
    }
  }

  const handlePieceClick = (piece: string, square: Square) => {
    if (draggable) {
      updateHighlightedSquares(square)
    }
  }

  const handlePieceDragBegin = (piece: string, square: Square) => {
    if (draggable) {
      updateHighlightedSquares(square)
    }
  }

  const determineSquareStyles = () => {
    const styles: { [key: string]: { backgroundColor: string } } = {};
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }
    dottedSquares.forEach(square => {
      styles[square] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    })
    return styles
  }

  const handleBackToLobby = (e: React.MouseEvent) => {
    e.preventDefault()
    socket?.emit("close-room", {roomId: room})
    navigate("/lobby")
  }

  return (
    <div className="grid grid-cols-4 h-screen place-items-center">
      <div className="col-span-1">
        Hello
      </div>
      <div className="col-span-2 size-5/6">
        <Chessboard 
          position={draggable ? position : displayPosition}
          onPieceDrop={handleDropPiece} 
          arePiecesDraggable={draggable}
          onPieceClick={handlePieceClick}
          onSquareClick={handleSquareClick}
          customSquareStyles={determineSquareStyles()}
          onPieceDragBegin={handlePieceDragBegin}
          boardOrientation={orientation as BoardOrientation}
        />
        <GameBoard
          inCheck={gameState.inCheck}
          possibleMoves={gameState.possibleMoves}
          position={gameState.position}
          draggable={gameState.draggable}
          handleMakeMove={handleMakeMove}
          orientation={gameState.orientation}
        />
      </div>
      <div className="col-span1">
        <MoveDisplay
          history={gameHistory}
          setBoard={handleSetBoardToPos}
          selectedMoveNum={moveCount}
          setSelectedMoveNum={setMoveCount}
          resetSquares={resetHighlightedSquares}
          players={players}
        />
        <MoveDisplay
          history={gameState.history}
        />
      </div>
      <div>
        {players.map(player => player.username)}
      </div>
      {over === "" 
        ?  
        <button onClick={handleResign}>Resign</button>
        :
       <div className="game-result-container">
          {over}
          <button onClick={handleBackToLobby}>Back to Lobby</button>
        </div>
      }
    </div>
  )
}

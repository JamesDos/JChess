import { useState, useEffect, useCallback } from "react";
import { Square, Move, Color} from 'chess.js';
// import socket from "../../connections/socket";
import useGameSetUp from "../../hooks/useGameSetUp";
import { useNavigate } from "react-router-dom";
// import useLocalStorage from "../../hooks/useLocalStorage";
import { useSocket } from "../../hooks/useSocket";
import { BoardDisplay } from "../../components/BoardDisplay/boardDisplay";
import './game.css';

import { BoardOrientation } from "react-chessboard/dist/chessboard/types";

interface moveData {
  from: string,
  to: string, 
  promotion: string,
}

export interface ValidSquares {
  [key: string]: {squares: Square[]}
}

interface GameStatePayload {
  position: string,
  turn: Color,
  history: Move[],
  moveCount: number,
  status: string,
  inCheck: boolean,
  validSquares: ValidSquares,
  draggable: boolean,
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


export const Game = () => {


  // TODO: Refactor code to rely on socket data rather than react state data
  const { room, orientation, players, dispatch } = useGameSetUp()

  const socket = useSocket()


  const [gameState, setGameState] = useState<GameStatePayload | null>(null)



  const [over, setOver] = useState("")


  const navigate = useNavigate()

  const handleSetGameState = useCallback((payload: any) => {
    console.log(`curr orientation is ${orientation}`)
    const newGameState = {
      position: payload.position,
      turn: payload.turn,
      history: payload.history,
      moveCount: payload.moveNumber,
      inCheck: payload.inCheck,
      validSquares: payload.validSquares,
      draggable: payload.draggable,
      status: payload.status
    }
    console.log("setting game state")
    setGameState(newGameState)
  }, [orientation])

  // Move Functions
  const onMove = (sourceSquare: Square, targetSquare: Square) => {
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    }
    socket?.emit("move", { move: moveData, roomId: room}, (res: any) => {
      setGameState(res)
    })

  }

  const handleResign = (e: React.MouseEvent) => {
    e.preventDefault()
    socket?.emit("resign", {roomId: room})
  }

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
        handleSetGameState(payload)
      }

      if (data.type === "move") {
        handleSetGameState(payload)
      }
      
      // TODO: figure out why user-reconnect is called but not join-game
      // After reload turns white
      if (data.type === "user-reconnect") {
        
        console.log(`restored gameState is ${JSON.stringify(payload)}`)
        handleSetGameState(payload)

      }

      if (data.type === "game-over") {
        console.log(`final pgn is ${payload.pgn}`)
      }

      // if (data.type === "game-resign") {
      //   const resigner = payload.resigner
      //   const winner = payload.winner
      //   const message = `${resigner.color} resigns! ${winner.color} wins!`
      //   setOver(message)
      //   chess.setComment(`${resigner.color} resigns`)
      // }
    })

    // return () => {
    //   console.log("closing socket from receiving messages")
    //   socket?.off("message")
    // }
  }, [socket, handleSetGameState])


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
      <div className="col-span-3 size-5/6">
        <BoardDisplay
          onMove={onMove}
          orientation={orientation as BoardOrientation}
          recentMove={gameState}
          validSquares={gameState?.validSquares as ValidSquares}
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

import { Socket } from "socket.io";
import { Chess, Move } from "chess.js";
import { v4 as uuidv4 } from 'uuid';
import { socketManager } from "./SocketManager";
import { User } from "./SocketManager";
import { JOIN_GAME, MOVE } from "./messages";

export type GameStatus = "ONGOING" | "PENDING" | "OVER"
export type GameResult = "WHITE_WIN" | "BLACK_WIN" | "DRAW"

export class Game {

  public gameId: string
  public player1UserId: string // player 1 is white
  public player2UserId: string | null // player 2 is black
  private chess: Chess
  private startTime: Date
  private status: GameStatus
  private result: GameResult | null
  private moveCount: number

  constructor(player1: string, player2: string | null) {
    this.player1UserId = player1
    this.player2UserId = null
    this.chess = new Chess()
    this.startTime = new Date()
    this.gameId = uuidv4()
    this.status = "PENDING"
    this.result = null
    this.moveCount = 0
  }

  addPlayer2(player2UserId: string) {
    this.player2UserId = player2UserId
    this.status = "ONGOING"

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: JOIN_GAME,
        payload: {
          gameId: this.gameId,
          white: {
            id: this.player1UserId
          },
          black: {
            id: this.player2UserId
          }
        }
      })
    )
  }

  makeMove(user: User, move: Move) {
    // move validation (ensures white can't move black's pieces and vice versa)
    if (this.chess.turn() == "w" && user.id !== this.player1UserId) {
      return 
    }
    if (this.chess.turn() == "b" && user.id !== this.player2UserId) {
      return
    }

    if (this.status === "OVER") {
      console.log("user making move after game ended")
      return
    }

    try {
      console.log(`received move is ${move}`)
      this.chess.move(move)
    } catch (err) {
      console.error(err)
    }

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE, 
        payload: {
          move: move,
          history: this.chess.history({verbose: true}),
          fen: this.chess.fen()

        }
      })
    )

    if (this.chess.isGameOver()) {
      if (this.chess.isDraw()) {
        this.result = "DRAW"
      } else if (this.chess.isCheckmate()) {
        const result = this.chess.turn() === "b" ? "WHITE_WIN" : "BLACK_WIN"
        this.result = result
        this.endGame()
      } else {
        console.log("error: some other result")
      }
    }

    this.moveCount += 1
  }

  endGame() {
    socketManager.broadcast(
      this.gameId,
      "game ended"
    )
  }

}
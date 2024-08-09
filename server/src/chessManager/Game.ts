import { Socket } from "socket.io";
import { Chess, Move } from "chess.js";
import { v4 as uuidv4 } from 'uuid';
import { socketManager } from "./SocketManager";
import { GameUser } from "./SocketManager";
import { GAME_OVER, JOIN_GAME, MOVE } from "./messages";
import { gameModel as DBGAME } from "../models/game";
import User from "../models/user";

export type GameStatus = "ONGOING" | "PENDING" | "COMPLETED" | "ABANDONED" | "ABORT"
export type GameResult = "WHITE_WIN" | "BLACK_WIN" | "DRAW"

export class Game {

  public gameId: string
  public player1UserId: string // player 1 is white
  public player2UserId: string | null // player 2 is black
  private chess: Chess
  private startTime: Date
  public status: GameStatus
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

  async addPlayer2(player2UserId: string) {
    this.player2UserId = player2UserId
    this.status = "ONGOING"
    this.setPgnHeaders()

    let whitePlayer
    let blackPlayer
    try {
      whitePlayer = await User.findById(this.player1UserId)
      blackPlayer = await User.findById(this.player2UserId)
    } catch (err) {
      console.error(err)
    }

    if (!whitePlayer || !blackPlayer) {
      console.log("whitePlayer or blackPlayer ids not found in db when joining game!")
      return
    }

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: JOIN_GAME,
        payload: {
          gameId: this.gameId,
          white: {
            username: whitePlayer.username,
            id: this.player1UserId
          },
          black: {
            username: blackPlayer.username,
            id: this.player2UserId
          }
        }
      })
    )
  }

  async createGameInDb() {
    this.startTime = new Date(Date.now())
    const newGame = new DBGAME({
      gameId: this.gameId,
      date: this.startTime,
      pgn: this.chess.pgn(),
      white: this.player1UserId,
      black: this.player2UserId
    })
    try {
      await newGame.save()
    } catch (err) {
      console.error(err)
    }
  }

  setPgnHeaders() {
    if (!this.player2UserId) {
      console.log("player2 not in game! cannot set pgn headers")
      return
    }
    this.chess.header(
      "White", this.player1UserId,
      "Black", this.player2UserId,
      "Site", "JChess",
    )
  }

  makeMove(user: GameUser, move: Move) {
    // move validation (ensures white can't move black's pieces and vice versa)
    if (this.chess.turn() == "w" && user.id !== this.player1UserId) {
      return 
    }
    if (this.chess.turn() == "b" && user.id !== this.player2UserId) {
      return
    }

    if (this.status === "COMPLETED") {
      console.log("user making move after game ended")
      return
    }

    try {
      console.log(`received move is ${move}`)
      this.chess.move(move)
    } catch (err) {
      console.error(err)
    }

    this.moveCount += 1

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE, 
        payload: {
          move: move,
          history: this.chess.history({verbose: true}),
          fen: this.chess.fen(),
          moveCount: this.moveCount
        }
      })
    )

    if (this.chess.isGameOver()) {
      this.endGame()
    }
  }

  endGame() {
    this.status = "COMPLETED"
    if (this.chess.isDraw()) {
      this.result = "DRAW"
    } else if (this.chess.isCheckmate()) {
      const result = this.chess.turn() === "b" ? "WHITE_WIN" : "BLACK_WIN"
      this.result = result
    } else if (this.chess.getComment() === "white resign") {
      this.result = "BLACK_WIN"
    } else if (this.chess.getComment() === "black resign") {
      this.result = "WHITE_WIN"
    } else {
      console.error("error: some other result??")
      return
    }

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          result: this.result,
          status: this.status,
          pgn: this.chess.pgn()
        }
      })
    )
  }

  resign(user: GameUser) {
    if (user.id === this.player1UserId) {
      this.chess.setComment("white resign")
    } else if (user.id === this.player2UserId) {
      this.chess.setComment("black resign")
    } else {
      console.error("User not in game!")
    }
    this.endGame()
  }

  drawRequest(user: GameUser) {

  }

}
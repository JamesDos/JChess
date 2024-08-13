import { Socket } from "socket.io";
import { Chess, Move } from "chess.js";
import { v4 as uuidv4 } from 'uuid';
import { socketManager } from "./SocketManager";
import { GameUser } from "./SocketManager";
import { GAME_OVER, JOIN_GAME, MOVE, GAME_RESIGN } from "./messages";
import { gameModel as DBGame } from "../models/game";
import { moveModel as DBMove } from "../models/move";
import User from "../models/user";

export type GameStatus = "ONGOING" | "PENDING" | "COMPLETED" | "ABANDONED" | "ABORT"
export type GameResult = "WHITE_WIN" | "BLACK_WIN" | "DRAW"

export class Game {

  public gameId: string
  public player1UserId: string // player 1 is white
  public player2UserId: string | null // player 2 is black
  public player1Username: string
  public player2Username: string
  private chess: Chess
  private startTime: Date
  public status: GameStatus
  public result: GameResult | null
  private moveNumber: number

  constructor(player1UserId: string, player1Username: string) {
    this.player1UserId = player1UserId
    this.player1Username = player1Username
    this.player2UserId = null
    this.player2Username = ""
    this.chess = new Chess()
    this.startTime = new Date()
    this.gameId = uuidv4()
    this.status = "PENDING"
    this.result = null
    this.moveNumber = 0
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

    try {
      await this.createGameInDb()
    } catch (err) {
      console.error(err)
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
    // Only call when player2 joins game
    this.startTime = new Date(Date.now())
    const newGame = new DBGame({
      gameId: this.gameId,
      date: this.startTime,
      pgn: this.chess.pgn(),
      currentPosition: this.chess.fen(),
      white: this.player1UserId,
      black: this.player2UserId
    })
    await newGame.save()
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

  async addMoveToDb(move: Move) {
    const addedMove = new DBMove({
      gameId: this.gameId,
      moveNumber: this.moveNumber, 
      before: move.before,
      after: move.after,
      color: move.color,
      piece: move.piece,
      from: move.from,
      to: move.to,
      san: move.san,
      flags: move.flags
    })
    await addedMove.save()
    await DBGame.findOneAndUpdate({gameId: this.gameId}, {currentPosition: move.after})
  }

  async makeMove(user: GameUser, move: Move) {
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

    this.moveNumber += 1

    try {
      await this.addMoveToDb(move)
    } catch (err) {
      console.error(err)
      return
    }

    socketManager.broadcast(
      this.gameId,
      JSON.stringify({
        type: MOVE, 
        payload: {
          move: move,
          history: this.chess.history(),
          fen: this.chess.fen(),
          moveNumber: this.moveNumber
        }
      })
    )

    if (this.chess.isGameOver()) {
      this.endGame("COMPLETED")
    }
  }

  endGame(status: GameStatus) {
    this.status = status
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
    let resigner
    let winner
    if (user.id === this.player1UserId) {
      this.chess.setComment("white resign")
      resigner = { username: this.player1Username, id: this.player1UserId, color: "white"}
      winner = {username: this.player2Username, id: this.player2UserId, color: "black"}
    } else if (user.id === this.player2UserId) {
      this.chess.setComment("black resign")
      resigner = {username: this.player2Username, id: this.player2UserId, color: "black"}
      winner = { username: this.player1Username, id: this.player1UserId, color: "white"}
    } else {
      console.error("User not in game!")
      return
    }
    socketManager.broadcast(this.gameId, JSON.stringify({
      type: GAME_RESIGN,
      payload: {
        gameId: this.gameId,
        resigner: {...resigner},
        winner: {...winner}
      }
    }));
    this.endGame("COMPLETED")
  }

  drawRequest(user: GameUser) {
    // TODO: Implement draw request 
  }

}
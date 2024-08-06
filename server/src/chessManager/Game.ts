import { Socket } from "socket.io";
import { Chess } from "chess.js";
import { v4 as uuidv4 } from 'uuid';

export type GameStatus = "ONGOING" | "PENDING" | "OVER"

export class Game {

  public roomId: string
  private player1: Socket // player 1 is white
  private player2: Socket | null // player 2 is black
  private chess: Chess
  private startTime: Date
  private isPending: GameStatus

  constructor(player1: Socket, roomId: string) {
    this.player1 = player1
    this.player2 = null
    this.chess = new Chess()
    this.startTime = new Date()
    this.roomId = roomId
    this.isPending = "PENDING"
  }

  addPlayer2(player2Socket: Socket) {
    this.player2 = player2Socket
    this.isPending = "ONGOING"
  }

  makeMove(socket: Socket, move: string) {
    // move validation (ensures white can't move black's pieces and vice versa)
    if (this.chess.turn() == "w" && socket !== this.player1) {
      return 
    }
    if (this.chess.turn() == "b" && socket !== this.player2) {
      return
    }


    try {
      this.chess.move(move)
    } catch (err) {
      console.error(err)
    }

    if (this.chess.isGameOver()) {

    }
  }

}
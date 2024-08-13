import { Server, Socket } from "socket.io";
import { Game } from "./Game";
import { GameUser, socketManager } from "./SocketManager";
import * as messages from "./messages";

class GameManager {
  private static instance: GameManager
  private games: Game[]
  private users: GameUser[]

  constructor() {
    this.games = []
    this.users = []
  }

  static getInstance() {
    if (GameManager.instance) {
      return GameManager.instance
    }
    GameManager.instance = new GameManager()
    return GameManager.instance
  }

  addGame(game: Game) {
    this.games.push(game)
  }

  removeGame(gameId: string) {
    this.games = this.games.filter(game => game.gameId != gameId)
  }

  findGame(gameId: string) {
    return this.games.find(g => g.gameId === gameId)
  }

  addUser(user: GameUser) {
    this.users.push(user)
  }

  addUserToGame(user: GameUser, gameId: string) {
    socketManager.addUser(user, gameId)
  }

  removeUser(socket: Socket) {
    const user = this.users.find(user => user.socket.id === socket.id)
    if (!user) {
      console.error("user not founded")
      return
    }
    this.users = this.users.filter(user => user.socket.id !== socket.id)
    socketManager.removeUser(user)
  }

  findGamesWithUser(user: GameUser) {
    return this.games.filter(g => g.status === "PENDING" && g.player1UserId === user.id)
  }

  getAllPendingGames() {
    return this.games.filter(g => g.status === "PENDING")
  }

}

export const gameManager = GameManager.getInstance()







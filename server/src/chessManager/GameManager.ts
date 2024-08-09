import { Server, Socket } from "socket.io";
import { Game } from "./Game";
import { User, socketManager } from "./SocketManager";
import * as messages from "./messages";

class GameManager {
  private static instance: GameManager
  private games: Game[]
  private users: User[]

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

  addUser(user: User) {
    this.users.push(user)
  }

  addUserToGame(user: User, gameId: string) {
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

  getAllPendingGames() {
    return this.games.find(g => g.status === "PENDING")
  }

}

export const gameManager = GameManager.getInstance()







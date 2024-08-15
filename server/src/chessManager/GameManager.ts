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
    socketManager.removeUser(user.id)
  }

  getUser(userId: string) {
    return this.users.find(u => u.id === userId)
  }

  findGamesWithUser(user: GameUser) {
    return this.games.filter(g => g.status === "PENDING" && g.player1UserId === user.id)
  }

  getAllPendingGames() {
    return this.games.filter(g => g.status === "PENDING")
  }

  getAllActiveUserGames(user: GameUser) {
    console.log(`Curr user id is ${user.id}`)
    const activeGames = this.games.find(g => { 
      return (g.status === "ONGOING") && (g.player1UserId === user.id || g.player2UserId === user.id)
    })
    console.log("logging all active games:")
    this.getAllGames().forEach(g => {
      console.log(`gameId: ${g.id} status: ${g.status} white: ${g.white} black: ${g.black}`)
    })
    return activeGames
  }

  getAllGames() {
    return (
      this.games.map(g => ({
        id: g.gameId,
        status: g.status,
        white: g.player1UserId,
        black: g.player2UserId,
      }))
    )
  }

}

export const gameManager = GameManager.getInstance()







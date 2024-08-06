import { Server, Socket } from "socket.io";
import { Game } from "./Game";
import { User, socketManager } from "./SocketManager";

class GameManager {
  private static instance: GameManager
  private games: Game[]
  private users: User[]

  constructor() {
    this.games = []
  }

  static getInstance() {
    if (GameManager.instance) {
      return GameManager.instance
    }
    GameManager.instance = new GameManager()
    return GameManager.instance
  }

  // createGame(player1Socket: Socket) {
  //   const room = socketManager.createRoom(player1Socket.id)
  //   const game = new Game(player1Socket, room.roomId)
  //   this.games.push(game)
  // }

  joinGame(player2Socket: Socket, roomId: string) {
    const game = this.games.find(game => game.roomId == roomId)
    if (!game) {
      console.log("game not found")
    } else {
      game.addPlayer2(player2Socket)
    }
  }

  removeGame(roomId) {
    this.games = this.games.filter(game => game.roomId != roomId)
  }

  addUser(user: User) {
    this.users.push(user)
    this.addHandlers(user)
  }

  removeUser(socket: Socket) {
    const user = this.users.find(user => user.socket.id === socket.id)
    if (!user) {
      console.error("user not founder")
      return
    }
    this.users = this.users.filter(user => user.socket.id !== socket.id)
    socketManager.removeUser(user)
  }

  private addHandlers(user: User) {
    user.socket.on("create-game", async (data) => {
      const gameId = data.gameId
      
    })
  }
}

export const gameManager = GameManager.getInstance()





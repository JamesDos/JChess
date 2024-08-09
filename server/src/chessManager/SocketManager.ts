import { Server, Socket } from "socket.io";

export class GameUser {
  public socket: Socket
  public id: string
  public username: string

  constructor(socket: Socket, id: string, username: string) {
    this.socket = socket
    this.id = id
    this.username = username
  }
}

class SocketManager {
  /**
   * roomToUsers maps each room to a list of the users in that room
   * userToRoom maps each userId to the room that the user is in
   */
  private static instance: SocketManager
  private roomToUsers: Map<string, GameUser[]>
  private userToRoom: Map<string, string>

  constructor() {
    this.roomToUsers = new Map<string, GameUser[]>()
    this.userToRoom = new Map<string, string>()
  }

  static getInstance() {
    if (SocketManager.instance) {
      return SocketManager.instance
    }
    SocketManager.instance = new SocketManager()
    return SocketManager.instance
  }

  addUser(user: GameUser, roomId: string) {
    this.roomToUsers.set(roomId, [
      ...(this.roomToUsers.get(roomId) || []),
      user
    ])
    this.userToRoom.set(user.id, roomId)
  }

  broadcast(roomId: string, message: string) {
    const users = this.roomToUsers.get(roomId)
    if (!users) {
      console.error("No users in this room")
      return
    }
    users.forEach(user => {
      user.socket.send(message)
    })
  }

  removeUser(user: GameUser) {
    const roomId = this.userToRoom.get(user.id)
    if (!roomId) {
      console.error("user not in any rooms")
      return
    }
    const userList = this.roomToUsers.get(roomId) || []
    const remainingUsers = userList.filter(u => u.id !== user.id)
    if (remainingUsers.length === 0) {
      this.roomToUsers.delete(roomId)
    } else {
      this.roomToUsers.set(roomId, remainingUsers)
    }
    this.userToRoom.delete(user.id)
  }
}

export const socketManager = SocketManager.getInstance()
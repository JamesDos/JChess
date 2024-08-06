import { Server, Socket } from "socket.io";

export class User {
  public socket: Socket
  public id: string

  constructor(socket: Socket, id: string) {
    this.socket = socket
    this.id = id
  }
}

class SocketManager {
  /**
   * roomToUsers maps each room to a list of the users in that room
   * userToRoom maps each userId to the room that the user is in
   */
  private static instance: SocketManager
  private roomToUsers: Map<string, User[]>
  private userToRoom: Map<string, string>

  constructor() {
    this.roomToUsers = new Map<string, User[]>()
    this.userToRoom = new Map<string, string>()
  }

  static getInstance() {
    if (SocketManager.instance) {
      return SocketManager.instance
    }
    SocketManager.instance = new SocketManager()
    return SocketManager.instance
  }

  addUser(user: User, roomId: string) {
    this.roomToUsers.set(roomId, [
      ...(this.roomToUsers.get(roomId) || []),
      user
    ])
    this.userToRoom.set(user.id, roomId)
  }

  broadcast(roomId: string, message: string) {
    const users = this.roomToUsers.get(roomId)
    console.log(users)
    if (!users) {
      console.error("No users in this room")
      return
    }
    users.forEach(user => {
      user.socket.send(message)
    })
  }

  removeUser(user: User) {
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

import { Server, Socket } from "socket.io";
import { io } from "../server";
import { v4 as uuidv4 } from 'uuid';

const rooms = new Map(); 

const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("create-room", async (cb) => {
      const roomId = uuidv4() // create new room with roomId
      await socket.join(roomId)
      rooms.set(roomId, { // update rooms map to include new room
        roomId, 
        players: [{id: socket.id}]
      })
      cb(roomId)
    })
  })
  
}

export const socketConnection = (io: Server) => {
  async function handleCreateRoom(cb) {
    const socket = this
    const roomId = uuidv4() // create new room with roomId
    await socket.join(roomId)
    rooms.set(roomId, { // update rooms map to include new room
      roomId, 
      players: [{id: socket.id}]
    })
    cb(roomId)
  }
  async function handleJoinRoom(roomData, cb) {
    const socket = this
    console.log(`RoomId is ${roomData.roomId}`)
    const room = rooms.get(roomData.roomId)
    let error, message;
    if (!room) { // if room does not exist send error through callback
      error = true;
      message = 'room does not exist';
    } else if (room.length <= 0) { // room is empty
      error = true;
      message = 'room is empty';
    } else if (room.length >= 2) { // room is full
      error = true;
      message = 'room is full';
    }
    if (error) {
      // if there's an error, check if the client passed a callback,
      // call the callback (if it exists) with an error object and exit or 
      // just exit if the callback is not given
      if (cb) { // if user passed a callback, call it with an error payload
        cb({
          error,
          message
        });
      }
      return
    }
    await socket.join(roomData.roomId)
    const updatedRoom = {
      ...room, 
      players: [...room.players, {id: socket.id}]
    }
    rooms.set(roomData.id, updatedRoom)
    cb(updatedRoom) // pass room details to client
    console.log(`Emitting opponent join to ${roomData.roomId}`)
    socket.to(roomData.roomId).emit("opponent-joined", updatedRoom)
  }


  return {
    handleCreateRoom,
    handleJoinRoom,
  }
}

io.on("connection", (socket: Socket) => {
  socket.on("create-room", async (cb) => {
    const roomId = uuidv4() // create new room with roomId
    await socket.join(roomId)
    rooms.set(roomId, { // update rooms map to include new room
      roomId, 
      players: [{id: socket.id}]
    })
    cb(roomId)
  })
  socket.on("join-room", async (roomData, cb) => {
    console.log(`RoomId is ${roomData.roomId}`)
    const room = rooms.get(roomData.roomId)
    let error, message;
    if (!room) { // if room does not exist send error through callback
      error = true;
      message = 'room does not exist';
    } else if (room.length <= 0) { // room is empty
      error = true;
      message = 'room is empty';
    } else if (room.length >= 2) { // room is full
      error = true;
      message = 'room is full';
    }
    if (error) {
      // if there's an error, check if the client passed a callback,
      // call the callback (if it exists) with an error object and exit or 
      // just exit if the callback is not given
      if (cb) { // if user passed a callback, call it with an error payload
        cb({
          error,
          message
        });
      }
      return
    }
    await socket.join(roomData.roomId)
    const updatedRoom = {
      ...room, 
      players: [...room.players, {id: socket.id}]
    }
    rooms.set(roomData.id, updatedRoom)
    cb(updatedRoom) // pass room details to client
    console.log(`Emitting opponent join to ${roomData.roomId}`)
    socket.to(roomData.roomId).emit("opponent-joined", updatedRoom)
  })
  socket.on("move", (moveData) => {
    console.log(`Sent move to Room ${moveData.room}`)
    socket.to(moveData.room).emit("move", moveData.move)
  })
  socket.on("disconnect", () => {
    const gameRooms = Array.from(rooms.values()) // list of all game rooms
    gameRooms.forEach(room => {
      // find which rooms the disconnected client joined using socket's id
      const userInRoom = room.players.find((player: {id: string}) => player.id === socket.id)
      if (userInRoom) {
        if (room.players.length < 2) {
          rooms.delete(room.roomId)
          return 
        }
      }
      // emit to all clients in room that player disconnected
      socket.to(room.roomId).emit("player-disconnected", userInRoom)
    })
  })
  socket.on("close-room", async (data) => {
    socket.to(data.roomId).emit("close-room", data)
    const clientSockets = await io.in(data.roomId).fetchSockets() // get array of all sockets in room
    clientSockets.forEach(s => {
      s.leave(data.roomId) // force socket to leave room
    })
    rooms.delete(data.roomId)
  })
  
});



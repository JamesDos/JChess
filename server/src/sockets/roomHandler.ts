import { v4 as uuidv4 } from 'uuid';
import Room from "../models/room";
import { Socket, Server } from "socket.io";


interface RoomData {
  roomId: string,
  playerSocketIds: string[]
}

interface CloseRoomData {
  roomId: string,
}

export default (io: Server) => {
  const createRoom = async function (this: Socket, cb: (roomId: string | null, err?:any) => void) {
    const socket = this
    try {
      const roomId = uuidv4() // create new room with roomId
      await socket.join(roomId)
  
      const newRoom = new Room({
        roomId: roomId,
        playerSocketIds: [{socketId: socket.id}]
      })
      await newRoom.save()
      cb(roomId)
    } catch (err) {
      console.log("socket create-room error")
      console.error(err)
      cb(null, err)
    }  
  }

  const joinRoom = async function (this: Socket, roomData: RoomData, cb: any) {
    const socket = this
    try {
      const room = await Room.findOne({roomId: roomData.roomId})
      let error, message;
      if (!room) { // if room does not exist send error through callback
        error = true;
        message = 'room does not exist';
      } else if (room.playerSocketIds.length <= 0) { // room is empty
        error = true;
        message = 'room is empty';
      } else if (room.playerSocketIds.length >= 2) { // room is full
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
      room?.playerSocketIds.push({socketId: socket.id})
      const updatedRoom = await room?.save()
      cb(updatedRoom)
      console.log(`Emitting opponent join to ${roomData.roomId}`)
      socket.to(roomData.roomId).emit("opponent-joined", updatedRoom)
    } catch (err) {
      console.log("socket join-room error")
      console.error(err)
      cb(null, err)
    }
  }

  const handleDisconnect = async function (this: Socket) {
    const socket = this
    try {
      // find which rooms the disconnected client joined using socket's id
      const userRooms = await Room.find({playerSocketIds: {$elemMatch: {$eq: socket.id}}})
      if (!userRooms) {
        console.log("no rooms with user in ")
        return
      }
      userRooms.forEach(room => {
        // tell all rooms that current socket is in that socket has disconnected
        socket.to(room.roomId).emit("player-disconnected", socket.id)
      })
      // delete all rooms that have socket and less than 2 players (socket is only one in room)
      await Room.deleteMany({
        playerSocketIds: {$elemMatch: {$eq: socket.id}},
        $expr: { $lt: [{ $size: "$playerSocketIds" }, 2] }
      })
    } catch (err) {
      console.log("socket disconnect error")
      console.error(err)
    }
  }

  const closeRoom = async function(this: Socket, data: CloseRoomData) {
    try {
      const socket = this
      socket.to(data.roomId).emit("close-room", data)
      const clientSockets = await io.in(data.roomId).fetchSockets() // get array of all sockets in room
      clientSockets.forEach(s => {
        s.leave(data.roomId) // force socket to leave room
      })
      await Room.deleteOne({roomId: data.roomId})
      console.log("sucessfully deleted room")
    } catch (err) {
      console.log("socket closeRoom error")
      console.error(err)
    }
  }

  
  return {
    createRoom,
    joinRoom,
    handleDisconnect,
    closeRoom,
  }
}
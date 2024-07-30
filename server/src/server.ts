import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import usersRouter from "./routes/users"; 
import gamesRouter from "./routes/games";
import registerRouter from "./routes/register";
import authRouter from "./routes/auth";
import refreshTokenRouter from "./routes/refresh";
import logoutRouter from "./routes/logout";
import { verifyJWT } from "./middleware/verifyJWT";

const PORT = process.env.PORT;
const app = express();

let uri: string
if (process.env.DATABASE_URL) { // handle undefined db url
  uri = process.env.DATABASE_URL
} else {
  throw new Error("DATABASE_URL not set")
}

mongoose.connect(uri)
const db = mongoose.connection
db.on("error", (error) => console.error(error))
db.once("open", () => console.log("Connected to Database"))

app.use(cors())
app.use(express.json())
app.use(cookieParser())

// routes
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use("/login", authRouter)
app.use("/register", registerRouter)
app.use("/refresh", refreshTokenRouter)
app.use("/logout", logoutRouter)


// protected routes
app.use(verifyJWT)
app.use("/users", usersRouter)
app.use("/games", gamesRouter)

app.all("*", (req, res) => {
  res.status(404)
  if (req.accepts("json")) {
    res.json({error: "404 Not Found"})
  } else {
    res.type("txt").send("404 Not Found")
  }
})

const httpServer = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

// maps socketIds to list of players in the game that player with socketId is in
const rooms = new Map(); 

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

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




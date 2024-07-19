import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors())
const PORT = 3000;

const httpServer = createServer();
const games = {}

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

io.on("connection", (socket: Socket) => {
  console.log(socket.id)
  socket.on("join-game", (roomId, cb) => {
    const clients = io.sockets.adapter.rooms.get(roomId)
    if (clients?.size || 0 > 2) {
      cb(`Room is full! Room has ${clients?.size} users`)
    } else {
      socket.join(roomId)
      cb(`Joined game with id: ${roomId} with ${clients?.size} users`)
    }
  })
  socket.on("move", (move) => {
    console.log(move)
    socket.broadcast.emit("newMove", move)
  })
  
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});




import { io } from "../index";
import { Server, Socket } from "socket.io";

io.on("connection", (socket: Socket) => {
  console.log(socket.id)
  socket.on("move", (move) => {
    console.log(move)
    socket.broadcast.emit("newMove", move)
  })
});
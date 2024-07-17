import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors())
const PORT = 3000;

const httpServer = createServer();

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

io.on("connection", (socket: Socket) => {
  console.log(socket.id)
  socket.on("move", (move) => {
    console.log(move)
    socket.broadcast.emit("newMove", move)
  })
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});



// //New imports
// const http = require('http').Server(app);
// const cors = require('cors');

// app.use(cors());

// const socketIO = require('socket.io')(http, {
//   cors: {
//       origin: "http://localhost:3000"
//   }
// });

// socketIO.on('connection', (socket) => {
//   console.log(`⚡: ${socket.id} user just connected!`);
//   socket.on('disconnect', () => {
//     console.log('🔥: A user disconnected');
//   });
// });

// app.get('/api', (req: Request, res: Response) => {
//   res.json({
//     message: 'Hello world',
//   });
// });

// http.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });
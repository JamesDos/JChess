import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { gameManager } from "./chessManager/gameManager";
import { User } from "./chessManager/SocketManager";
import registerGameHandlers from "./chessManager/gameHandler";

// Databases
import mongoose from "mongoose";
// import { createClient } from "redis";

// Routes
import usersRouter from "./routes/users"; 
import gamesRouter from "./routes/games";
import registerRouter from "./routes/register";
import authRouter from "./routes/auth";
import refreshTokenRouter from "./routes/refresh";
import logoutRouter from "./routes/logout";


// middleware
import verifyJWT from "./middleware/verifyJWT";
import credentials from "./middleware/credentials";
import corsOptions from "./config/corsOptions";

// Sockets
import Room from "./models/room";
import roomHandler from "./sockets/roomHandler";
import chessHandler from "./sockets/chessHandler";


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

// const redisClient = createClient({
//     password: process.env.REDIS_PWD,
//     socket: {
//         host: 'redis-13928.c16.us-east-1-2.ec2.redns.redis-cloud.com',
//         port: 13928
//     }
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// await redisClient.connect();

app.use(credentials)
app.use(cors(corsOptions))
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
// app.use(verifyJWT)
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
// const rooms = new Map(); 

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

const {
  createRoom,
  joinRoom,
  handleDisconnect,
  closeRoom,
} = roomHandler(io)

const {
  makeMove,
  handleResign
} = chessHandler(io)

const onConnection = (socket: Socket) => {
  console.log('New client connected');
  registerGameHandlers(io, socket)
}

io.on("connection", onConnection)

// io.on("connection", (socket: Socket) => {


//   // Room handlers
//   // socket.on("create-room", createRoom)
//   // socket.on("join-room", joinRoom)
//   // socket.on("disconnect", handleDisconnect)
//   // socket.on("close-room", closeRoom)

//   // // Chess handlers
//   // socket.on("move", makeMove)
//   // socket.on("resign", handleResign)
// });




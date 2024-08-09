import { Server, Socket } from 'socket.io';
import  { gameManager } from './gameManager';
import { Game } from "./Game"
import { User } from './SocketManager';
import { socketManager } from './SocketManager';
import * as messages from "./messages";


const registerGameHandlers = (io: Server, socket: Socket) => {
  const user = new User(socket, socket.id);
  gameManager.addUser(user);

  socket.on("create-game", (cb) => {
    console.log("Handler 'create-game' triggered");
    const game = new Game(user.id, null);
    const gameId = game.gameId;
    gameManager.addGame(game);
    socketManager.addUser(user, gameId)
    socketManager.broadcast(gameId, JSON.stringify({
      type: messages.CREATE_GAME,
      payload: {
        gameId: gameId
      }
    }));
    cb(gameId)
  });

  socket.on("join-room", async (data) => {
    console.log("Handler 'join-room' triggered");
    console.log(`socket auth is ${socket.handshake.auth.token}`)
    const gameId = data.roomId;
    const game = gameManager.findGame(gameId);
    if (!game) {
      console.error("No game with gameId");
      return;
    }
    if (game && game.player2UserId === null) {
      socketManager.addUser(user, gameId)
      game.addPlayer2(user.id);
      return;
    } else {
      console.log(`game not made! player2 is ${game.player2UserId}`)
    }
  });

  socket.on("move", async (data) => {
    console.log("Handler 'move' triggered");
    const gameId = data.roomId
    const game = gameManager.findGame(gameId)
    if (!game) {
      console.error("No game with gameId");
      return;
    }
    game.makeMove(user, data.move)
    return
  })

  socket.on("resign", async (data) => {
    console.log("Handler 'resign' triggered");
    const gameId = data.roomId
    const game = gameManager.findGame(gameId)
    if (!game) {
      console.error("No game with gameId");
      return;
    }

  })


};

export default registerGameHandlers;

import { Server, Socket } from 'socket.io';
import  { gameManager } from './gameManager';
import { Game } from "./Game"
import { User } from './SocketManager';
import { socketManager } from './SocketManager';


const registerGameHandlers = (io: Server, socket: Socket) => {
  const user = new User(socket, socket.id);
  gameManager.addUser(user);

  socket.on("create-game", (cb) => {
    console.log("Handler 'create-game' triggered");
    const game = new Game(user.id, null);
    const gameId = game.gameId;
    gameManager.addGame(game);
    socketManager.addUser(user, gameId)
    socketManager.broadcast(gameId, "game added");
    cb(gameId)
  });

  socket.on("join-room", async (data) => {
    console.log("Handler 'join-room' triggered");
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
    }
  });
};

export default registerGameHandlers;

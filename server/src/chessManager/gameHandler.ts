import { Server, Socket } from 'socket.io';
import  { gameManager } from './gameManager';
import { Game } from "./Game"
import { GameUser } from './SocketManager';
import { socketManager } from './SocketManager';
import * as messages from "./messages";
import jwt from 'jsonwebtoken';
import "dotenv/config";

interface userJWTClaims {
  username: string
  id: string
}


const registerGameHandlers = (io: Server, socket: Socket) => {
  let decoded
  try {
    // ideally should be jwt.verify 
    // TODO: refresh token on frontend before socket connection
    // decoded = jwt.verify(socket.handshake.auth.token, process.env.ACCESS_TOKEN_SECRET as string) as userJWTClaims
    decoded = jwt.decode(socket.handshake.auth.token) as userJWTClaims
    console.log(`Decoded username ${decoded.username}`)
    console.log(`Decoded id ${decoded.id}`)
  } catch (err) {
    console.error(err)
    return
  }

  if (!decoded) {
    console.error("decoded is undefined!!!")
    return
  }

  if (!decoded.id) {
    console.error(`decoded id is not defined. decoded username is ${decoded.username}`)
  }

  let user = gameManager.getUser(decoded.id)
  if (!user) {
    console.log("making new user....")
    user = new GameUser(socket, decoded.id, decoded.username);
    gameManager.addUser(user);
  } else {
    console.log("updating user socket to new socket")
    user.setSocket(socket)
  }

  socket.on("create-game", (cb) => {
    console.log("Handler 'create-game' triggered");
    const userGames = gameManager.findGamesWithUser(user)
    if (userGames.length > 0) { // user already has pending games
      console.log("cannot make multiple games at once!")
      console.log(`userGames are ${userGames.map(g => g.gameId)}`)
      return
    }

    const game = new Game(user.id, user.username);
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
    io.emit("game-change") // alert all sockets of new game creation to update lobby
  });

  socket.on("join-room", async (data) => {
    console.log("Handler 'join-room' triggered");
    const gameId = data.roomId;
    const game = gameManager.findGame(gameId);
    if (!game) {
      console.error("No game with gameId");
      return;
    }
    if (game.player1UserId == user.id) {
      console.log("cannot join game with yourself!")
      return;
    }
    if (game.player2UserId === null) {
      socketManager.addUser(user, gameId)
      game.addPlayer2(user.id);
      io.emit("game-change") 
    } else {
      console.log("cannot join game that is full!")
    }
  });

  socket.on("rejoin-game", async (data) => {
    console.log("Handle 'rejoin-game' triggered");
    const activeGame = gameManager.getAllActiveUserGames(user)
    console.log(`Active games are ${activeGame}`)
    if (!activeGame) {
      console.log("user not in any games before disconnect!")
      return
    }
    console.log(`rejoining game with gameid ${activeGame.gameId}`)
    socketManager.addUser(user, activeGame.gameId)
    activeGame.rejoinGame(user)
    // activeGame.restoreGameState(user)
  })

  socket.on("reconnect-user", async (data) => {
    console.log("Handle 'reconnect user' triggered");
    const activeGame = gameManager.getAllActiveUserGames(user)
    if (!activeGame) {
      console.log("user not in any games before disconnect!")
      return
    }
    activeGame.reconnectUser(user)
  })

  socket.on("move", async (data) => {
    console.log("Handler 'move' triggered");
    const gameId = data.roomId
    const game = gameManager.findGame(gameId)
    if (!game) {
      console.error("No game with gameId");
      return;
    }
    game.makeMove(user, data.move)
    if (game.result) { // move may have caused the game to end
      gameManager.removeGame(game.gameId)
    }
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
    game.resign(user)
    gameManager.removeGame(game.gameId)
  })

  socket.on("disconnect", () => {
    console.log(`User ${decoded.id} disconnected`);
  
    // Find the user associated with the socket
    const user = gameManager.getUser(decoded.id);
    if (user) {
      // Find the game the user is part of
      // const userGames = gameManager.findGamesWithUser(user);
      // userGames.forEach(game => {
      //   // Remove the user from the game
      //   game.removeUser(user);
      //   console.log(`Removed user ${decoded.id} from game ${game.gameId}`);
        
      //   // If the game has no more users, clean up the game
      //   if (game.isEmpty()) {
      //     gameManager.removeGame(game.gameId);
      //     console.log(`Removed empty game ${game.gameId}`);
      //   }
      // });
  
      // Remove the user from the game manager
      socketManager.removeUser(decoded.id);
      // gameManager.removeUser(decoded.id);
      console.log(`Removed user ${decoded.id} from game manager`);
    } else {
      console.error(`User ${decoded.id} not found in game manager`);
    }
  });


};

export default registerGameHandlers;

import { Socket, Server } from "socket.io";
import { Color } from "chess.js";

interface simpleMoveData {
  from: string,
  to: string, 
  color: Color, 
  promotion: string,
}

interface MoveData {
  move: simpleMoveData,
  roomId: string
}

interface ResignData {
  roomId: string,
  message: string
}

export default (io: Server) => {
  const makeMove = function (this: Socket, moveData: MoveData) {
    const socket = this
    socket.to(moveData.roomId).emit("move", moveData.move)
  }

  const handleResign = function (this: Socket, data: ResignData) {
    const socket = this
    socket.to(data.roomId).emit("opponent-resign", data.message)
  }

  return {
    makeMove,
    handleResign
  }
}

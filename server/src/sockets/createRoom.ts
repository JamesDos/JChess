
import { v4 as uuidv4 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';

async function handleCreateRoom(cb) {
  const socket = this
  const roomId = uuidv4() // create new room with roomId
  await socket.join(roomId)
  rooms.set(roomId, { // update rooms map to include new room
    roomId, 
    players: [{id: socket.id}]
  })
  cb(roomId)
}
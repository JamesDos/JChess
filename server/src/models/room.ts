import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  playerSocketIds: [{
    socketId: {
      type: String, 
      required: true
    }
  }]
})

const roomModel = mongoose.model("Room", roomSchema)

export default roomModel
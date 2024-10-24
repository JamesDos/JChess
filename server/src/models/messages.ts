import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
import mongoose from "mongoose";
import { messageSchema } from "./messages";

const chatSchema = new mongoose.Schema({
  messages: [messageSchema],
})

const chatModel = mongoose.model("Chat", chatSchema)

export default chatModel
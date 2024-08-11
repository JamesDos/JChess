import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String, 
    required: true 
  },
  date: {
    type: Date,
    required: true,
    // immutable: true,
  },
  pgn: {
    type: String,
    required: true,
    // immutable: true,
  },
  currentPosition: {
    type: String,
    required: true
  },
  black: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    // immutable: true,
  },
  white: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    // immutable: true,
  },
  blackEloGain: {
    type: Number,
    // immutable: true,
  },
  whiteEloGain: {
    type: Number,
    // immutable: true,
  }
})

export const gameModel = mongoose.model("Game", gameSchema)


import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
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

const gameModel = mongoose.model("Game", gameSchema)

export default gameModel
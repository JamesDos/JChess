import mongoose from "mongoose";

const moveSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true
  },
  moveNumber: {
    type: Number,
    required: true
  }, 
  before: {
    type: String,
    required: true
  },
  after: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  }, 
  piece: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  san: {
    type: String,
    required: true
  },
  flags: {
    type: String,
    required: true
  },
})

export const moveModel = mongoose.model("Move", moveSchema)

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  elo: {
    type: Number,
    required: true,
    default: 1500,
  },
  friends: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Friend",
    default: []
  }]
})

const userModel = mongoose.model("User", userSchema)

export default userModel
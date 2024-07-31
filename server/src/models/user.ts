import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
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
  }],
  refreshToken: {
    type: String,
    default: ""
  }
})

const userModel = mongoose.model("User", userSchema)

export default userModel
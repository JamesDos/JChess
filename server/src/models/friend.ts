import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  requester: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
  },
  recipient: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["add friend", "request", "pending", "friends"]
  }
})

const friendModel = mongoose.model("Friend", friendSchema)

export default friendModel
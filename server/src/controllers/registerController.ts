import User from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { errorMessage } from "./usersController";

export const handleNewUser = async (req: Request, res: Response) => {
  /* Creates a new user **/
  try {
    // Check for duplicate usernames
    const existingUser = await User.find({userName: req.body.userName})
    // where("userName").equals(req.body.userName)
    if (existingUser.length > 0) {
      return res.status(409).json({message: "userName taken!"})
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      userName: req.body.userName,
      password: hashedPassword
    })
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}
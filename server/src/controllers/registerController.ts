import User from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { errorMessage } from "./usersController";

export const handleNewUser = async (req: Request, res: Response) => {
  /* Creates a new user **/
  try {
    // Check for duplicate usernames
    const existingUser = await User.find({username: req.body.username})
    console.log(`Body is ${req.body}`)
    if (existingUser.length > 0) {
      console.log(`Username is ${req.body.username}`)
      console.log(existingUser)
      return res.status(409).json({message: "username taken!"})
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    })
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}
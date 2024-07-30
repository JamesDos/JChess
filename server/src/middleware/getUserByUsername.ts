import { Request, Response, NextFunction } from "express";
import User from "../models/user";

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
  let user;
  try {
    user = await User.findOne({userName: req.body.userName})
    if (user === null) {
      return res.status(404).json({message: "Cannot find user"})
    }
  } catch (err: any) {
    return res.status(500).json({message: err.message})
  }
  res.locals.user = user
  next()
}
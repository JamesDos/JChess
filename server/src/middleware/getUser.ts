import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { errorMessage } from "../routes/users";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  let user;
  try {
    user = await User.findById(req.params.id)
    if (user === null) {
      return res.status(404).json(errorMessage("Cannot find user!"))
    }
  } catch (err: any) {
    return res.status(500).json({message: err.message})
  }
  res.locals.user = user
  next()
}
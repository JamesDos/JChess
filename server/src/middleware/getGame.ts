import { Request, Response, NextFunction } from "express";
import Game from "../models/game";
import { errorMessage } from "../routes/users";

export const getGame = async (req: Request, res: Response, next: NextFunction) => {
  let game;
  try {
    game = await Game.findById(req.params.id)
    if (game === null) {
      return res.status(404).json(errorMessage("cannot find user"))
    }
  } catch (err: any) {
    res.status(500).json(errorMessage(err))
  }
  res.locals.game = game 
  next()
}
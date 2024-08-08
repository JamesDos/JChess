import {gameModel as Game} from "../models/game";
import { Request, Response } from "express";
import { successMessage, errorMessage } from "./usersController";

// Root (/) functions
export const getAllGames = async (req: Request, res: Response) => {
  /* Get all games **/
  try {
    const games = await Game.find()
    res.json(games)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
}

export const createGame = async (req: Request, res: Response) => {
  /* Create game **/
  const game = new Game({
    date: req.body.date,
    pgn: req.body.pgn,
    black: req.body.black,
    white: req.body.white,
    blackEloGain: req.body.blackEloGain,
    whiteEloGain: req.body.whiteEloGain,
  })
  try {
    const newGame = await game.save()
    res.status(201).json(newGame)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}


// /:id functions
export const getGameById = async (req: Request, res: Response) => {
  /* Get game by id **/
  res.json(res.locals.game)
}

export const updateGame = async (req: Request, res: Response) => {
  /* Update game by id **/
  const updates = req.body
  try {
    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!updatedGame) {
      return res.status(404).json(errorMessage("Cannot find game"));
    }

    res.json(updatedGame)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}

export const deleteGame = async (req: Request, res: Response) => {
  /* Delete game by id **/
  try {
    await res.locals.game.deleteOne()
    res.json(successMessage("deleted game"))
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}

// /user/:userId functions
export const getAllUserGames = async (req: Request, res: Response) => {
  /* Get all games by user id from most to least recent **/
  try {
    const allGames = await Game.find({
      $or: [{white: req.params.userId}, {black: req.params.userId}]
    })
    .sort(({date: -1}))
    .exec()
    res.json(allGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
}

// /user/white/:userId functions
export const getUserWhiteGames = async (req: Request, res: Response) => {
  /* Get all white games by user id from most to least **/
  try {
    const whiteGames = await Game.where("white").equals(req.params.userId).sort({date: -1})
    res.json(whiteGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
}

// /user/black/:userId functions
export const getUserBlackGames = async (req: Request, res: Response) => {
  /* Get all black games by user id from most to least recent **/
  try {
    const blackGames = await Game.where("black").equals(req.params.userId).sort({date: -1})
    res.json(blackGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
}
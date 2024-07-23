import express, { Request, Response, NextFunction } from "express";
import Game from "../models/game";
import { successMessage, errorMessage } from "./users";

const gamesRouter = express.Router()

// Middleware functions
const getGame = async (req: Request, res: Response, next: NextFunction) => {
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

// Get all games
gamesRouter.get("/", async (req, res) => {
  try {
    const games = await Game.find()
    res.json(games)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Get one game
gamesRouter.get("/:id", getGame, async (req, res) => {
  res.json(res.locals.game)
})

// Get all games by user id from most to least recent
gamesRouter.get("/user/:userId", async (req, res) => {
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
})

// Get all white games by user id from most to least
gamesRouter.get("/user/white/:userId", async (req, res) => {
  try {
    const whiteGames = await Game.where("white").equals(req.params.userId).sort({date: -1})
    res.json(whiteGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Get all black games by user id from most to least recent 
gamesRouter.get("/user/black/:userId", async (req, res) => {
  try {
    const blackGames = await Game.where("black").equals(req.params.userId).sort({date: -1})
    res.json(blackGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Create a game
gamesRouter.post("/", async (req, res) => {
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
})

// Update game
gamesRouter.patch("/:id", getGame, async (req, res) => {
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
})

// Delete game
gamesRouter.delete("/:id", getGame, async (req, res) => {
  try {
    await res.locals.game.deleteOne()
    res.json(successMessage("deleted game"))
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
})

export default gamesRouter
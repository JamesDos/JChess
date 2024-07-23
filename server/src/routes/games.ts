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
gamesRouter.get("/:userId", async (req, res) => {
  try {
    const allGames = Game.find({
      "$or": [{white: req.params.userId}, {black: req.params.userId}]
    })
    .sort(({date: -1}))
    .exec()
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Get all white games by user id from most to least
gamesRouter.get("/:userId/white", async (req, res) => {
  try {
    const whiteGames = Game.where("white").equals(req.params.userId).sort({date: -1})
    res.json(whiteGames)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Get all black games by user id from most to least recent 
gamesRouter.get("/:userId/black", async (req, res) => {
  try {
    const blackGames = Game.where("black").equals(req.params.userId).sort({date: -1})
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
  if (req.body.date !== null) {
    res.locals.date = req.body.date
  }
  if (req.body.pgn !== null) {
    res.locals.pgn = req.body.pgn
  }
  if (req.body.black !== null) {
    res.locals.black = req.body.black
  }
  if (req.body.white !== null) {
    res.locals.white = req.body.white
  }
  if (req.body.blackEloGain !== null) {
    res.locals.blackEloGain = req.body.blackEloGain
  }
  if (req.body.whiteEloGain !== null) {
    res.locals.whiteEloGain =  req.body.whiteEloGain
  }
  try {
    const updatedGame = await res.locals.game.save()
    res.json(updatedGame)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
})

// Delete game
gamesRouter.delete("/:id", getGame, async (req, res) => {
  try {
    await res.locals.game.remove()
    res.json(successMessage("delete game"))
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
})

export default gamesRouter
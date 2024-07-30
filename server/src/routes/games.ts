import express, { Request, Response, NextFunction } from "express";
import { getGame } from "../middleware/getGame";
import * as gamesController from "../controllers/gamesController";

const gamesRouter = express.Router()

gamesRouter.route("/")
  .get(gamesController.getAllGames)
  .post(gamesController.createGame)

gamesRouter.route("/:id")
  .get(getGame, gamesController.getGameById)
  .patch(gamesController.updateGame)
  .delete(getGame, gamesController.deleteGame)

gamesRouter.route("/user/:userId")
  .get(gamesController.getAllUserGames)

gamesRouter.route("/user/white/:userId")
  .get(gamesController.getUserWhiteGames)

gamesRouter.route("/user/black/:userId")
  .get(gamesController.getUserBlackGames)

export default gamesRouter
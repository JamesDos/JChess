import express from "express";
import * as refreshTokenController from "../controllers/refreshTokenController";

const refreshTokenRouter = express.Router()

refreshTokenRouter.get("/", refreshTokenController.handleRefresh)

export default refreshTokenRouter
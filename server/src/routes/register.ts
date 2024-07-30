import express from "express";
import * as registerController from "../controllers/registerController";

const registerRouter = express.Router()

registerRouter.post("/", registerController.handleNewUser)

export default registerRouter
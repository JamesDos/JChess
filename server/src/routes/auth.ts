import express from "express";
import * as authController from "../controllers/authController";
import { getUserByUsername } from "../middleware/getUserByUsername";

const authRouter = express.Router()

authRouter.post("/", getUserByUsername, authController.handleLogin)

export default authRouter
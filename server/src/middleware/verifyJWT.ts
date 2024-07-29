import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { userToken } from "../types/custom";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  // authHeader will be: "Bearer token", so we want to get token
  const token = authHeader && authHeader.split(" ")[1] // token either undefined or token
  if (!token) {
    return res.sendStatus(401) // invalid request
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) {
      return res.sendStatus(403) // token no longer valid (forbidden)
    }
    req.username = (decoded as userToken).username
    next()
  })
}
import User from "../models/user";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userToken } from "../types/custom";

export const handleRefresh = async (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) {
    return res.sendStatus(401)
  }
  const refreshToken = cookies.jwt as string 
  // Verify that user has refresh token
  const user = await User.findOne({refreshToken: refreshToken})
  if (!user) {
    res.sendStatus(403) // forbidden
  }
  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    (err, decoded) => {
      if (err || user?.userName !== (decoded as userToken).username) {
        return res.sendStatus(403)
      }
      // make new acess token
      const accessToken = jwt.sign(
        {"username": (decoded as userToken).username},
        process.env.ACCESS_TOKEN_SECRET as string,
        {expiresIn: "60s"}
      )
      res.json({accessToken})
    }
  )
}
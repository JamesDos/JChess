import User from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { errorMessage } from "./usersController";

export const handleLogin =  async (req: Request, res: Response) => {
  const user = res.locals.user

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      // Create JWTs
      const accessToken = jwt.sign(
        {"username": user.userName},
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "30s"}
      )
      const refreshToken = jwt.sign(
        {"username": user.userName},
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "1d"}
      )
      // Saving refresh token with user in db
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {refreshToken: refreshToken}, // add refresh token field
        { new: true, runValidators: true }
      )
      // sending refresh token as httpOnly cookies and access token as json
      res.cookie("jwt", refreshToken, {httpOnly: true, sameSite: "none", secure: true, maxAge: 24 * 60 * 60 * 1000}) // set max age of cookie to 1 day
      res.json({accessToken}) 
    } else {
      res.status(401).json({message: "Unauthorized!"})
    }
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}
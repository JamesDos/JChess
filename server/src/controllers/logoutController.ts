import User from "../models/user";
import { Request, Response } from "express";

export const handleLogout = async (req: Request, res: Response) => {
  console.log("In logout")
  const cookies = req.cookies
  if (!cookies?.jwt) {
    return res.sendStatus(204) // No content
  }
  const refreshToken = cookies.jwt as string 
  // check if refresh token in db
  const user = await User.findOne({refreshToken: refreshToken})
  if (!user) {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true })
    return res.sendStatus(204) // forbidden
  }
  // Delete refresh token from db
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {refreshToken: ""}, // add refresh token field
    { new: true, runValidators: true }
  )
  res.clearCookie("jwt", {httpOnly: true, sameSite: "none", secure: true})
  res.sendStatus(204)
}
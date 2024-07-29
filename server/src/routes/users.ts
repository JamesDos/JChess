import express, { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { userToken } from "../types/custom"

const usersRouter = express.Router()

// Helper functions
export const errorMessage = (err: any) => {
  return { message: err.message}
}

export const successMessage = (message: string) => {
  return { message: message } 
}

// Middleware functions
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  let user;
  try {
    user = await User.findById(req.params.id)
    if (user === null) {
      return res.status(404).json(errorMessage("Cannot find user!"))
    }
  } catch (err: any) {
    return res.status(500).json({message: err.message})
  }
  res.locals.user = user
  next()
}

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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

const handleRefreshToken = async (req: Request, res: Response) => {
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

const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) {
    return res.sendStatus(204) // No content
  }
  const refreshToken = cookies.jwt as string 
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


// Get all users
usersRouter.get("/", async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
})

// Get one user
usersRouter.get("/:id", getUser, async (req, res) => {
  res.json(res.locals.user)
})

// Create a user 
usersRouter.post("/", async (req, res) => {
  try {
    const existingUser = await User.where("userName").equals(req.body.userName)
    if (existingUser !== null) {
      return res.status(409).json({message: "userName taken!"})
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      userName: req.body.userName,
      password: hashedPassword
    })
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
})

// Check user login
usersRouter.post("/login", getUser, async (req, res) => {
  const user = res.locals.user
  if (await bcrypt.compare(req.body.password, user.password)) {
    // Create JWTs
    const accessToken = jwt.sign(
      {"username": user.userName},
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "5m"}
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
})

// Update a user
usersRouter.patch("/:id", async (req, res) => {
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json(errorMessage("Cannot find user"));
    }

    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json(errorMessage(err.message));
  }
});

// Delete user
usersRouter.delete("/:id", getUser, async (req, res) => {
  try {
    await res.locals.user.deleteOne()
    res.json(successMessage("deleted user"))
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
})

export default usersRouter
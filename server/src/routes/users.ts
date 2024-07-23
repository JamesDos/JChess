import express, { Request, Response, NextFunction } from "express";
import User from "../models/user";

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
      return res.status(404).json(errorMessage("cannot find user"))
    }
  } catch (err: any) {
    return res.status(500).json({message: err.message})
  }
  res.locals.user = user
  next()
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
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
  })
  try {
    const newUser = await user.save()
    res.status(201).json(newUser)
  } catch (err) {
    res.status(400).json(errorMessage(err))
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
import User from "../models/user";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

// Helper functions
export const errorMessage = (err: any) => {
  return { message: err.message}
}

export const successMessage = (message: string) => {
  return { message: message } 
}

// Root (/) functions
// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.status(500).json(errorMessage(err))
  }
}

// // Create user
// export const createUser = async (req: Request, res: Response) => {
//   try {
//     // Check for duplicate usernames
//     const existingUser = await User.where("userName").equals(req.body.userName)
//     if (existingUser !== null) {
//       return res.status(409).json({message: "userName taken!"})
//     }
//     const hashedPassword = await bcrypt.hash(req.body.password, 10)
//     const user = new User({
//       userName: req.body.userName,
//       password: hashedPassword
//     })
//     const newUser = await user.save()
//     res.status(201).json(newUser)
//   } catch (err) {
//     res.status(400).json(errorMessage(err))
//   }
// }

// /:id functions
// Get one user
export const getUserById = async (req: Request, res: Response) => {
  res.json(res.locals.user)
}

// Update one user
export const updateUser = async (req: Request, res: Response) => {
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
}

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    await res.locals.user.deleteOne()
    res.json(successMessage("deleted user"))
  } catch (err) {
    res.status(400).json(errorMessage(err))
  }
}
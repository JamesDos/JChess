import express from "express";

const usersRouter = express.Router()

// Get all users
usersRouter.get("/", (req, res) => {
  res.send("Hello World")
})

// Get one user
usersRouter.get("/:id", (req, res) => {

})

// Create a user 
usersRouter.post("/", (req, res) => {

})

// Update a user
usersRouter.patch("/", (req, res) => {

})

// Delete user
usersRouter.delete("/", (req, res) => {

})


export default usersRouter
import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import axios from "axios";


const LOGIN_URL = "./login"

export const Login = () => {
  const { setAuth } = useAuth()
  const navigate = useNavigate()


  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [errMsg, setErrMsg] = useState("")


  const handleReset = () => {
    setUsername("")
    setPassword("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username == "" || password == "") {
      // useAuth.login(input)
      alert("please provide a valid username and password!")
      return
    }
    try {
      const response = await axiosInstance.post(
        LOGIN_URL,
        JSON.stringify({username: username, password: password}),
        {
          headers: {"Content-Type": "application/json"},
          withCredentials: true
        }
      )
      console.log(JSON.stringify(response?.data))
      const accessToken = response?.data?.accessToken
      setAuth({username, password, accessToken })
      handleReset()
      navigate("/")

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrMsg("No server response")
        } else if (err.response?.status === 400) {
          setErrMsg("Missing Username or Password")
        } else if (err.response?.status === 401) {
          setErrMsg("Unauthorized")
        } else {
          setErrMsg("Login Failed")
        }
      }
    }
  }

  return (
    <div className="login-page">
      <section className="login-container">
      <p className={!errMsg? "err-msg" : "hidden"}>{errMsg}</p>
        <h1>Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>

          <div>
            <label htmlFor="username-input">Username: </label>
            <input 
              type="text"
              id="username-input"
              name="username"
              placeholder="Enter Username"
              required
              onChange={e => setUsername(e.target.value)}
              />
            {/* <div id="username-input" className="sr-only">
              Please enter a valid username. It must contain at least 6 characters
            </div> */}
          </div>

          <div>
            <label htmlFor="password-input">Password: </label>
            <input 
              type="password"
              id="password-input"
              name="password"
              placeholder="Enter Password"
              required
              onChange={e => setPassword(e.target.value)}
              />
            {/* <div id="password-input" className="sr-only">
              Please enter a password. It must contain at least 8 characters.
            </div> */}
          </div>
          <button className="btn-login">Submit</button>
        </form>

        <p>Need an account?<br />
        <Link to="/register ">
            Sign Up
          </Link>
        </p>

      </section>
  </div>
  )
}
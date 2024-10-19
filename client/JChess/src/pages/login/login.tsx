import { useState } from "react";
import useAuth from "../../hooks/useAuth";
// import "./login.css";
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
    <div className="min-h-screen grid place-items-center">
      <section className="flex flex-col justify-center gap-4 h-[60%] w-[25%] bg-light-grey px-10 py-4 rounded-md">
        <h1 className="text-3xl font-bold py-2">Login</h1>
        <p className={errMsg ? "err-msg" : "hidden"}>{errMsg}</p>
        <form className="flex flex-col gap-5 py-2" onSubmit={handleSubmit}>

          <div className="flex flex-col gap-1">
            <label htmlFor="username-input">Username: </label>
            <input 
              type="text"
              id="username-input"
              name="username"
              placeholder="Enter Username"
              required
              className={`h-8 bg-light-grey border-solid border-2 
              focus:outline-none focus:border-blue rounded-md py-4 px-2
              ${ username ? "border-green" : "border-orange"}`}
              
            
              onChange={e => setUsername(e.target.value)}
              />
            {/* <div id="username-input" className="sr-only">
              Please enter a valid username. It must contain at least 6 characters
            </div> */}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password-input">Password: </label>
            <input 
              type="password"
              id="password-input"
              name="password"
              placeholder="Enter Password"
              required
              className={`h-8 bg-light-grey border-solid border-2 
                focus:outline-none focus:border-blue rounded-md py-4 px-2
                ${ password ? "border-green" : "border-orange"}`}  
              onChange={e => setPassword(e.target.value)}
              />
            {/* <div id="password-input" className="sr-only">
              Please enter a password. It must contain at least 8 characters.
            </div> */}
          </div>

          <button className="h-12 border-none rounded-md bg-blue text-white py-2">Submit</button>
          
        </form>

        <p className="">Need an account?<br />
          <Link to="/register ">
            Sign Up
          </Link>
        </p>

      </section>
  </div>
  )
}
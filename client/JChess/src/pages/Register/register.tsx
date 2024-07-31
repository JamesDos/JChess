import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios";
import axios from "axios";
import "./register.css";
import { Link } from "react-router-dom";

// username must be 4 - 24 chars long, start with lowercase letter
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/
/**pwd must be 8-24 chars long, contain at least 1: 
 * - lowercase letter
 * - uppercase letter
 * - special character from [!@#$%]
 * - number
*/
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/
const REGISTER_URL = "./register"

export const Register = () => {
  const [username, setUsername] = useState("")
  const [validUsername, setValidUsername] = useState(false)

  const [pwd, setPwd] = useState("")
  const [validPwd, setValidPwd] = useState(false)

  const [confirmPwd, setConfirmPwd] = useState("")
  const [validConfirmPwd, setValidConfirmPwd] = useState(false)

  const [errMsg, setErrMsg] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const res = USER_REGEX.test(username)
    setValidUsername(res)
  }, [username])

  useEffect(() => {
    const res = PWD_REGEX.test(pwd)
    setValidPwd(res)
    const match = (pwd === confirmPwd)
    setValidConfirmPwd(match)
  }, [pwd, confirmPwd])

  useEffect(() => {
    setErrMsg("")
  }, [username, pwd, confirmPwd])

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault()
    // Final check of valid inputs
    if (!USER_REGEX.test(username) || !PWD_REGEX.test(pwd)) {
      setErrMsg("Invalid Form Data")
      return
    }
    try {
      const res = await axiosInstance.post(
        REGISTER_URL,
        JSON.stringify({username: username, password: pwd}),
        {
          headers: {"Content-Type": "application/json"},
          withCredentials: true
        }
      )
      console.log(res.data)
      setSuccess(true)
    } catch(err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err?.response) {
          setErrMsg("No Server Response")
        } else if (err.response?.status === 409) {
          setErrMsg("Username Taken!")
        } else {
          setErrMsg("Registration Failed")
        }
      }
    }
  }

  return (
    <div className="register-page">
      {success ? (
        <section className="register-success-container">
          <p>Success!</p>
          <p>{/** Add react router for sign in*/}</p>
        </section>
      ) : (
      <section className="register-container">
        <p className={!errMsg? "err-msg" : "hidden"}>{errMsg}</p>
        <h1>Sign Up</h1>
        <form className="register-form" onSubmit={handleSubmit}> 

          <div>
            <label htmlFor="register-username">Username:</label>
            <input 
              type="text" 
              id="register-username"
              autoComplete="off"
              required
              onChange={e => setUsername(e.target.value)}
            />
            <p className={username && !validUsername ? "instructions" : "hidden"}>
              Username must be 4-24 characters.<br />
              Must begin with a letter.<br />
              Letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>

          <div>
            <label htmlFor="register-pwd">Password:</label>
            <input 
              type="password" 
              id="register-pwd"
              required
              onChange={e => setPwd(e.target.value)}
            />
            <p className={pwd && !validPwd ? "instructions" : "hidden"}>
              Password must be 8-24 characters.<br />
              Must contain at least 1 capital, lowercase, number and special character.<br />
              Allowed special characters: !@#$%
            </p>
          </div>

          <div>
            <label htmlFor="register-confirm-pwd">Confirm Password:</label>
            <input 
              type="password" 
              id="register-confirm-pwd"
              required
              onChange={e => setConfirmPwd(e.target.value)}
            />
            <p className={!validConfirmPwd? "instructions" : "hidden"}>
              Passwords must match<br />
            </p>
          </div>

          <div>
            <button
              disabled={(!validUsername || !validPwd || !validConfirmPwd) ? true :  false}
              className="btn-signup"
            >Sign Up</button>
          </div>

        </form>

        <p>Already registered?<br />
          <Link to="/login">
            Log In
          </Link>
        </p>
      </section>
      )}
    </div>
  )
}
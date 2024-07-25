import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";

interface formInput {
  username: string,
  password: string
}

export const Login = () => {
  const [input, setInput] = useState<formInput>({
    username: "",
    password: "",
  })

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.username !== "" && input.password !== "") {
      // useAuth.login(input)
      console.log(input.username)
      console.log(input.password)
    } else {
      alert("please provide a valid username and password!")
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInput((prevInput) => ({
      ...prevInput,
      [name]: value
    }))
  }

  return (
    <form className="login-form" onSubmit={handleSubmitForm}>
      <div className="login-form-elm">
        <label htmlFor="username-input">Username</label>
        <input 
          type="text"
          id="username-input"
          name="username"
          placeholder="Enter Username"
          aria-describedby="username-input"
          aria-invalid={false}
          onChange={handleInput}
           />
        {/* <div id="username-input" className="sr-only">
          Please enter a valid username. It must contain at least 6 characters
        </div> */}
      </div>
      <div className="login-form-elm">
        <label htmlFor="password-input">Password</label>
        <input 
          type="password"
          id="password-input"
          name="password"
          placeholder="Enter Password"
          onChange={handleInput}
          />
        {/* <div id="password-input" className="sr-only">
          Please enter a password. It must contain at least 8 characters.
        </div> */}
      </div>
      <button className="btn-submit">Submit</button>
    </form>
  )
}
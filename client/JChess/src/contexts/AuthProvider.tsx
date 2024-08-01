import { createContext, useContext, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider!")
  }
  return context
}

interface AuthContextType {
  username: string,
  password: string,
  accessToken: string
  setAuth: React.Dispatch<React.SetStateAction<AuthStateType | null>>
}

interface AuthStateType {
  username: string,
  password: string,
  accessToken: string
}

// const defaultAuth: AuthStateType = {
//   username: "",
//   password: "",
//   accessToken: ""
// }

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [auth, setAuth] = useState<AuthStateType | null >(null)
  // const [user, setUser] = useState({name: "", isAuthenticated: false})
  // const [token, setToken] = useState(true)

  // const login = (userName: string, password: string) => {
  //   // TODO: Call Auth API to validate userName and password
  //   console.log(`${userName} ${password}`)
  // }

  // const logout = () => {
  //   setUser(prevUser => ({...prevUser, isAuthenticated: false}))
  // }

  return (
    <AuthContext.Provider value={
      { username: auth?.username || "", 
        password: auth?.password || "", 
        accessToken: auth?.accessToken || "",
        setAuth
      }}>
      {children}
    </AuthContext.Provider>
  )
}
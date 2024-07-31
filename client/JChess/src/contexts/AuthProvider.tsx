import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [auth, setAuth] = useState({})
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
    <AuthContext.Provider value={{auth, setAuth}}>
      {children}
    </AuthContext.Provider>
  )
}
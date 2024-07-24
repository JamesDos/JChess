import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = () => {
  const [user, setUser] = useState({name: "", isAuthenticated: false})

  const login = (userName: string, password: string) => {
    // TODO: Call Auth API to validate userName and password
    console.log(`${userName} ${password}`)
  }

  const logout = () => {
    setUser(prevUser => ({...prevUser, isAuthenticated: false}))
  }

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      
    </AuthContext.Provider>
  )
}
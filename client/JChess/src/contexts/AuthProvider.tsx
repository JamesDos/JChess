import { createContext, useState } from "react";

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthContextType {
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

const defaultAuth: AuthStateType = {
  username: "",
  password: "",
  accessToken: ""
}

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [auth, setAuth] = useState<AuthStateType | null >(defaultAuth)

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
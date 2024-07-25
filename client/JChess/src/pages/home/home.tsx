import { useAuth } from "../../contexts/AuthProvider"

export const Home = () => {
  const auth = useAuth()

  return (
    <div className="home-page">
      <h1>Welcome! {auth.user?.username}</h1>
      <button className="logout-btn" onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}
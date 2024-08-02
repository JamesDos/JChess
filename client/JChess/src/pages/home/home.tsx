import useAuth from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import useLogout from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate()
  const auth = useAuth()
  const logout = useLogout()

  const signOut = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="home-page">
      <h1>Welcome! {auth.username}</h1>
      <button className="logout-btn" onClick={signOut}>Logout</button>
      <Link to="/lobby"><button>Lobby</button></Link>
      <Link to="/game"><button>Game</button></Link>
    </div>
  )
}
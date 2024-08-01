import { useAuth } from "../../contexts/AuthProvider";
import { Link } from "react-router-dom";

export const Home = () => {
  const auth = useAuth()

  return (
    <div className="home-page">
      <h1>Welcome! {auth.username}</h1>
      <button className="logout-btn" onClick={() => auth.logout()}>Logout</button>
      <Link to="/lobby"><button>Lobby</button></Link>
      <Link to="/game"><button>Game</button></Link>
    </div>
  )
}
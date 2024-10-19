import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";

export const ProfilePage = () => {

  const navigate = useNavigate()
  const auth = useAuth()
  const logout = useLogout()

  const signOut = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <section className="w-auto min-h-screen bg-light-grey">
      <div className="home-page">
        <h1>Welcome! {auth.username}</h1>
        <button className="logout-btn" onClick={signOut}>Logout</button>
      </div>
    </section>
  )
}
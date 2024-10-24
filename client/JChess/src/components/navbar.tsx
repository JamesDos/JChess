import { Link } from "react-router-dom";
import wR from "../assets/wR.svg";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogout  from "../hooks/useLogout";

export const Navbar = () => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const navigate = useNavigate();
  const logout = useLogout();

  const signOut = async () => {
    await logout();
    navigate("/login");
  };


  return (
    <nav className="w-screen">
      <ul className="list-none flex justify-start items-stretch h-20 px-6 bg-lighter-grey">
        <div className="flex items-center h-1/12 gap-2 px-4">
          <img className="size-12" src={wR}/>
          <h1 className="text-2xl">JChess</h1>
        </div>
        <NavItem to="/" text="Play"/>
        <NavItem to="/analysis" text="Analysis"/>
        <NavItem to="/games" text="Games"/>
        <NavItem to="/profile" text="Profile" />
      </ul>
    </nav>
  )
}

interface NavItemProps {
  to: string
  text: string
}

const NavItem = (props: NavItemProps) => {
  return (
    <li 
      className="flex justify-center items-center w-1/12 last:ml-auto hover:bg-light-grey"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(90deg, #5d8d25 0%, #5d8d25 50%, #fffcf0 50%, #fffcf0 100%)", // Gradient color to simulate the fill
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          backgroundSize: "200% 100%", // Double width for transition effect
          backgroundPosition: "100% 0",
          transition: "background-position 0.5s ease", // Smooth transition of the fill
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundPosition = "0 0"; // Start from left
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundPosition = "100% 0"; // Reset to right
        }}
      >
        <Link to={props.to}>
          <h2 className="text-lg grow">{props.text}</h2>
        </Link>
      </motion.div>
    </li>
  )
}

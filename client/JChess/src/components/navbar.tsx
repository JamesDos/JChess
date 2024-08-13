import { Link } from "react-router-dom";
import wR from "../assets/wR.svg";

export const Navbar = () => {
  return (
    <nav className="w-screen">
      <ul className="list-none flex justify-start items-stretch h-20 px-3 bg-lighter-grey">
        <div className="flex items-center h-1/12 gap-2 px-4">
          <img className="size-12" src={wR}/>
          <h1 className="text-2xl">JChess</h1>
        </div>
        <NavItem to="/lobby" text="Lobby"/>
        <NavItem to="/analysis" text="Analysis"/>
        <NavItem to="/games" text="Games"/>
        <NavItem to="/profile" text="Profile"/>
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
    <li className="flex justify-center items-center w-1/12 last:ml-auto hover:bg-light-grey">
      <Link to={props.to}>
        <h2 className="text-lg grow">{props.text}</h2>
      </Link>
    </li>
  )
}

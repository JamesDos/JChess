import { Lobby } from "../pages/lobby/lobby";
import { Game } from "../pages/game/game";

export const nav = [
  { path: "/", name: "Home", element: <Home />, isMenu: true, isPrivate: false },
  { path: "/Lobby", name: "Lobby", element: <Lobby />, isMenu: false, isPrivate: true },
  { path: "/Game", name: "Game", element: <Game />, isMenu: false, isPrivate: true },
]
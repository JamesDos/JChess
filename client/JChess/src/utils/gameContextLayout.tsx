import { Outlet } from "react-router-dom";
import { SocketProvider } from "../contexts/SocketProvider";
import { GameSetUpProvider } from "../contexts/GameSetUpProvider";

export const GameContextLayout = () => {
  return (
    <SocketProvider>
      <GameSetUpProvider>
        <Outlet/>
      </GameSetUpProvider>
    </SocketProvider>
  )
}

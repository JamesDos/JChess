import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/game/game";
import { Lobby } from "./pages/lobby/lobby";
import { SocketProvider } from "./contexts/SocketProvider";

const App = () => {
  return (
  <SocketProvider>
    <Routes>
      <Route path="/" element={<Lobby />}/>
      <Route path="/game" element={<Game />}/>
    </Routes>
  </SocketProvider>
  )
}

export default App

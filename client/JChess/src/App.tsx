import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/game/game";
import { Lobby } from "./pages/lobby/lobby";

const App = () => {
  return (
  <Routes>
    <Route path="/" element={<Lobby />}/>
    <Route path="/game" element={<Game />}/>
  </Routes>
  )
}

export default App

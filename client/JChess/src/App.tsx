import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/game/game";
import { Lobby } from "./pages/lobby/lobby";
import { Login } from "./pages/login/login";
import { Home } from "./pages/home/home";
import { useState, useEffect, useCallback} from "react";
import socket from "./connections/socket";
import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { PrivateRoutes } from "./utils/PrivateRoutes";

const App = () => {
  const [room, setRoom] = useState("")
  const [orientation, setOrientation] = useState<BoardOrientation | string>("")
  const [players, setPlayers] = useState<{id: string}[]>([])

  // resets game to initial state
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);

  useEffect(() => {
    socket.on("opponent-joined", (roomData) => {
      console.log("effect called")
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, [])

  return (
    <div className="app">
      <Routes>
        <Route element={<PrivateRoutes/>}>
          <Route path="/" element={<Home/>}/>
          <Route path="/lobby" element={
            <Lobby
              setRoom={setRoom}
              setOrientation={setOrientation}
              setPlayers={setPlayers}
            />
          }/>
        <Route path="/game" element={
            <Game
              room={room}
              orientation={orientation}
              players={players}
              cleanup={cleanup}
            />
          }/>
        </Route>
        <Route path="/login" element={<Login/> }/>
      </Routes>
    </div>
  )
}

export default App

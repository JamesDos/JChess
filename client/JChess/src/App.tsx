import { Outlet, Route, Routes } from "react-router-dom";
import { Game } from "./pages/Game/game";
import { Lobby } from "./pages/Lobby/lobby";
import { Login } from "./pages/Login/login";
import { Home } from "./pages/Home/home";
// import { useState, useEffect, useCallback} from "react";
// import socket from "./connections/socket";
// import { BoardOrientation } from "react-chessboard/dist/chessboard/types";
import { PrivateRoutes } from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthProvider";
import { GameSetUpProvider } from "./contexts/GameSetUpProvider";

const App = () => {
  // const [room, setRoom] = useState("")
  // const [orientation, setOrientation] = useState<BoardOrientation | string>("")
  // const [players, setPlayers] = useState<{id: string}[]>([])

  // // resets game to initial state
  // const cleanup = useCallback(() => {
  //   setRoom("");
  //   setOrientation("");
  //   setPlayers([]);
  // }, []);

  // useEffect(() => {
  //   socket.on("opponent-joined", (roomData) => {
  //     console.log("effect called")
  //     console.log("roomData", roomData)
  //     setPlayers(roomData.players);
  //   });
  // }, [])

  return (
    <div className="app">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/> }/>
          <Route element={<PrivateRoutes/>}>
            <Route path="/" element={<Home/>}/>
            <Route element={<GameSetUpProvider><Outlet/></GameSetUpProvider>}>
              <Route path="/lobby" element={<Lobby/>}/>
              <Route path="/game" element={<Game/>}/>
            </Route>
            {/* <Route path="/lobby" element={
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
            }/> */}
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default App

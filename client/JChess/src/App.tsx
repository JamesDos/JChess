import { Route, Routes } from "react-router-dom";
import { Game } from "./pages/game/game";
import { Lobby } from "./pages/lobby/lobby";
import { useState, useEffect, useCallback} from "react";
import socket from "./connections/socket";

const App = () => {
  const [room, setRoom] = useState("")
  const [orientation, setOrientation] = useState("")
  const [players, setPlayers] = useState<{id: string}[]>([])

  // resets game to initial state
  const cleanup = useCallback(() => {
    setRoom("");
    setOrientation("");
    setPlayers([]);
  }, []);

  // socket?.on("opponent-joined", (roomData) => {
  //   console.log("roomData", roomData)
  //   setPlayers(roomData.players);
  // });

  useEffect(() => {
    // const onOpponentJoined = (roomData) => {
    //   console.log("effect called")
    //   setPlayers(roomData.players)
    // }
    // socket.on("opponent-joined", onOpponentJoined)

    // return () => {
    //   socket?.off("opponent-joined", onOpponentJoined)
    // }
    socket.on("opponent-joined", (roomData) => {
      console.log("effect called")
      console.log("roomData", roomData)
      setPlayers(roomData.players);
    });
  }, [])

  console.log(`My id is ${socket.id}`)
  console.log(`Curr players is ${players}`)

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Lobby
            setRoom={setRoom}
            setOrientation={setOrientation}
            setPlayers={setPlayers}
          />
        }/>
      <Route 
        path="/game" 
        element={
          <Game
            room={room}
            orientation={orientation}
            players={players}
            cleanup={cleanup}
          />
        }/>
    </Routes>
  )
}

export default App

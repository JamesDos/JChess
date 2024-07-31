import { Outlet, Route, Routes } from "react-router-dom";
import { Game } from "./pages/Game/game";
import { Lobby } from "./pages/Lobby/lobby";
import { Login } from "./pages/Login/login";
import { Register } from "./pages/Register/register";
import { Home } from "./pages/Home/home";
import { PrivateRoutes } from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthProvider";
import { GameSetUpProvider } from "./contexts/GameSetUpProvider";

const App = () => {

  return (
    <main className="app">
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/> }/>
          <Route element={<PrivateRoutes/>}>
            <Route path="/" element={<Home/>}/>
            <Route element={<GameSetUpProvider><Outlet/></GameSetUpProvider>}>
              <Route path="/lobby" element={<Lobby/>}/>
              <Route path="/game" element={<Game/>}/>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </main>
  )
}

export default App

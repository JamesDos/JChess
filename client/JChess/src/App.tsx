import { Outlet, Route, Routes } from "react-router-dom";
import { Game } from "./pages/Game/game";
import { HomePage } from "./pages/Lobby/lobby";
import { Login } from "./pages/Login/login";
import { Register } from "./pages/Register/register";
// import { Home } from "./pages/Home/home";
import { PrivateRoutes } from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthProvider";
import { AnalysisPage } from "./pages/Analysis/analysis";
import { ProfilePage } from "./pages/Profile/profile";
import { GameContextLayout } from "./utils/gameContextLayout";
import PersistLogin from "./utils/persistLogin";
import { Navbar } from "./components/navbar";

const App = () => {

  return (
    <main className="app">
      <AuthProvider>
        <Routes>

          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/> }/>

          <Route element={<PersistLogin/>}>
            <Route element={<PrivateRoutes/>}>

              <Route element={<><Navbar/><Outlet/></>}>
                {/* <Route path="/" element={<Home/>}/> */}
                <Route element={<GameContextLayout/>}>
                  <Route path="/" element={<HomePage/>}/>
                  <Route path="/game" element={<Game/>}/>
                </Route>
                <Route path="/analysis" element={<AnalysisPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
              </Route>
    
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </main>
  )
}

export default App

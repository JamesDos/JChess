import { useContext } from "react";
import { GameSetUpContext } from "../contexts/GameSetUpProvider";

const useGameSetUp = () => {
  const context = useContext(GameSetUpContext)
  if (context === null) {
    throw new Error("useGameSetUp must be used within a GameSetUpProvider!")
  }
  return context
}

export default useGameSetUp
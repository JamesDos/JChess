import { useState } from "react";
import { LobbyGameData } from "./lobby";

export interface GamesDisplayerProps {
  createGame: (e: React.MouseEvent) => void,
  joinGame: (e: React.MouseEvent, gameId: string) => void,
  gameList: LobbyGameData[]
}


export const GamesDisplayer = (props: GamesDisplayerProps) => {
  const [activeDisplay, setActiveDisplay] = useState<string>("create game")

  const displayStates = ["create game", "lobby"]

  const toggleActiveDisplay = (display: string) => {
    setActiveDisplay(display)
  }

  return (
    <section className="flex flex-col h-full w-3/5">
      <GamesDisplayerNavbar
        toggle={toggleActiveDisplay}
        displayStates={displayStates}
      />
      { activeDisplay === "create game" 
        ? 
        <CreateGamesDisplay
          createGame={props.createGame}
        />
        : 
        <ActiveGamesDisplay 
          gameList={props.gameList}
          joinGame={props.joinGame}
        />
      }
    </section>
  )
}

interface GamesDisplayerNavbarProps {
  toggle: (display: string) => void
  displayStates: string[]
}

const GamesDisplayerNavbar = (props: GamesDisplayerNavbarProps) => {
  return (
    <ul className="list-none flex justify-between bg-background-black">
      <li 
        className="flex justify-center grow border-transparent border-b-2 
        hover:border-orange py-2 cursor-pointer"
        onClick={() => props.toggle(props.displayStates[0])}>
        Create Game
      </li>
      <li className="flex justify-center grow border-transparent border-b-2
        hover:border-orange py-2 cursor-pointer"
        onClick={() => props.toggle(props.displayStates[1])}>
        Lobby
      </li>
    </ul>
  )
}

interface ActiveGamesDisplay {
  gameList: LobbyGameData[]
  joinGame: (e: React.MouseEvent, gameId: string) => void,
}

const ActiveGamesDisplay = (props: ActiveGamesDisplay) => {
  const gameListElms = props.gameList.map(game => {
    return (
      <div 
        key={game.gameId} 
        className="grid grid-cols-2 hover:bg-orange cursor-pointer px-4 py-2
         border-b border-text-white border-opacity-20"
        onClick = {e => props.joinGame(e, game.gameId)}>
          <div className="col-span-1">
            {game.whiteUsername}
          </div>
          <div className="col-span-1">
            {game.gameId} 
          </div>
      </div>
    )
  })

  return (
    <div className="rounded-md bg-lighter-grey h-5/6">
      <div className="flex justify-between row-span-2 min-h-8 px-4 py-2 border-b
       border-text-white border-opacity-20">
        <h2 className="flex-1 font-semibold">Player</h2>
        <h2 className="flex-1 font-semibold">Game Id</h2>
      </div>
      <div className="col-span-full">
        {gameListElms}
      </div>
    </div>
  )
}

interface CreateGamesDisplay {
  createGame: (e: React.MouseEvent) => void,
}

const CreateGamesDisplay = (props: CreateGamesDisplay) => {
  return (
    <div className="flex justify-center items-center grow rounded-lg bg-lighter-grey
     hover:bg-orange">
      <button 
        onClick={props.createGame}
        >
        Create Game
      </button>
    </div>
  )
}
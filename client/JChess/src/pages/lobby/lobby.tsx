
export const Lobby = () => {
  return (
    <div className="lobby-container">
      <button 
        className="create-game-btn"
        // onClick={(e) => createNewGame(e)}
        >Make Game</button>
      <form>
        <input 
          type="text" 
          className="join-game-text-input"
          // onChange={e => setJoinRoomId(e.target.value)}
          ></input>
        <button
          className="join-game-btn"
          // onClick={e => joinGame(e, joinRoomId)}
          type="button"
        >Join Game</button>
      </form>
    </div>
  )
}
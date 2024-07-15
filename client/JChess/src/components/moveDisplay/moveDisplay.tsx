import { useState } from "react";
import "./moveDisplay.css";

export const MoveDisplay = (props) => {

  const handleClickMove = (pos, halfMoveCount: number) => {
    console.log(halfMoveCount)
    props.setBoard(pos)
    props.setSelectedMoveNum(halfMoveCount)
  }

  const rowItemList = []
  for (let i = 0; i < props.history.length; i++) {
    const move = props.history[i]
    if (i % 2 == 0) { // white move
      rowItemList.push({
        turn: move.before.split(" ").slice(-1),
        white: move.san,
        black: "",
        afterWhiteMovePos: move.after,
        afterBlackMovePos: ""
      })
    } else { // black move
      const latestMove = rowItemList[rowItemList.length - 1]
      latestMove.black = move.san
      latestMove.afterBlackMovePos = move.after
    }
  }

  const rowItemListElms = rowItemList.map((rowItem, index: number) => {
    // index === turn number - 1
    const whiteHalfMove = (index > 0) ? ((index + 1) * 2) - 1 : 1
    const blackHalfMove = (index > 0) ? ((index + 1) * 2) : 2
    return (
      <div key={index} className="move-display--rowitem">
        <div className="move-display--rowitem--turn">{rowItem.turn}</div>
        <div 
          onClick={() => handleClickMove(rowItem.afterWhiteMovePos, whiteHalfMove)}
          className={`move-display--rowitem--move ${whiteHalfMove == props.selectedMoveNum ? "selected" : ""}`}>{rowItem.white}</div>
        <div 
          onClick={() => handleClickMove(rowItem.afterBlackMovePos, blackHalfMove)}
          className={`move-display--rowitem--move ${blackHalfMove == props.selectedMoveNum ? "selected" : ""}`}>{rowItem.black}</div>
      </div>
    )
  })

  return (
    <div className="move-display-container">
      {rowItemListElms}
    </div>
  )
}
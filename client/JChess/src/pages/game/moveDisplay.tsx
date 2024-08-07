import { useEffect, useCallback } from "react";
import back1 from "../../assets/images/back1.png";
import backFull from "../../assets/images/backFull.png";
import forward1 from "../../assets/images/forward1.png";
import forwardFull from "../../assets/images/forwardFull.png";
import { Move } from "chess.js"

import "./moveDisplay.css";

export interface MoveDisplayProps {
  history: Move[],
  setBoard: (pos: string) => void,
  selectedMoveNum: number,
  setSelectedMoveNum: React.Dispatch<React.SetStateAction<number>>,
  resetSquares: () => void
}

export const MoveDisplay = (props: MoveDisplayProps) => {

  const handleClickMove = (pos: string, halfMoveCount: number) => {
    props.setBoard(pos)
    props.setSelectedMoveNum(halfMoveCount)
    props.resetSquares()
  }

  const moveForwardOne = useCallback(() => {
    console.log(props.selectedMoveNum)
    console.log(props.history.length)
    if (props.selectedMoveNum < props.history.length) {
      // selectedMoveNum - 1 === index of position in history
      // Thus, index of next move === selectedMoveNum
      props.setSelectedMoveNum(prevNum => prevNum + 1)
      props.setBoard(props.history[props.selectedMoveNum].after)
      props.resetSquares()
    }
  }, [props])

  const moveForwardFull = () => {
    if (props.selectedMoveNum < props.history.length) {
      props.setSelectedMoveNum(props.history.length)
      props.setBoard(props.history[props.history.length - 1].after)
      props.resetSquares()
    }
  }

  const moveBackwardsOne = useCallback(() => {
    if (props.selectedMoveNum > 1) {
      props.setSelectedMoveNum(prevNum => prevNum - 1)
      props.setBoard(props.history[props.selectedMoveNum - 2].after)
      props.resetSquares()
    }
  }, [props])

  const moveBackwardsFull = () => {
    if (props.selectedMoveNum > 1) {
      props.setSelectedMoveNum(1)
      props.setBoard(props.history[0].after)
      props.resetSquares()
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        moveBackwardsOne()
      } else if (e.key === "ArrowRight") {
        moveForwardOne()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moveBackwardsOne, moveForwardOne])


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
      <div className="move-display--forward-btns-container">
          <button className="move-display--forward-btns back-full-btn"
            onClick={moveBackwardsFull}>
            <img src={backFull} alt="back-full"/>
          </button>
          <button className="move-display--forward-btns back-one-btn"
            onClick={moveBackwardsOne}>
            <img src={back1} alt="back-one"/>
          </button>
          <button className="move-display--forward-btns forward-one-btn"
            onClick={moveForwardOne}
          >
            <img src={forward1} alt="forward-one"/>
          </button>
          <button className="move-display--forward-btns forward-full-btn"
            onClick={moveForwardFull}>
            <img src={forwardFull} alt="forward-full"/>
          </button>
      </div>
      {rowItemListElms}
    </div>
  )
}
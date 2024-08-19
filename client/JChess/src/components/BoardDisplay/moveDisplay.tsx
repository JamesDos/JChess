import { useEffect, useCallback } from "react";
import back1 from "../../assets/images/back1.png";
import backFull from "../../assets/images/backFull.png";
import forward1 from "../../assets/images/forward1.png";
import forwardFull from "../../assets/images/forwardFull.png";
import { Move } from "chess.js";
import { Player } from "../../contexts/GameSetUpProvider";
import { Action } from "../BoardDisplay/boardDisplay";

// import "./moveDisplay.css";

export interface MoveDisplayProps {
  history: Move[],
  // setBoard: (pos: string) => void,
  selectedMoveNum: number,
  // setSelectedMoveNum: React.Dispatch<React.SetStateAction<number>>,
  // resetSquares: () => void,
  players?: Player[],
  dispatch: React.Dispatch<Action>,
}

export const MoveDisplay = (props: MoveDisplayProps) => {

  const handleClickMove = (pos: string, halfMoveCount: number) => {
    props.dispatch({
      type: "update-display-pos",
      payload: {
        newDisplayPos: pos,
        newMoveNum: halfMoveCount,
        draggable: halfMoveCount == props.history.length,
      }
    })
    // props.setBoard(pos)
    // props.setSelectedMoveNum(halfMoveCount)
    // props.resetSquares()
  }

  const moveForwardOne = useCallback(() => {
    if (props.selectedMoveNum < props.history.length) {
      // selectedMoveNum - 1 === index of position in history
      // Thus, index of next move === selectedMoveNum
      props.dispatch({
        type: "update-display-pos",
        payload: {
          newDisplayPos: props.history[props.selectedMoveNum].after,
          newMoveNum: props.selectedMoveNum + 1,
          draggable: props.selectedMoveNum + 1 === props.history.length,
        }
      })
      // props.setSelectedMoveNum(prevNum => prevNum + 1)
      // props.setBoard(props.history[props.selectedMoveNum].after)
      // props.resetSquares()
    }
  }, [props])

  const moveForwardFull = () => {
    if (props.selectedMoveNum < props.history.length) {
      props.dispatch({
        type: "update-display-pos",
        payload: {
          newDisplayPos: props.history[props.history.length - 1].after,
          newMoveNum: props.history.length,
          draggable: true,
        }
      })
      // props.setSelectedMoveNum(props.history.length)
      // props.setBoard(props.history[props.history.length - 1].after)
      // props.resetSquares()
    }
  }

  const moveBackwardsOne = useCallback(() => {
    if (props.selectedMoveNum > 1) {
      props.dispatch({
        type: "update-display-pos",
        payload: {
          newDisplayPos: props.history[props.selectedMoveNum - 2].after,
          newMoveNum: props.selectedMoveNum - 1,
          draggable: props.history.length === props.selectedMoveNum - 1,
        }
      })
      // props.setSelectedMoveNum(prevNum => prevNum - 1)
      // props.setBoard(props.history[props.selectedMoveNum - 2].after)
      // props.resetSquares()
    }
  }, [props])

  const moveBackwardsFull = () => {
    if (props.selectedMoveNum > 1) {
      if (props.selectedMoveNum > 1) {
        props.dispatch({
          type: "update-display-pos",
          payload: {
            newDisplayPos: props.history[0].after,
            newMoveNum: 1,
            draggable: props.history.length === 1
          }
        })
      // props.setSelectedMoveNum(1)
      // props.setBoard(props.history[0].after)
      // props.resetSquares()
    }
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
      <div key={index} className="grid place-items-stretch grid-cols-5">
        <div className="flex justify-center col-span-1 bg-lighter-grey">{rowItem.turn}</div>
        
        {rowItem.white && <div 
          onClick={() => handleClickMove(rowItem.afterWhiteMovePos, whiteHalfMove)}
          className={`pl-4 ${whiteHalfMove == props.selectedMoveNum ? "bg-selected-blue" : ""} 
          col-span-2 hover:bg-hover-blue cursor-pointer`}>
        {rowItem.white}</div>}
        {rowItem.black && <div 
          onClick={() => handleClickMove(rowItem.afterBlackMovePos, blackHalfMove)}
          className={`pl-4 ${blackHalfMove == props.selectedMoveNum ? "bg-selected-blue" : ""} 
          col-span-2 hover:bg-hover-blue cursor-pointer`}>
        {rowItem.black}</div>}
      </div>
    )
  })

  return (
    <div className="flex flex-col bg-light-grey overflow-scroll no-scrollbar h-full">
      <div>
        Black Player
      </div>
      <div className="flex items-center w-full h-8 sticky top-0">
        <ForwardButton 
          onClick={moveBackwardsFull}
          imgSrc={backFull}
          alt={"back-full"}
        />
        <ForwardButton
          onClick={moveBackwardsOne}
          imgSrc={back1}
          alt={"back-one"}
        />
        <ForwardButton
          onClick={moveForwardOne}
          imgSrc={forward1}
          alt={"forward-one"}
        />
        <ForwardButton
          onClick={moveForwardFull}
          imgSrc={forwardFull}
          alt={"forward-full"}
        />
      </div>
      {rowItemListElms}
      <div>
        White Player
      </div>
    </div>
  )
}

interface ForwardButtonProps {
  onClick: () => void,
  imgSrc: string,
  alt: string
}

const ForwardButton = (props: ForwardButtonProps) => {
  return (
    <button
      className="flex justify-center items-center flex-1 hover:bg-green cursor-pointer
      border-none bg-light-grey"
      onClick={props.onClick}>
      <img 
        className="max-w-full max-h-full"
        src={props.imgSrc} 
        alt={props.alt} />
    </button>
  )
}
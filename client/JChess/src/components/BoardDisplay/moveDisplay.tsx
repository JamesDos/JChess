import { useEffect, useCallback } from "react";
import back1 from "../../assets/images/backward-step-solid.png";
import backFull from "../../assets/images/backward-fast-solid.png";
import forward1 from "../../assets/images/forward-step-solid.png";
import forwardFull from "../../assets/images/forward-fast-solid.png";
import flagImg from "../../assets/images/flag-regular.png";
import handshakeImg from "../../assets/images/handshake-regular.png";
import { Move } from "chess.js";
import { Player } from "../../contexts/GameSetUpProvider";
import { Action } from "../BoardDisplay/boardDisplay";

export interface MoveDisplayProps {
  history: Move[],
  selectedMoveNum: number,
  players?: Player[],
  dispatch: React.Dispatch<Action>,
  orientation: string,
}

export const MoveDisplay = (props: MoveDisplayProps) => {

  const whitePlayerUsername = props.players?.[0].username
  const blackPlayerUsername = props.players?.[1].username

  const handleClickMove = (pos: string, halfMoveCount: number) => {
    props.dispatch({
      type: "update-display-pos",
      payload: {
        newDisplayPos: pos,
        newMoveNum: halfMoveCount,
        draggable: halfMoveCount == props.history.length,
      }
    })
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
    <div className="flex flex-col bg-light-grey overflow-scroll no-scrollbar h-full rounded-md">
      <div className="flex justify-between py-2 px-4">
        <div>
          {props.players ? (props.orientation === "black" ? whitePlayerUsername : blackPlayerUsername ) : ""}
        </div>
        <div>
          {props.players ? "1500" : ""}
        </div>
      </div>
      <div className="flex items-center w-full h-8 sticky top-0">
        <DisplayButton 
          onClick={moveBackwardsFull}
          imgSrc={backFull}
          alt={"back-full"}
        />
        <DisplayButton
          onClick={moveBackwardsOne}
          imgSrc={back1}
          alt={"back-one"}
        />
        <DisplayButton
          onClick={moveForwardOne}
          imgSrc={forward1}
          alt={"forward-one"}
        />
        <DisplayButton
          onClick={moveForwardFull}
          imgSrc={forwardFull}
          alt={"forward-full"}
        />
      </div>
      <div className="min-h-64">
        {rowItemListElms}
      </div>

      <OfferButtons />
      <div className="flex justify-between py-2 px-4">
        <div>
          {props.players ? (props.orientation === "white" ? whitePlayerUsername : blackPlayerUsername ) : ""}
        </div>
        <div>
          {props.players ? "1500" : ""}
        </div>
      </div>
    </div>
  )
}

interface DisplayButtonProps {
  onClick: () => void,
  imgSrc: string,
  alt: string
}

const DisplayButton = (props: DisplayButtonProps) => {
  return (
    <button
      className="flex justify-center items-center flex-1 hover:bg-green cursor-pointer
      border-none bg-lighter-grey w-full h-full py-1"
      onClick={props.onClick}>
      <img 
        className="max-w-full max-h-full"
        src={props.imgSrc} 
        alt={props.alt} />
    </button>
  )
}

const OfferButtons = () => {
  return (
    <div className="flex items-center h-8 w-full">
      <DisplayButton 
        onClick={() => console.log("clicked offer draw")}
        imgSrc={handshakeImg}
        alt={"offer draw"}
      />
      <DisplayButton 
        onClick={() => console.log("clicked offer resign")}
        imgSrc={flagImg}
        alt={"resign"}
      />
    </div>
  )
}
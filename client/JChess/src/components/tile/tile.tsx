import "./tile.css";
import { ROWS, COLS } from "../board/board";

const convertPosToCoords = (i: number, j: number) => {
  const rank = ROWS - i
  const file = String.fromCharCode("a".charCodeAt(0) + j)

  return [file, rank]
}

export interface TileProps {
  isWhite: boolean
  row: number
  col: number
}

export const Tile = (props: TileProps) => {
  const classNameString = `tile-container ${props.isWhite ? "white": "black"} ${props.row} ${props.col}`
  const [file, rank] = convertPosToCoords(props.row, props.col)
  
  return (
    <div className={classNameString}>
      <div className="tile--label">{file}{rank}</div>
    </div>
  )
}
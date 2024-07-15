import "./tile.css";
import { ROWS, COLS, Piece, PieceType, Color} from "../types"
import Draggable from "react-draggable";

const convertPosToCoords = (i: number, j: number) => {
  const rank = ROWS - i
  const file = String.fromCharCode("a".charCodeAt(0) + j)

  return [file, rank]
}


export interface TileProps {
  color: Color
  row: number
  col: number
  pieceImage: string
}

export const Tile = (props: TileProps) => {
  const tileColor = props.color.toLowerCase()
  const classNameString = `tile-container ${tileColor}`
  const [file, rank] = convertPosToCoords(props.row, props.col)

  return (
    <div className={classNameString}>
        { props.pieceImage && 
          <Draggable>
              <div style={{backgroundImage: `url(${props.pieceImage})`}} className="piece"></div>
          </Draggable>
          }
      {rank === 1 && 
      <div className={`tile--label-file ${tileColor}`}>{file}</div>}
      {file === "h" && 
      <div className= {`tile--label-rank ${tileColor}`}>{rank}</div>}
    </div>
  )
}
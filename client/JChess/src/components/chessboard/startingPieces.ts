import {ROWS, COLS, Color, Piece, PieceType} from "../types";

const assetPath = "../../assets/images";

const blackPawns = []
const whitePawns = []

for(let i = 0; i < 8; i++) {
  for(let j = 0; j < 8; j++) {
    if (i == 1) {
      blackPawns.push(
        {type: PieceType.PAWN, color: Color.BLACK, xPos: 1, yPos: j, image:`${assetPath}/bP.png`},
      )
    }
    if (i == 7) {
      whitePawns.push(
        {type: PieceType.PAWN, color: Color.WHITE, xPos: 6, yPos: j, image:`${assetPath}/wP.png`},
      )
    }
  }
}

export const startingPieces: Piece[] = [
  ...blackPawns,
  ...whitePawns,
  // knights
  {type: PieceType.KNIGHT, color: Color.BLACK, xPos: 0, yPos: 1, image:`${assetPath}/bN.png`},
  {type: PieceType.KNIGHT, color: Color.BLACK, xPos: 0, yPos: 6, image:`${assetPath}/bN.png`},
  {type: PieceType.KNIGHT, color: Color.WHITE, xPos: 7, yPos: 1, image:`${assetPath}/wN.png`},
  {type: PieceType.KNIGHT, color: Color.WHITE, xPos: 7, yPos: 6, image:`${assetPath}/wN.png`},
  // bishops
  {type: PieceType.BISHOP, color: Color.BLACK, xPos: 0, yPos: 2, image:`${assetPath}/bB.png`},
  {type: PieceType.BISHOP, color: Color.BLACK, xPos: 0, yPos: 5, image:`${assetPath}/bB.png`},
  {type: PieceType.BISHOP, color: Color.WHITE, xPos: 7, yPos: 2, image:`${assetPath}/wB.png`},
  {type: PieceType.BISHOP, color: Color.WHITE, xPos: 7, yPos: 5, image:`${assetPath}/wB.png`},
  // rooks
  {type: PieceType.ROOK, color: Color.BLACK, xPos: 0, yPos: 0, image:`${assetPath}/bR.png`},
  {type: PieceType.ROOK, color: Color.BLACK, xPos: 0, yPos: 7, image:`${assetPath}/bR.png`},
  {type: PieceType.ROOK, color: Color.WHITE, xPos: 7, yPos: 0, image:`${assetPath}/wR.png`},
  {type: PieceType.ROOK, color: Color.WHITE, xPos: 7, yPos: 7, image:`${assetPath}/wR.png`},
  // queens
  {type: PieceType.QUEEN, color: Color.BLACK, xPos: 0, yPos: 3, image:`${assetPath}/bQ.png`},
  {type: PieceType.QUEEN, color: Color.WHITE, xPos: 7, yPos: 3, image:`${assetPath}/wQ.png`},
  // kings
  {type: PieceType.KING, color: Color.WHITE, xPos: 0, yPos: 4, image:`${assetPath}/bK.png`},
  {type: PieceType.KING, color: Color.WHITE, xPos: 7, yPos: 4, image:`${assetPath}/wK.png`},
]
export const ROWS = 8;
export const COLS = 8;

export enum Color {
  WHITE = "WHITE",
  BLACK = "BLACK",
}

export interface Piece {
  type: PieceType,
  color: Color,
  xPos: number,
  yPos: number,
  image: string,
}

export enum PieceType {
  PAWN = "PAWN",
  KNIGHT = "KNIGHT",
  BISHOP = "BISHOP",
  ROOK = "ROOK",
  QUEEN = "QUEEN",
  KING = "KING",
}
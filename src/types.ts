export interface BlockState {
  x: number
  y: number
  revealod?: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

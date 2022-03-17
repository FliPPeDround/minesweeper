import type { Ref } from 'vue'
import type { BlockState } from '~/types'

const directions = [
  [1, 1], [1, 0], [1, -1],
  [-1, 1], [-1, 0], [-1, -1],
  [0, 1], [0, -1],
]

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: 'play' | 'won' | 'lost'
  startMS: number
}

export class GamePlay {
  state = ref() as Ref<GameState>

  get board() {
    return this.state.value.board
  }

  get blocks() {
    return this.state.value.board.flat() as BlockState[]
  }

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      startMS: +new Date(),
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            adjacentMines: 0,
            revealod: false,
          }),
        ),
      ),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  generoteMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.width - 1)
      const block = state[x][y]
      if (Math.abs(block.x - initial.x) <= 1 && Math.abs(block.y - initial.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }

    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((row, _y) => {
      row.forEach((block, _x) => {
        if (block.mine)
          return
        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return
    this.getSiblings(block).forEach((s) => {
      if (!s.revealod) {
        s.revealod = true
        this.expendZero(s)
      }
    })
  }

  onRightClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (block.revealod)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return
    if (!this.state.value.mineGenerated) {
      this.generoteMines(this.board, block)
      this.state.value.mineGenerated = true
    }

    block.revealod = true
    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      return
    }
    this.expendZero(block)
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined

      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealod = true
    })
  }

  checkGameState() {
    const blocks = this.board.flat()
    if (blocks.every(block => block.revealod || block.flagged || block.mine)) {
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
      }
      else {
        this.state.value.gameState = 'won'
      }
    }
  }
}

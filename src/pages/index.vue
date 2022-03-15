<script setup lang="ts">

interface BlockState {
  x: number
  y: number
  revealod?: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

const WIDTH = 10
const HEIGHT = 10
const state = $ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        adjacentMines: 0,
      }),
    ),
  ),
)

function generoteMines() {
  for (const row of state) {
    for (const block of row)
      block.mine = Math.random() < 0.2
  }
}

const directions = [
  [1, 1], [1, 0], [1, -1],
  [-1, 1], [-1, 0], [-1, -1],
  [0, 1], [0, 1],
]

function updateNumbers() {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      if (block.mine) return
      directions.forEach(([dx, dy]) => {
        const x2 = x + dx
        const y2 = y + dy
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
          return
        if (state[y2][x2].mine)
          block.adjacentMines += 1
      })
    })
  })
}
// const onClick = (x: number, y: number) => {
//   console.log(x, y)
// }

function getBlockClass(block: BlockState) {
  return block.mine ? 'text-red' : 'text-gray'
}
generoteMines()
updateNumbers()
</script>

<template>
  <div>
    Minesweeper
    <div v-for="row,y in state" :key="y">
      <button
        v-for="item,x in row"
        :key="x"
        w-10 h-10
        hover:bg-gray
        border
        :class="getBlockClass(item)"
        @click="onClick(x, y)"
      >
        <div v-if="item.mine">
          💣
        </div>
        <div v-else>
          {{ item.adjacentMines }}
        </div>
      </button>
    </div>
  </div>
</template>

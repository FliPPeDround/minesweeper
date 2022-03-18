<script setup lang="ts">
// import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'
import Confetti from '~/components/Confetti.vue'

const play = new GamePlay(9, 9, 10)

useStorage('mine-state', play.state)
const state = $computed(() => play.board)

const now = $(useNow())
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000))

const mineCount = $computed(() => {
  if (!play.state.value.mineGenerated)
    return play.mines
  return play.blocks.reduce((a, b) => a - (b.flagged ? 1 : 0), play.mines)
})

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
  switch (difficulty) {
    case 'easy':
      play.reset(9, 9, 10)
      break
    case 'medium':
      play.reset(16, 16, 40)
      break
    case 'hard':
      play.reset(30, 16, 99)
      break
  }
}

watchEffect(() => {
  play.checkGameState()
})
</script>

<template>
  <div>
    Minesweeper
    <div flex="~ gap-1" justify-center p-5>
      <button
        btn
        @click="play.reset()"
      >
        New Game
      </button>
      <button
        btn
        @click="newGame('easy')"
      >
        Easy
      </button>
      <button
        btn
        @click="newGame('medium')"
      >
        Medium
      </button>
      <button
        btn
        @click="newGame('hard')"
      >
        Hard
      </button>
    </div>
    <div flex="~ gap-10" justify-center>
      <div font-mono flex="~ gap-1" justify-center items-center>
        <div i-carbon-time />
        {{ timerMS }}
      </div>
      <div font-mono flex="~ gap-1" justify-center items-center>
        <div i-mdi-mine />
        {{ mineCount }}
      </div>
    </div>
    <div w-full overflow-auto>
      <div
        v-for="row,y in state"
        :key="y"
        flex="~"
        items-center justify-center w-max ma
      >
        <MineBlock
          v-for="block, x in row"
          :key="x"
          :block="block"
          @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
          @dblclick="play.autoExpand(block)"
        />
      </div>
    </div>
  </div>
  <Confetti :passed="play.state.value.status === 'won'" />
</template>

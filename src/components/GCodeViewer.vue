<template>
  <svg class="g-code" :width="2 * size" :height="2 * size" :viewBox="`0 0 ${size} ${size}`">
    <rect class="bed" x="0" y="0" :width="size" :height="size" />

    <g transform="scale(1, -1) translate(0, -235)">
      <path v-for="line of lines" :key="line.id" :class="line.class" :d="`M${line.x} ${line.y} l${line.dx} ${line.dy}`" />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { convertGCode } from '../utils/tools'

type Line = {
  id: number
  class: 'move' | 'line'
  x: number
  y: number
  dx: number
  dy: number
}

// Properties

const props = defineProps({
  gCode: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 235
  }
})

// Data

const scale = ref(0.5) // Scale factor
const offsetX = ref(50) // X offset
const offsetY = ref(0) // Y offset

// Computed

const lines = computed<Line[]>(() => {
  const code = convertGCode(props.gCode, scale.value, offsetX.value, offsetY.value)
  const rows = code.split('\n')
  const lines: Line[] = []

  console.log(code)

  let lastX = 0
  let lastY = 0
  let id = 1
  let absolute = true

  for (let row of rows) {
    // Remove comments
    const commentIndex = row.indexOf(';')
    if (commentIndex !== -1) {
      row = row.slice(0, commentIndex)
    }

    row = row.trim()
    if (row === '') {
      continue
    }

    const [command, ...args] = row.split(' ')

    // Arguments start with a letter XYZ plus number. Store arguments in map

    const argsMap: Record<string, number> = {}
    for (const arg of args) {
      const letter = arg[0]
      const value = parseFloat(arg.slice(1))
      argsMap[letter] = value
    }

    if (command === 'G0' || command === 'G1') {
      let dx = argsMap.X
      let dy = argsMap.Y

      if (dx === undefined && dy === undefined) {
        continue
      }

      const x = lastX
      const y = lastY

      lastX = absolute ? (dx ?? x) : lastX + (dx ?? 0)
      lastY = absolute ? (dy ?? y) : lastY + (dy ?? 0)

      if (absolute) {
        dx = (dx ?? x) - x
        dy = (dy ?? y) - y
      }

      lines.push({ id: id++, class: command === 'G0' ? 'move' : 'line', x, y, dx, dy })

      console.log(lastX, lastY)
    } else if (command === 'G90') {
      absolute = true
    } else if (command === 'G91') {
      absolute = false
    }
  }

  console.log(lines)

  return lines
})
</script>

<style>
svg.g-code {
  stroke: black;
  fill: none;
}

svg.g-code .bed {
  stroke: blue !important;
}

svg.g-code .move {
  stroke: green !important;
  vector-effect: non-scaling-stroke;
}
</style>

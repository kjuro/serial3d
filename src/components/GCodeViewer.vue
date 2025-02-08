<template>
  <div>
    <svg class="g-code" :viewBox="`0 0 ${size} ${size}`" @mousedown="onMouseDown" :style="{ cursor: editable ? 'crosshair' : 'default' }">
      <rect class="bed" x="0" y="0" :width="size" :height="size" />

      <g :transform="`scale(1, -1) translate(0, -${size})`">
        <g v-if="showGrid" class="grid">
          <line v-for="line of grid" :key="line.id" :class="line.class" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" />
        </g>

        <path v-for="line of lines" :key="line.id" :class="line.class" :d="`M${line.x} ${line.y} l${line.dx} ${line.dy}`" />

        <line :x1="X - 4" :y1="Y" :x2="X + 4" :y2="Y" class="cross" />
        <line :x1="X" :y1="Y - 4" :x2="X" :y2="Y + 4" class="cross" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVModel } from '@vueuse/core'

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
  modelValue: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    //default: 235
    default: 200
  },
  editable: {
    type: Boolean,
    default: true
  },
  X: {
    type: Number,
    default: 0
  },
  Y: {
    type: Number,
    default: 0
  },
  Z: {
    type: Number,
    default: 0
  },
  showMoves: {
    type: Boolean,
    default: true
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  snapToGrid: {
    type: Boolean,
    default: true
  },
  gridSteps: {
    type: Number,
    default: 4
  }
})

// Emits

const emit = defineEmits<{
  'update:modelValue': [code: string]
  send: [code: string]
  move: [pos: { x: number; y: number; z: number }]
}>()

// Data

const gCode = useVModel(props, 'modelValue', emit)

// Computed

const lines = computed<Line[]>(() => {
  const rows = gCode.value.split('\n')
  const lines: Line[] = []

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

      if (props.showMoves || command === 'G1') {
        lines.push({ id: id++, class: command === 'G0' ? 'move' : 'line', x, y, dx, dy })
      }
    } else if (command === 'G90') {
      absolute = true
    } else if (command === 'G91') {
      absolute = false
    }
  }

  return lines
})

const grid = computed(() => {
  const lines: { id: number; class: string; x1: number; y1: number; x2: number; y2: number }[] = []

  if (props.showGrid) {
    for (let i = 0; i <= props.size; i += 10 / props.gridSteps) {
      lines.push({ id: i * 2, class: `grid-${i % 10}`, x1: 0, y1: i, x2: props.size, y2: i })
      lines.push({ id: i * 2 + 1, class: `grid-${i % 10}`, x1: i, y1: 0, x2: i, y2: props.size })
    }
  }

  return lines
})

// Methods

const onMouseDown = (event: MouseEvent) => {
  if (!props.editable) return

  const svgElement = event.currentTarget as SVGElement
  const rect = svgElement.getBoundingClientRect()
  const x = props.size * ((event.clientX - rect.left) / rect.width)
  const y = props.size * (1 - (event.clientY - rect.top) / rect.height)

  emit('move', { x, y, z: props.Z })
}
</script>

<style>
svg.g-code {
  height: 100%;
  stroke: black;
  stroke-width: 0.4;
  fill: none;
}

svg.g-code .bed {
  stroke: blue !important;
}

svg.g-code .cross {
  stroke: red !important;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

svg.g-code .move {
  stroke: green !important;
  vector-effect: non-scaling-stroke;
}

svg.g-code .grid line {
  stroke: #eee !important;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

svg.g-code .grid line.grid-0 {
  stroke: #ccc !important;
}
</style>
